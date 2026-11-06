import { WBBaseElement, defineComponent, escapeHtml, readBooleanAttribute } from './base-element.js';

export class WBSelect extends WBBaseElement {
  static get observedAttributes() {
    return ['label', 'value', 'disabled', 'error', 'placeholder', 'layout'];
  }

  constructor() {
    super();
    this.inputId = `wb-select-${Math.random().toString(36).slice(2, 8)}`;
    this.optionsObserver = new MutationObserver((records) => {
      if (!records.some((record) => record.type !== 'attributes' || record.target !== this)) return;
      const value = this.value;
      this.renderOptions();
      this.shadowRoot.querySelector('select').value = value;
    });
    this.handleChange = this.handleChange.bind(this);
  }

  connectedCallback() {
    const currentValue = this.shadowRoot.querySelector('select')?.value;
    this.render();
    this.renderOptions();
    if (currentValue !== undefined) this.shadowRoot.querySelector('select').value = currentValue;
    if (this.hasAttribute('value')) this.syncValue();
    this.optionsObserver.observe(this, { childList: true, subtree: true, attributes: true, characterData: true });
  }

  disconnectedCallback() {
    this.optionsObserver.disconnect();
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
    this.setAttribute('value', nextValue ?? '');
  }

  handleChange(event) {
    event.stopPropagation();
    const newValue = event.target.value;
    this.setAttribute('value', newValue);
    this.emit('input', { value: newValue });
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
    select.innerHTML = placeholder ? `<option value="" data-placeholder disabled selected>${escapeHtml(placeholder)}</option>` : '';

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
    const layout = this.getAttribute('layout') ?? 'vertical';

    const existing = this.shadowRoot.querySelector('select');
    if (existing) {
      existing.disabled = disabled;
      existing.setAttribute('aria-invalid', String(Boolean(error)));
      existing.setAttribute('aria-describedby', error ? `${this.inputId}-error` : '');
      const labelNode = this.shadowRoot.querySelector('.label');
      labelNode.textContent = label;
      labelNode.hidden = !label;
      const errorNode = this.shadowRoot.querySelector('.error-message');
      errorNode.textContent = error;
      errorNode.hidden = !error;
      this.shadowRoot.querySelector('.wrapper').classList.toggle('horizontal', layout === 'horizontal');
      const placeholderOption = existing.querySelector('option[data-placeholder]');
      if (placeholderOption) {
        placeholderOption.textContent = this.getAttribute('placeholder') ?? '';
        if (!this.hasAttribute('placeholder')) placeholderOption.remove();
      } else if (this.hasAttribute('placeholder')) {
        const option = new Option(this.getAttribute('placeholder'), '');
        option.disabled = true;
        option.dataset.placeholder = '';
        existing.prepend(option);
      }
      return;
    }
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

        .wrapper.horizontal {
          flex-direction: row;
          align-items: flex-start;
          gap: 12px;
        }

        .wrapper.horizontal .label {
          min-width: var(--wb-label-width);
          padding-top: 9px;
          flex-shrink: 0;
        }

        .wrapper.horizontal .select-group {
          flex: 1;
          min-width: 0;
        }

        .label {
          font-size: var(--wb-label-font-size);
          font-weight: var(--wb-label-font-weight);
          color: var(--wb-label-color);
        }

        .select-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .select-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
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
      <div class="wrapper ${layout === 'horizontal' ? 'horizontal' : ''}">
        <label class="label" for="${this.inputId}" ${label ? '' : 'hidden'}>${escapeHtml(label)}</label>
        <div class="select-group">
          <div class="select-wrapper">
            <select id="${this.inputId}" ${disabled ? 'disabled' : ''}>
            </select>
            <div class="arrow"></div>
          </div>
          <div class="error-message" id="${this.inputId}-error" ${error ? '' : 'hidden'}>${escapeHtml(error)}</div>
        </div>
      </div>
    `;

    const select = this.shadowRoot.querySelector('select');
    select.addEventListener('input', (event) => event.stopPropagation());
    select.addEventListener('change', this.handleChange);
    this.renderOptions();
    this.render();
  }
}

defineComponent('wb-select', WBSelect);
