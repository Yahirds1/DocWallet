import AsyncStorage from '@react-native-async-storage/async-storage';
import { Directory, File, Paths } from 'expo-file-system';

import type { SelectedFile, WalletDocument } from './model';

const STORAGE_KEY = '@docwallet/documents-v1';
const documentsDirectory = new Directory(Paths.document, 'docwallet');

function ensureDirectory() {
  if (!documentsDirectory.exists) {
    documentsDirectory.create({ idempotent: true, intermediates: true });
  }
}

function extensionFor(file: SelectedFile) {
  const extension = file.name.match(/\.[a-zA-Z0-9]+$/)?.[0]?.toLowerCase();
  if (extension) {
    return extension;
  }
  return file.type === 'pdf' ? '.pdf' : '.jpg';
}

export async function loadDocuments(): Promise<WalletDocument[]> {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored) as WalletDocument[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveDocuments(documents: WalletDocument[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
}

export async function persistFile(file: SelectedFile, id: string) {
  ensureDirectory();
  const source = new File(file.uri);
  const destination = new File(documentsDirectory, `${id}${extensionFor(file)}`);
  await source.copy(destination, { overwrite: true });
  return destination.uri;
}

export function removeFile(uri: string) {
  const file = new File(uri);
  if (file.exists) {
    file.delete();
  }
}
