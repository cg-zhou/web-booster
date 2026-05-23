/**
 * web-booster - framework-agnostic Web Components and style tokens
 * @version __VERSION__
 * @author https://cg-zhou.top/
 * @license MIT
 */

import { WBButton } from './components/wb-button.js';
import { WBCard } from './components/wb-card.js';
import { WBCode } from './components/wb-code.js';
import { getRegisteredWBIconNames, registerWBIcon, registerWBIcons, WBIcon } from './components/wb-icon.js';
import { WBInlineCode } from './components/wb-inline-code.js';
import { WBInput } from './components/wb-input.js';
import { WBLink } from './components/wb-link.js';
import { WBMessage, WBMessageHost, showMessage } from './components/wb-message.js';
import { WBNumber } from './components/wb-number.js';
import { WBParagraph } from './components/wb-paragraph.js';
import { WBSelect } from './components/wb-select.js';
import { WBSwitch } from './components/wb-switch.js';
import { WBTag } from './components/wb-tag.js';

export {
  WBButton,
  WBCard,
  WBCode,
  getRegisteredWBIconNames,
  registerWBIcon,
  registerWBIcons,
  WBInlineCode,
  WBIcon,
  WBInput,
  WBLink,
  WBMessage,
  WBMessageHost,
  WBNumber,
  WBParagraph,
  WBSelect,
  WBSwitch,
  WBTag,
  showMessage
};

if (typeof window !== 'undefined') {
  window.WebBooster = {
    WBButton,
    WBCard,
    WBCode,
    getRegisteredWBIconNames,
    registerWBIcon,
    registerWBIcons,
    WBInlineCode,
    WBIcon,
    WBInput,
    WBLink,
    WBMessage,
    WBMessageHost,
    WBNumber,
    WBParagraph,
    WBSelect,
    WBSwitch,
    WBTag,
    showMessage,
    message: WBMessage,
    icons: {
      names: getRegisteredWBIconNames,
      register: registerWBIcons,
      registerOne: registerWBIcon
    }
  };
}