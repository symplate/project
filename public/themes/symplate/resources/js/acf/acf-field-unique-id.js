import { buttonCopyContent } from '../functions';

document.addEventListener('DOMContentLoaded', () => {

  if (typeof acf === 'undefined' || typeof acf.addAction === 'undefined') {
    return;
  }

  class FieldUniqueId extends HTMLElement {
    constructor() {
      super();

      acf.addAction(`ready_field/name=unique_id`, this.init.bind(this));
      acf.addAction('append_field/type=unique_id', this.set.bind(this));

      this.copyButton = this.querySelector('[data-copy="button"]');
      this.copyContent = this.querySelector('[data-copy="content"]');

      if (this.copyButton && this.copyContent) {
        buttonCopyContent(this.copyButton, this.copyContent);
      }
    }

    generate(length = 12) {
      let bytes;

      if (window.crypto && window.crypto.getRandomValues) {
          bytes = new Uint8Array(Math.ceil(length / 2));
          window.crypto.getRandomValues(bytes);
      }
      else {
          bytes = new Array(Math.ceil(length / 2));

          for (let i = 0; i < bytes.length; i++) {
              bytes[i] = Math.floor(Math.random() * 256);
          }
      }

      const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('').slice(0, length);

      return hex + '-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    init(field) {
      
    }

    set(field) {
      const inputElement = field.$el[0].querySelector('[data-input]');
      const valueElement = field.$el[0].querySelector('[data-value]');
      const pendingElement = field.$el[0].querySelector('[data-pending]');
      const id = this.generate();

      if (id) {
        inputElement.value = id;
        valueElement.textContent = id;
        valueElement.hidden = false;
        pendingElement.hidden = true;
      }
      else {
        inputElement.value = '';
        valueElement.hidden = true;
        pendingElement.hidden = false;
      }
    }
  }

  customElements.define('field-unique-id', FieldUniqueId);

});
