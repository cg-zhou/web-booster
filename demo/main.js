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