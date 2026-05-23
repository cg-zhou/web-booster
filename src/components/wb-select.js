import { WBBaseElement, defineComponent, readBooleanAttribute } from './base-element.js';

export class WBSelect extends WBBaseElement {
  static get observedAttributes() {
    return ['label', 'value', 'disabled', 'error', 'placeholder'];
  }

  constructor() {
    super();
    this.handleChange = this.handleChange.bind(this);
  }

  connectedCallback() {
    this.render();
    this.renderOptions();
    this.syncValue();
  }

  attributeChangedCallback(name) {
    if (!this.isConnected) {
      return;
    }
    if (name === 'value') {
      this.syncValue();
    } else {
      this.render();
    }
  }

  get value() {
    return this.shadowRoot.querySelector('select')?.value ?? this.getAttribute('value') ?? '';
  }

  set value(nextValue) {
    this.setAttribute('value', nextValue);
  }

  handleChange(event) {
    const newValue = event.target.value;
    this.setAttribute('value', newValue);
    this.emit('change', { value: newValue });
  }

  syncValue() {
    const select = this.shadowRoot.querySelector('select');
    if (select) {
      select.value = this.getAttribute('value') ?? '';
    }
  }

  renderOptions() {
    const select = this.shadowRoot.querySelector('select');
    if (!select) return;

    // Clear existing options except placeholder
    const placeholder = this.getAttribute('placeholder');
    select.innerHTML = placeholder ? `<option value="" disabled selected>${placeholder}</option>` : '';

    // Project light DOM options into shadow DOM select
    const options = this.querySelectorAll('option');
    options.forEach(opt => {
      const newOpt = document.createElement('option');
      newOpt.value = opt.value;
      newOpt.textContent = opt.textContent;
      newOpt.selected = opt.hasAttribute('selected') || opt.value === this.getAttribute('value');
      newOpt.disabled = opt.hasAttribute('disabled');
      select.appendChild(newOpt);
    });
  }

  render() {
    const label = this.getAttribute('label') ?? '';
    const disabled = readBooleanAttribute(this, 'disabled');
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

        .select-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        select {
          width: 100%;
          height: 36px;
          padding: 0 32px 0 12px;
          border: 1px solid var(--wb-input-border, #d1d5db);
          border-radius: var(--wb-radius-sm, 6px);
          background: var(--wb-input-bg, #fff);
          color: var(--wb-text, #0f172a);
          font-size: 13px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.18s ease, box-shadow 0.18s ease;
          appearance: none;
          cursor: pointer;
          box-sizing: border-box;
        }

        select:focus {
          border-color: var(--wb-primary, #1e293b);
          box-shadow: 0 0 0 3px var(--wb-focus-ring, #1e293b20);
        }

        select:disabled {
          background: var(--wb-input-disabled-bg, #f3f4f6);
          cursor: not-allowed;
          opacity: 0.7;
          border-color: var(--wb-input-border, #d1d5db);
        }

        .arrow {
          position: absolute;
          right: 12px;
          top: 50%;
          width: 8px;
          height: 8px;
          pointer-events: none;
          border-right: 1.5px solid var(--wb-text-muted, #64748b);
          border-bottom: 1.5px solid var(--wb-text-muted, #64748b);
          transform: translateY(-60%) rotate(45deg);
        }

        .error-message {
          font-size: 12px;
          color: var(--wb-message-error-text, #b91c1c);
        }

        :host([error]) select {
          border-color: var(--wb-message-error-text, #b91c1c);
        }
      </style>
      <div class="wrapper">
        ${label ? `<label class="label">${label}</label>` : ''}
        <div class="select-wrapper">
          <select ?disabled="${disabled}">
          </select>
          <div class="arrow"></div>
        </div>
        ${error ? `<div class="error-message">${error}</div>` : ''}
      </div>
    `;

    this.shadowRoot.querySelector('select').addEventListener('change', this.handleChange);
    this.renderOptions();
  }
}

defineComponent('wb-select', WBSelect);
