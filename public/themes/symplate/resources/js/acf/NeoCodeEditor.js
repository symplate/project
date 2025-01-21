import ace from 'ace-builds/src-noconflict/ace';
import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/mode-plain_text';
import 'ace-builds/src-noconflict/mode-css';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-html';
import 'ace-builds/src-noconflict/theme-textmate';
import 'ace-builds/src-noconflict/theme-mono_industrial';

document.addEventListener('DOMContentLoaded', () => {
  /**
   * Represents a custom Neo Code Editor web component.
   *
   * @class      NeoCodeEditor
   * @extends    HTMLElement
   */
  class NeoCodeEditor extends HTMLElement {
    /**
     * Creates an instance of NeoCodeEditor.
     *
     * @constructor
     */
    constructor() {
      super();

      // Initialize properties
      this.editorId = this.dataset.id || null;
      this.textarea = this.querySelector('textarea[data-content]');

      // Proceed if necessary elements are found
      if (this.editorId && this.textarea) {
        this.contentChanged = false;
        this.formSubmitted = false;
        this.form = this.closest('form');

        // Set default values if attributes are not provided
        this.fontSize = parseInt(this.dataset.fontSize) || 14;
        this.minLines = parseInt(this.dataset.minLines) || 16;
        this.maxLines = parseInt(this.dataset.maxLines) || 16;
        this.tabSize = parseInt(this.dataset.tabSize) || 2;

        // Retrieve necessary elements
        this.editorElement = this.querySelector(`#${this.editorId}`);
        this.placeholderElement = this.querySelector('[data-placeholder]');

        // Adjust placeholder font size
        if (this.placeholderElement) {
          this.placeholderElement.style.fontSize = `${this.fontSize}px`;
        }

        // Determine theme and mode based on dataset attributes
        this.theme = this.hasAttribute('data-dark-style') ? 'mono_industrial' : 'textmate';
        this.mode = this.dataset.mode && ['plain_text', 'javascript', 'css', 'html'].includes(this.dataset.mode) ? this.dataset.mode : 'plain_text';

        // Initialize the editor
        this.init();

        // Attach confirmation dialog for unsaved changes
        this.attachConfirmationDialog();
        
        // Attach event listeners
        this.labelClickListener();
        this.editorChangeListener();
        this.attachFormSubmitListener();
      }
    }

    /**
     * Attaches an event listener to detect form submission.
     * When the form is submitted, updates the `formSubmitted` indicator to true.
     *
     * @method attachFormSubmitListener
     */
    attachFormSubmitListener() {
      const form = this.closest('form');
      if (form) {
          form.addEventListener('submit', () => {
              this.formSubmitted = true; // Mettre à jour l'indicateur lorsque le formulaire est soumis
          });
      }
    }

    /**
     * Initializes the ACE editor instance.
     *
     * @method     init
     */
    init() {
      this.editor = ace.edit(this.editorId, {
        mode: `ace/mode/${this.mode}`,
        theme: `ace/theme/${this.theme}`,
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
        useWorker: false,
        autoScrollEditorIntoView: true,
        minLines: this.minLines,
        maxLines: this.maxLines,
        fontSize: `${this.fontSize}px`,
        wrap: this.hasAttribute('data-word-wrap'),
        fontFamily: 'SF Mono, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        cursorStyle: 'slim',
        showInvisibles: false,
        showPrintMargin: false,
        tabSize: this.tabSize,
        useSoftTabs: true,
        placeholder: '',
      });

      // Set initial editor content from textarea
      this.editor.setValue(this.textarea.value);
      this.editor.clearSelection();

      // Update placeholder visibility on window load
      window.addEventListener('load', () => {
        if (this.placeholderElement) {
          if (this.editorElement && this.editorElement.offsetParent !== null) {
            this.updatePlaceholder();
          }
        }
      });
    }

    /**
     * Attach focus event to label click.
     *
     * @method     labelClickListener
     */
    labelClickListener() {
      this.label = this.closest('.acf-field').querySelector('.acf-label label');

      if (this.label) {
        this.label.addEventListener('click', event => {
          this.editor.focus();
        });
      }
    }

    /**
     * Attach change event to editor content change.
     *
     * @method     editorChangeListener
     */
    editorChangeListener() {
      this.editor.getSession().on('change', event => {
        this.textarea.value = this.editor.getValue();
        setTimeout(() => {
          this.updatePlaceholder();
          this.contentChanged = true;
        }, 25);
      });
    }

    /**
     * Update placeholder position and visibility.
     *
     * @method     updatePlaceholder
     */
    updatePlaceholder() {
      if (!this.placeholderElement) return;
      const gutterWidth = this.getGutterWidth();
      const offsetX = (gutterWidth + 5);
      this.placeholderElement.style.left = `${offsetX}px`;
      this.placeholderElement.style.display = this.editor.getValue() == '' ? 'block' : 'none';
    }

    /**
     * Calculate gutter width.
     *
     * @method     getGutterWidth
     * @return     {number}  The gutter width.
     */
    getGutterWidth() {
      const gutterElement = this.editor.renderer.$gutter;
      return gutterElement ? gutterElement.offsetWidth : 0;
    }

    /**
     * Check if content has been changed since page load
     */
    hasContentChanged() {
      return this.contentChanged;
    }

    /**
     * Attach confirmation dialog on window unload
     */
    attachConfirmationDialog() {
      window.addEventListener('beforeunload', event => {
        if (this.hasContentChanged() && !this.formSubmitted) {
          // Display the confirmation dialog
          // Some browsers ignore custom messages for security reasons
          if (!confirm('Some changes have not been saved. Do you still want to leave the page?')) {
            event.preventDefault();
          }
        }
      });
    }
  }

  // Define custom element 'neo-code-editor'
  customElements.define('neo-code-editor', NeoCodeEditor);
});
