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
  if (dom1) {
    prerenderFocusMarker(dom1, dom1.textContent.length - caretPos[1]);
    prerenderFocusMarker(dom1, dom1.textContent.length - caretPos[1] + 1);
  }
  return dom.innerHTML;
}

// markdwon decotator: new line handler
function mddNewLine(mds) {
  // 1. convert new line symbol back to \n
  mds = mds.replace(/¶/g, '\n');

  // 2. split line
  mds = mds.split('\n');
  
  return mds;
}

// markdown decorator: Bold parser
// test: https://regex101.com/r/l1yUUj/4
const mddBoldParser = [
  mds => mds.replace(/(?<!\\)\*\*(([^\s]|\\.)([^\*\n]|\\\*)*[^\s\\]|[^\s\\])\*\*/g, `<b>¨b´$1¨b´</b>`),
  mds => mds.replace(/¨b´/g, `<span class='md-bold'>**</span>`)
];

const mddBoldItalicParser = [
  mds => mds.replace(/(?<!\\)\*\*\*(([^\s]|\\.)([^\*\n]|\\\*)*[^\s\\]|[^\s\\])\*\*\*/g, `<b><i>¨bi´$1¨bi´</i></b>`),
  mds => mds.replace(/¨bi´/g, `<span class='md-bold-italic'>***</span>`) 
];

const mddItalicParser = [
  mds => mds.replace(/(?<!\\)\*(([^\s]|\\.)([^\*\n]|\\\*)*[^\s\\]|[^\s\\])\*/g, `<i>¨i´$1¨i´</i>`),
  mds => mds.replace(/¨i´/g, `<span class='md-italic'>*</span>`)
];

function addParser(parser, func) {
  parser[0].push(func[0]);
  parser[1].push(func[1]);
}

function applyParser(parser, mds) {
  for (let i = 0; i < parser[0].length; i++) mds = parser[0][i](mds);
  for (let i = 0; i < parser[1].length; i++) mds = parser[1][i](mds);
  return mds;
}

// markdown decorator core
function markdownDecoratorCore(mds) {
  let idCounter = 0;

  // 1. deal with \n
  mds = mddNewLine(mds);

  let parser = [[], []];
  addParser(parser, mddBoldItalicParser);
  addParser(parser, mddBoldParser);
  addParser(parser, mddItalicParser);

  // 2. convert markdown to HTML
  for (let i = 0; i < mds.length; i++) mds[i] = applyParser(parser, mds[i]);
  
  // 3. wrap each line with div and add new line symbol back
  if (mds[mds.length - 1] == '') mds[mds.length - 1] = '<br>';
  for (let i = 0; i < mds.length - 1; i++) {
    if (mds[i] === '') {
      mds[i] = '<br><span class="hide">¶</span>';
    } else {
      mds[i] += '<span class="hide">¶</span>';
    }
  }
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
