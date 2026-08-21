import { WBBaseElement, defineComponent, escapeHtml, readBooleanAttribute } from './base-element.js';

/**
 * Generic file picker with an optional image preview.
 * The selected file and decoded image (when applicable) are exposed through the `change` event:
 *   event.detail.file
 *   event.detail.image
 */
export class WBFilePicker extends WBBaseElement {
  static get observedAttributes() {
    return ['accept', 'label', 'hint', 'change-label', 'invalid-message', 'image-error-message', 'disabled'];
  }

  constructor() {
    super();
    this.objectUrl = null;
    this.selectedFile = null;
    this.selectedImage = null;
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleDrop = this.handleDrop.bind(this);
    this.handleDragOver = this.handleDragOver.bind(this);
    this.handleDragLeave = this.handleDragLeave.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  connectedCallback() {
    this.render();
  }

  disconnectedCallback() {
    this.revokeObjectUrl();
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this.render();
    }
  }

  get file() {
    return this.selectedFile;
  }

  get image() {
    return this.selectedImage;
  }

  open() {
    this.shadowRoot.querySelector('input')?.click();
  }

  handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.open();
    }
  }

  handleDragOver(event) {
    event.preventDefault();
    this.shadowRoot.querySelector('.dropzone')?.classList.add('dragover');
  }

  handleDragLeave(event) {
    event.preventDefault();
    this.shadowRoot.querySelector('.dropzone')?.classList.remove('dragover');
  }

  handleDrop(event) {
    event.preventDefault();
    const dropzone = this.shadowRoot.querySelector('.dropzone');
    dropzone?.classList.remove('dragover');
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.loadFile(file);
    }
  }

  handleInputChange(event) {
    const file = event.target.files?.[0];
    if (file) {
      this.loadFile(file);
    }
  }

  revokeObjectUrl() {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
  }

  loadFile(file) {
    const accept = this.getAttribute('accept') ?? '';
    if (!this.matchesAccept(file, accept)) {
      this.showError(this.getAttribute('invalid-message') ?? '请选择有效的文件。');
      return;
    }

    this.revokeObjectUrl();
    this.selectedFile = file;
    this.selectedImage = null;

    if (!file.type.startsWith('image/')) {
      this.showFile(file, null);
      this.emit('change', { file, image: null });
      return;
    }

    const url = URL.createObjectURL(file);
    this.objectUrl = url;
    const image = new Image();
    image.onload = () => {
      this.selectedImage = image;
      this.renderPreview(file, image);
      this.emit('change', { file, image });
    };
    image.onerror = () => {
      this.showError(this.getAttribute('image-error-message') ?? '文件预览失败，请换一个文件试试。');
    };
    image.src = url;
  }

  showError(message) {
    const status = this.shadowRoot.querySelector('.status');
    if (status) {
      status.textContent = message;
      status.hidden = false;
    }
  }

  matchesAccept(file, accept) {
    if (!accept || accept === '*/*') return true;
    return accept.split(',').some((token) => {
      const value = token.trim().toLowerCase();
      return value.endsWith('/*')
        ? file.type.toLowerCase().startsWith(value.slice(0, -1))
        : value.startsWith('.')
          ? file.name.toLowerCase().endsWith(value)
          : file.type.toLowerCase() === value;
    });
  }

  showFile(file, image) {
    const prompt = this.shadowRoot.querySelector('.upload-prompt');
    const preview = this.shadowRoot.querySelector('.preview-wrap');
    const sourceName = this.shadowRoot.querySelector('.source-name');
    if (!prompt || !preview || !sourceName) return;
    sourceName.textContent = file.name;
    const dimensions = this.shadowRoot.querySelector('.source-dimensions');
    const frame = this.shadowRoot.querySelector('.preview-frame');
    if (dimensions) {
      dimensions.textContent = image ? `${image.naturalWidth} × ${image.naturalHeight}` : (file.type || '文件');
      dimensions.hidden = false;
    }
    if (frame) frame.hidden = !image;
    prompt.hidden = true;
    preview.hidden = false;
    this.shadowRoot.querySelector('.dropzone')?.classList.add('has-preview');
  }

  renderPreview(file, image) {
    const canvas = this.shadowRoot.querySelector('canvas');
    if (!canvas) return;
    const size = canvas.width;
    const context = canvas.getContext('2d');
    const scale = Math.min(size / image.naturalWidth, size / image.naturalHeight);
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    context.clearRect(0, 0, size, size);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(image, (size - width) / 2, (size - height) / 2, width, height);
    this.shadowRoot.querySelector('.source-name').textContent = file.name;
    this.shadowRoot.querySelector('.source-dimensions').textContent = `${image.naturalWidth} × ${image.naturalHeight}`;
    this.showFile(file, image);
    const status = this.shadowRoot.querySelector('.status');
    if (status) {
      status.hidden = true;
    }
  }

  render() {
    const accept = this.getAttribute('accept') ?? '*/*';
    const label = this.getAttribute('label') ?? '点击选择或拖拽文件';
    const hint = this.getAttribute('hint') ?? '';
    const changeLabel = this.getAttribute('change-label') ?? '点击此处更换文件';
    const disabled = readBooleanAttribute(this, 'disabled');

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; color: var(--wb-text); font-family: var(--wb-font-family); }
        .dropzone { min-height: 150px; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 20px; border: 1px dashed #b8c3d0; border-radius: var(--wb-radius-md); background: #f8fafc; color: var(--wb-text-muted); cursor: pointer; text-align: center; outline: none; transition: border-color .2s, background .2s; }
        .dropzone:hover, .dropzone.dragover, .dropzone:focus-visible { border-color: var(--wb-primary); background: #f1f5f9; }
        .dropzone.has-preview { align-items: stretch; }
        .dropzone[aria-disabled='true'] { cursor: not-allowed; opacity: .55; pointer-events: none; }
        .upload-prompt { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; }
        .upload-mark { width: 40px; height: 40px; display: grid; place-items: center; margin-bottom: 2px; border: 1px solid #d5dce5; border-radius: 10px; background: #fff; color: #64748b; font-size: 24px; }
        .upload-prompt strong { color: #334155; font-size: 15px; font-weight: 600; }
        .upload-prompt small { color: #94a3b8; font: 11px/1.4 var(--wb-font-family-code); letter-spacing: .04em; }
        .preview-wrap { width: 100%; display: flex; align-items: center; justify-content: center; gap: 18px; min-height: 150px; }
        .preview-wrap:hover .preview-frame { border-color: #94a3b8; }
        .preview-frame { padding: 12px; border: 1px solid #dbe2ea; border-radius: 10px; background: repeating-conic-gradient(#e2e8f0 0 25%, #fff 0 50%) 0 0 / 16px 16px; }
        canvas { display: block; width: 128px; height: 128px; }
        .source-meta { min-width: 0; display: flex; flex-direction: column; align-items: flex-start; gap: 8px; text-align: left; font-weight:bold; }
        .source-name { max-width: 260px; margin: 0; color: #475569; font-size: 13px; word-break: break-all; }
        .source-dimensions, .change-hint { color: #94a3b8; font-size: 12px; }
        .status { margin: 8px 0 0; color: var(--wb-error); font-size: 12px; }
        [hidden] { display: none !important; }
        @media (max-width: 380px) { .preview-wrap { align-items: flex-start; flex-direction: column; padding: 8px 0; } }
      </style>
      <div class="dropzone" role="button" tabindex="${disabled ? '-1' : '0'}" aria-label="${escapeHtml(label)}" aria-disabled="${disabled ? 'true' : 'false'}">
        <div class="upload-prompt">
          <span class="upload-mark" aria-hidden="true">＋</span>
          <strong>${escapeHtml(label)}</strong>
          <small>${escapeHtml(hint)}</small>
        </div>
        <input type="file" accept="${escapeHtml(accept)}" ${disabled ? 'disabled' : ''} hidden>
        <div class="preview-wrap" hidden>
          <div class="preview-frame"><canvas width="128" height="128"></canvas></div>
          <div class="source-meta"><p class="source-name"></p><span class="source-dimensions"></span><span class="change-hint">${escapeHtml(changeLabel)}</span></div>
        </div>
      </div>
      <p class="status" hidden aria-live="polite"></p>
    `;

    const dropzone = this.shadowRoot.querySelector('.dropzone');
    const input = this.shadowRoot.querySelector('input');
    dropzone.addEventListener('click', (event) => {
      if (event.target !== input && !disabled) this.open();
    });
    dropzone.addEventListener('keydown', this.handleKeyDown);
    dropzone.addEventListener('dragover', this.handleDragOver);
    dropzone.addEventListener('dragenter', this.handleDragOver);
    dropzone.addEventListener('dragleave', this.handleDragLeave);
    dropzone.addEventListener('drop', this.handleDrop);
    input.addEventListener('change', this.handleInputChange);
  }
}

defineComponent('wb-file-picker', WBFilePicker);
