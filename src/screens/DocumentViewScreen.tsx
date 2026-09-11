import { MaterialCommunityIcons } from '@expo/vector-icons';
import { File } from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';

import type { BiometricInfo, WalletDocument } from '../model';
import { colors, shadows } from '../theme';

type Props = {
  biometric: BiometricInfo;
  document: WalletDocument;
  onBack: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onLock: () => void;
};

export function DocumentViewScreen({
  biometric,
  document,
  onBack,
  onDelete,
  onEdit,
  onLock,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [viewerError, setViewerError] = useState(false);

  async function openPdfExternally() {
    try {
      if (Platform.OS === 'android') {
        const file = new File(document.uri);
        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
          data: file.contentUri,
          flags: 1,
          type: 'application/pdf',
        });
        return;
      }

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(document.uri, {
          dialogTitle: 'Abrir documento PDF',
          mimeType: 'application/pdf',
        });
      }
    } catch {
      try {
        await Sharing.shareAsync(document.uri, {
          dialogTitle: 'Abrir documento PDF',
          mimeType: 'application/pdf',
        });
      } catch {
        Alert.alert(
          'No se pudo abrir el PDF',
          'No hay una aplicación disponible para visualizar este archivo.',
        );
      }
    }
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <RoundButton
            icon="chevron-left"
            label="Regresar"
            onPress={onBack}
          />
          <RoundButton
            icon="dots-horizontal"
            label="Opciones del documento"
            onPress={() => setMenuOpen(true)}
          />
        </View>

        <Text style={styles.title}>{document.name}</Text>
        {document.protected ? (
          <View style={styles.unlockedRow}>
            <MaterialCommunityIcons
              name="face-recognition"
              size={24}
              color={colors.green}
            />
            <Text style={styles.unlockedText}>
              Desbloqueado con {biometric.methodName}
            </Text>
          </View>
        ) : (
          <Text style={styles.unprotectedText}>Documento sin protección</Text>
        )}

        <View style={styles.viewer}>
          {viewerError ? (
            <View style={styles.viewerMessage}>
              <MaterialCommunityIcons
                name="file-alert-outline"
                size={48}
                color="#D5D9DF"
              />
              <Text style={styles.viewerMessageTitle}>
                No se pudo mostrar el archivo
              </Text>
              <Text style={styles.viewerMessageText}>
                El archivo pudo haberse movido o eliminado.
              </Text>
            </View>
          ) : document.fileType === 'image' ? (
            <Image
              accessibilityLabel={`Vista de ${document.name}`}
              onError={() => setViewerError(true)}
              resizeMode="contain"
              source={{ uri: document.uri }}
              style={{ height: '100%', width: '100%' }}
            />
          ) : Platform.OS === 'ios' ? (
            <WebView
              allowFileAccess
              onError={() => setViewerError(true)}
              originWhitelist={['file://*']}
              source={{ uri: document.uri }}
              style={styles.pdfWebView}
            />
          ) : (
            <View style={styles.pdfPlaceholder}>
              <View style={styles.pdfIcon}>
                <MaterialCommunityIcons
                  name="file-pdf-box"
                  size={52}
                  color="#6B5234"
                />
              </View>
              <Text numberOfLines={2} style={styles.pdfName}>
                {document.fileName}
              </Text>
              <Text style={styles.pdfHelp}>
                Documento PDF guardado localmente
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={openPdfExternally}
                style={({ pressed }) => [
                  styles.openPdfButton,
                  pressed && styles.pressed,
                ]}
              >
                <MaterialCommunityIcons
                  name="open-in-new"
                  size={19}
                  color="#FFFFFF"
                />
                <Text style={styles.openPdfText}>Abrir PDF</Text>
              </Pressable>
            </View>
          )}
        </View>

        <Text style={styles.sectionLabel}>INFORMACIÓN</Text>
        <View style={styles.infoCard}>
          <InfoRow label="Categoría" value={document.category} />
          <View style={styles.divider} />
          <InfoRow
            color={document.protected ? colors.green : undefined}
            icon={document.protected ? 'lock-outline' : undefined}
            label="Protección"
            value={
              document.protected ? biometric.methodName : 'Sin protección'
            }
          />
          <View style={styles.divider} />
          <InfoRow
            label="Tipo de archivo"
            value={document.fileType === 'pdf' ? 'PDF' : 'Imagen'}
          />
        </View>

        {document.protected ? (
          <Pressable
            accessibilityRole="button"
            onPress={onLock}
            style={({ pressed }) => [
              styles.lockButton,
              pressed && styles.pressed,
            ]}
          >
            <MaterialCommunityIcons
              name="lock-outline"
              size={22}
              color={colors.blue}
            />
            <Text style={styles.lockButtonText}>Bloquear nuevamente</Text>
          </Pressable>
        ) : null}
      </ScrollView>

      <ActionsSheet
        onClose={() => setMenuOpen(false)}
        onDelete={() => {
          setMenuOpen(false);
          onDelete();
        }}
        onEdit={() => {
          setMenuOpen(false);
          onEdit();
        }}
        onLock={
          document.protected
            ? () => {
                setMenuOpen(false);
                onLock();
              }
            : undefined
        }
        visible={menuOpen}
      />
    </View>
  );
}

function RoundButton({
  icon,
  label,
  onPress,
}: {
  icon: 'chevron-left' | 'dots-horizontal';
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.roundButton, pressed && styles.pressed]}
    >
      <MaterialCommunityIcons name={icon} size={29} color={colors.text} />
    </Pressable>
  );
}

function InfoRow({
  color,
  icon,
  label,
  value,
}: {
  color?: string;
  icon?: 'lock-outline';
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <View style={styles.infoValueRow}>
        {icon ? (
          <MaterialCommunityIcons name={icon} size={20} color={color} />
        ) : null}
        <Text style={[styles.infoValue, color ? { color } : null]}>{value}</Text>
      </View>
    </View>
  );
}

function ActionsSheet({
  onClose,
  onDelete,
  onEdit,
  onLock,
  visible,
}: {
  onClose: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onLock?: () => void;
  visible: boolean;
}) {
  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <Pressable accessibilityLabel="Cerrar" onPress={onClose} style={styles.scrim} />
      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />
        <Text style={styles.sheetTitle}>Opciones del documento</Text>
        <View style={styles.actionList}>
          {onLock ? (
            <ActionRow
              icon="lock-outline"
              label="Bloquear nuevamente"
              onPress={onLock}
            />
          ) : null}
          <ActionRow icon="pencil-outline" label="Editar información" onPress={onEdit} />
          <ActionRow
            destructive
            icon="trash-can-outline"
            label="Eliminar documento"
            onPress={onDelete}
          />
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={onClose}
          style={({ pressed }) => [styles.sheetCancel, pressed && styles.pressed]}
        >
          <Text style={styles.sheetCancelText}>Cancelar</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

function ActionRow({
  destructive,
  icon,
  label,
  onPress,
}: {
  destructive?: boolean;
  icon: string;
  label: string;
  onPress: () => void;
}) {
  const color = destructive ? colors.red : colors.text;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.actionRow, pressed && styles.pressed]}
    >
      <MaterialCommunityIcons name={icon as never} size={23} color={color} />
      <Text style={[styles.actionText, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  roundButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  title: {
    color: colors.text,
    fontSize: 27,
    fontWeight: '800',
    letterSpacing: -0.65,
    marginTop: 13,
  },
  unlockedRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
    marginTop: 5,
  },
  unlockedText: {
    color: colors.green,
    fontSize: 13,
    fontWeight: '600',
  },
  unprotectedText: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 7,
  },
  viewer: {
    backgroundColor: '#252A31',
    borderRadius: 24,
    height: 350,
    marginTop: 20,
    overflow: 'hidden',
    ...shadows.card,
  },
  pdfWebView: {
    backgroundColor: '#252A31',
    flex: 1,
  },
  pdfPlaceholder: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  pdfIcon: {
    alignItems: 'center',
    backgroundColor: '#F0E5D5',
    borderRadius: 22,
    height: 82,
    justifyContent: 'center',
    width: 82,
  },
  pdfName: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    marginTop: 18,
    textAlign: 'center',
  },
  pdfHelp: {
    color: '#ABB0B7',
    fontSize: 12.5,
    marginTop: 7,
  },
  openPdfButton: {
    alignItems: 'center',
    backgroundColor: '#3C4654',
    borderRadius: 15,
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 13,
  },
  openPdfText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  viewerMessage: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  viewerMessageTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    marginTop: 14,
  },
  viewerMessageText: {
    color: '#ABB0B7',
    fontSize: 13,
    marginTop: 7,
    textAlign: 'center',
  },
  sectionLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.1,
    marginBottom: 10,
    marginTop: 29,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 21,
    paddingHorizontal: 18,
    ...shadows.card,
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 51,
    justifyContent: 'space-between',
  },
  infoLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  infoValueRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  infoValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  divider: {
    backgroundColor: colors.border,
    height: StyleSheet.hairlineWidth,
  },
  lockButton: {
    alignItems: 'center',
    backgroundColor: '#E7EBF3',
    borderRadius: 18,
    flexDirection: 'row',
    gap: 10,
    height: 55,
    justifyContent: 'center',
    marginTop: 20,
  },
  lockButtonText: {
    color: colors.blue,
    fontSize: 15,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.76,
  },
  scrim: {
    backgroundColor: colors.overlay,
    flex: 1,
  },
  sheet: {
    backgroundColor: '#FCFCFA',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    bottom: 0,
    left: 0,
    paddingBottom: Platform.OS === 'ios' ? 34 : 22,
    paddingHorizontal: 20,
    position: 'absolute',
    right: 0,
  },
  sheetHandle: {
    alignSelf: 'center',
    backgroundColor: '#D5D7D2',
    borderRadius: 3,
    height: 5,
    marginTop: 12,
    width: 62,
  },
  sheetTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 14,
    marginTop: 24,
  },
  actionList: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    overflow: 'hidden',
  },
  actionRow: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 13,
    minHeight: 58,
    paddingHorizontal: 17,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  sheetCancel: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 18,
    height: 54,
    justifyContent: 'center',
    marginTop: 12,
  },
  sheetCancelText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
});
