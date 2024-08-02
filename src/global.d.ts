import { CircleProps, RectProps, TextProps } from "./CanvasReconciler";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'canvasRect': NodeProps<RectProps>;
      'canvasCircle': NodeProps<CircleProps>;
      'canvasText': NodeProps<TextProps>;
    }
  }
}

export {};