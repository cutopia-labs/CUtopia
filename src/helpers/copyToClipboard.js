const MAX_RANGE = 1000000;
const copyToClipboard = (copyStr) => {
  const input = document.createElement('input');
  input.value = copyStr;
  document.body.appendChild(input);

  if (navigator.userAgent.match(/ipad|iphone/i)) {
    const range = document.createRange();
    range.selectNodeContents(input);

    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    input.setSelectionRange(0, MAX_RANGE);
  } else {
    input.select();
  }
  document.execCommand('copy');
  document.body.removeChild(input);
};

export default copyToClipboard;
