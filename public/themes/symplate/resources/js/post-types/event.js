import { buttonCopyContent } from '../functions';

document.addEventListener('DOMContentLoaded', () => {
  (() => {
    const wrappers = document.querySelectorAll('[id^="EventButtonCopy-"]');
    const editSlugElement = document.getElementById('edit-slug-box');

    if (wrappers && editSlugElement) {
      wrappers.forEach(wrapper => {
        editSlugElement.appendChild(wrapper);
      });
    }
  })();
});
