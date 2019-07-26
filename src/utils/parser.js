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
const mddBoldParser1 = [
  mds => mds.replace(/(?<!\\)\*\*(([^\s]|\\.)([^\*\n]|\\\*)*[^\s\\]|[^\s\\])\*\*/g, `<b>¨b1´$1¨b1´</b>`),
  mds => mds.replace(/¨b1´/g, `<span class='md-bold'>**</span>`)
];
const mddBoldParser2 = [
  mds => mds.replace(/__([^\s][^_\n]*[^\s]|[^\s])__/g, `<b>¨b2´$1¨b2´</b>`),
  mds => mds.replace(/¨b2´/g, `<span class='md-bold'>__</span>`)
];

const mddBoldItalicParser = [
  mds => mds.replace(/(?<!\\)\*\*\*(([^\s]|\\.)([^\*\n]|\\\*)*[^\s\\]|[^\s\\])\*\*\*/g, `<b><i>¨bi´$1¨bi´</i></b>`),
  mds => mds.replace(/¨bi´/g, `<span class='md-bold-italic'>***</span>`) 
];

const mddItalicParser1 = [
  mds => mds.replace(/(?<!\\)\*(([^\s]|\\.)([^\*\n]|\\\*)*[^\s\\]|[^\s\\])\*/g, `<i>¨i1´$1¨i1´</i>`),
  mds => mds.replace(/¨i1´/g, `<span class='md-italic'>*</span>`)
];
const mddItalicParser2 = [
  mds => mds.replace(/_([^\s][^_\n]*[^\s]|[^\s])_/g, `<i>¨i2´$1¨i2´</i>`),
  mds => mds.replace(/¨i2´/g, `<span class='md-italic'>_</span>`)
];

// test: https://regex101.com/r/pxbM5w/2
const mddInlineCodeParser = [
  mds => mds.replace(/(?<!\\)`((([^`\n]|\\`)+([^\\`]|\\`))|[^\s\\`])`/g, `<code>¨ic´$1¨ic´</code>`),
  mds => mds.replace(/¨ic´/g, `<span class='md-inline-code'>\`</span>`)
];

const mddLinkParser = [
  mds => mds.replace(/\[(([^\s\]]|[^\s\]]\s|\s[^\s\]])+)\]\(([^\)]*)\)/g, `<a href='$3'>¨l1´$1¨l2´¨l3´$3¨l4´</a>`),
  mds => mds.replace(/¨l1´/g, `<span class='md-link'>[</span>`)
            .replace(/¨l2´/g, `<span class='md-link'>]`)
            .replace(/¨l3´/g, `(`)
            .replace(/¨l4´/g, `)</span>`)
]

class MDParser {
  constructor() {this.parser = [[],[]];}
  add(func) {
    this.parser[0].push(func[0]);
    this.parser[1].push(func[1]);
  }
  apply(mds) {
    for (let i = 0; i < this.parser[0].length; i++) mds = this.parser[0][i](mds);
    for (let i = 0; i < this.parser[1].length; i++) mds = this.parser[1][i](mds);
    return mds;
  }
}

// markdown decorator core
// render the whole document
// TODO: render only 1 paragraph at a time to improve performance
function markdownDecoratorCore(mds) {
  let idCounter = 0;

  // 1. deal with \n
  mds = mddNewLine(mds);

  // TODO: export parser definition to function
  let parser = new MDParser();
  parser.add(mddBoldItalicParser);
  parser.add(mddBoldParser1);
  parser.add(mddBoldParser2);
  parser.add(mddItalicParser1);
  parser.add(mddItalicParser2);
  parser.add(mddInlineCodeParser);
  parser.add(mddLinkParser);

  // 2. convert markdown to HTML
  for (let i = 0; i < mds.length; i++) mds[i] = parser.apply(mds[i]);
  
  // 3. wrap each line with p and add new line symbol back
  if (mds[mds.length - 1] == '') mds[mds.length - 1] = '<br>';
  for (let i = 0; i < mds.length - 1; i++) {
    if (mds[i] === '') {
      mds[i] = '<br><span class="hide">¶</span>';
    } else {
      mds[i] += '<span class="hide">¶</span>';
    }
  }
    for (let i = 0; i < mds.length; i++) mds[i] = "<p>" + mds[i] + "</p>";
  for (let i = 1; i < mds.length; i++) mds[0] += mds[i];
  
  return mds[0];
}

// ============================================
// public function

export function markdownDecorator(marstr, caretPos) {
  marstr = markdownDecoratorCore(marstr);
  if (caretPos) marstr = prerender(marstr, caretPos);
  return marstr;
}
