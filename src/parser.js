/**
 * @name parser.js
 * @desc Parser for Markdown string.
 */

// ============================================
// import
import {
  getSelectedParagraph
} from './caret.js';

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
      if (node.nodeType === 1) {
        node.classList.add('md-focus');
      }
      prerenderFocusMarker(node, restLength);
      return;
    } else {
      restLength -= node.textContent.length;
    }
  }
}

// prerender: render focus on dom
function prerender(prerenderId, marstr, caretPos) {
  let dom = document.getElementById(prerenderId);
  dom.innerHTML = marstr;
  let dom1 = dom.childNodes[caretPos[0]];
  if (dom1) {
    dom1.classList.add('md-focus');
    prerenderFocusMarker(dom1, dom1.textContent.length - caretPos[1]);
    prerenderFocusMarker(dom1, dom1.textContent.length - caretPos[1] + 1);
  }
  return dom.innerHTML;
}

// markdwon decorator: new line handler
function mddNewLineAnalyzer(mds) {
  // 1. parse original \n to ¶ and 
  mds = mds.replace(/\n\n/g, '¶');
  mds = mds.replace(/\n/g, '¬');

  // 2. convert 2 new line into 1 paragraph
  mds = mds.replace(/¬¬/g, '¶');

  // 3. split new line
  mds = mds.split('¶');
  for (let i = 0; i < mds.length; i++) {
    mds[i] = mds[i].split('¬');
  }
  
  return mds;
}

// markdown decorator: new line wrapper
function mddNewLineWrapper(mds) {
  let doc = ''
  for (let i = 0; i < mds.length; i++) {
    let paragraph = '';
    for (let j = 0; j < mds[i].length; j++) {
      if (mds[i][j] == '') mds[i][j] = '<br/>';
      paragraph += mds[i][j] + '†'; // use † to represent'<span class="hide">¬</span>'
    }
    mds[i] = paragraph.replace(/†$/, '').replace(/\<\/div\>†/g, '†</div>').replace(/†/g, '<span class="hide">¬</span>');
    doc += `<div mid='${getCounter()}'>` + mds[i] + "<span class=\"hide\">¶</span></div>";
  }

  doc = doc.replace(/\<span class=\"hide\"\>¶\<\/span\>\<\/div\>$/, '</div>');

  return doc;
}

// This parser assume that the whole paragraph is list
function mddListAnalyzer(mds, options) {
  let useTab = options.indentStyle === 'tab';
  for (let i = 0; i < mds.length; i++) {
    // 1. Check if match seperator rule. If so, continue;
    if (mds[i][0].match(/^([\s]*\*[\s]*\*[\s]*\*[\s\*]*|[\s]*-[\s]*-[\s]*-[\s-]*)$/)) continue;

    // 2. Check if first line match list rule. If not, following line should not be list
    //    create regex: space before regex
    let preSpace = useTab ? '' : `(\s){0,${options.indentSize - 1}}`;
    let matchReg = new RegExp(`(^${preSpace}([\\*-\\+])|([\\d])+\\.)\\s`);
    if (!mds[i][0].match(matchReg)) continue;

    // 3. Parse list
    // Range of umber of spaces per intent level
    let numSpaces = [0, options.indentSize, options.indentSize * 2];
    // Number of tabs. 
    // If exceed, it will be treated as normal text and drop all tabs before the first character.
    let curLevel = 1; 
      
    for (let j = 0; j < mds[i].length; j++) {
      // Check if this line is a list or just normal text.
      // preSpace = options.indentStyle === 'tab' ? '\t'.repeat(curLevel) : `(\ ){${numSpaces[curLevel]},${numSpaces[curLevel + 1]}}`;
      preSpace = useTab ? '\\t' : '\\ ';
      matchReg = new RegExp(`^([${preSpace}]*(([\\*-\\+])|([\\d]+\\.)))\\s([^\\*-\\+]|$)`);
      let isNormalText = !mds[i][j].match(matchReg);
      if (!isNormalText) { // MATCH!!
        // get number of space before *-+
        let spaces = mds[i][j].replace(/^([\t\ ]*)([\*\+-]|\d+\.).*$/, '$1');
        let validIndent = useTab ? spaces.length <= curLevel : spaces.length < numSpaces[curLevel + 1]; // 1 more level is acceptable
        if (!validIndent) {
          // Mark it normal text and do not render it as list item
          console.log(mds[i][j]);
          isNormalText = true;
        } else {
          // get accurate indent level
          if (useTab) {
            curLevel = spaces.length; // Just ignore numSpace list. You wont use it.
          } else {
            for (let k = 1; k <= curLevel + 1; k++) {
              if (spaces.length - numSpaces[k] < 0) {
                curLevel = k;
                break;
              }
            }
            // Update numSpaces list
            if (numSpaces.length <= curLevel) numSpaces.push(spaces.length + options.indentSize);
            else numSpaces[curLevel] = spaces.length + options.indentSize;
            if (numSpaces.length <= curLevel + 1) numSpaces.push(spaces.length + options.indentSize * 2);
            else numSpaces[curLevel + 1] = spaces.length + options.indentSize * 2;
            console.log(numSpaces, mds[i][j]);
          }
          // justify if this is ordered list or unordered list
          let firstSymbol = mds[i][j].replace(/^[\t\ ]*([\*\+-]).*$/, '$1');
          if (firstSymbol.match(/[\*\+-]/)) {  
            // make mds[i][j] as unordered list item
            mds[i][j] = mds[i][j].replace(/^([\t\ ]*[\*\+-].)(.*)$/, `<div class='md-ulist md-indent-${curLevel}' mdtype='ulist'><span class='md-ulist-dot'></span><span class='md-ulistm'>$1</span>$2</div>`);
          } else {
            // make mds[i][j] as ordered list item
            mds[i][j] = mds[i][j].replace(/^([\t\ ]*([\d]+\.).)(.*)$/, `<div class='md-olist md-indent-${curLevel}' mdtype='olist'><span class='md-olist-number' olist-number='$2'></span><span class='md-olistm'>$1</span>$3</div>`)
          }
        }
      } else {
        console.log(mds[i][j]);
      }
      if (isNormalText) { // not match. It is normal text and drop all spaces/tabs before it.
        mds[i][j] = mds[i][j].replace(/^([\s]*)(.+)$/, `<div class='md-ulist md-indent-${curLevel}' mdtype='ulist'><span class='md-ulistm'>$1</span>$2</div>`);
      }
    }

    // if (!mds[i][0].match(/(^(\t|(\ ){0,3})\*)[^$]/)) continue;
    // console.log(`mds[${i}] match!`, mds[i]);
  }
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
  (mds, options, storage) => {
    storage.seperator = [];
    return mds.replace(/^([\s]*\*[\s]*\*[\s]*\*[\s\*]*|[\s]*-[\s]*-[\s]*-[\s-]*)$/g, (match, p1) => {
      storage.seperator.push(p1);
      return `<span class='md-seperator'>¨sl´</span>`;
    });
  },
  (mds, options, storage) => {
    for (let i in storage.seperator) {
      let str = storage.seperator[i];
      mds = mds.replace(/¨sl´/, `<span class='md-seperatorm'>${str}</span>`);
    }
    return mds;
  }
];

class MDParser {
  constructor(options) {
    this.parser = {
      singleLine: {
        parser: [],
        marker: []
      },
      paragraph: [],
      lineWraper: [],
    };
    this.storage = {};
    this.slpl = 0;
    this.ppl = 0;
    this.lpl = 0;
    this.loadOptions(options);
  }

  loadOptions(options) {
    this.options = {
      // only tab and space is acceptable
      // default: space
      indentStyle: (options && options.indentStyle && options.indentStyle.match(/space|tab/)) ? options.indentStyle : 'space',

      // if indentStyle is tab, indentSize will be ignored
      // default: 2
      indentSize: (options && options.indentSize && (typeof options.indentStyle === 'number')) ? options.indentSize : 2,
    }
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
    // initialize storage
    this.storage = {};
    // paragraph
    let paragraph = this.parser.paragraph;
    for (let i = 0; i < this.ppl; i++) mds = paragraph[i](mds, this.options, this.storage);
    // single line
    let singleLine = this.parser.singleLine;
    for (let j = 0; j < mds.length; j++) {
      for (let k = 0; k < mds[j].length; k++) {
        for (let i = 0; i < this.slpl; i++) mds[j][k] = singleLine.parser[i](mds[j][k], this.options, this.storage);
        for (let i = 0; i < this.slpl; i++) mds[j][k] = singleLine.marker[i](mds[j][k], this.options, this.storage);
      }
    }
    // line wraper
    let lineWraper = this.parser.lineWraper;
    for (let i = 0; i < this.lpl; i++) mds = lineWraper[i](mds, this.options, this.storage);
    return mds;
  }
}

// markdown decorator core
// render the whole document
// TODO: render only 1 paragraph at a time to improve performance
function markdownDecoratorCore(editor, caretPos, parser, mode, mdtext) {
  let mds = '';
  if (!caretPos) mode = 'all';
  mds = parser.apply(editor.textContent);
  return mds;

  switch (mode) {
    case 'p':
      let index = caretPos[0];
      if (!editor.childNodes[index]) return null;
      if (mdtext) mds = mdtext;
      else mds = editor.childNodes[index].textContent;
      mds = mds.replace(/^¶([^$])/, (match, p1) => p1).replace(/¶$/, '');
      // parse markdown
      mds = parser.apply(mds)[0]; // Parser returns a list of paragraphs. 
                                  // However, we have only 1 paragraph, just use the first one.

      // remove <p> wrapper
      mds = mds.replace(/^\<p( mid='[\d]+')?\>/, '').replace(/\<\/p\>$/, '');

      // put rendered result back to dom
      editor.childNodes[index].innerHTML = mds;

      return editor.innerHTML;
    case 'all':
    default:
      // just apply parser on content
      mds = parser.apply(editor.textContent);
      for (let i = 1; i < mds.length; i++) mds[0] += mds[i];
      return mds[0];
  }
}

// ============================================
// public function

// dom element, array, parser object, string
export function markdownDecorator(editor, prerenderId, caretPos, parser, mode, mdtext) {
  let html = markdownDecoratorCore(editor, caretPos, parser, mode, mdtext);
  if (!html) return null;
  if (caretPos) html = prerender(prerenderId, html, caretPos);
  // console.log(html);
  return html;
}

// TODO: adjust render style according to options
export function initParser(options) {
  let parser = new MDParser();
  // paragraph parser
  parser.addParagraphParser(mddNewLineAnalyzer);
  parser.addParagraphParser(mddListAnalyzer);
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
