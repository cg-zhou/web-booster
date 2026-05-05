import { WBBaseElement, defineComponent, escapeHtml } from './base-element.js';

const ICON_NAME_MAP = {
  info: 'info',
  success: 'check',
  warning: 'triangle-alert',
  error: 'circle-x'
};

function normalizeMessageInput(input) {
  if (typeof input === 'string') {
    return { text: input };
  }

  return input ?? {};
}

export class WBMessageHost extends WBBaseElement {
  constructor() {
    super();
    this.messages = [];
    this.timers = new Map();
  }

  connectedCallback() {
    this.render();
  }

  disconnectedCallback() {
    this.timers.forEach((timerId) => window.clearTimeout(timerId));
    this.timers.clear();
  }

  open(input) {
    const options = normalizeMessageInput(input);
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const type = options.type ?? 'info';
    const duration = Number(options.duration ?? 2400);
    const message = {
      id,
      type,
      text: String(options.text ?? ''),
      icon: options.icon ?? ICON_NAME_MAP[type] ?? ICON_NAME_MAP.info
    };

    this.messages = [...this.messages, message];
    this.render();

    const timerId = window.setTimeout(() => {
      this.dismiss(id);
    }, Math.max(duration, 800));

    this.timers.set(id, timerId);
    return id;
  }

  dismiss(id) {
    const timerId = this.timers.get(id);
    if (timerId) {
      window.clearTimeout(timerId);
      this.timers.delete(id);
    }

    const nextMessages = this.messages.filter((message) => message.id !== id);
    if (nextMessages.length === this.messages.length) {
      return;
    }

    this.messages = nextMessages;
    this.render();
  }

  render() {
    const itemsMarkup = this.messages
      .map((message) => `
        <div class="message message--${escapeHtml(message.type)}" role="status">
          <span class="message__icon"><wb-icon name="${escapeHtml(message.icon)}" size="16"></wb-icon></span>
          <span class="message__text">${escapeHtml(message.text)}</span>
        </div>
      `)
      .join('');

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          position: fixed;
          top: 32px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
          pointer-events: none;
          font-family: var(--wb-font-family);
        }

        .stack {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .message {
          width: 100%;
          display: grid;
          grid-template-columns: auto minmax(0, 1fr);
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: var(--wb-radius-md);
          border: 0.5px solid var(--wb-message-border);
          background: var(--wb-message-bg);
          color: var(--wb-message-text);
          box-shadow: 0 12px 32px #0f172a1a;
          backdrop-filter: blur(14px);
          pointer-events: auto;
          animation: slide-in 0.22s ease;
        }

        .message--info {
          --wb-message-bg: var(--wb-message-info-bg);
          --wb-message-border: var(--wb-message-info-border);
          --wb-message-text: var(--wb-message-info-text);
        }

        .message--success {
          --wb-message-bg: var(--wb-message-success-bg);
          --wb-message-border: var(--wb-message-success-border);
          --wb-message-text: var(--wb-message-success-text);
        }

        .message--warning {
          --wb-message-bg: var(--wb-message-warning-bg);
          --wb-message-border: var(--wb-message-warning-border);
          --wb-message-text: var(--wb-message-warning-text);
        }

        .message--error {
          --wb-message-bg: var(--wb-message-error-bg);
          --wb-message-border: var(--wb-message-error-border);
          --wb-message-text: var(--wb-message-error-text);
        }

        .message__icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: currentColor;
        }

        .message__text {
          min-width: 0;
          font-size: 13px;
          line-height: 1.45;
          letter-spacing: -0.01em;
        }

        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translate3d(0, -16px, 0) scale(0.96);
          }

          to {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }
      </style>
      <div class="stack" aria-live="polite">${itemsMarkup}</div>
    `;
  }
}

defineComponent('wb-message-host', WBMessageHost);

function getManagedHost() {
  if (typeof document === 'undefined') {
    return null;
  }

  let host = document.querySelector('wb-message-host[data-managed="true"]');

  if (!host) {
    host = document.createElement('wb-message-host');
    host.setAttribute('data-managed', 'true');
    document.body.append(host);
  }

  return host;
}

export function showMessage(input) {
  const host = getManagedHost();
  return host ? host.open(input) : '';
}

export const WBMessage = {
  open(input) {
    return showMessage(input);
  },
  info(text, duration) {
    return showMessage({ type: 'info', text, duration });
  },
  success(text, duration) {
    return showMessage({ type: 'success', text, duration });
  },
  warning(text, duration) {
    return showMessage({ type: 'warning', text, duration });
  },
  error(text, duration) {
    return showMessage({ type: 'error', text, duration });
  }
};