import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  categories,
  type BiometricInfo,
  type Category,
  type DocumentDraft,
  type SelectedFile,
  type WalletDocument,
} from '../model';
import { categoryTheme, colors, shadows } from '../theme';

type Props = {
  biometric: BiometricInfo;
  document?: WalletDocument;
  saving: boolean;
  onBack: () => void;
  onSave: (draft: DocumentDraft) => Promise<void>;
};

export function DocumentFormScreen({
  biometric,
  document,
  saving,
  onBack,
  onSave,
}: Props) {
  const [name, setName] = useState(document?.name ?? '');
  const [category, setCategory] = useState<Category>(
    document?.category ?? 'Identificación',
  );
  const [isProtected, setIsProtected] = useState(
    document?.protected ?? false,
  );
  const [file, setFile] = useState<SelectedFile>();
  const [categoryOpen, setCategoryOpen] = useState(false);

  const canSave =
    name.trim().length > 0 && Boolean(document || file) && !saving;

  async function pickImage(fromCamera: boolean) {
    try {
      if (fromCamera) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert(
            'Permiso de cámara',
            'DocWallet necesita acceso a la cámara para tomar la fotografía.',
          );
          return;
        }
      }

      const result = fromCamera
        ? await ImagePicker.launchCameraAsync({
            cameraType: ImagePicker.CameraType.back,
            mediaTypes: ['images'],
            quality: 0.9,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.9,
          });

      if (!result.canceled) {
        const asset = result.assets[0];
        setFile({
          name: asset.fileName ?? `documento-${Date.now()}.jpg`,
          type: 'image',
          uri: asset.uri,
        });
      }
    } catch {
      Alert.alert(
        'No se pudo seleccionar la imagen',
        'Intenta nuevamente o elige otro archivo.',
      );
    }
  }

  async function pickPdf() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false,
        type: 'application/pdf',
      });
      if (!result.canceled) {
        const asset = result.assets[0];
        setFile({ uri: asset.uri, name: asset.name, type: 'pdf' });
      }
    } catch {
      Alert.alert(
        'No se pudo seleccionar el PDF',
        'Comprueba el archivo e intenta nuevamente.',
      );
    }
  }

  function toggleProtection(value: boolean) {
    if (value && !biometric.available) {
      Alert.alert(
        'Biometría no disponible',
        'Configura Face ID, Touch ID o una huella en tu dispositivo antes de proteger documentos.',
      );
      return;
    }
    setIsProtected(value);
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.screen}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <HeaderButton icon="chevron-left" label="Regresar" onPress={onBack} />
        <Text style={styles.title}>
          {document ? 'Editar documento' : 'Agregar documento'}
        </Text>
        <Text style={styles.subtitle}>
          {document
            ? 'Actualiza la información del documento.'
            : 'Completa la información básica.'}
        </Text>

        <FieldLabel>NOMBRE DEL DOCUMENTO</FieldLabel>
        <View style={styles.inputContainer}>
          <TextInput
            accessibilityLabel="Nombre del documento"
            autoCapitalize="sentences"
            maxLength={60}
            onChangeText={setName}
            placeholder="Ej. Credencial universitaria"
            placeholderTextColor="#A1A49F"
            returnKeyType="done"
            style={styles.input}
            value={name}
          />
          {name ? (
            <Pressable
              accessibilityLabel="Borrar nombre"
              hitSlop={12}
              onPress={() => setName('')}
            >
              <MaterialCommunityIcons
                name="close-circle"
                size={18}
                color="#B0B3AE"
              />
            </Pressable>
          ) : null}
        </View>

        <FieldLabel>CATEGORÍA</FieldLabel>
        <Pressable
          accessibilityRole="button"
          onPress={() => setCategoryOpen(true)}
          style={({ pressed }) => [
            styles.select,
            pressed && styles.pressed,
          ]}
        >
          <View
            style={[
              styles.selectIcon,
              { backgroundColor: categoryTheme[category].background },
            ]}
          >
            <MaterialCommunityIcons
              name={categoryTheme[category].icon as never}
              size={20}
              color={categoryTheme[category].foreground}
            />
          </View>
          <Text style={styles.selectText}>{category}</Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={25}
            color="#9A9D98"
          />
        </Pressable>

        <FieldLabel>{document ? 'ARCHIVO GUARDADO' : 'ARCHIVO'}</FieldLabel>
        {document ? (
          <SelectedFileCard
            file={{
              name: document.fileName,
              type: document.fileType,
              uri: document.uri,
            }}
          />
        ) : file ? (
          <SelectedFileCard file={file} onRemove={() => setFile(undefined)} />
        ) : (
          <View style={styles.fileOptions}>
            <FileOption
              background="#E4EEE7"
              color="#315440"
              icon="camera-outline"
              label="Tomar fotografía"
              onPress={() => pickImage(true)}
            />
            <View style={styles.divider} />
            <FileOption
              background="#E5E9F5"
              color="#405476"
              icon="image-outline"
              label="Seleccionar imagen"
              onPress={() => pickImage(false)}
            />
            <View style={styles.divider} />
            <FileOption
              background="#F0E5D5"
              color="#6B5234"
              icon="file-pdf-box"
              label="Seleccionar documento PDF"
              onPress={pickPdf}
            />
          </View>
        )}

        <View style={styles.biometricCard}>
          <View style={styles.biometricText}>
            <Text style={styles.biometricTitle}>Proteger con biometría</Text>
            <Text style={styles.biometricSubtitle}>
              {biometric.available
                ? `Solicitar ${biometric.methodName} al abrirlo.`
                : 'No disponible en este dispositivo.'}
            </Text>
          </View>
          <Switch
            accessibilityLabel="Proteger con biometría"
            ios_backgroundColor="#D9DCD7"
            onValueChange={toggleProtection}
            thumbColor="#FFFFFF"
            trackColor={{ false: '#D9DCD7', true: colors.green }}
            value={isProtected}
          />
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={!canSave}
          onPress={() =>
            onSave({
              category,
              file,
              name: name.trim(),
              protected: isProtected,
            })
          }
          style={({ pressed }) => [
            styles.saveButton,
            !canSave && styles.saveDisabled,
            pressed && canSave && styles.pressed,
          ]}
        >
          <Text style={styles.saveText}>
            {saving
              ? 'Guardando...'
              : document
                ? 'Guardar cambios'
                : 'Guardar documento'}
          </Text>
        </Pressable>
      </ScrollView>

      <CategoryModal
        category={category}
        onChange={(next) => {
          setCategory(next);
          setCategoryOpen(false);
        }}
        onClose={() => setCategoryOpen(false)}
        visible={categoryOpen}
      />
    </KeyboardAvoidingView>
  );
}

function HeaderButton({
  icon,
  label,
  onPress,
}: {
  icon: 'chevron-left';
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
    >
      <MaterialCommunityIcons name={icon} size={31} color={colors.text} />
    </Pressable>
  );
}

function FieldLabel({ children }: { children: string }) {
  return <Text style={styles.fieldLabel}>{children}</Text>;
}

function FileOption({
  background,
  color,
  icon,
  label,
  onPress,
}: {
  background: string;
  color: string;
  icon: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.fileOption, pressed && styles.pressed]}
    >
      <View style={[styles.fileIcon, { backgroundColor: background }]}>
        <MaterialCommunityIcons
          name={icon as never}
          size={22}
          color={color}
        />
      </View>
      <Text style={styles.fileOptionText}>{label}</Text>
      <MaterialCommunityIcons
        name="chevron-right"
        size={25}
        color="#A0A39E"
      />
    </Pressable>
  );
}

function SelectedFileCard({
  file,
  onRemove,
}: {
  file: SelectedFile;
  onRemove?: () => void;
}) {
  const pdf = file.type === 'pdf';
  return (
    <View style={styles.selectedFile}>
      <View
        style={[
          styles.selectedFileIcon,
          { backgroundColor: pdf ? '#F0E5D5' : '#E5E9F5' },
        ]}
      >
        <MaterialCommunityIcons
          name={pdf ? 'file-pdf-box' : 'image-outline'}
          size={26}
          color={pdf ? '#6B5234' : '#405476'}
        />
      </View>
      <View style={styles.selectedFileText}>
        <Text numberOfLines={1} style={styles.selectedFileName}>
          {file.name}
        </Text>
        <Text style={styles.selectedFileType}>
          {pdf ? 'Documento PDF' : 'Imagen'}
        </Text>
      </View>
      {onRemove ? (
        <Pressable
          accessibilityLabel="Quitar archivo"
          hitSlop={12}
          onPress={onRemove}
        >
          <MaterialCommunityIcons
            name="close-circle"
            size={22}
            color="#A0A39E"
          />
        </Pressable>
      ) : null}
    </View>
  );
}

function CategoryModal({
  category,
  visible,
  onChange,
  onClose,
}: {
  category: Category;
  visible: boolean;
  onChange: (category: Category) => void;
  onClose: () => void;
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
        <Text style={styles.sheetTitle}>Seleccionar categoría</Text>
        <View style={styles.categoryList}>
          {categories.map((option) => {
            const theme = categoryTheme[option];
            return (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ checked: option === category }}
                key={option}
                onPress={() => onChange(option)}
                style={({ pressed }) => [
                  styles.categoryOption,
                  pressed && styles.pressed,
                ]}
              >
                <View
                  style={[
                    styles.categoryDot,
                    { backgroundColor: theme.background },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={theme.icon as never}
                    size={20}
                    color={theme.foreground}
                  />
                </View>
                <Text style={styles.categoryOptionText}>{option}</Text>
                {option === category ? (
                  <MaterialCommunityIcons
                    name="check"
                    size={23}
                    color={colors.green}
                  />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    paddingBottom: 28,
    paddingHorizontal: 20,
  },
  headerButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    height: 46,
    justifyContent: 'center',
    marginTop: 8,
    width: 46,
  },
  title: {
    color: colors.text,
    fontSize: 29,
    fontWeight: '800',
    letterSpacing: -0.7,
    marginTop: 13,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 3,
  },
  fieldLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.1,
    marginBottom: 11,
    marginTop: 28,
  },
  inputContainer: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 17,
    flexDirection: 'row',
    height: 56,
    paddingHorizontal: 18,
    ...shadows.card,
  },
  input: {
    color: colors.text,
    flex: 1,
    fontSize: 16,
    paddingRight: 10,
  },
  select: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 17,
    flexDirection: 'row',
    height: 58,
    paddingHorizontal: 16,
    ...shadows.card,
  },
  selectIcon: {
    alignItems: 'center',
    borderRadius: 8,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  selectText: {
    color: colors.text,
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  fileOptions: {
    backgroundColor: colors.surface,
    borderRadius: 21,
    overflow: 'hidden',
    ...shadows.card,
  },
  fileOption: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 63,
    paddingHorizontal: 16,
  },
  fileIcon: {
    alignItems: 'center',
    borderRadius: 11,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  fileOptionText: {
    color: colors.text,
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 14,
  },
  divider: {
    backgroundColor: colors.border,
    height: StyleSheet.hairlineWidth,
    marginLeft: 74,
    marginRight: 17,
  },
  selectedFile: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 19,
    flexDirection: 'row',
    minHeight: 78,
    padding: 15,
    ...shadows.card,
  },
  selectedFileIcon: {
    alignItems: 'center',
    borderRadius: 13,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  selectedFileText: {
    flex: 1,
    marginHorizontal: 13,
  },
  selectedFileName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  selectedFileType: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  biometricCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 21,
    flexDirection: 'row',
    marginTop: 22,
    minHeight: 82,
    paddingHorizontal: 18,
    ...shadows.card,
  },
  biometricText: {
    flex: 1,
    paddingRight: 12,
  },
  biometricTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  biometricSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 5,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 19,
    height: 58,
    justifyContent: 'center',
    marginTop: 28,
  },
  saveDisabled: {
    backgroundColor: '#B8BBB7',
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 16,
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
    paddingBottom: Platform.OS === 'ios' ? 36 : 22,
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
    marginBottom: 12,
    marginTop: 24,
  },
  categoryList: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    overflow: 'hidden',
  },
  categoryOption: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 58,
    paddingHorizontal: 14,
  },
  categoryDot: {
    alignItems: 'center',
    borderRadius: 9,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  categoryOptionText: {
    color: colors.text,
    flex: 1,
    fontSize: 16,
    marginLeft: 13,
  },
});
