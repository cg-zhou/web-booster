import '../src/styles/web-booster.css';
import '../src/styles/web-booster-demo.css';
import '../src/index.js';

document.addEventListener('click', (event) => {
	const trigger = event.target.closest('wb-button[data-message-type]');

	if (!trigger || !window.WebBooster?.message) {
		return;
	}

	const type = trigger.getAttribute('data-message-type') ?? 'info';
	const text = trigger.getAttribute('data-message-text') ?? '操作已完成。';
	const messageApi = window.WebBooster.message;
	const handler = typeof messageApi[type] === 'function' ? messageApi[type].bind(messageApi) : messageApi.info.bind(messageApi);

	handler(text);
});

document.addEventListener('click', (event) => {
	const trigger = event.target.closest('wb-button[data-demo-click-message]');

	if (!trigger || !window.WebBooster?.message) {
		return;
	}

	window.WebBooster.message.info(trigger.getAttribute('data-demo-click-message') ?? '按钮示例已点击。');
});

document.addEventListener('click', (event) => {
	const trigger = event.target.closest('wb-button[data-adjust-target]');

	if (!trigger) {
		return;
	}

	const targetId = trigger.getAttribute('data-adjust-target');
	const delta = Number(trigger.getAttribute('data-adjust-delta') ?? 0);
	const target = targetId ? document.getElementById(targetId) : null;

	if (!target || Number.isNaN(delta)) {
		return;
	}

	const nextValue = Number(target.value ?? 0) + delta;
	target.value = nextValue;
	target.dispatchEvent(new CustomEvent('change', {
		bubbles: true,
		composed: true,
		detail: { value: Number(target.value ?? 0) }
	}));
});

document.addEventListener('change', (event) => {
	const target = event.target;

	if (target?.id === 'demo-rotate' && window.WebBooster?.message) {
		window.WebBooster.message.info(`Rotation: ${event.detail?.value ?? target.value}deg`);
	}

	if ((target?.id === 'demo-flip-x' || target?.id === 'demo-flip-y') && window.WebBooster?.message) {
		const label = target.id === 'demo-flip-x' ? 'Horizontal flip' : 'Vertical flip';
		const checked = event.detail?.checked ?? target.checked;
		window.WebBooster.message.info(`${label}: ${checked ? 'on' : 'off'}`);
	}
});