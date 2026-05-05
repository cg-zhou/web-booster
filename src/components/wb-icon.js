import { Check, CircleX, Code, Copy, Info, Menu, Sparkles, TriangleAlert } from 'lucide';
import { WBBaseElement, defineComponent } from './base-element.js';

const normalizedIconMap = new Map();
const builtinIconEntries = [
  ['sparkles', Sparkles],
  ['menu', Menu],
  ['copy', Copy],
  ['check', Check],
  ['code', Code],
  ['info', Info],
  ['triangle-alert', TriangleAlert],
  ['circle-x', CircleX]
];

const customIconEntries = [
  [
    'github',
    {
      nodes: [
        ['path', { d: 'M12 .5C5.73.5.65 5.58.65 11.85c0 5.02 3.26 9.27 7.78 10.78.57.1.78-.25.78-.56 0-.28-.01-1.02-.01-2-3.17.69-3.84-1.53-3.84-1.53-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.02 1.76 2.68 1.25 3.33.96.1-.74.4-1.25.73-1.54-2.53-.29-5.2-1.27-5.2-5.64 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.17a10.9 10.9 0 0 1 5.74 0c2.19-1.48 3.15-1.17 3.15-1.17.62 1.58.23 2.75.11 3.04.74.8 1.18 1.82 1.18 3.07 0 4.38-2.68 5.34-5.23 5.62.41.35.77 1.04.77 2.1 0 1.52-.01 2.75-.01 3.13 0 .31.2.67.79.55 4.51-1.5 7.77-5.76 7.77-10.78C23.35 5.58 18.27.5 12 .5Z' }]
      ],
      svgAttributes: {
        fill: 'currentColor',
        stroke: 'none'
      }
    }
  ]
];

function normalizeIconName(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]/g, '');
}

function normalizeIconDefinition(iconDefinition) {
  if (Array.isArray(iconDefinition)) {
    return { nodes: iconDefinition };
  }

  if (iconDefinition && Array.isArray(iconDefinition.nodes)) {
    return {
      nodes: iconDefinition.nodes,
      svgAttributes: iconDefinition.svgAttributes ?? {}
    };
  }

  return null;
}

export function registerWBIcon(name, iconDefinition) {
  const normalizedName = normalizeIconName(name);
  const normalizedDefinition = normalizeIconDefinition(iconDefinition);

  if (!normalizedName || !normalizedDefinition) {
    return false;
  }

  normalizedIconMap.set(normalizedName, normalizedDefinition);
  return true;
}

export function registerWBIcons(iconDefinitions) {
  if (!iconDefinitions || typeof iconDefinitions !== 'object') {
    return 0;
  }

  let registeredCount = 0;

  for (const [name, iconDefinition] of Object.entries(iconDefinitions)) {
    if (registerWBIcon(name, iconDefinition)) {
      registeredCount += 1;
    }
  }

  return registeredCount;
}

function ensureBuiltinIcons() {
  if (normalizedIconMap.size > 0) {
    return normalizedIconMap;
  }

  for (const [name, iconDefinition] of builtinIconEntries) {
    registerWBIcon(name, iconDefinition);
  }

  for (const [name, iconDefinition] of customIconEntries) {
    registerWBIcon(name, iconDefinition);
  }

  return normalizedIconMap;
}

export function getRegisteredWBIconNames() {
  ensureBuiltinIcons();
  return [...normalizedIconMap.keys()];
}

function getIconDefinition(name) {
  const iconMap = ensureBuiltinIcons();
  return iconMap.get(normalizeIconName(name));
}

function buildSvgNode(node) {
  const [tagName, attributes = {}, children = []] = node;
  const attrs = Object.entries(attributes)
    .map(([name, value]) => `${name}="${String(value)}"`)
    .join(' ');
  const childMarkup = Array.isArray(children) ? children.map(buildSvgNode).join('') : '';
  return `<${tagName}${attrs ? ` ${attrs}` : ''}>${childMarkup}</${tagName}>`;
}

function renderIconSvg(name, size) {
  const iconDefinition = getIconDefinition(name);

  if (!iconDefinition) {
    return '';
  }

  const svgAttributes = {
    xmlns: 'http://www.w3.org/2000/svg',
    width: String(size),
    height: String(size),
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '2',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    class: `lucide lucide-${normalizeIconName(name)}`,
    ...(iconDefinition.svgAttributes ?? {})
  };

  const attrs = Object.entries(svgAttributes)
    .map(([attrName, value]) => `${attrName}="${value}"`)
    .join(' ');

  return `<svg ${attrs}>${iconDefinition.nodes.map(buildSvgNode).join('')}</svg>`;
}

export class WBIcon extends WBBaseElement {
  static get observedAttributes() {
    return ['name', 'size'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const name = this.getAttribute('name') ?? 'sparkles';
    const size = Number(this.getAttribute('size') ?? 18);
    const svgMarkup = renderIconSvg(name, size);

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          line-height: 0;
          color: currentColor;
        }

        .fallback {
          width: ${size}px;
          height: ${size}px;
          border-radius: 999px;
          background: var(--wb-icon-surface);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 700;
          color: var(--wb-text);
        }
      </style>
      ${svgMarkup || `<span class="fallback">?</span>`}
    `;

    this.setAttribute('aria-hidden', 'true');
  }
}

defineComponent('wb-icon', WBIcon);