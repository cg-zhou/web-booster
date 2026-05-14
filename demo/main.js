import '../src/index.js';

const navLinks = document.querySelectorAll('.wb-demo-topnav__nav a');
const sections = Array.from(navLinks).map(link => {
  const id = link.getAttribute('href')?.slice(1);
  return id ? document.getElementById(id) : null;
}).filter(Boolean);

function updateActiveLink() {
  const scrollY = window.scrollY + 100;

  let activeIndex = 0;
  for (let i = sections.length - 1; i >= 0; i--) {
    if (sections[i].offsetTop <= scrollY) {
      activeIndex = i;
      break;
    }
  }

  navLinks.forEach((link, i) => {
    if (i === activeIndex) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

window.addEventListener('scroll', updateActiveLink, { passive: true });
updateActiveLink();

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