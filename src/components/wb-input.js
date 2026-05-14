import { WBBaseElement, defineComponent, readBooleanAttribute } from './base-element.js';

export class WBInput extends WBBaseElement {
  static get observedAttributes() {
    return ['label', 'value', 'placeholder', 'type', 'disabled', 'readonly', 'error'];
  }

  constructor() {
    super();
    this.inputId = `wb-input-${Math.random().toString(36).slice(2, 8)}`;
    this.handleChange = this.handleChange.bind(this);
    this.handleInput = this.handleInput.bind(this);
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

  get value() {
    return this.shadowRoot.querySelector('input')?.value ?? '';
  }

  set value(nextValue) {
    this.setAttribute('value', nextValue);
  }

  handleInput(event) {
    this.emit('input', { value: event.target.value });
  }

  handleChange(event) {
    this.emit('change', { value: event.target.value });
  }

  render() {
    const label = this.getAttribute('label') ?? '';
    const value = this.getAttribute('value') ?? '';
    const placeholder = this.getAttribute('placeholder') ?? '';
    const type = this.getAttribute('type') ?? 'text';
    const disabled = readBooleanAttribute(this, 'disabled');
    const readonly = readBooleanAttribute(this, 'readonly');
    const error = this.getAttribute('error') ?? '';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: var(--wb-font-family);
          color: var(--wb-text);
        }

        .wrapper {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .label {
          font-size: 13px;
          font-weight: 500;
          color: var(--wb-text);
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        input {
          width: 100%;
          height: 36px;
          padding: 0 12px;
          border: 1px solid var(--wb-input-border);
          border-radius: var(--wb-radius-sm);
          background: var(--wb-input-bg);
          color: var(--wb-text);
          font-size: 13px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.18s ease, box-shadow 0.18s ease;
          box-sizing: border-box;
        }

        input::placeholder {
          color: var(--wb-text-muted);
        }

        input:focus {
          border-color: var(--wb-primary);
          box-shadow: 0 0 0 3px var(--wb-focus-ring);
        }

        input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: var(--wb-disabled-bg);
          color: var(--wb-text-muted);
          border-color: var(--wb-input-border);
        }

        input:read-only {
          background: var(--wb-panel);
          cursor: default;
          border-style: dashed;
        }

        .error {
          font-size: 12px;
          color: var(--wb-error);
          margin-top: 2px;
        }

        input.is-error {
          border-color: var(--wb-error);
        }

        input.is-error:focus {
          box-shadow: 0 0 0 3px var(--wb-error-light);
        }

        .slot-right {
          position: absolute;
          right: 8px;
          display: flex;
          align-items: center;
        }
      </style>
      <div class="wrapper">
        ${label ? `<label class="label" for="${this.inputId}">${label}</label>` : ''}
        <div class="input-wrapper">
          <input
            id="${this.inputId}"
            type="${type}"
            .value="${value}"
            placeholder="${placeholder}"
            ${disabled ? 'disabled' : ''}
            ${readonly ? 'readonly' : ''}
            class="${error ? 'is-error' : ''}"
          />
          <span class="slot-right"><slot name="suffix"></slot></span>
        </div>
        ${error ? `<span class="error">${error}</span>` : ''}
      </div>
    `;

    const input = this.shadowRoot.querySelector('input');
    input?.addEventListener('input', this.handleInput);
    input?.addEventListener('change', this.handleChange);
  }
}

defineComponent('wb-input', WBInput);
