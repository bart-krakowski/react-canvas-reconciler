import { CircleProps, RectProps, TextProps } from "./MyReconciler";

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