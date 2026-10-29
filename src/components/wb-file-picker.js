import { WBBaseElement, defineComponent, escapeHtml, readBooleanAttribute } from './base-element.js';

/**
 * Generic file picker with an optional image preview.
 * Selection emits `change` immediately; image decoding emits `preview` separately:
 *   event.detail.file
 *   event.detail.image
 */
export class WBFilePicker extends WBBaseElement {
  static get observedAttributes() {
    return ['accept', 'label', 'hint', 'change-label', 'invalid-message', 'image-error-message', 'disabled', 'size'];
  }

  constructor() {
    super();
    this.objectUrl = null;
    this.selectedFile = null;
    this.selectedImage = null;
    this.loadVersion = 0;
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleDrop = this.handleDrop.bind(this);
    this.handleDragOver = this.handleDragOver.bind(this);
    this.handleDragLeave = this.handleDragLeave.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  connectedCallback() {
    this.render();
    if (this.selectedFile && !this.selectedImage) this.decodeImage(this.selectedFile);
  }

  disconnectedCallback() {
    this.loadVersion += 1;
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

  get disabled() {
    return readBooleanAttribute(this, 'disabled');
  }

  clear() {
    this.loadVersion += 1;
    this.revokeObjectUrl();
    this.selectedFile = null;
    this.selectedImage = null;
    this.render();
    this.emit('change', { file: null, image: null });
  }

  focus(options) {
    this.shadowRoot.querySelector('.dropzone')?.focus(options);
  }

  open() {
    if (this.disabled) return;
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
    if (this.disabled) return;
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
    if (this.disabled) return;
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.loadFile(file);
    }
  }

  handleInputChange(event) {
    const file = event.target.files?.[0];
    event.stopPropagation();
    event.target.value = '';
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
    if (this.disabled || !(file instanceof File)) return false;
    const accept = this.getAttribute('accept') ?? '';
    if (!this.matchesAccept(file, accept)) {
      this.showError(this.getAttribute('invalid-message') ?? '请选择有效的文件。');
      return false;
    }

    this.loadVersion += 1;
    this.revokeObjectUrl();
    this.selectedFile = file;
    this.selectedImage = null;
    this.render();
    this.emit('change', { file, image: null });
    // A change listener may clear or replace this selection synchronously.
    if (this.selectedFile === file) this.decodeImage(file);
    return true;
  }

  decodeImage(file) {
    if (!file.type.startsWith('image/')) return;
    const version = ++this.loadVersion;
    const url = URL.createObjectURL(file);
    this.objectUrl = url;
    const image = new Image();
    const isCurrent = () => version === this.loadVersion && this.selectedFile === file;
    image.onload = () => {
      if (!isCurrent()) return;
      this.selectedImage = image;
      this.renderPreview(file, image);
      this.revokeObjectUrl();
      this.emit('preview', { file, image });
    };
    image.onerror = () => {
      if (!isCurrent()) return;
      this.revokeObjectUrl();
      this.showError(this.getAttribute('image-error-message') ?? '图片预览失败，仍可使用该文件。');
      this.emit('preview', { file, image: null });
    };
    image.src = url;
  }

  formatSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let value = bytes;
    let index = 0;
    while (value >= 1024 && index < units.length - 1) {
      value /= 1024;
      index += 1;
    }
    return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
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
      dimensions.textContent = `${this.formatSize(file.size)}${image ? ` · ${image.naturalWidth} × ${image.naturalHeight}` : ''}`;
      dimensions.hidden = false;
    }
    if (frame) frame.hidden = !image;
    const fileMark = this.shadowRoot.querySelector('.file-mark');
    if (fileMark) fileMark.toggleAttribute('hidden', Boolean(image));
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
        :host { display: block; color: var(--wb-text, #0f172a); font-family: var(--wb-font-family, system-ui, sans-serif); }
        .dropzone { min-height: 150px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; padding: 20px; border: 1px dashed var(--wb-button-border-strong, #c0cada); border-radius: var(--wb-radius-lg, 12px); background: var(--wb-code-bg, #f8fafc); color: var(--wb-text-muted, #64748b); cursor: pointer; transition: border-color .15s ease, background-color .15s ease; }
        .dropzone:hover, .dropzone.dragover { border-color: var(--wb-text-muted, #64748b); background: var(--wb-disabled-bg, #f1f5f9); }
        .dropzone:focus-visible { outline: 2px solid var(--wb-primary, #1e293b); outline-offset: 3px; }
        .dropzone[aria-disabled='true'] { cursor: not-allowed; opacity: .55; pointer-events: none; }
        .upload-prompt { display: flex; align-items: center; gap: 13px; min-width: 0; }
        .upload-mark { width: 38px; height: 38px; flex: 0 0 38px; display: grid; place-items: center; border-radius: var(--wb-radius-lg, 12px); background: var(--wb-icon-surface, #e8eef5); color: var(--wb-text-muted, #64748b); }
        .upload-mark svg { width: 20px; height: 20px; }
        .prompt-copy { min-width: 0; text-align: left; }
        .upload-prompt strong, .upload-prompt small { display: block; }
        .upload-prompt strong { color: var(--wb-text, #0f172a); font-size: 13px; font-weight: 600; }
        .upload-prompt small { margin-top: 4px; color: var(--wb-text-muted, #64748b); font-size: 11px; line-height: 1.5; }
        .preview-wrap { width: 100%; min-width: 0; display: flex; align-items: center; gap: 16px; }
        .preview-frame { flex: 0 0 auto; padding: 6px; border: 1px solid var(--wb-icon-card-border, #dbe3ec); border-radius: var(--wb-radius-md, 8px); background: repeating-conic-gradient(var(--wb-card-border, #e5e7eb) 0 25%, var(--wb-input-bg, #fff) 0 50%) 0 0 / 12px 12px; }
        canvas { display: block; width: 128px; height: 128px; }
        .file-mark { width: 38px; height: 38px; flex: 0 0 38px; padding: 8px; box-sizing: border-box; border-radius: var(--wb-radius-lg, 12px); background: var(--wb-icon-surface, #e8eef5); color: var(--wb-text-muted, #64748b); }
        .source-meta { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; text-align: left; }
        .source-name { margin: 0; color: var(--wb-text, #0f172a); font-size: 13px; font-weight: 600; overflow-wrap: anywhere; }
        .source-dimensions, .change-hint { color: var(--wb-text-muted, #64748b); font-size: 11px; line-height: 1.5; }
        :host([size='sm']) .dropzone { min-height: 116px; padding: 14px 18px; }
        :host([size='sm']) .preview-wrap { gap: 13px; }
        :host([size='sm']) .preview-frame { padding: 5px; }
        :host([size='sm']) canvas { width: 72px; height: 72px; }
        .status { margin: 8px 0 0; color: var(--wb-error, #dc2626); font-size: 12px; }
        [hidden] { display: none !important; }
        @media (max-width: 380px) { canvas { width: 72px; height: 72px; } .dropzone { padding: 14px; } .preview-wrap { gap: 12px; } }
      </style>
      <div class="dropzone" role="button" tabindex="${disabled ? '-1' : '0'}" aria-label="${escapeHtml(label)}" aria-disabled="${disabled ? 'true' : 'false'}">
        <div class="upload-prompt">
          <span class="upload-mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4"/></svg></span>
          <span class="prompt-copy"><strong>${escapeHtml(label)}</strong><small>${escapeHtml(hint)}</small></span>
        </div>
        <input type="file" accept="${escapeHtml(accept)}" ${disabled ? 'disabled' : ''} hidden>
        <div class="preview-wrap" hidden>
          <svg class="file-mark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 2h8l4 4v16H6z"/><path d="M14 2v5h5"/></svg>
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
    if (this.selectedFile) {
      this.showFile(this.selectedFile, this.selectedImage);
      if (this.selectedImage) this.renderPreview(this.selectedFile, this.selectedImage);
    }
  }
}

defineComponent('wb-file-picker', WBFilePicker);
