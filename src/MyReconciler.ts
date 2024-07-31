import ReactReconciler, {
  HostConfig,
} from "react-reconciler";
import { DefaultEventPriority } from "react-reconciler/constants";

const renderInstanceOrText = (
  instanceOrText: Instance | TextInstance,
  container: Container
) => {
  const { ctx } = container;
  const ratio = window.devicePixelRatio || 1;

  ctx.save();

  if ("type" in instanceOrText) {
    const { type, props } = instanceOrText;
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
    instanceOrText.children.forEach((child) =>
      renderInstanceOrText(child, container)
    );
  } else {
    // TextInstance
    ctx.fillStyle = instanceOrText.color;
    ctx.font = instanceOrText.font;
    ctx.fillText(
      instanceOrText.text,
      instanceOrText.x * ratio,
      instanceOrText.y * ratio
    );
  }

  ctx.restore();
};

const handleClick = (
  container: Container,
  x: number,
  y: number
) => {
  const hit = hitTest(container, x, y);
  if (hit) {
    hit.props.onClick?.(hit.props.id);
  }
};

const hitTest = (
  container: Container,
  x: number,
  y: number
): Instance | null => {
  let topHit: Instance | null = null;

  const testShape = (instance: Instance) => {
    const { type, props } = instance;
    let hit = false;

    switch (type) {
      case "rect":
        hit =
          x >= props.x &&
          x <= props.x + props.width &&
          y >= props.y &&
          y <= props.y + props.height;
        break;
      case "circle":
        const dx = x - props.x;
        const dy = y - props.y;
        hit =
          dx * dx + dy * dy <= props.radius * props.radius;
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

const renderAll = (container: Container) => {
  const { ctx, canvas } = container;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  container.children.forEach((child) =>
    renderInstanceOrText(child, container)
  );
};

interface BaseShape {
  color?: string;
  onClick?: () => void;
}

interface RectProps extends BaseShape {
  type: "rect";
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CircleProps extends BaseShape {
  type: "circle";
  x: number;
  y: number;
  radius: number;
}

interface TextProps extends BaseShape {
  type: "text";
  x: number;
  y: number;
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

  commitUpdate(instance, updatePayload, _type, _oldProps) {
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

const resizeCanvas = (canvas: HTMLCanvasElement) => {
  const { width, height } = canvas.getBoundingClientRect();
  if (canvas.width !== width || canvas.height !== height) {
    const { devicePixelRatio: ratio = 1 } = window;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(ratio, ratio);
    }
    return true;
  }
  return false;
};

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
    if (resizeCanvas(canvas)) {
      renderAll(container);
    }
  });

  canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
  
    console.log('Click detected:', { x, y, scaleX, scaleY, canvasWidth: canvas.width, canvasHeight: canvas.height });
  
    handleClick(container, x, y);
  });

  return root;
};
