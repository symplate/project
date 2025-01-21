import { downloadJSONFile } from '../functions';

document.addEventListener('DOMContentLoaded', () => {
  class SubscriptionsExport extends HTMLElement {
    constructor() {
      super();

      this.form = this.querySelector('form');
      this.submitButton = this.form.querySelector('[data-submit]');

      if (this.submitButton) {
        this.submitButton.addEventListener('click', this.handlesubmitButtonClick.bind(this));
      }
    }

    handlesubmitButtonClick() {
      event.preventDefault();

      const formData = new FormData(this.form);

      fetch(NeoConfig.ajax.url, {
        method: 'POST',
        body: formData,
      })
        .then(response => {
          return response.json();
        })
        .then(responseData => {
          downloadJSONFile(responseData.fileName, responseData.fileContent);
        })
        .catch(error => {
          console.error('Error:', error);
        });
    }
  }

  customElements.define('subscriptions-export', SubscriptionsExport);

});
