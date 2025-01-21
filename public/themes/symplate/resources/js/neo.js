import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { buttonCopyContent } from './functions';
import './custom-elements/neo-notice';
import './custom-elements/neo-settings-form';
import './custom-elements/subscriptions-export';
import './acf';
import './post-types/event';

// Turn jQuery animations off
jQuery.fx.off = true;

document.addEventListener('DOMContentLoaded', () => {

  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

  // 
  (() => {
    const buttons = document.querySelectorAll('[data-neo-copy-button]');
    buttons.forEach(button => {
      buttonCopyContent(button);
      button.hidden = false;
    });
  })();

  // (() => {

  //   const wrapper = document.getElementById('adminmenuwrap');
  //   const element = document.getElementById('AdminMenuSiteStatus');

  //   if (wrapper && element) {
  //     wrapper.insertBefore(element, wrapper.firstChild);
  //     element.hidden = false;
  //   }

  // })();

});
