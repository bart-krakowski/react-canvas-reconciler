import ReactReconciler, {
  type HostConfig,
} from "react-reconciler";

type Type = string;
type Props = { [key: string]: unknown };
type Container = Document | Element;
type Instance = Element;
type TextInstance = Text;

type SuspenseInstance = Element;
type HydratableInstance = unknown;
type PublicInstance = Instance | TextInstance
type HostContext = unknown;
type UpdatePayload = Record<string, unknown> | null;
type ChildSet = Element;
type TimeoutHandle = ReturnType<typeof setTimeout>;
type NoTimeout = number;

const updateDomProperties = (
  domElement: Element,
  nextProps: Props,
  prevProps: Props = {}
) => {
  Object.keys(prevProps).forEach((propName) => {
    if (
      propName.startsWith("on") &&
      typeof prevProps[propName] === "function"
    ) {
      const callback = prevProps[propName] as EventListener;
      const eventType = propName.toLowerCase().substring(2);
      domElement.removeEventListener(
        eventType,
        callback
      );
    }
  });

  Object.keys(nextProps).forEach((propName) => {
    if (
      propName.startsWith("on") &&
      typeof nextProps[propName] === "function"
    ) {
      const eventType = propName.toLowerCase().substring(2);
      domElement.addEventListener(
        eventType,
        nextProps[propName] as EventListener
      );
    } else if (propName !== "children") {
      if (nextProps[propName] !== null) {
        domElement.setAttribute(
          propName,
          nextProps[propName] as string
        );
      } else {
        domElement.removeAttribute(propName);
      }
    }
  });
};

export const hostConfig: HostConfig<
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
  createInstance(type, props) {
    const el = document.createElement(type);
    updateDomProperties(el, props);
    return el;
  },

  createTextInstance(text) {
    return document.createTextNode(text);
  },

  appendChild(
    parentInstance,
    child
  ) {
    parentInstance.appendChild(child);
  },

  appendChildToContainer(container, child) {
    container.appendChild(child);
  },

  removeChild(parentInstance, child) {
    parentInstance.removeChild(child);
  },

  removeChildFromContainer(
    container,
    child
  ) {
    container.removeChild(child);
  },

  finalizeInitialChildren() {
    return false;
  },

  prepareUpdate() {
    return {};
  },

  commitUpdate(
    instance,
    _updatePayload,
    _type,
    oldProps,
    newProps
  ) {
    updateDomProperties(instance, newProps, oldProps);
  },

  commitTextUpdate(textInstance, _oldText, newText) {
    textInstance.nodeValue = newText;
  },

  shouldSetTextContent() {
    return false;
  },

  resetTextContent() {},

  getRootHostContext() {
    return {};
  },

  prepareForCommit() {
    return null;
  },

  resetAfterCommit() {},

  clearContainer(container) {
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  },

  supportsMutation: true,

  supportsPersistence: false,

  supportsHydration: false,

  appendInitialChild(parentInstance, child) {
    if (parentInstance.appendChild) {
      parentInstance.appendChild(child);
    }
  },

  getChildHostContext(parentHostContext) {
    return parentHostContext;
  },

  getPublicInstance(instance) {
    return instance;
  },

  preparePortalMount() {
    throw new Error("Function not implemented.");
  },

  scheduleTimeout(fn, delay) {
    return window.setTimeout(fn, delay);
  },

  cancelTimeout(id) {
    window.clearTimeout(id);
  },

  noTimeout: 0,

  isPrimaryRenderer: false,

  getCurrentEventPriority() {
    return 0;
  },

  getInstanceFromNode() {
    return null;
  },

  beforeActiveInstanceBlur() {
    throw new Error("Function not implemented.");
  },

  afterActiveInstanceBlur() {
    throw new Error("Function not implemented.");
  },

  prepareScopeUpdate() {
    throw new Error("Function not implemented.");
  },

  getInstanceFromScope() {
    return null;
  },

  detachDeletedInstance(node) {
    node.remove();
  },
};

const DOMReconciler = ReactReconciler(hostConfig);

export const render = (
  element: React.ReactElement,
  container: HTMLElement
) => {
  if (!container._rootContainer) {
    container._rootContainer =
      DOMReconciler.createContainer(
        container,
        0,
        null,
        false,
        null,
        "",
        (error) => console.error(error),
        null
      );
  }

  DOMReconciler.updateContainer(
    element,
    container._rootContainer,
    null,
    null
  );
};
