import { WBBaseElement, defineComponent, readBooleanAttribute } from './base-element.js';

export class WBLink extends WBBaseElement {
  static get observedAttributes() {
    return ['href', 'target', 'rel', 'strong'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const href = this.getAttribute('href') ?? '#';
    const target = this.getAttribute('target') ?? '';
    const rel = this.getAttribute('rel') ?? (target === '_blank' ? 'noreferrer' : '');
    const strong = readBooleanAttribute(this, 'strong') ? ' link--strong' : '';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline;
          color: var(--wb-text);
          font-family: var(--wb-font-family);
        }

        a {
          color: inherit;
          text-decoration-line: underline;
          text-underline-offset: 0.3em;
        }

        a:hover {
          color: var(--wb-text);
          text-decoration-thickness: 2px;
        }

        .link--strong {
          font-weight: 600;
        }
      </style>
      <a class="link${strong}" href="${href}" ${target ? `target="${target}"` : ''} ${rel ? `rel="${rel}"` : ''}><slot></slot></a>
    `;
  }
}

defineComponent('wb-link', WBLink);