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
  let dom1 = dom.childNodes[caretPos[0]];
  prerenderFocusMarker(dom1, dom1.textContent.length - caretPos[1]);
  prerenderFocusMarker(dom1, dom1.textContent.length - caretPos[1] + 1);
  return dom.innerHTML;
}

// markdown decorator: Bold parser
// test: https://regex101.com/r/l1yUUj/1
function mddBoldParser(mds) {
  // remove wrong bold html style
  
  // make bold html style
  // mds = mds.replace(/\<b\>\<span class=\'md-bold\' mdid=\'\d+\.\d+\'\>\*\*\<\/span\>([^\s][^\*\n]*[^\s]|[^\s])\<span class=\'md-bold\'\>\*\*\<\/span\>\<b\\\>/g, "**$1**");
  mds = mds.replace(/\*\*([^\s][^\*\n]*[^\s]|[^\s])\*\*/g, `<b><span class='md-bold' mdid='${getNewID()}'>**</span>$1<span class='md-bold'>**</span></b>`);

  return mds;
}

// markdwon decotator: new line handler
function mddNewLine(mds) {
  // 1. convert new line symbol back to \n
  mds = mds.replace(/¶/g, '\n');

  // 2. split line
  mds = mds.split('\n');
  
  return mds;
}

// markdown decorator core
function markdownDecoratorCore(mds) {
  // 1. deal with \n
  mds = mddNewLine(mds);

  // 2. convert markdown to HTML
  for (let i = 0; i < mds.length; i++) {
    // bold & italic parser
    // bold parser
    mds[i] = mddBoldParser(mds[i]);
    // italic parser
  }
  
  // 3. wrap each line with div and add new line symbol back
  if (mds[mds.length - 1] == '') mds[mds.length - 1] = '<br>';
  for (let i = 0; i < mds.length - 1; i++) mds[i] += '<span class="hide">¶</span>';
  for (let i = 0; i < mds.length; i++) mds[i] = "<div>" + mds[i] + "</div>";
  for (let i = 1; i < mds.length; i++) mds[0] += mds[i];
  
  return mds[0];
}

// ============================================
// public function

export function markdownDecorator(marstr, caretPos) {
  marstr = markdownDecoratorCore(marstr);
  marstr = prerender(marstr, caretPos);
  return marstr;
}
