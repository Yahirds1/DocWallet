import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { BiometricInfo, WalletDocument } from '../model';
import { colors } from '../theme';

type Props = {
  authenticating: boolean;
  biometric: BiometricInfo;
  document: WalletDocument | null;
  error: string | null;
  onAuthenticate: () => void;
  onClose: () => void;
};

export function BiometricSheet({
  authenticating,
  biometric,
  document,
  error,
  onAuthenticate,
  onClose,
}: Props) {
  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
      transparent
      visible={Boolean(document)}
    >
      <Pressable accessibilityLabel="Cancelar" onPress={onClose} style={styles.scrim} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View
          style={[
            styles.biometricIcon,
            error ? styles.errorIconBackground : null,
          ]}
        >
          {authenticating ? (
            <ActivityIndicator color={colors.blue} size="large" />
          ) : (
            <MaterialCommunityIcons
              name={error ? 'shield-alert-outline' : 'face-recognition'}
              size={48}
              color={error ? colors.red : colors.blue}
            />
          )}
        </View>

        <Text style={styles.title}>
          {error ? 'No pudimos verificarte' : 'Documento protegido'}
        </Text>
        <Text style={styles.description}>
          {error ??
            `Confirma tu identidad para abrir “${document?.name ?? ''}”.`}
        </Text>

        <Pressable
          accessibilityRole="button"
          disabled={authenticating || !biometric.available}
          onPress={onAuthenticate}
          style={({ pressed }) => [
            styles.primaryButton,
            !biometric.available && styles.disabledButton,
            pressed && styles.pressed,
          ]}
        >
          {authenticating ? null : (
            <MaterialCommunityIcons
              name="face-recognition"
              size={23}
              color="#FFFFFF"
            />
          )}
          <Text style={styles.primaryButtonText}>
            {authenticating
              ? 'Verificando identidad...'
              : error
                ? 'Intentar nuevamente'
                : biometric.actionLabel}
          </Text>
        </Pressable>

        {!biometric.available ? (
          <Text style={styles.unavailableText}>
            La biometría no está configurada en este dispositivo.
          </Text>
        ) : null}

        <Pressable
          accessibilityRole="button"
          disabled={authenticating}
          hitSlop={12}
          onPress={onClose}
          style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
        >
          <Text style={styles.cancelText}>Cancelar</Text>
        </Pressable>

        <View style={styles.privacyRow}>
          <MaterialCommunityIcons
            name="lock-outline"
            size={20}
            color="#858984"
          />
          <Text style={styles.privacyText}>
            Tu documento permanece oculto y protegido.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    backgroundColor: colors.overlay,
    flex: 1,
  },
  sheet: {
    alignItems: 'center',
    backgroundColor: '#FCFCFA',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    bottom: 0,
    left: 0,
    minHeight: 518,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    paddingHorizontal: 28,
    position: 'absolute',
    right: 0,
  },
  handle: {
    backgroundColor: '#D5D7D2',
    borderRadius: 3,
    height: 5,
    marginTop: 12,
    width: 62,
  },
  biometricIcon: {
    alignItems: 'center',
    backgroundColor: colors.blueSoft,
    borderRadius: 44,
    height: 86,
    justifyContent: 'center',
    marginTop: 30,
    width: 86,
  },
  errorIconBackground: {
    backgroundColor: colors.redSoft,
  },
  title: {
    color: colors.text,
    fontSize: 25,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginTop: 22,
    textAlign: 'center',
  },
  description: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
    maxWidth: 310,
    textAlign: 'center',
  },
  primaryButton: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: colors.primary,
    borderRadius: 19,
    flexDirection: 'row',
    gap: 10,
    height: 58,
    justifyContent: 'center',
    marginTop: 30,
  },
  disabledButton: {
    backgroundColor: '#AEB2AE',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    marginTop: 22,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  cancelText: {
    color: '#626762',
    fontSize: 16,
    fontWeight: '700',
  },
  unavailableText: {
    color: colors.red,
    fontSize: 12,
    marginTop: 12,
    textAlign: 'center',
  },
  privacyRow: {
    alignItems: 'center',
    alignSelf: 'stretch',
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
    paddingHorizontal: 12,
    paddingTop: 24,
  },
  privacyText: {
    color: '#858984',
    flex: 1,
    fontSize: 12.5,
  },
  pressed: {
    opacity: 0.76,
  },
});
