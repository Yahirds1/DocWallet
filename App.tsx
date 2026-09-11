import * as Haptics from 'expo-haptics';
import * as LocalAuthentication from 'expo-local-authentication';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  Alert,
  AppState,
  BackHandler,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';

import { BiometricSheet } from './src/components/BiometricSheet';
import type {
  BiometricInfo,
  DocumentDraft,
  WalletDocument,
} from './src/model';
import { DocumentFormScreen } from './src/screens/DocumentFormScreen';
import { DocumentViewScreen } from './src/screens/DocumentViewScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import {
  loadDocuments,
  persistFile,
  removeFile,
  saveDocuments,
} from './src/storage';
import { colors } from './src/theme';

type Route =
  | { name: 'home' }
  | { name: 'form'; documentId?: string }
  | { name: 'view'; documentId: string };

const defaultBiometric: BiometricInfo = {
  actionLabel: 'Desbloquear con biometría',
  available: false,
  methodName: 'biometría',
};

export default function App() {
  const [documents, setDocuments] = useState<WalletDocument[]>([]);
  const [route, setRoute] = useState<Route>({ name: 'home' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [biometric, setBiometric] = useState(defaultBiometric);
  const [pendingDocument, setPendingDocument] =
    useState<WalletDocument | null>(null);
  const [authenticating, setAuthenticating] = useState(false);
  const [authenticationError, setAuthenticationError] = useState<
    string | null
  >(null);

  const routeDocument =
    route.name === 'form' || route.name === 'view'
      ? documents.find((item) => item.id === route.documentId)
      : undefined;

  useEffect(() => {
    async function initialize() {
      try {
        const [storedDocuments, hardware, enrolled, types] = await Promise.all([
          loadDocuments(),
          Platform.OS === 'web'
            ? Promise.resolve(false)
            : LocalAuthentication.hasHardwareAsync(),
          Platform.OS === 'web'
            ? Promise.resolve(false)
            : LocalAuthentication.isEnrolledAsync(),
          Platform.OS === 'web'
            ? Promise.resolve([] as LocalAuthentication.AuthenticationType[])
            : LocalAuthentication.supportedAuthenticationTypesAsync(),
        ]);

        setDocuments(storedDocuments);
        setBiometric(getBiometricInfo(hardware && enrolled, types));
      } catch {
        Alert.alert(
          'No se pudieron cargar los documentos',
          'Cierra y abre la aplicación para intentarlo nuevamente.',
        );
      } finally {
        setLoading(false);
      }
    }

    initialize();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (
        state !== 'active' &&
        route.name === 'view' &&
        routeDocument?.protected
      ) {
        setRoute({ name: 'home' });
      }
    });
    return () => subscription.remove();
  }, [route, routeDocument]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (pendingDocument) {
          closeAuthentication();
          return true;
        }
        if (route.name !== 'home') {
          setRoute({ name: 'home' });
          return true;
        }
        return false;
      },
    );
    return () => subscription.remove();
  }, [pendingDocument, route.name]);

  function openDocument(document: WalletDocument) {
    if (document.protected) {
      setAuthenticationError(null);
      setPendingDocument(document);
      return;
    }
    setRoute({ name: 'view', documentId: document.id });
  }

  function closeAuthentication() {
    if (authenticating) {
      return;
    }
    setAuthenticationError(null);
    setPendingDocument(null);
  }

  async function authenticate() {
    if (!pendingDocument || authenticating || !biometric.available) {
      return;
    }

    setAuthenticating(true);
    setAuthenticationError(null);
    try {
      const result = await LocalAuthentication.authenticateAsync({
        biometricsSecurityLevel: 'weak',
        cancelLabel: 'Cancelar',
        disableDeviceFallback: true,
        fallbackLabel: '',
        promptDescription: 'Usa la biometría registrada en tu dispositivo.',
        promptMessage: `Desbloquear ${pendingDocument.name}`,
        promptSubtitle: 'DocWallet',
      });

      if (result.success) {
        void Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        ).catch(() => undefined);
        const documentId = pendingDocument.id;
        setPendingDocument(null);
        setRoute({ name: 'view', documentId });
      } else if (
        result.error !== 'user_cancel' &&
        result.error !== 'system_cancel' &&
        result.error !== 'app_cancel'
      ) {
        void Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Error,
        ).catch(() => undefined);
        setAuthenticationError(
          'No fue posible verificar tu identidad. El documento continúa bloqueado.',
        );
      }
    } catch {
      setAuthenticationError(
        'Ocurrió un problema al usar la biometría. Intenta nuevamente.',
      );
    } finally {
      setAuthenticating(false);
    }
  }

  async function saveDocument(draft: DocumentDraft) {
    setSaving(true);
    let copiedUri: string | undefined;
    try {
      let nextDocuments: WalletDocument[];
      if (route.name === 'form' && route.documentId && routeDocument) {
        nextDocuments = documents.map((item) =>
          item.id === route.documentId
            ? {
                ...item,
                category: draft.category,
                name: draft.name,
                protected: draft.protected,
              }
            : item,
        );
      } else {
        if (!draft.file) {
          return;
        }
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        copiedUri = await persistFile(draft.file, id);
        const newDocument: WalletDocument = {
          category: draft.category,
          createdAt: Date.now(),
          fileName: draft.file.name,
          fileType: draft.file.type,
          id,
          name: draft.name,
          protected: draft.protected,
          uri: copiedUri,
        };
        nextDocuments = [newDocument, ...documents];
      }

      await saveDocuments(nextDocuments);
      setDocuments(nextDocuments);
      setRoute({ name: 'home' });
      void Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success,
      ).catch(() => undefined);
    } catch {
      if (copiedUri) {
        removeFile(copiedUri);
      }
      Alert.alert(
        'No se pudo guardar el documento',
        'Verifica que exista espacio disponible e intenta nuevamente.',
      );
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete(document: WalletDocument) {
    Alert.alert(
      '¿Eliminar este documento?',
      'Esta acción eliminará el archivo de DocWallet y no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar documento',
          style: 'destructive',
          onPress: async () => {
            try {
              const nextDocuments = documents.filter(
                (item) => item.id !== document.id,
              );
              await saveDocuments(nextDocuments);
              setDocuments(nextDocuments);
              setRoute({ name: 'home' });
              try {
                removeFile(document.uri);
              } catch {
                // Metadata is already removed; an orphaned private file is harmless.
              }
              void Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success,
              ).catch(() => undefined);
            } catch {
              Alert.alert(
                'No se pudo eliminar',
                'El documento continúa guardado. Intenta nuevamente.',
              );
            }
          },
        },
      ],
    );
  }

  let content;
  if (route.name === 'form') {
    content = (
      <DocumentFormScreen
        biometric={biometric}
        document={routeDocument}
        onBack={() => setRoute({ name: 'home' })}
        onSave={saveDocument}
        saving={saving}
      />
    );
  } else if (route.name === 'view' && routeDocument) {
    content = (
      <DocumentViewScreen
        biometric={biometric}
        document={routeDocument}
        onBack={() => setRoute({ name: 'home' })}
        onDelete={() => confirmDelete(routeDocument)}
        onEdit={() =>
          setRoute({ name: 'form', documentId: routeDocument.id })
        }
        onLock={() => setRoute({ name: 'home' })}
      />
    );
  } else {
    content = (
      <HomeScreen
        documents={documents}
        loading={loading}
        onAdd={() => setRoute({ name: 'form' })}
        onOpen={openDocument}
      />
    );
  }

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <StatusBar style="dark" />
        <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
          {content}
        </SafeAreaView>
        <BiometricSheet
          authenticating={authenticating}
          biometric={biometric}
          document={pendingDocument}
          error={authenticationError}
          onAuthenticate={authenticate}
          onClose={closeAuthentication}
        />
      </View>
    </SafeAreaProvider>
  );
}

function getBiometricInfo(
  available: boolean,
  types: LocalAuthentication.AuthenticationType[],
): BiometricInfo {
  if (!available) {
    return defaultBiometric;
  }

  const supportsFace = types.includes(
    LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
  );
  const supportsFingerprint = types.includes(
    LocalAuthentication.AuthenticationType.FINGERPRINT,
  );

  if (Platform.OS === 'ios' && supportsFace) {
    return {
      actionLabel: 'Desbloquear con Face ID',
      available: true,
      methodName: 'Face ID',
    };
  }
  if (Platform.OS === 'ios' && supportsFingerprint) {
    return {
      actionLabel: 'Desbloquear con Touch ID',
      available: true,
      methodName: 'Touch ID',
    };
  }
  if (supportsFingerprint) {
    return {
      actionLabel: 'Desbloquear con huella',
      available: true,
      methodName: 'huella digital',
    };
  }
  if (supportsFace) {
    return {
      actionLabel: 'Desbloquear con reconocimiento facial',
      available: true,
      methodName: 'reconocimiento facial',
    };
  }
  return {
    actionLabel: 'Desbloquear con biometría',
    available: true,
    methodName: 'biometría',
  };
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background,
    flex: 1,
  },
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
});
