import { ref } from 'vue';
import type { Ref } from 'vue';

interface TouchOptions {
  longPressDelay?: number;
  doubleTapDelay?: number;
  swipeThreshold?: number;
}

interface TouchCallbacks {
  onTap?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down') => void;
  onTouchStart?: () => void;
  onTouchEnd?: () => void;
}

export function useTouch(options: TouchOptions = {}) {
  const {
    longPressDelay = 500,
    doubleTapDelay = 300,
    swipeThreshold = 50
  } = options;

  const touchStartTime = ref(0);
  const lastTapTime = ref(0);
  const touchTimer = ref<number | null>(null);
  const startPosition = ref({ x: 0, y: 0 });
  const isLongPress = ref(false);

  const handleTouchStart = (event: TouchEvent, callbacks?: TouchCallbacks) => {
    const touch = event.touches[0];
    touchStartTime.value = Date.now();
    startPosition.value = {
      x: touch.clientX,
      y: touch.clientY
    };
    isLongPress.value = false;

    callbacks?.onTouchStart?.();

    if (callbacks?.onLongPress) {
      touchTimer.value = window.setTimeout(() => {
        isLongPress.value = true;
        callbacks.onLongPress?.();
      }, longPressDelay);
    }
  };

  const handleTouchMove = (event: TouchEvent, callbacks?: TouchCallbacks) => {
    if (touchTimer.value) {
      clearTimeout(touchTimer.value);
      touchTimer.value = null;
    }

    if (!callbacks?.onSwipe) return;

    const touch = event.touches[0];
    const deltaX = touch.clientX - startPosition.value.x;
    const deltaY = touch.clientY - startPosition.value.y;

    if (Math.abs(deltaX) > swipeThreshold || Math.abs(deltaY) > swipeThreshold) {
      const direction = Math.abs(deltaX) > Math.abs(deltaY)
        ? deltaX > 0 ? 'right' : 'left'
        : deltaY > 0 ? 'down' : 'up';

      callbacks.onSwipe(direction);
    }
  };

  const handleTouchEnd = (event: TouchEvent, callbacks?: TouchCallbacks) => {
    if (touchTimer.value) {
      clearTimeout(touchTimer.value);
      touchTimer.value = null;
    }

    callbacks?.onTouchEnd?.();

    if (isLongPress.value) {
      isLongPress.value = false;
      return;
    }

    const touchEndTime = Date.now();
    const tapTime = touchEndTime - touchStartTime.value;

    if (tapTime < longPressDelay) {
      const timeSinceLastTap = touchEndTime - lastTapTime.value;

      if (timeSinceLastTap < doubleTapDelay) {
        callbacks?.onDoubleTap?.();
        lastTapTime.value = 0;
      } else {
        callbacks?.onTap?.();
        lastTapTime.value = touchEndTime;
      }
    }
  };

  const cleanup = () => {
    if (touchTimer.value) {
      clearTimeout(touchTimer.value);
      touchTimer.value = null;
    }
  };

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    cleanup,
    isLongPress
  };
}