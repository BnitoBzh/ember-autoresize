import Ember from 'ember';
import adobeBlank from './adobe-blank';
import { measureText } from "dom-ruler";

const { RSVP, run } = Ember;

var sheet;
function injectAdobeBlank() {
  if (sheet) {
    return sheet;
  }

  const element = document.createElement('style');
  const parent = document.head || document.body;
  parent.appendChild(element);

  // Find the stylesheet object created by the DOM element
  for (var i = document.styleSheets.length - 1; i >= 0; i--) {
    let stylesheet = document.styleSheets[i];
    if (stylesheet.ownerNode === element) {
      sheet = stylesheet;
      break;
    }
  }

  if (sheet.insertRule) {
    sheet.insertRule(`@font-face { ${adobeBlank} }`, 0);
  } else {
    sheet.addRule('@font-face', adobeBlank, 0);
  }
}

const SPECIMEN = " !\"\\#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{|}~";
var referenceSize;

function getReferenceSize() {
  if (referenceSize) {
    return referenceSize;
  }
  return referenceSize = measureText(SPECIMEN, {
    fontFamily: `"AdobeBlank"`
  }, {});
}

function checkIfFontLoaded(fontFamily, options, resolve, reject) {
  let blankSize = getReferenceSize();
  let size = measureText(SPECIMEN, {
    "font-family": `${fontFamily}, "AdobeBlank"`
  }, {});

  if (size.width !== blankSize.width ||
      size.height !== blankSize.height) {
    resolve();
  } else if (options.timeout <= 0) {
    reject();
  } else {
    setTimeout(function () {
      options.timeout -= 50;
      checkIfFontLoaded(fontFamily, options, resolve, reject);
    }, 50);
  }
}

var loadedFonts = {};
export default function (fontFamily, options={ timeout: 3000 }) {
  injectAdobeBlank();

  if (loadedFonts[fontFamily] == null) {
    loadedFonts[fontFamily] = new RSVP.Promise(function (resolve, reject) {
      checkIfFontLoaded(fontFamily, Ember.copy(options, true), run.bind(resolve), run.bind(reject));
    });
  }

  return loadedFonts[fontFamily];
}
