import type { Category } from './model';

export const colors = {
  background: '#F6F6F3',
  surface: '#FFFFFF',
  text: '#17191C',
  textSecondary: '#6F746F',
  border: '#E6E7E2',
  primary: '#192331',
  green: '#39715C',
  greenSoft: '#DCE8DF',
  blue: '#3D5277',
  blueSoft: '#DEE4F2',
  red: '#B44848',
  redSoft: '#F5E4E4',
  overlay: 'rgba(16, 21, 29, 0.44)',
};

export const categoryTheme: Record<
  Category,
  { background: string; foreground: string; icon: string }
> = {
  Identificación: {
    background: '#DCE8DF',
    foreground: '#294C3A',
    icon: 'card-account-details-outline',
  },
  Universidad: {
    background: '#DEE4F2',
    foreground: '#33496D',
    icon: 'school-outline',
  },
  Trabajo: {
    background: '#EEE3D1',
    foreground: '#684F30',
    icon: 'briefcase-outline',
  },
  Personal: {
    background: '#EEDFE2',
    foreground: '#67434B',
    icon: 'heart-outline',
  },
  Otros: {
    background: '#E1E5E8',
    foreground: '#43515A',
    icon: 'file-document-outline',
  },
};

export const shadows = {
  card: {
    shadowColor: '#172033',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 3,
  },
};
