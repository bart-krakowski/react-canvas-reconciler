import ReactReconciler from 'react-reconciler';

declare global {
  interface HTMLElement {
    _rootContainer?: ReactReconciler.FiberRoot;
  }

  namespace JSX {
    interface IntrinsicElements {
      group: {
        x: number;
        y: number;
        children: JSX.Element[];
      }
      'canvas-rect': {
        x: number;
        y: number;
        width: number;
        height: number;
        fill: string;
      };
    }
  }
}