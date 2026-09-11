import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { WalletDocument } from '../model';
import { categoryTheme, colors, shadows } from '../theme';

type Props = {
  documents: WalletDocument[];
  loading: boolean;
  onAdd: () => void;
  onOpen: (document: WalletDocument) => void;
};

export function HomeScreen({ documents, loading, onAdd, onOpen }: Props) {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topRow}>
        <Text style={styles.brand}>DocWallet</Text>
        <Pressable
          accessibilityLabel="Agregar documento"
          accessibilityRole="button"
          onPress={onAdd}
          style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
        >
          <MaterialCommunityIcons name="plus" size={29} color="#FFFFFF" />
        </Pressable>
      </View>

      <Text style={styles.title}>Mis documentos</Text>
      <Text style={styles.subtitle}>
        {loading
          ? 'Cargando documentos...'
          : `${documents.length} ${documents.length === 1 ? 'documento guardado' : 'documentos guardados'}`}
      </Text>

      {!loading && documents.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <MaterialCommunityIcons
              name="wallet-outline"
              size={42}
              color={colors.blue}
            />
          </View>
          <Text style={styles.emptyTitle}>Tu wallet está vacía</Text>
          <Text style={styles.emptyText}>
            Guarda identificaciones, credenciales y documentos importantes en
            un solo lugar.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={onAdd}
            style={({ pressed }) => [
              styles.emptyButton,
              pressed && styles.pressed,
            ]}
          >
            <MaterialCommunityIcons name="plus" size={20} color="#FFFFFF" />
            <Text style={styles.emptyButtonText}>Agregar documento</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.cardList}>
        {documents.map((document) => (
          <DocumentCard
            document={document}
            key={document.id}
            onPress={() => onOpen(document)}
          />
        ))}
      </View>

      {documents.length > 0 ? (
        <Text style={styles.hint}>Toca una tarjeta para abrirla</Text>
      ) : null}
    </ScrollView>
  );
}

function DocumentCard({
  document,
  onPress,
}: {
  document: WalletDocument;
  onPress: () => void;
}) {
  const theme = categoryTheme[document.category];

  return (
    <Pressable
      accessibilityHint={
        document.protected
          ? 'Solicitará autenticación biométrica'
          : 'Se abrirá directamente'
      }
      accessibilityLabel={`${document.name}, ${document.category}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.background },
        pressed && styles.cardPressed,
      ]}
    >
      <View style={[styles.decoration, { borderColor: theme.foreground }]} />
      <View style={styles.cardHeader}>
        <View style={styles.categoryRow}>
          <View
            style={[styles.categoryIcon, { backgroundColor: theme.foreground }]}
          >
            <MaterialCommunityIcons
              name={theme.icon as never}
              size={20}
              color="#FFFFFF"
            />
          </View>
          <Text style={[styles.category, { color: theme.foreground }]}>
            {document.category.toUpperCase()}
          </Text>
        </View>
        {document.protected ? (
          <MaterialCommunityIcons
            name="lock-outline"
            size={22}
            color={theme.foreground}
          />
        ) : null}
      </View>

      <Text
        numberOfLines={2}
        style={[styles.documentName, { color: theme.foreground }]}
      >
        {document.name}
      </Text>

      <View style={styles.cardFooter}>
        <Text style={[styles.protection, { color: theme.foreground }]}>
          {document.protected ? 'Documento protegido' : 'Sin protección'}
        </Text>
        <View style={styles.fileBadge}>
          <Text style={[styles.fileBadgeText, { color: theme.foreground }]}>
            {document.fileType === 'pdf' ? 'PDF' : 'IMG'}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  brand: {
    color: '#626660',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 16,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },
  title: {
    color: colors.text,
    fontSize: 31,
    fontWeight: '800',
    letterSpacing: -0.8,
    marginTop: 10,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  cardList: {
    gap: 16,
    marginTop: 26,
  },
  card: {
    borderRadius: 25,
    height: 176,
    overflow: 'hidden',
    padding: 20,
    ...shadows.card,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  decoration: {
    borderRadius: 70,
    borderWidth: 1,
    height: 126,
    opacity: 0.12,
    position: 'absolute',
    right: -29,
    top: -30,
    width: 126,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  categoryIcon: {
    alignItems: 'center',
    borderRadius: 11,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  category: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.15,
  },
  documentName: {
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginTop: 27,
    maxWidth: '84%',
  },
  cardFooter: {
    alignItems: 'center',
    bottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: 20,
    position: 'absolute',
    right: 20,
  },
  protection: {
    fontSize: 13,
    opacity: 0.78,
  },
  fileBadge: {
    backgroundColor: 'rgba(255,255,255,0.68)',
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 7,
  },
  fileBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  hint: {
    color: '#8B8E89',
    fontSize: 12,
    marginTop: 27,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 26,
    marginTop: 42,
    paddingHorizontal: 28,
    paddingVertical: 42,
    ...shadows.card,
  },
  emptyIcon: {
    alignItems: 'center',
    backgroundColor: colors.blueSoft,
    borderRadius: 24,
    height: 74,
    justifyContent: 'center',
    width: 74,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 24,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
    textAlign: 'center',
  },
  emptyButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 17,
    flexDirection: 'row',
    gap: 8,
    height: 54,
    justifyContent: 'center',
    marginTop: 28,
    paddingHorizontal: 24,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
