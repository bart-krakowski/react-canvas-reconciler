import ReactReconciler, { HostConfig } from "react-reconciler";
import { DefaultEventPriority } from "react-reconciler/constants";

interface BaseShape {
  color?: string;
  onClick?: () => void;
  x: number;
  y: number;
}

interface RectProps extends BaseShape {
  type: "rect";
  width: number;
  height: number;
}

interface CircleProps extends BaseShape {
  type: "circle";
  radius: number;
}

interface TextProps extends BaseShape {
  type: "text";
  text: string;
  font?: string;
}

type ShapeProps = RectProps | CircleProps | TextProps;

type Type = ShapeProps["type"];
type Props = ShapeProps;
type Container = {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  children: Instance[];
};
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
type HostContext = {};
type UpdatePayload = Props;
type ChildSet = never;
type TimeoutHandle = number;
type NoTimeout = -1;

function addClickIndicator(x: number, y: number, container: Container) {
  const { ctx } = container;
  const dpr = window.devicePixelRatio || 1;
  
  ctx.save();
  ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
  ctx.beginPath();
  ctx.arc(x / dpr, y / dpr, 5, 0, 2 * Math.PI);
  ctx.fill();
  ctx.restore();

  setTimeout(() => {
    renderAll(container);
  }, 1000);
}

const renderAll = (container: Container) => {
  const { ctx, canvas } = container;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  container.children.forEach((child) =>
    renderInstance(child, container)
  );
};

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

const hitTest = (container: Container, x: number, y: number): Instance | null => {
  let topHit: Instance | null = null;
  const dpr = window.devicePixelRatio || 1;

  const testShape = (instance: Instance) => {
    const { type, props } = instance;
    let hit = false;

    switch (type) {
      case "rect":
        hit = x >= props.x && x <= props.x + props.width * dpr && 
              y >= props.y && y <= props.y + props.height * dpr;
        break;
      case "circle":
        const dx = x - props.x;
        const dy = y - props.y;
        hit = dx * dx + dy * dy <= (props.radius * dpr) * (props.radius * dpr);
        break;
      case "text":
        // Simple hit test for text (treat as a point)
        hit = Math.abs(x - props.x) < 10 && Math.abs(y - props.y) < 10;
        break;
    }

    if (hit) {
      topHit = instance;
    }

    instance.children.forEach(testShape);
  };

  container.children.forEach(testShape);

  return topHit;
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
    throw new Error(
      "Canvas renderer does not support text instances"
    );
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

  preparePortalMount() {},

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
      renderInstance(child, container);
    }
  },

  insertBefore(parentInstance, child, beforeChild) {
    if (
      typeof child === "object" &&
      typeof beforeChild === "object"
    ) {
      const index =
        parentInstance.children.indexOf(beforeChild);
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
        renderInstance(child, container);
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
    throw new Error(
      "Canvas renderer does not support text instances"
    );
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

  detachDeletedInstance() {},

  beforeActiveInstanceBlur() {},

  afterActiveInstanceBlur() {},

  prepareScopeUpdate() {},

  getInstanceFromScope() {
    return null;
  },

  getInstanceFromNode() {
    return null;
  },
};

const renderInstance = (
  instance: Instance,
  container: Container
) => {
  const { ctx } = container;
  const { type, props } = instance;
  const ratio = window.devicePixelRatio || 1;

  ctx.save();

  switch (type) {
    case "rect":
      ctx.fillStyle = props.color || "black";
      ctx.fillRect(
        props.x * ratio,
        props.y * ratio,
        props.width * ratio,
        props.height * ratio
      );
      break;
    case "circle":
      ctx.fillStyle = props.color || "black";
      ctx.beginPath();
      ctx.arc(
        props.x * ratio,
        props.y * ratio,
        props.radius * ratio,
        0,
        2 * Math.PI
      );
      ctx.fill();
      break;
    case "text":
      ctx.fillStyle = props.color || "black";
      ctx.font = props.font || "12px Arial";
      ctx.fillText(
        props.text,
        props.x * ratio,
        props.y * ratio
      );
      break;
  }

  ctx.restore();

  instance.children.forEach((child) =>
    renderInstance(child, container)
  );
};

const reconciler = ReactReconciler(hostConfig);

function resizeCanvas(canvas: HTMLCanvasElement) {
  canvas.removeAttribute('width');
  canvas.removeAttribute('height');

  const parent = canvas.parentElement;
  const width = parent ? parent.clientWidth : window.innerWidth;
  const height = parent ? parent.clientHeight : window.innerHeight;
  const dpr = window.devicePixelRatio || 1;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.scale(dpr, dpr);
  }
}

export const render = (
  element: React.ReactElement,
  canvas: HTMLCanvasElement
) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get 2D context from canvas");
  }

  resizeCanvas(canvas);

  const container: Container = {
    canvas,
    ctx,
    children: [],
  };

  const root = reconciler.createContainer(
    container,
    0,
    null,
    false,
    null,
    "",
    (error) => console.error(error),
    null
  );

  reconciler.updateContainer(element, root, null, () => {
    renderAll(container);
  });

  window.addEventListener("resize", () => {
    resizeCanvas(canvas);
    renderAll(container);
  });

  canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
  
    addClickIndicator(x, y, container);
    handleClick(container, x, y);
  });

  return root;
};