export interface DraggableEvent<T> {
  oldIndex: number;
  newIndex: number;
  preventDefault: () => void;
  draggedContext: {
    element: T;
    index: number;
  };
  relatedContext: {
    element: T;
    index: number;
  };
}