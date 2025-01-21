import { NeoConfirmDialog } from '../classes/NeoConfirmDialog';

/**
 * Represents a custom Neo Settings Form web component.
 *
 * @class      NeoSettingsForm
 * @extends    HTMLElement
 */
document.addEventListener('DOMContentLoaded', () => {
  class NeoSettingsForm extends HTMLElement {
    constructor() {
      super();

      const currentUrl = new URL(window.location.href);
      if (currentUrl.searchParams.has('notice')) {
        currentUrl.searchParams.delete('notice');
        history.replaceState(null, null, currentUrl.toString());
      }

      this.postId = this.dataset.postId || null;
      this.menuSlug = this.dataset.menuSlug || null;
      this.header = this.querySelector('.neo-admin-header');

      if (this.header) {
        window.addEventListener('resize', this.onDocumentScroll.bind(this));
        window.addEventListener('scroll', this.onDocumentScroll.bind(this));
      }

      this.form = this.querySelector('form');

      if (!this.form) {
        console.error('Error:', 'Missing settings form.');
        return false;
      }

      this.submitButton = this.form.querySelector('[data-submit]');
      this.resetButton = this.form.querySelector('[data-reset]');
      this.exportButton = this.form.querySelector('[data-export]');

      this.fieldsWrapper = this.querySelector('[data-fields="wrapper"]');
      this.fieldGroupElements = this.fieldsWrapper.querySelectorAll('[data-fields="group"]');

      this.successWrapper = this.querySelector('[data-success="wrapper"]');
      this.noticeWrapper = this.querySelector('[data-notice="wrapper"]');

      if (this.noticeWrapper) {
        this.noticeHandler = this.querySelector('[data-notice="handler"]');
      }

      if (typeof acf !== 'undefined' && typeof acf.addFilter !== 'undefined') {
        acf.add_filter('validation_complete', (json, $form) => {
          if (json.valid) {
            this.afterValidationSuccess();
          }
          return json;
        });
      }

      if (this.resetButton) {
        this.confirmDialog = new NeoConfirmDialog({
          heading: this.resetButton.dataset.heading || '',
          message: this.resetButton.dataset.message || '',
        });

        this.resetButton.addEventListener('click', this.onResetClickHandler.bind(this));
      }

      if (this.exportButton) {
        this.exportButton.addEventListener('click', this.onExportClickHandler.bind(this));
      }
    }

    onResetClickHandler(event) {
      this.confirmDialog.show();
      this.confirmDialog.on('confirm', this.onResetConfirmHandler.bind(this));
    }

    onResetConfirmHandler() {
      // this.resetButton.disabled = true;
      this.submitButton.disabled = true;
      // this.resetButton.classList.add('loading');

      this.fieldGroupElements.forEach(fieldGroup => {
        fieldGroup.classList.add('loading-overlay');
      });

      if (this.successWrapper) {
        this.successWrapper.remove();
      }

      this.noticeWrapper.hidden = true;
      this.noticeHandler.innerHTML = '';

      const formData = new FormData();
      formData.append('action', 'neo/ajax/admin/settings/reset');
      formData.append('nonce', NeoConfig.ajax.nonce);
      formData.append('post_id', this.postId);

      fetch(NeoConfig.ajax.url, {
        method: 'POST',
        body: formData,
      })
      .then(response => {
        return response.json();
      })
      .then(data => {
        if (data.hasOwnProperty('notice') && this.noticeHandler) {
          this.noticeHandler.innerHTML = data.notice;
          this.noticeWrapper.hidden = false;
          window.scrollTo(0, 0);

          if (data.hasOwnProperty('error')) {
            // this.resetButton.classList.remove('loading');
            // this.resetButton.disabled = false;
            this.submitButton.disabled = false;
            this.fieldGroupElements.forEach(fieldGroup => {
              fieldGroup.classList.remove('loading-overlay');
            });
            return;
          }
        }

        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('notice', 'reset');
        window.location.href = currentUrl.href;
      })
      .catch(error => {
        console.error('Error:', error);
      });
    }

    afterValidationSuccess() {
      this.submitButton.disabled = true;
      // this.resetButton.disabled = true;
      this.submitButton.classList.add('loading');
      this.fieldGroupElements.forEach(fieldGroup => {
        fieldGroup.classList.add('loading-overlay');
      });

      if (this.successWrapper) {
        this.successWrapper.remove();
      }
    }

    onDocumentScroll() {
      const headerRect = this.header.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      let threshold = getComputedStyle(document.documentElement).getPropertyValue('--wp-admin--admin-bar--height');

      if (window.innerWidth >= parseInt(NeoConfig.style.breakpoints['wp-mobile'])) {
        threshold = parseInt(threshold);
      }
      else if (window.innerWidth >= parseInt(NeoConfig.style.breakpoints['wp-xs'])) {
        threshold = parseInt(threshold);
      }
      else {
        threshold = 0;
      }

      if (headerRect.top <= threshold) {
        this.header.classList.add('is-sticky');
      }
      else {
        this.header.classList.remove('is-sticky');
      }
    }
  }

  customElements.define('neo-settings-form', NeoSettingsForm);

});
