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

export interface NotifyOptions {
  title?: string;
  text?: string;
  icon?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  showCancelButton?: boolean;
  timer?: number;
  position?: 'top' | 'top-start' | 'top-end' | 'center' | 'center-start' | 'center-end' | 'bottom' | 'bottom-start' | 'bottom-end';
  customClass?: {
    container?: string;
    popup?: string;
    header?: string;
    title?: string;
    closeButton?: string;
    icon?: string;
    image?: string;
    content?: string;
    input?: string;
    actions?: string;
    confirmButton?: string;
    cancelButton?: string;
    footer?: string;
  };
}