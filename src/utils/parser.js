import { isValidElement } from "react";

/**
 * @name parser.js
 * @desc Parser for Markdown string.
 */

// ============================================
// import
import {
  getNewID
} from './id.js';

// ============================================
// private function

// markdown decorator: Bold parser
// test: https://regex101.com/r/l1yUUj/1
function mddBoldParser(mds) {
  // remove wrong bold html style
  
  // make bold html style
  // mds = mds.replace(/\<b\>\<span class=\'md-bold\' mdid=\'\d+\.\d+\'\>\*\*\<\/span\>([^\s][^\*\n]*[^\s]|[^\s])\<span class=\'md-bold\'\>\*\*\<\/span\>\<b\\\>/g, "**$1**");
  mds = mds.replace(/\*\*([^\s][^\*\n]*[^\s]|[^\s])\*\*/g, `<b><span class='md-bold' mdid='${getNewID()}'>**</span>$1<span class='md-bold'>**</span></b>`);

  return mds;
}

// markdown decorator core
function markdownDecoratorCore(mds) {
  mds = mddBoldParser(mds);
  
  // wrap with div temporarily
  mds = '<div>' + mds + '</div>';
  
  return mds;
}

function prerenderFocusMarker(range, restLength) {
  if (!(range && range.hasChildNodes())) {
    return;
  }
  for (let i = 0; i < range.childNodes.length; i++) {
    let node = range.childNodes[i];
    if (node.textContent.length >= restLength) {
      if (node.nodeType === 1) node.classList.add('md-focus');
      prerenderFocusMarker(node, restLength);
      return;
    } else {
      restLength -= node.textContent.length;
    }
  }
}

// prerender: render focus on dom
function prerender(marstr, caretPos) {
  let dom = document.getElementById('prerender');
  dom.innerHTML = marstr;
  prerenderFocusMarker(dom, dom.textContent.length - caretPos[1]);
  prerenderFocusMarker(dom, dom.textContent.length - caretPos[1] + 1);
  return dom.innerHTML;
}

// ============================================
// public function

export function markdownDecorator(marstr, caretPos) {
  marstr = markdownDecoratorCore(marstr);
  marstr = prerender(marstr, caretPos);
  return marstr;
}
