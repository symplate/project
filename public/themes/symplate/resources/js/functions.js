/**
 * Downloads a JSON file.
 * @param {string} fileName - The name of the file to download.
 * @param {Object} jsonData - The JSON data to include in the file.
 */
export function downloadJSONFile(fileName, jsonData) {
    const blob = new Blob([JSON.stringify(jsonData)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// export function downloadFile(fileName, contentType, fileContent) {
//     const blob = new Blob([fileContent], { type: contentType });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');

//     a.href = url;
//     a.download = fileName;
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//     URL.revokeObjectURL(url);
// }

/**
 * Copies the text content of a specified element when a button is clicked.
 * @param {HTMLElement} buttonElement - The button element that triggers the copy action.
 * @param {HTMLElement} contentElement - The element whose text content will be copied, data-copy="content" is none.
 */
export function buttonCopyContent(buttonElement, contentElement = null) {
  if (!buttonElement) return;
  if (!contentElement) {
    contentElement = buttonElement.querySelector('[data-copy="content"]');
  }
  if (!contentElement) return;

  const initialSpan = buttonElement.querySelector('[data-copy="initial"]');
  const copiedSpan = buttonElement.querySelector('[data-copy="copied"]');

  buttonElement.addEventListener('click', () => {
    const content = contentElement.textContent.trim();
    const tempInput = document.createElement('input');

    tempInput.value = content;
    document.body.appendChild(tempInput);

    tempInput.select();
    tempInput.setSelectionRange(0, 99999);

    document.execCommand('copy');
    document.body.removeChild(tempInput);

    if (initialSpan && copiedSpan) {
      initialSpan.setAttribute('hidden', true);
      copiedSpan.removeAttribute('hidden');
      
      setTimeout(() => {
        copiedSpan.setAttribute('hidden', true);
        initialSpan.removeAttribute('hidden');
      }, 1200);
    }
  });
}
