import { WBBaseElement, defineComponent } from './base-element.js';

export class WBInlineCode extends WBBaseElement {
  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-flex;
          align-items: center;
          padding: 0.15rem 0.4rem;
          border-radius: var(--wb-radius-sm);
          border: 1px solid var(--wb-code-border);
          background: var(--wb-code-bg);
          color: var(--wb-code-text);
          font-family: var(--wb-font-family-code);
          font-size: 0.92em;
          vertical-align: baseline;
        }

        code {
          font: inherit;
          color: inherit;
        }
      </style>
      <code><slot></slot></code>
    `;
  }
}

defineComponent('wb-inline-code', WBInlineCode);
