export interface NotifyItemData {
  onClick?: () => void;
  buttonText?: string;
  buttonClass?: string;
  progressBarDuration?: number;
}

export interface NotifyItem {
  title: string;
  text: string;
  data?: NotifyItemData;
}