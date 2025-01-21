document.addEventListener('DOMContentLoaded', function() {
  class SectionLink extends HTMLElement {
    constructor() {
      super();

      this.parentEl = this.closest('.menu-item-settings');
      this.pageIdInput = this.parentEl.querySelector('.menu-item-data-object-id');
      this.pageId = parseInt(this.pageIdInput.value);

      this.menuItemWrapper = this.closest('li.menu-item');
      this.input = this.menuItemWrapper.querySelector('input[type="hidden"]');
      this.select = this.querySelector('select');
      this.field = this.select.closest('.acf-field-section-link');
      this.fieldHiddenInput = this.querySelector('[data-field-hidden]');
      this.currentValue = this.select.dataset.currentValue;

      this.actionInput = this.querySelector('[data-action]');
      this.nonceInput = this.querySelector('[data-nonce]');

      if (this.actionInput && this.nonceInput) {
        this.action = this.actionInput.value;
        this.nonce = this.nonceInput.value;
      }

      if (!this.pageId) {
        this.field.remove();
      }
      else {
        this.loadSections();
      }

      this.select.addEventListener('change', (event) => {
        this.fieldHiddenInput.value = this.select.value;
      });
    }

    loadSections() {
      const formData = new FormData();
      formData.append('action', 'neo/ajax/section-link/items');
      formData.append('nonce', NeoConfig.ajax.nonce);
      formData.append('page_id', this.pageId);
      formData.append('current_value', this.currentValue);

      fetch(NeoConfig.ajax.url, {
        method: 'POST',
        body: formData,
      })
      .then(response => response.json())
      .then(responseData => {
        if (responseData.hasOwnProperty('options')) {
          this.select.innerHTML = responseData.options;
        }
        else {
          this.field.remove();
        }
      })
      .catch(error => console.error(error))
      .finally(() => {
        // 
      });
    }
  }

  customElements.define('section-link', SectionLink);
});
