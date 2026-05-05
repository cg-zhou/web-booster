import { WBBaseElement, defineComponent, readBooleanAttribute } from './base-element.js';

export class WBButton extends WBBaseElement {
  static get observedAttributes() {
    return ['variant', 'size', 'href', 'target', 'rel', 'disabled'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const variant = this.getAttribute('variant') === 'primary' ? 'primary' : 'secondary';
    const size = ['sm', 'md', 'lg'].includes(this.getAttribute('size')) ? this.getAttribute('size') : 'md';
    const href = this.getAttribute('href');
    const target = this.getAttribute('target') ?? '';
    const rel = this.getAttribute('rel') ?? (target === '_blank' ? 'noreferrer' : '');
    const disabled = readBooleanAttribute(this, 'disabled');
    const className = `button button--${variant} button--${size}${disabled ? ' is-disabled' : ''}`;
    const tag = href ? 'a' : 'button';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-flex;
          font-family: var(--wb-font-family);
        }

        .button {
          --_wb-button-bg: var(--wb-button-secondary-bg, var(--wb-panel));
          --_wb-button-bg-hover: var(--wb-button-secondary-bg-hover, var(--wb-panel-strong));
          --_wb-button-border: var(--wb-button-border);
          --_wb-button-border-hover: var(--wb-button-border-strong);
          --_wb-button-text: var(--wb-button-secondary-text, var(--wb-text));
          --_wb-button-text-hover: var(--wb-button-secondary-text-hover, var(--wb-text));
          min-height: 40px;
          padding: 0 16px;
          border: 1px solid var(--_wb-button-border);
          border-radius: var(--wb-radius-md);
          background: var(--_wb-button-bg);
          color: var(--_wb-button-text);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          font-size: 13px;
          font-weight: var(--wb-button-font-weight, 400);
          line-height: 1;
          white-space: nowrap;
          text-decoration: none;
          transition: background 0.18s ease, border-color 0.18s ease, color 0.18s ease, box-shadow 0.18s ease;
          box-shadow: 0 1px 2px #0f172a08;
        }

        .button:hover {
          background: var(--_wb-button-bg-hover);
          border-color: var(--_wb-button-border-hover);
          color: var(--_wb-button-text-hover);
          box-shadow: 0 4px 12px #0f172a1a;
        }

        .button--primary {
          --_wb-button-bg: var(--wb-primary);
          --_wb-button-bg-hover: var(--wb-primary-strong);
          --_wb-button-border: var(--wb-primary);
          --_wb-button-border-hover: var(--wb-primary-strong);
          --_wb-button-text: #ffffff;
          --_wb-button-text-hover: #ffffff;
        }

        .button--sm {
          min-height: 32px;
          padding: 0 12px;
          border-radius: var(--wb-radius-sm);
          font-size: 12px;
          gap: 6px;
        }

        .button--lg {
          min-height: 46px;
          padding: 0 18px;
          border-radius: var(--wb-radius-lg);
          font-size: 14px;
          gap: 10px;
        }

        .is-disabled {
          opacity: 0.54;
          cursor: not-allowed;
          pointer-events: none;
          box-shadow: 0 1px 2px #0f172a08;
        }

        button {
          appearance: none;
        }
      </style>
      <${tag}
        class="${className}"
        ${tag === 'button' ? 'type="button"' : ''}
        ${href ? `href="${href}"` : ''}
        ${target ? `target="${target}"` : ''}
        ${rel ? `rel="${rel}"` : ''}
        ${disabled ? 'aria-disabled="true"' : ''}
      ><slot></slot></${tag}>
    `;
  }
}

defineComponent('wb-button', WBButton);