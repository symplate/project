import { Tooltip, Collapse } from 'bootstrap/dist/js/bootstrap.bundle.min';

import Coloris from "@melloware/coloris";
import "@melloware/coloris/dist/coloris.css";

import { NeoConfirmDialog } from '../classes/NeoConfirmDialog';

document.addEventListener('DOMContentLoaded', () => {

  if (typeof acf === 'undefined' || typeof acf.addAction === 'undefined') {
    return;
  }

  class ColorSchemeGroup extends HTMLElement {
    constructor() {
      super();

      if (!(this.groupKey = this.dataset.key || null)) return;
      if (!(this.groupField = acf.getField(this.groupKey))?.val()) return;
      if (!(this.groupElement = this.groupField?.$el[0])) return;

      this.groupTable = this.querySelector('.acf-repeater > .acf-table');
      this.addRowButtons = Array.from(this.groupElement?.querySelectorAll('[data-event="add-scheme"]') ?? []);
      this.schemesCountHolder = Array.from(this.groupElement?.querySelectorAll('[data-schemes-count]') ?? []);

      this.updateStates();

      acf.addAction(`ready_field/name=color_scheme_group`, this.onGroupReady.bind(this));
      acf.addAction('ready_field/type=color_scheme', this.onSchemeReady.bind(this));
      acf.addAction('append_field/type=color_scheme', this.onSchemeAppend.bind(this));
    }

    updateStates() {
      const totalRows = this.getTotalRows();
      const firstRowRemoveButton = this.groupElement.querySelector('.acf-row:first-child [data-event="remove-scheme"]');

      if (firstRowRemoveButton) {
        if (totalRows <= 1) {
          firstRowRemoveButton.disabled = true;
          firstRowRemoveButton.style.setProperty('pointer-events', 'none');
          firstRowRemoveButton.style.setProperty('opacity', '0.5');
        }
        else {
          firstRowRemoveButton.disabled = false;
          firstRowRemoveButton.style.setProperty('pointer-events', 'auto');
          firstRowRemoveButton.style.setProperty('opacity', '1');
        }
      }

      this.addRowButtons.forEach(button => {
        button.disabled = totalRows >= this.groupField.data.max;
      });

      this.schemesCountHolder.forEach(element => {
        element.textContent = `${totalRows}/${this.groupField.data.max}`;
      });

      if (this.groupTable) {
        const rows = this.groupTable.querySelectorAll('tr.acf-row:not(.acf-clone, .acf-deleted)');

        let index = 1;
        rows.forEach(row => {
          const number = row.querySelector('[data-number]');

          if (number) {
            number.textContent = index++;
          }
        });
      }
    }

    onGroupReady(field) {
      this.addRowButtons.forEach(button => {
        button.addEventListener('click', (event) => {
          this.groupField.onClickAdd(event, this.groupField.$el);
          this.updateStates();
        });
      });
    }

    onSchemeReady(field) {
      this.initTooltip(field);

      field.on('sortstopField', () => {
        this.updateStates();
      });

      const removeButton = field.$el[0].querySelector('[data-event="remove-scheme"]');

      if (removeButton) {
        removeButton.addEventListener('click', (event) => {
          const confirmDialog = new NeoConfirmDialog({
            heading: removeButton.dataset.heading || '',
            message: removeButton.dataset.message || '',
          });

          confirmDialog.show();
          confirmDialog.on('confirm', this.onRemoveSchemeConfirmHandler.bind(this, field, confirmDialog));
        });
      }
    }

    onSchemeAppend(field) {
      this.onSchemeReady(field);

      const element = field.$el[0];

      element.classList.add('added');
      element.scrollIntoView({ behavior: 'smooth' });

      setTimeout(() => {
        element.classList.remove('added');
      }, 600);
    }

    onRemoveSchemeConfirmHandler(field, dialog) {
      this.removeScheme(field);
    }

    removeScheme(field) {
      const row = field.$el[0].closest('tr.acf-row');
      row.remove();
      this.updateStates();
    }

    getTotalRows() {
      if (this.groupTable) {
        const rows = this.groupTable.querySelectorAll('tr.acf-row:not(.acf-clone, .acf-deleted)');

        if (rows && Array.isArray(Array.from(rows))) {
          return rows.length;
        }
      }

      return 0;
    }

    initTooltip(field) {
      const controlsWrapper = field.$el[0].querySelector('.color-scheme-header__controls');

      if (controlsWrapper) {
        const buttons = controlsWrapper.querySelectorAll('.color-scheme-header__controls-button');

        buttons.forEach(button => {
          const row = button.closest('.acf-row');
          const title = button.dataset.title || null;

          if (title) {
            const tooltip = new Tooltip(button, {
              title: title,
              placement: 'top',
            });

            row.addEventListener('DOMNodeRemoved', () => tooltip.hide());
          }
        });
      }
    }
  }

  class ColorSchemeField extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.initColorPickers();
    }

    initColorPickers() {
      try {
        if (typeof Coloris !== 'undefined') {
          Coloris.init();
          Coloris({
            // parent: '',
            el: '[data-color="input"]',
            theme: 'pill',
            themeMode: 'light',
            formatToggle: false,
            wrap: false,
            alpha: false,
            format: 'hex',
            margin: 0,
            clearButton: false,
            closeButton: false,
            focusInput: false,
            selectInput: true,
            swatches: [
              '#ffffff',
              '#000000',
              '#0d6efd',
              '#0dcaf0',
              '#6610f2',
              '#6f42c1',
              '#d63384',
              '#dc3545',
              '#fd7e14',
              '#ffc107',
              '#198754',
              '#20c997',
            ],
            defaultColor: '#000000',
            onChange: this.handleColorChange.bind(this),
          });
          Coloris.close();
        } else {
          console.error('Coloris library is not available.');
        }
      } catch (error) {
        console.error('Error initializing color pickers:', error);
      }
    }

    handleColorChange(color, input) {
      try {
        const parent = input.closest('label');

        if (parent) {
          const colorKey = input.dataset.colorKey || null;
          const colorKeySlug = colorKey ? colorKey.replace(/_/g, "-") : null;
          const colorButton = parent.querySelector('[data-color="button"]');
          const colorText = parent.querySelector('[data-color="text"]');
          const preview = input.closest('color-scheme-field').querySelector('[data-preview]');

          colorText.textContent = color;
          colorButton.style.setProperty(`--${NeoConfig.style.prefix}button-picker-bg`, color);
          preview.style.setProperty(`--color-scheme-${colorKeySlug}`, color);
        }
      } catch (error) {
        console.error('Error handling color change:', error);
      }
    }
  }

  customElements.define('color-scheme-group', ColorSchemeGroup);
  customElements.define('color-scheme-field', ColorSchemeField);

});
