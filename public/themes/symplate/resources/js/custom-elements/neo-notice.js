document.addEventListener('DOMContentLoaded', () => {
  /**
   * Custom element representing a notification.
   * @class
   */
  class NeoNotice extends HTMLElement {
    /**
     * Constructor for NeoNotice.
     * @constructor
     */
    constructor() {
      super();

      /**
       * The type of the notification.
       * @type {string}
       */
      this.type = this.dataset.type || 'info';

      /**
       * Indicates if the notification is dismissible.
       * @type {boolean}
       */
      this.dismissible = this.hasAttribute('data-dismissible');

      /**
       * The auto-close timeout for the notification.
       * @type {number|null}
       */
      this.autoClose = this.dataset.autoClose || null;

      if (this.autoClose) {
        setTimeout(() => {
          this.close();
        }, this.autoClose);
      }

      if (this.dismissible) {
        this.closeButton = this.querySelector('[data-dismiss]');

        if (this.closeButton) {
          this.closeButton.addEventListener('click', event => {
            this.close();
          });
        }
      }
    }

    /**
     * Closes the notification.
     * @method
     */
    close() {
      this.classList.add('is-closing');

      this.addEventListener('transitionend', () => {
        this.remove();
      });

      setTimeout(() => {
        this.remove();
      }, 200);
    }
  }

  customElements.define('neo-notice', NeoNotice);
});
