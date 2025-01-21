import { Modal } from 'bootstrap/dist/js/bootstrap.bundle.min.js';

export class NeoConfirmDialog {
  constructor(options = {}) {
    this.options = Object.assign({}, {
      heading: '',
      message: '',
      backdrop: 'static',
      keyboard: true,
      focus: true,
    }, options);

    this.modalElement = document.getElementById('NeoConfirmDialog');
    this.modal = new Modal(this.modalElement, {
      backdrop: this.options.backdrop,
      keyboard: this.options.keyboard,
      focus: this.options.focus,
    });

    this.cancelButton = this.modalElement.querySelector('[data-cancel]');
    this.confirmButton = this.modalElement.querySelector('[data-confirm]');

    this.headingHolder = this.modalElement.querySelector('[data-heading]');
    if (this.headingHolder && this.options.heading) {
      this.headingHolder.textContent = this.options.heading;
    }

    this.messageHolder = this.modalElement.querySelector('[data-message]');
    if (this.messageHolder && this.options.message) {
      this.messageHolder.textContent = this.options.message;
    }

    this.modalElement.addEventListener('shown.bs.modal', event => {
      this.confirmButton.focus();
    });
  }

  show() {
    this.modal.show();
  }

  hide() {
    this.modal.hide();
  }

  dispose() {
    this.modal.dispose();
  }

  on(eventName, callback) {
    switch (eventName) {
      case 'confirm':
        this.confirmHandler = () => {
          this.hide();
          if (typeof callback === 'function') {
            callback();
          }
        };
        this.confirmButton.removeEventListener('click', this.confirmHandler);
        this.confirmButton.addEventListener('click', this.confirmHandler);
      break;
      case 'cancel':
        this.cancelHandler = () => {
          this.hide();
          if (typeof callback === 'function') {
            callback();
          }
        };
        this.cancelButton.removeEventListener('click', this.cancelHandler);
        this.cancelButton.addEventListener('click', this.cancelHandler);
      break;
      default:
        console.error('Event not supported');
      break;
    }
  }
}
