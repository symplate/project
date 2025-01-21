import { Dropdown } from 'bootstrap/dist/js/bootstrap.bundle.min';

document.addEventListener('DOMContentLoaded', () => {
  class ColorSchemePicker extends HTMLElement {
    constructor() {
      super();
      this.selectorValueHolder = '[data-value-holder]';
      this.selectorDropdownToggle = '.dropdown-toggle';
      this.selectorDropdownTogglePreview = '.dropdown-toggle [data-preview]';
      this.selectorDropdownLabel = '[data-label]';
      this.selectorDropdownMenu = '.dropdown-menu';
    }

    connectedCallback() {
      this.valueHolder = this.querySelector(this.selectorValueHolder);
      this.dropdownToggle = this.querySelector(this.selectorDropdownToggle);
      this.dropdownTogglePreview = this.querySelector(this.selectorDropdownTogglePreview);
      this.dropdownLabel = this.dropdownToggle.querySelector(this.selectorDropdownLabel);
      this.dropdownMenu = this.querySelector(this.selectorDropdownMenu);

      if (!this.valueHolder || !this.dropdownToggle || !this.dropdownLabel || !this.dropdownMenu) {
        console.error('Some required elements are missing.');
        return;
      }

      this.dropdownPicker = new Dropdown(this.dropdownToggle, {});

      this.buttons = this.dropdownMenu.querySelectorAll('button');
      this.buttons.forEach(button => {
        button.addEventListener('click', this.handleButtonClick.bind(this, button));
      });
    }

    handleButtonClick(button, event) {
      const value = button.dataset.value || null;
      const labelElement = button.querySelector(this.selectorDropdownLabel);
      const preview = button.querySelector('[data-preview]');

      if (preview) {
        const previewStyles = window.getComputedStyle(preview);

        for (let i = 0; i < previewStyles.length; i++) {
          const propertyName = previewStyles[i];

          if (propertyName.startsWith('--color-scheme-preview-')) {
            this.dropdownTogglePreview.style.setProperty(propertyName, previewStyles.getPropertyValue(propertyName));
          }
        }
      }

      if (value) {
        this.dropdownLabel.textContent = labelElement.textContent;

        this.buttons.forEach(button => {
          button.classList.remove('active');
        });

        this.dropdownPicker.hide();

        this.valueHolder.value = value;

        button.classList.add('active');
      } else {
        this.dropdownLabel.textContent = '';
        this.valueHolder.value = '';
        this.buttons.forEach(button => {
          button.classList.remove('active');
        });
      }
    }
  }

  customElements.define('color-scheme-picker', ColorSchemePicker);
});
