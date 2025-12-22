let tooltip = null;

function createTooltip() {
  if (tooltip) return tooltip;

  tooltip = document.createElement('div');
  tooltip.id = 'darija-translator-tooltip';
  tooltip.style.cssText = `
    position:absolute;
    background:#10b981;
    color:white;
    padding:6px 10px;
    border-radius:8px;
    font-size:12px;
    z-index:10000;
  `;

  tooltip.innerHTML = `
    <button id="tooltipTranslateBtn">Translate</button>
    <button id="tooltipCopyBtn">Copy</button>
  `;

  document.body.appendChild(tooltip);

  tooltip.querySelector('#tooltipTranslateBtn').onclick = () => {
    const text = window.getSelection().toString().trim();
    if (text) {
      chrome.runtime.sendMessage({
        action: 'openSidePanelWithText',
        text
      });
      hideTooltip();
    }
  };

  tooltip.querySelector('#tooltipCopyBtn').onclick = async () => {
    const text = window.getSelection().toString().trim();
    if (text) {
      await navigator.clipboard.writeText(text);
      chrome.runtime.sendMessage({
        action: 'openSidePanelWithText',
        text
      });
      hideTooltip();
    }
  };

  return tooltip;
}

function showTooltip(rect) {
  const t = createTooltip();
  t.style.display = 'block';
  t.style.left = rect.left + 'px';
  t.style.top = rect.top - 30 + 'px';
}

function hideTooltip() {
  if (tooltip) tooltip.style.display = 'none';
}

document.addEventListener('mouseup', () => {
  setTimeout(() => {
    const text = window.getSelection().toString().trim();
    if (text && text.length <= 500) {
      const rect = window.getSelection().getRangeAt(0).getBoundingClientRect();
      showTooltip(rect);
    } else {
      hideTooltip();
    }
  }, 10);
});


document.addEventListener('mousedown', (e) => {
  if (tooltip && !tooltip.contains(e.target)) {
    hideTooltip();
  }
});

document.addEventListener('scroll', () => {
  hideTooltip();
});

console.log('Darija Translator content script loaded');