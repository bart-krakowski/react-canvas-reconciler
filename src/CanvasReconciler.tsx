import { useRef, useEffect, FC, ReactNode } from 'react';
import ReactReconciler, { HostConfig, OpaqueRoot } from "react-reconciler";
import { DefaultEventPriority } from "react-reconciler/constants";

type Canvas = HTMLCanvasElement;

interface RootState {
  canvas: Canvas;
  ctx: CanvasRenderingContext2D;
  children: Instance[];
  dpr: number;
  invalidate: () => void;
}

interface BaseShape {
  color?: string;
  onClick?: () => void;
  x: number;
  y: number;
}

export interface RectProps extends BaseShape {
  type: "rect";
  width: number;
  height: number;
}

export interface CircleProps extends BaseShape {
  type: "circle";
  radius: number;
}

export interface TextProps extends BaseShape {
  type: "text";
  text: string;
  font?: string;
}

type ShapeProps = RectProps | CircleProps | TextProps;

export type NodeProps<T extends ShapeProps> = Omit<T, "type">;

type Type = `canvas${Capitalize<ShapeProps["type"]>}`;
type Props = ShapeProps;
type Container = RootState;
type Instance = {
  type: Type;
  props: Props;
  parent: Instance | null;
  children: Instance[];
};
type TextInstance = never;
type SuspenseInstance = never;
type HydratableInstance = never;
type PublicInstance = Instance;
type HostContext = Record<string, never>;
type UpdatePayload = Props;
type ChildSet = never;
type TimeoutHandle = number;
type NoTimeout = -1;

function resizeCanvas(canvas: HTMLCanvasElement, state: RootState) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const dpr = window.devicePixelRatio || 1;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  state.dpr = dpr;
  state.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function getClickCoordinates(canvas: HTMLCanvasElement, event: MouseEvent, dpr: number): { x: number, y: number } {
  const rect = canvas.getBoundingClientRect();
  const x = (event.clientX - rect.left) * (canvas.width / rect.width / dpr);
  const y = (event.clientY - rect.top) * (canvas.height / rect.height / dpr);
  return { x, y };
}

function addClickIndicator(x: number, y: number, container: Container) {
  const { ctx } = container;

  ctx.save();
  ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, 2 * Math.PI);
  ctx.fill();
  ctx.restore();

  setTimeout(() => {
    renderAll(container);
  }, 1000);
}

const handleClick = (
  container: Container,
  x: number,
  y: number
) => {
  const hit = hitTest(container, x, y);
  if (hit) {
    hit.props.onClick?.();
  }
};

const isCircleProps = (_props: Props, type: Type): _props is CircleProps => {
  return type === "canvasCircle";
}

const isRectProps = (_props: Props, type: Type): _props is RectProps => {
  return type === "canvasRect";
}

const isTextProps = (_props: Props, type: Type): _props is TextProps => {
  return type === "canvasText";
}

const hitTest = (container: Container, x: number, y: number): Instance | null => {
  let topHit: Instance | null = null;

  const testShape = (instance: Instance, parentX = 0, parentY = 0) => {
    const { type, props } = instance;
    const absX = parentX + props.x;
    const absY = parentY + props.y;
    let hit = false;

    switch (type) {
      case "canvasRect": {
        if (isRectProps(props, type)) {
          hit = x >= absX && x <= absX + props.width &&
            y >= absY && y <= absY + props.height;
        }
        break;
      }
      case "canvasCircle": {
        if (isCircleProps(props, type)) {
          const dx = x - absX;
          const dy = y - absY;
          hit = dx * dx + dy * dy <= props.radius * props.radius;
        }
        break;
      }
      case "canvasText":
        if (isTextProps(props, type)) {
          hit = Math.abs(x - absX) < 10 && Math.abs(y - absY) < 10;
        }
        break;
    }

    if (hit) {
      topHit = instance;
    }

    instance.children.forEach(child => testShape(child, absX, absY));
  };

  container.children.forEach(child => testShape(child));

  return topHit;
};

const renderInstance = (
  instance: Instance,
  container: Container,
  parentX = 0,
  parentY = 0
) => {
  const { ctx } = container;
  const { type, props } = instance;

  const x = parentX + props.x;
  const y = parentY + props.y;

  ctx.save();

  switch (type) {
    case "canvasRect": {
      if (isRectProps(props, type)) {
        ctx.fillStyle = props.color || "black";
        ctx.fillRect(
          x,
          y,
          props.width,
          props.height
        );
      }
    }
      break;

    case "canvasCircle": {
      if (isCircleProps(props, type)) {
        ctx.fillStyle = props.color || "black";
        ctx.beginPath();
        ctx.arc(
          x,
          y,
          props.radius,
          0,
          2 * Math.PI
        );
        ctx.fill();
      }
    }
      break;
    case "canvasText": {
      if (isTextProps(props, type)) {
        ctx.fillStyle = props.color || "black";
        ctx.font = props.font || "12px Arial";
        ctx.fillText(
          props.text,
          x,
          y
        );
      }
    }
      break;
  }

  ctx.restore();

  instance.children.forEach((child) =>
    renderInstance(child, container, x, y)
  );
};

const renderAll = (container: Container) => {
  const { ctx, canvas } = container;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
  
  container.children.forEach((child) =>
    renderInstance(child, container)
  );
};

const hostConfig: HostConfig<
  Type,
  Props,
  Container,
  Instance,
  TextInstance,
  SuspenseInstance,
  HydratableInstance,
  PublicInstance,
  HostContext,
  UpdatePayload,
  ChildSet,
  TimeoutHandle,
  NoTimeout
> = {
  supportsMutation: true,
  supportsPersistence: false,
  supportsHydration: false,

  getCurrentEventPriority: () => DefaultEventPriority,
  isPrimaryRenderer: false,
  warnsIfNotActing: true,

  createInstance(type, props) {
    return {
      type,
      props,
      parent: null,
      children: [],
    };
  },

  createTextInstance() {
    throw new Error("Canvas renderer does not support text instances");
  },

  appendInitialChild(parentInstance, child) {
    if (typeof child === "object") {
      parentInstance.children.push(child);
      child.parent = parentInstance;
    }
  },

  finalizeInitialChildren() {
    return false;
  },

  prepareUpdate(
    _instance: Instance,
    _type: string,
    _oldProps: Props,
    newProps: Props
  ) {
    return newProps;
  },

  shouldSetTextContent() {
    return false;
  },

  getRootHostContext() {
    return {};
  },

  getChildHostContext() {
    return {};
  },

  getPublicInstance(instance) {
    return instance;
  },

  prepareForCommit() {
    return null;
  },

  resetAfterCommit(containerInfo) {
    renderAll(containerInfo);
  },

  preparePortalMount() { },

  scheduleTimeout(
    fn: (...args: unknown[]) => unknown,
    delay: number
  ) {
    return setTimeout(fn, delay);
  },

  cancelTimeout(id) {
    clearTimeout(id);
  },

  noTimeout: -1 as const,

  supportsMicrotasks: true,
  scheduleMicrotask:
    typeof queueMicrotask === "function"
      ? queueMicrotask
      : typeof Promise !== "undefined"
        ? (callback: () => void) =>
          Promise.resolve(null)
            .then(callback)
            .catch((error) =>
              setTimeout(() => {
                throw error;
              })
            )
        : setTimeout,

  appendChild(parentInstance, child) {
    if (typeof child === "object") {
      parentInstance.children.push(child);
      child.parent = parentInstance;
    }
  },

  appendChildToContainer(container, child) {
    if (typeof child === "object") {
      container.children.push(child);
      renderAll(container);
    }
  },

  insertBefore(parentInstance, child, beforeChild) {
    if (
      typeof child === "object" &&
      typeof beforeChild === "object"
    ) {
      const index = parentInstance.children.indexOf(beforeChild);
      if (index !== -1) {
        parentInstance.children.splice(index, 0, child);
        child.parent = parentInstance;
      }
    }
  },

  insertInContainerBefore(container, child, beforeChild) {
    if (
      typeof child === "object" &&
      typeof beforeChild === "object"
    ) {
      const index = container.children.indexOf(beforeChild);
      if (index !== -1) {
        container.children.splice(index, 0, child);
        renderAll(container);
      }
    }
  },

  removeChild(parentInstance, child) {
    if (typeof child === "object") {
      const index = parentInstance.children.indexOf(child);
      if (index !== -1) {
        parentInstance.children.splice(index, 1);
        child.parent = null;
      }
    }
  },

  removeChildFromContainer(container, child) {
    if (typeof child === "object") {
      const index = container.children.indexOf(child);
      if (index !== -1) {
        container.children.splice(index, 1);
      }
    }
  },

  commitUpdate(instance, updatePayload) {
    instance.props = {
      ...instance.props,
      ...updatePayload,
    };
  },

  commitTextUpdate() {
    throw new Error("Canvas renderer does not support text instances");
  },

  clearContainer(container) {
    container.children = [];
    container.ctx.clearRect(
      0,
      0,
      container.canvas.width,
      container.canvas.height
    );
  },

  detachDeletedInstance() { },
  beforeActiveInstanceBlur() { },
  afterActiveInstanceBlur() { },
  prepareScopeUpdate() { },
  getInstanceFromScope() { return null; },
  getInstanceFromNode() { return null; },
};

const reconciler = ReactReconciler(hostConfig);

const createRoot = (canvas: Canvas) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error("Could not get 2D context from canvas");

  const dpr = window.devicePixelRatio || 1;

  const state: RootState = {
    canvas,
    ctx,
    children: [],
    dpr,
    invalidate: () => renderAll(state),
  };

  const root: OpaqueRoot = reconciler.createContainer(
    state,
    0,
    null,
    false,
    null,
    '',
    console.error,
    null
  );

  const handleResize = () => {
    resizeCanvas(canvas, state);
    renderAll(state);
  };

  const handleCanvasClick = (event: MouseEvent) => {
    const { x, y } = getClickCoordinates(canvas, event, state.dpr);
    addClickIndicator(x, y, state);
    handleClick(state, x, y);
  };

  window.addEventListener('resize', handleResize);
  canvas.addEventListener('click', handleCanvasClick);

  handleResize();

  return {
    render: (element: ReactNode) => {
      reconciler.updateContainer(element, root, null, () => {
        renderAll(state);
      });
    },
    unmount: () => {
      reconciler.updateContainer(null, root, null, () => {});
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('click', handleCanvasClick);
    },
  };
};

interface CanvasProps {
  children?: ReactNode;
}

export const Canvas: FC<CanvasProps> = ({ children }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rootRef = useRef<ReturnType<typeof createRoot> | null>(null);

  useEffect(() => {
    if (canvasRef.current && !rootRef.current) {
      rootRef.current = createRoot(canvasRef.current);
      rootRef.current.render(children);
    }

    return () => {
      rootRef.current?.unmount();
    };
  }, []);

  useEffect(() => {
    rootRef.current?.render(children);
  }, [children]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      }}
    />
  );
};
