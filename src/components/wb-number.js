import { WBBaseElement, defineComponent, readBooleanAttribute } from './base-element.js';

function parseNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function countDecimals(value) {
  const normalized = String(value);

  if (!normalized.includes('.')) {
    return 0;
  }

  return normalized.length - normalized.indexOf('.') - 1;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export class WBNumber extends WBBaseElement {
  static get observedAttributes() {
    return ['label', 'min', 'max', 'step', 'value', 'disabled'];
  }

  constructor() {
    super();
    this.handleRangeInput = this.handleRangeInput.bind(this);
    this.handleRangeChange = this.handleRangeChange.bind(this);
    this.handleNumberInput = this.handleNumberInput.bind(this);
    this.handleNumberChange = this.handleNumberChange.bind(this);
  }

  connectedCallback() {
    this.render();
    this.syncUi();
  }

  attributeChangedCallback(name) {
    if (!this.isConnected) {
      return;
    }

    if (name === 'value') {
      this.syncUi();
      return;
    }

    this.render();
    this.syncUi();
  }

  get value() {
    return this.getNormalizedValue();
  }

  set value(nextValue) {
    this.setAttribute('value', String(nextValue));
  }

  getState() {
    const min = parseNumber(this.getAttribute('min'), 0);
    const rawMax = parseNumber(this.getAttribute('max'), 100);
    const max = rawMax >= min ? rawMax : min;
    const step = Math.abs(parseNumber(this.getAttribute('step'), 1)) || 1;
    const fallbackValue = clamp(min, min, max);
    const value = clamp(parseNumber(this.getAttribute('value'), fallbackValue), min, max);
    const disabled = readBooleanAttribute(this, 'disabled');
    const label = this.getAttribute('label') ?? '';

    return {
      label,
      min,
      max,
      step,
      value,
      disabled,
      precision: Math.max(countDecimals(step), countDecimals(min), countDecimals(max))
    };
  }

  getNormalizedValue() {
    return this.getState().value;
  }

  formatValue(value, precision) {
    return precision > 0 ? value.toFixed(precision) : String(value);
  }

  updateValue(nextValue, eventName) {
    const state = this.getState();
    const normalizedValue = clamp(parseNumber(nextValue, state.value), state.min, state.max);
    const formattedValue = this.formatValue(normalizedValue, state.precision);

    if (this.getAttribute('value') !== formattedValue) {
      this.setAttribute('value', formattedValue);
    } else {
      this.syncUi();
    }

    this.emit(eventName, { value: normalizedValue });
  }

  handleRangeInput(event) {
    this.updateValue(event.target.value, 'input');
  }

  handleRangeChange(event) {
    this.updateValue(event.target.value, 'change');
  }

  handleNumberInput(event) {
    const { value } = event.target;

    if (value === '' || value === '-' || value === '.' || value === '-.') {
      return;
    }

    this.updateValue(value, 'input');
  }

  handleNumberChange(event) {
    this.updateValue(event.target.value, 'change');
  }

  syncUi() {
    const state = this.getState();
    const rangeInput = this.shadowRoot.querySelector('[data-role="range"]');
    const numberInput = this.shadowRoot.querySelector('[data-role="number"]');
    const valueText = this.shadowRoot.querySelector('[data-role="value"]');
    const formattedValue = this.formatValue(state.value, state.precision);

    if (rangeInput) {
      rangeInput.value = formattedValue;
      rangeInput.min = String(state.min);
      rangeInput.max = String(state.max);
      rangeInput.step = String(state.step);
      rangeInput.disabled = state.disabled;
    }

    if (numberInput) {
      numberInput.value = formattedValue;
      numberInput.min = String(state.min);
      numberInput.max = String(state.max);
      numberInput.step = String(state.step);
      numberInput.disabled = state.disabled;
    }

    if (valueText) {
      valueText.textContent = formattedValue;
    }
  }

  render() {
    const state = this.getState();

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: grid;
          gap: 10px;
          color: var(--wb-text);
          font-family: var(--wb-font-family);
        }

        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .label {
          font-size: 13px;
          font-weight: 600;
          letter-spacing: -0.01em;
        }

        .value {
          color: #475569;
          font-size: 12px;
          font-variant-numeric: tabular-nums;
        }

        .controls {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 88px;
          gap: 12px;
          align-items: center;
        }

        input[type='range'] {
          width: 100%;
          margin: 0;
          accent-color: var(--wb-primary);
          cursor: pointer;
        }

        input[type='number'] {
          width: 100%;
          min-height: 40px;
          padding: 0 10px;
          border: 1px solid var(--wb-input-border, var(--wb-button-border));
          border-radius: var(--wb-radius-md);
          background: var(--wb-input-bg);
          color: var(--wb-text);
          box-sizing: border-box;
          font: inherit;
          font-size: 13px;
          font-variant-numeric: tabular-nums;
          box-shadow: inset 0 1px 2px #0f172a08;
        }

        input[type='number']:focus,
        input[type='range']:focus {
          outline: none;
        }

        input[type='number']:focus {
          border-color: var(--wb-primary);
          box-shadow: 0 0 0 3px #3b82f61a;
        }

        input:disabled {
          opacity: 0.56;
          cursor: not-allowed;
        }
      </style>
      <div class="header">
        <span class="label">${state.label || '<slot name="label">Value</slot>'}</span>
        <span class="value" data-role="value"></span>
      </div>
      <div class="controls">
        <input data-role="range" type="range" />
        <input data-role="number" type="number" inputmode="decimal" />
      </div>
    `;

    this.shadowRoot.querySelector('[data-role="range"]')?.addEventListener('input', this.handleRangeInput);
    this.shadowRoot.querySelector('[data-role="range"]')?.addEventListener('change', this.handleRangeChange);
    this.shadowRoot.querySelector('[data-role="number"]')?.addEventListener('input', this.handleNumberInput);
    this.shadowRoot.querySelector('[data-role="number"]')?.addEventListener('change', this.handleNumberChange);
  }
}

defineComponent('wb-number', WBNumber);