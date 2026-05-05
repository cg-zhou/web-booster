import { WBBaseElement, copyTextToClipboard, defineComponent, escapeHtml } from './base-element.js';

function normalizeCodeText(value) {
  const normalized = String(value ?? '').replace(/\r\n?/g, '\n');
  const lines = normalized.split('\n');

  while (lines.length > 0 && lines[0].trim() === '') {
    lines.shift();
  }

  while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
    lines.pop();
  }

  const indent = lines
    .filter((line) => line.trim().length > 0)
    .reduce((minIndent, line) => {
      const currentIndent = line.match(/^\s*/)?.[0].length ?? 0;
      return Math.min(minIndent, currentIndent);
    }, Number.POSITIVE_INFINITY);

  if (!Number.isFinite(indent)) {
    return '';
  }

  return lines.map((line) => line.slice(indent)).join('\n');
}

export class WBCode extends WBBaseElement {
  constructor() {
    super();
    this.handleCopy = this.handleCopy.bind(this);
    this.handleMutation = this.handleMutation.bind(this);
    this.mutationObserver = new MutationObserver(this.handleMutation);
    this.copyState = false;
    this.copyTimer = null;
  }

  static get observedAttributes() {
    return ['language', 'value'];
  }

  connectedCallback() {
    this.mutationObserver.observe(this, {
      childList: true,
      characterData: true,
      subtree: true
    });
    this.render();
  }

  disconnectedCallback() {
    this.mutationObserver.disconnect();

    if (this.copyTimer) {
      window.clearTimeout(this.copyTimer);
    }
  }

  attributeChangedCallback() {
    this.render();
  }

  handleMutation() {
    this.render();
  }

  getCodeText() {
    if (this.hasAttribute('value')) {
      return normalizeCodeText(this.getAttribute('value') ?? '');
    }

    return normalizeCodeText(this.textContent ?? '');
  }

  async handleCopy() {
    const codeText = this.getCodeText().trimEnd();
    await copyTextToClipboard(codeText);
    this.copyState = true;
    this.render();
    this.emit('wb-copy', { value: codeText });

    if (this.copyTimer) {
      window.clearTimeout(this.copyTimer);
    }

    this.copyTimer = window.setTimeout(() => {
      this.copyState = false;
      this.render();
    }, 1600);
  }

  render() {
    const language = this.getAttribute('language') ?? 'code';
    const codeText = this.getCodeText().trimEnd();
    const escapedCode = escapeHtml(codeText);

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: var(--wb-font-family);
        }

        .wrapper {
          position: relative;
          margin: 8px 0;
        }

        pre {
          margin: 0;
          padding: 14px 16px;
          background: var(--wb-code-bg);
          border-radius: var(--wb-radius-sm);
          border: 1.5px solid var(--wb-code-border);
          color: var(--wb-code-text);
          font-family: var(--wb-font-family-code);
          font-size: 13px;
          line-height: 1.6;
          overflow-x: auto;
          white-space: pre;
          tab-size: 2;
        }

        code {
          font: inherit;
          color: inherit;
        }

        .toolbar {
          position: absolute;
          top: 8px;
          right: 8px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .language {
          padding: 4px 8px;
          border-radius: 999px;
          background: #0f172a0f;
          color: var(--wb-text);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        button {
          padding: 5px;
          border-radius: var(--wb-radius-sm);
          background: #ffffff;
          border: 1px solid #e2e8f0;
          color: #64748b;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          opacity: 0.72;
        }

        button:hover {
          opacity: 1;
          background: #f1f5f9;
          border-color: #cbd5e1;
          color: #0f172a;
        }

        button.copied {
          color: #10b981;
          border-color: #10b981;
          background: #ecfdf5;
          opacity: 1;
        }
      </style>
      <div class="wrapper">
        <div class="toolbar">
          <span class="language">${escapeHtml(language)}</span>
          <button type="button" class="${this.copyState ? 'copied' : ''}" aria-label="复制代码">
            <wb-icon name="${this.copyState ? 'check' : 'copy'}" size="16"></wb-icon>
          </button>
        </div>
        <pre><code>${escapedCode}</code></pre>
      </div>
    `;

    this.shadowRoot.querySelector('button')?.addEventListener('click', this.handleCopy, { once: true });
  }
}

defineComponent('wb-code', WBCode);