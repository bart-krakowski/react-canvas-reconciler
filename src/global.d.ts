import { CircleProps, RectProps } from "./MyReconciler";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'canvas-rect': NodeProps<RectProps>;
      'canvas-circle': NodeProps<CircleProps>;
    }
  }
}

export {};