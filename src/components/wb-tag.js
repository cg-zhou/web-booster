import { WBBaseElement, defineComponent, readBooleanAttribute } from './base-element.js';

export class WBTag extends WBBaseElement {
  static get observedAttributes() {
    return ['variant', 'closable', 'disabled'];
  }

  constructor() {
    super();
    this.handleClose = this.handleClose.bind(this);
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    if (!this.isConnected) {
      return;
    }
    this.render();
  }

  handleClose(event) {
    event.stopPropagation();
    this.emit('close');
  }

  render() {
    const variant = this.getAttribute('variant') ?? 'default';
    const closable = readBooleanAttribute(this, 'closable');
    const disabled = readBooleanAttribute(this, 'disabled');

    const variants = ['default', 'primary', 'success', 'warning', 'error'];
    const safeVariant = variants.includes(variant) ? variant : 'default';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-flex;
          font-family: var(--wb-font-family);
        }

        .tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          height: 24px;
          padding: 0 8px;
          border-radius: var(--wb-radius-sm);
          font-size: 12px;
          font-weight: 500;
          line-height: 1;
          white-space: nowrap;
          transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease;
        }

        .tag--default {
          background: var(--wb-panel);
          color: var(--wb-text);
          border: 1px solid var(--wb-card-border);
        }

        .tag--primary {
          background: var(--wb-primary-light);
          color: var(--wb-primary);
          border: 1px solid var(--wb-primary-light);
        }

        .tag--success {
          background: var(--wb-success-light);
          color: var(--wb-success);
          border: 1px solid var(--wb-success-light);
        }

        .tag--warning {
          background: var(--wb-warning-light);
          color: var(--wb-warning);
          border: 1px solid var(--wb-warning-light);
        }

        .tag--error {
          background: var(--wb-error-light);
          color: var(--wb-error);
          border: 1px solid var(--wb-error-light);
        }

        .tag.is-disabled {
          opacity: 0.54;
          cursor: not-allowed;
        }

        .close {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: transparent;
          border: none;
          padding: 0;
          cursor: pointer;
          color: inherit;
          opacity: 0.6;
          transition: opacity 0.18s ease, background 0.18s ease;
        }

        .close:hover {
          opacity: 1;
          background: #0f172a12;
        }

        .close svg {
          width: 10px;
          height: 10px;
        }
      </style>
      <span class="tag tag--${safeVariant}${disabled ? ' is-disabled' : ''}">
        <slot></slot>
        ${closable ? `
          <button class="close" type="button" aria-label="Remove" ${disabled ? 'disabled' : ''}>
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 3l8 8M11 3l-8 8"/>
            </svg>
          </button>
        ` : ''}
      </span>
    `;

    if (closable && !disabled) {
      this.shadowRoot.querySelector('.close')?.addEventListener('click', this.handleClose);
    }
  }
}

defineComponent('wb-tag', WBTag);
