import { WBBaseElement, defineComponent, readBooleanAttribute } from './base-element.js';

export class WBSwitch extends WBBaseElement {
  static get observedAttributes() {
    return ['label', 'checked', 'disabled'];
  }

  constructor() {
    super();
    this.handleToggle = this.handleToggle.bind(this);
    this.inputId = `wb-switch-${Math.random().toString(36).slice(2, 8)}`;
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

  get checked() {
    return readBooleanAttribute(this, 'checked');
  }

  set checked(nextValue) {
    this.toggleChecked(Boolean(nextValue), 'change');
  }

  toggleChecked(nextChecked, eventName) {
    if (nextChecked) {
      this.setAttribute('checked', '');
    } else {
      this.removeAttribute('checked');
    }

    this.emit('input', { checked: nextChecked });

    if (eventName === 'change') {
      this.emit('change', { checked: nextChecked });
    }
  }

  handleToggle() {
    if (readBooleanAttribute(this, 'disabled')) {
      return;
    }

    this.toggleChecked(!this.checked, 'change');
  }

  render() {
    const label = this.getAttribute('label') ?? '';
    const checked = this.checked;
    const disabled = readBooleanAttribute(this, 'disabled');

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-flex;
          color: var(--wb-text);
          font-family: var(--wb-font-family);
        }

        .switch {
          appearance: none;
          border: 0;
          background: transparent;
          padding: 0;
          display: inline-grid;
          grid-template-columns: minmax(0, 1fr) auto;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          color: inherit;
          font: inherit;
          text-align: left;
        }

        .switch:disabled {
          cursor: not-allowed;
          opacity: 0.56;
        }

        .label {
          font-size: 13px;
          font-weight: 500;
        }

        .track {
          width: 34px;
          height: 20px;
          border-radius: 999px;
          background: var(--wb-switch-track, #cbd5e1);
          position: relative;
          transition: background 0.18s ease;
          box-shadow: inset 0 0 0 1px #0f172a12;
        }

        .thumb {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #ffffff;
          box-shadow: 0 2px 6px #0f172a24;
          transition: transform 0.18s ease;
        }

        .switch[aria-checked='true'] .track {
          background: var(--wb-primary);
        }

        .switch[aria-checked='true'] .thumb {
          transform: translateX(14px);
        }

        .switch:focus-visible {
          outline: none;
        }

        .switch:focus-visible .track {
          box-shadow: 0 0 0 3px var(--wb-focus-ring, #3b82f633);
        }
      </style>
      <button
        class="switch"
        type="button"
        role="switch"
        aria-checked="${checked ? 'true' : 'false'}"
        aria-labelledby="${label ? this.inputId : ''}"
        ${disabled ? 'disabled' : ''}
      >
        ${label ? `<span class="label" id="${this.inputId}">${label}</span>` : '<slot></slot>'}
        <span class="track" aria-hidden="true"><span class="thumb"></span></span>
      </button>
    `;

    this.shadowRoot.querySelector('.switch')?.addEventListener('click', this.handleToggle);
  }
}

defineComponent('wb-switch', WBSwitch);