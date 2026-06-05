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
	const button = event.target.closest('wb-button');
	if (!button) return;

	const messageApi = window.WebBooster?.message;

	// Message type buttons (info/success/warning/error)
	const msgType = button.getAttribute('data-message-type');
	if (msgType && messageApi) {
		const text = button.getAttribute('data-message-text') ?? '操作已完成。';
		(messageApi[msgType] ?? messageApi.info).call(messageApi, text);
		return;
	}

	// Simple demo click message
	const demoMsg = button.getAttribute('data-demo-click-message');
	if (demoMsg && messageApi) {
		messageApi.info(demoMsg);
		return;
	}

	// Adjust target value (e.g. rotate)
	const targetId = button.getAttribute('data-adjust-target');
	if (targetId) {
		const delta = Number(button.getAttribute('data-adjust-delta') ?? 0);
		const target = document.getElementById(targetId);
		if (target && Number.isFinite(delta)) {
			const nextValue = Number(target.value ?? 0) + delta;
			target.value = nextValue;
			target.dispatchEvent(new CustomEvent('change', {
				bubbles: true,
				composed: true,
				detail: { value: nextValue }
			}));
		}
	}
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