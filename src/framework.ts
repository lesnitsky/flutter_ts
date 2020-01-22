enum HTMLElementType {
  DIV,
  TEXT,
}

export enum Alignment {
  topLeft,
  topCenter,
  topRight,
  centerLeft,
  center,
  centerRight,
  bottomLeft,
  bottomCenter,
  bottomRight,
}

interface ISize {
  width: number;
  height: number;
}

export class Size {
  width: number;
  height: number;

  constructor({ width, height }: ISize) {
    this.width = width;
    this.height = height;
  }
}

export interface Element {
  child?: Element | string;
  children?: Element[];
  classNames?: string[];
  styles?: any;
  type: HTMLElementType;
}

class ElementBinding {
  element: Element;

  constructor(element?: Element) {
    this.element = element;
  }
}

export abstract class Widget extends ElementBinding {
  abstract build(): Widget;
}

export abstract class StatelessWidget extends Widget {}

class Flush extends Widget {
  constructor(element: Element) {
    super(element);
  }

  build(): Widget {
    return null;
  }
}

class ElementBindingProxy extends Widget {
  build() {
    return new Flush(this.element);
  }
}

interface WidgetParams {
  constraints?: string;
  child: Widget;
}

interface FContainerParams extends WidgetParams {
  color?: string;
  width?: number | string;
  height?: number | string;
}

export const Colors = {
  red: 'red',
  green: 'green',
  blue: 'blue',
};

function _toCSSSize(size: number | string) {
  if (typeof size == 'number') {
    return `${size}px`;
  }

  return size;
}

export function Container({
  child,
  constraints = 'box-constraints-expand',
  color,
  height,
  width,
}: FContainerParams): Widget {
  const styles: any = {};

  if (color) {
    styles.backgroundColor = color;
  }

  if (typeof width != 'undefined') {
    styles.width = _toCSSSize(width);
  }

  if (typeof height != 'undefined') {
    styles.height = _toCSSSize(height);
  }

  return new ElementBindingProxy({
    type: HTMLElementType.DIV,
    classNames: [constraints],
    child: child.build().element,
    styles: styles,
  });
}

export function Text(content: string): Widget {
  return new ElementBindingProxy({ type: HTMLElementType.TEXT, child: content });
}

export enum AxisSize {
  min,
  max,
}

interface MultiChildrenWidgetParams {
  children: Widget[];
}

interface FlexWidgetParams extends MultiChildrenWidgetParams {
  mainAxisSize?: AxisSize;
}

export function Row({ children, mainAxisSize }: FlexWidgetParams): Widget {
  return new ElementBindingProxy({
    type: HTMLElementType.DIV,
    children: children.map((c) => c.build().element),
    classNames: ['row'],
    styles: mainAxisSize == AxisSize.max ? { width: '100%' } : null,
  });
}

export function Column({ children, mainAxisSize }: FlexWidgetParams): Widget {
  return new ElementBindingProxy({
    type: HTMLElementType.DIV,
    children: children.map((c) => c.build().element),
    classNames: ['column'],
    styles: mainAxisSize == AxisSize.max ? { height: '100%' } : null,
  });
}

export function Center({ child }: WidgetParams): Widget {
  return new ElementBindingProxy({
    type: HTMLElementType.DIV,
    child: child.build().element,
    classNames: ['center', 'box-constraints-expand'],
  });
}

interface ExpandedParams extends WidgetParams {
  flex: number;
}

export function Expanded({ child, flex }: ExpandedParams): Widget {
  return new ElementBindingProxy({
    type: HTMLElementType.DIV,
    child: child.build().element,
    styles: {
      flex: flex,
    },
  });
}

interface AlignParams extends WidgetParams {
  alignment: Alignment;
}

function _matchAlignmentToClassName(alignment: Alignment) {
  switch (alignment) {
    case Alignment.topLeft:
      return 'alignment-top-left';
    case Alignment.topCenter:
      return 'alignment-top-center';
    case Alignment.topRight:
      return 'alignment-top-right';
    case Alignment.centerLeft:
      return 'alignment-center-left';
    case Alignment.center:
      return 'alignment-center';
    case Alignment.bottomLeft:
      return 'alignment-bottom-left';
    case Alignment.bottomCenter:
      return 'alignment-bottom-center';
    case Alignment.bottomRight:
      return 'alignment-bottom-right';
  }
}

export function Stack({ children }: MultiChildrenWidgetParams): Widget {
  return new ElementBindingProxy({
    type: HTMLElementType.DIV,
    classNames: ['stack', 'box-constraints-expand'],
    children: children.map((c) => c.build().element),
  });
}

export function Align({ child, alignment }: AlignParams): Widget {
  return new ElementBindingProxy({
    type: HTMLElementType.DIV,
    child: child.element,
    classNames: [_matchAlignmentToClassName(alignment)],
  });
}

function _resolveHTMLTag(widget: Element): keyof HTMLElementTagNameMap {
  switch (widget.type) {
    case HTMLElementType.DIV:
      return 'div';
    case HTMLElementType.TEXT:
      return 'span';
  }
}

function _build(widget: Element | ElementBinding | Widget): HTMLElement {
  if (widget instanceof Widget && !(widget instanceof Flush)) {
    return _build(widget.build());
  }

  let element: Element;

  if (widget instanceof ElementBinding) {
    element = widget.element;
  } else {
    element = widget;
  }

  const htmlTagName = _resolveHTMLTag(element);
  const htmlElementForNode = document.createElement(htmlTagName);

  if (element.classNames && element.classNames.length) {
    element.classNames.forEach((c) => htmlElementForNode.classList.add(c));
  }

  if (element.styles) {
    Object.keys(element.styles).forEach((k) => {
      const v = element.styles[k];
      htmlElementForNode.style[k] = v;
    });
  }

  if (element.type == HTMLElementType.TEXT) {
    htmlElementForNode.textContent = element.child as string;
  }

  if (element.child) {
    const builtChild = _build(element.child as Element);
    htmlElementForNode.appendChild(builtChild);
    return htmlElementForNode;
  }

  if (element.children) {
    element.children.forEach((c) => htmlElementForNode.appendChild(_build(c)));
    return htmlElementForNode;
  }

  return htmlElementForNode;
}

export function runApp(widget: StatelessWidget, root?: HTMLElement) {
  const style = document.createElement('style');
  style.textContent = `
    * {
        box-sizing: border-box;
    }

    html, body {
        height: 100%;
    }

    body {
        margin: 0;
    }

    .box-constraints-expand {
        width: 100%;
        height: 100%;
    }

    .row {
        display: flex;
        flex-direction: row;
    }

    .column {
        display: flex;
        flex-direction: column;
    }

    .center {
        display: flex;
        flex: 1;
        justify-content: center;
        align-items: center;
    }

    .stack {
        position: relative;
    }

    .stack > * {
        position: absolute;
    }

    .alignment-top-left {
        top: 0;
        left: 0;
    }

    .alignment-top-right {
        top: 0;
        right: 0;
    }

    .alignment-top-center {
        top: 0;
        left: 50%;
        transform: translateX(-50%);
    }

    .alignment-bottom-left {
        bottom: 0;
        left: 0;
    }

    .alignment-bottom-right {
        bottom: 0;
        right: 0;
    }

    .alignment-bottom-center {
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
    }

    .alignment-center {
        top: 50%;
        left: 50%;
        transform: translate3d(-50%, -50%, 0);
    }

    .alignment-center-left {
        top: 50%;
        left: 0;
        transform: translateY(-50%);
    }

    .alignment-center-right {
        top: 50%;
        right: 0;
        transform: translateY(-50%);
    }
    `;

  document.head.appendChild(style);

  const appRoot = root || document.body;
  const htmlTree = _build(widget.build());
  appRoot.appendChild(htmlTree);
}
