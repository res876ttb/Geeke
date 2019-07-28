import { isValidElement } from "react";
import { Minimatch } from "minimatch";

/**
 * @name parser.js
 * @desc Parser for Markdown string.
 */

// ============================================
// import

// ============================================
// constant
const newLineSymbol = '<span class="hide">¶</span>';
const emptyLine = '<br/>';

// ============================================
// global variable
var mdcounter = 0;

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

// markdwon decorator: new line handler
function mddNewLineAnalyzer(mds) {
  // 1. convert new line symbol back to \n (Both ¶ and ¶¶ represent \n\n)
  mds = mds.replace(/¶¶/g, '\n');
  mds = mds.replace(/¶/g, '\n');

  // 2. split line
  mds = mds.split('\n');
  
  return mds;
}

// markdown decorator: new line wrapper
function mddNewLineWrapper(mds) {
  if (mds[mds.length - 1] == '') mds[mds.length - 1] = '<br>';

  // check if first line is empty
  if (mds[0] === '') mds[0] = emptyLine + newLineSymbol;
  else mds[0] += newLineSymbol;

  // wrap each line with new line symbol
  for (let i = 1; i < mds.length - 1; i++) {
    if (mds[i] === '') {
      mds[i] = newLineSymbol + emptyLine + newLineSymbol;
    } else {
      mds[i] = newLineSymbol + mds[i] + newLineSymbol;
    }
  }

  // add new line symbol at last line
  mds[mds.length - 1] = newLineSymbol + mds[mds.length - 1];

  // wrap with <p></p>
  for (let i = 0; i < mds.length; i++) mds[i] = `<p mid='${getCounter()}'>` + mds[i] + "</p>";
  
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

// test: https://regex101.com/r/B0Ui3g/1
const mddLinkParser = [
  mds => mds.replace(/\[(([^\s\]]|[^\s\]]\s|\s[^\s\]])+)\]\(([^\)]*)\)/g, `<a href='$3'>¨l1´$1¨l2´¨l3´$3¨l4´</a>`),
  mds => mds.replace(/¨l1´/g, `<span class='md-link'>[</span>`)
            .replace(/¨l2´/g, `<span class='md-link'>]`)
            .replace(/¨l3´/g, `(`)
            .replace(/¨l4´/g, `)</span>`)
];

const mddHeaderParser = [
  mds => mds.replace(/^#\ (\s*)(.+$)/g, `<span class='md-h1'>¨h1´$1$2</span>`)
            .replace(/^##\ (\s*)(.+$)/g, `<span class='md-h2'>¨h2´$1$2</span>`)
            .replace(/^###\ (\s*)(.+$)/g, `<span class='md-h3'>¨h3´$1$2</span>`)
            .replace(/^####\ (\s*)(.+$)/g, `<span class='md-h4'>¨h4´$1$2</span>`)
            .replace(/^#####\ (\s*)(.+$)/g, `<span class='md-h5'>¨h5´$1$2</span>`)
            .replace(/^######\ (\s*)(.+$)/g, `<span class='md-h6'>¨h6´$1$2</span>`),
  mds => mds.replace(/¨h1´/g, `<span class='md-h1m'># </span>`)
            .replace(/¨h2´/g, `<span class='md-h2m'>## </span>`)
            .replace(/¨h3´/g, `<span class='md-h3m'>### </span>`)
            .replace(/¨h4´/g, `<span class='md-h4m'>#### </span>`)
            .replace(/¨h5´/g, `<span class='md-h5m'>##### </span>`)
            .replace(/¨h6´/g, `<span class='md-h6m'>###### </span>`)
];

const mddEscaperParser = [
  mds => mds.replace(/\\(.)/g, `<span class='md-escaper'>¨e´$1</span>`),
  mds => mds.replace(/¨e´/g, `<span class='md-escaperm'>\\</span>`)
];

// test: https://regex101.com/r/hm1MSB/1
const mddStrikethroughParser = [
  mds => mds.replace(/(?<!\\)~~(([^\s]|\\.)([^~\n]|\\~)*[^\s\\]|[^\s\\])~~/g, `<del>¨s´$1¨s´</del>`),
  mds => mds.replace(/¨s´/g, `<span class='md-strikethrough'>~~</span>`)
];

// test: https://regex101.com/r/dY5dYq/1
// TODO: patch text content after improve render performance
const mddSeperatorParser = [
  mds => mds.replace(/^([\s]*\*[\s]*\*[\s]*\*[\s\*]*|[\s]*-[\s]*-[\s]*-[\s-]*)$/g, `<span class='md-seperator'>¨sl´</span>`),
  mds => mds.replace(/¨sl´/g, `<span class='md-seperatorm'>***</span>`)
];

class MDParser {
  constructor() {
    this.parser = {
      singleLine: {
        parser: [],
        marker: []
      },
      paragraph: [],
      lineWraper: [],
    };
    this.slpl = 0;
    this.ppl = 0;
    this.lpl = 0;
  }

  addSingleLineParser(func) {
    this.parser.singleLine.parser.push(func[0]);
    this.parser.singleLine.marker.push(func[1]);
    this.slpl++;
  }

  addParagraphParser(func) {
    this.parser.paragraph.push(func);
    this.ppl++;
  }

  addLineWraper(func) {
    this.parser.lineWraper.push(func);
    this.lpl++;
  }

  apply(mds) {
    // paragraph
    let paragraph = this.parser.paragraph;
    for (let i = 0; i < this.ppl; i++) mds = paragraph[i](mds);
    // single line
    let singleLine = this.parser.singleLine;
    for (let j = 0; j < mds.length; j++) {
      for (let i = 0; i < this.slpl; i++) mds[j] = singleLine.parser[i](mds[j]);
      for (let i = 0; i < this.slpl; i++) mds[j] = singleLine.marker[i](mds[j]);
    }
    // line wraper
    let lineWraper = this.parser.lineWraper;
    for (let i = 0; i < this.lpl; i++) mds = lineWraper[i](mds);
    return mds;
  }
}

// markdown decorator core
// render the whole document
// TODO: render only 1 paragraph at a time to improve performance
function markdownDecoratorCore(editor, caretPos, parser, mode) {
  let mds = '';
  if (!caretPos) mode = 'all';
  switch (mode) {
    case '3p':
      let start = Math.max(caretPos[0] - 1, 0), end = Math.min(caretPos[0] + 2, editor.childNodes.length);
      mds += editor.childNodes[start].textContent.replace(/^¶/, '');
      console.log(mds);
      for (let i = start + 1; i < end - 1; i++) {
        mds += editor.childNodes[i].textContent;
        if (mds[mds.length - 1] !== '¶') mds += '¶';
        console.log(editor.childNodes[i].textContent);
      }
      if (start === end) {
        mds = mds.replace(/¶$/, '');
      } else {
        mds += editor.childNodes[end - 1].textContent.replace(/¶$/, '');
        console.log(editor.childNodes[end - 1].textContent);
      }
      console.log(mds);
      // remove redundent paragraph seperation symbol
      // if (!mds.match(/^¶+$/)) mds = mds.replace(/^¶/, '').replace(/¶$/, '/');
      // else mds = mds.replace(/¶+/g, '¶'.repeat((end - start - 1) * 2));

      // parse markdown
      mds = parser.apply(mds);

      // patch for optimization
      if (caretPos[0] - 1 > 0) mds[0] = mds[0].replace(/^\<p( mid='[\d]+')?\>/, newLineSymbol);
      if (caretPos[0] + 2 < editor.childNodes.length) mds[mds.length - 1] = mds[mds.length - 1].replace(/\<\/p\>$/, newLineSymbol);
      for (let i = Math.max(caretPos[0] - 1, 0), j = 0; i < Math.min(caretPos[0] + 2, editor.childNodes.length); i++, j++) {
        editor.childNodes[i].innerHTML = mds[j].replace(/^\<p( mid='[\d]+')?\>/, '').replace(/\<\/p\>$/, '');
      }
      return editor.innerHTML;
    case 'all':
    default:
      mds = parser.apply(editor.textContent);
      for (let i = 1; i < mds.length; i++) mds[0] += mds[i];
      return mds[0];
  }
}

// ============================================
// public function

// dom element, array, parser object, string
export function markdownDecorator(editor, newCaretPos, prevCaretPos, parser, mode) {
  let html = markdownDecoratorCore(editor, prevCaretPos, parser, mode);
  if (newCaretPos) html = prerender(html, newCaretPos);
  return html;
}

export function initParser() {
  let parser = new MDParser();
  // paragraph parser
  parser.addParagraphParser(mddNewLineAnalyzer);
  // parser.addParagraphParser(mddListAnalyzer);
  // single line parser
  parser.addSingleLineParser(mddSeperatorParser);
  parser.addSingleLineParser(mddBoldItalicParser);
  parser.addSingleLineParser(mddBoldParser1);
  parser.addSingleLineParser(mddBoldParser2);
  parser.addSingleLineParser(mddItalicParser1);
  parser.addSingleLineParser(mddItalicParser2);
  parser.addSingleLineParser(mddInlineCodeParser);
  parser.addSingleLineParser(mddLinkParser);
  parser.addSingleLineParser(mddStrikethroughParser);
  parser.addSingleLineParser(mddEscaperParser);
  parser.addSingleLineParser(mddHeaderParser);
  // line wraper
  parser.addLineWraper(mddNewLineWrapper);
  return parser;
}

export function getCounter() {
  mdcounter++;
  return mdcounter;
}
