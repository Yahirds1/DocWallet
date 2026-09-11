export const categories = [
  'Identificación',
  'Universidad',
  'Trabajo',
  'Personal',
  'Otros',
] as const;

export type Category = (typeof categories)[number];
export type DocumentType = 'image' | 'pdf';

export type WalletDocument = {
  id: string;
  name: string;
  category: Category;
  uri: string;
  fileName: string;
  fileType: DocumentType;
  protected: boolean;
  createdAt: number;
};

export type SelectedFile = {
  uri: string;
  name: string;
  type: DocumentType;
};

export type DocumentDraft = {
  name: string;
  category: Category;
  protected: boolean;
  file?: SelectedFile;
};

export type BiometricInfo = {
  available: boolean;
  methodName: string;
  actionLabel: string;
};
