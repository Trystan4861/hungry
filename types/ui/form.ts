import type { Ref } from 'vue';

export interface FormChanges<T extends Record<string, boolean>> {
  changes: Ref<T>;
  markAsChanged: (field: keyof T) => void;
  hasChanges: () => boolean;
  resetChanges: () => void;
  saveChanges: (saveCallbacks: Record<keyof T, () => void>) => void;
}