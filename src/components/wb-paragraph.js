import { WBBaseElement, defineComponent, readBooleanAttribute } from './base-element.js';

export class WBParagraph extends WBBaseElement {
  static get observedAttributes() {
    return ['lead'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const leadClass = readBooleanAttribute(this, 'lead') ? ' paragraph--lead' : '';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          color: var(--wb-text);
          font-family: var(--wb-font-family);
        }

        .paragraph {
          margin: 0;
          color: inherit;
          font-size: 1rem;
          line-height: 1.75;
        }

        .paragraph--lead {
          font-size: 1rem;
          line-height: 1.75;
          color: var(--wb-text);
        }
      </style>
      <p class="paragraph${leadClass}"><slot></slot></p>
    `;
  }
}

defineComponent('wb-paragraph', WBParagraph);