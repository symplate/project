import './acf/NeoCodeEditor';
import './acf/acf-field-unique-id';
import './acf/acf-field-color_scheme';
import './acf/acf-field-color_scheme_picker';
import './acf/acf-field-section_link';

document.addEventListener('DOMContentLoaded', () => {
  if (typeof acf !== 'undefined' && typeof acf.addAction !== 'undefined') {
    acf.addAction('select2_init', function($select, args, settings, field) {
      const container = $select[0].nextElementSibling;
      if (container) {
        container.classList.add('neo');
      }
    });
  }
});
