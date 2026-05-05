import { WBBaseElement, defineComponent, escapeHtml } from './base-element.js';

export class WBCard extends WBBaseElement {
  static get observedAttributes() {
    return ['title'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const title = this.getAttribute('title');

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          color: var(--wb-text);
          font-family: var(--wb-font-family);
        }

        .card {
          display: flex;
          flex-direction: column;
          gap: 14px;
          padding: 22px;
          border-radius: var(--wb-radius-lg);
          border: 1px solid var(--wb-card-border);
          background: var(--wb-panel);
          box-shadow: var(--wb-shadow);
          overflow: hidden;
        }

        .title {
          margin: 0;
          font-size: 1.05rem;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .body {
          display: flex;
          flex-direction: column;
          gap: 14px;
          color: var(--wb-text);
        }

        ::slotted(*) {
          margin: 0;
        }
      </style>
      <article class="card">
        ${title ? `<h3 class="title">${escapeHtml(title)}</h3>` : '<slot name="title"></slot>'}
        <div class="body"><slot></slot></div>
      </article>
    `;
  }
}

defineComponent('wb-card', WBCard);