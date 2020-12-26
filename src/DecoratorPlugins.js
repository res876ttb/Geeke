const { options } = require("marked");

module.exports = {
  plugins: {
    boldItalic: {
      type: 'onepass',
      func1: mds => mds.replace(/([^\\]|^)\*\*\*(([^\s]|\\.)([^\*\n]|\\\*)*[^\s\\]|[^\s\\])\*\*\*/g, `$1<b><i>¨bi´$2¨bi´</i></b>`),
      func2: mds => mds.replace(/¨bi´/g, `<span class='md-bold-italic'>***</span>`) 
    },
  
    bold1: {
      type: 'onepass',
      func1: mds => mds.replace(/([^\\]|^)\*\*(([^\s]|\\.)([^\*\n]|\\\*)*[^\s\\]|[^\s\\])\*\*/g, `$1<b>¨b1´$2¨b1´</b>`),
      func2: mds => mds.replace(/¨b1´/g, `<span class='md-bold'>**</span>`)
    },
    bold2: {
      type: 'onepass',
      func1: mds => mds.replace(/([^\\]|^)__([^\s][^_\n]*[^\s]|[^\s])__/g, `$1<b>¨b2´$2¨b2´</b>`),
      func2: mds => mds.replace(/¨b2´/g, `<span class='md-bold'>__</span>`)
    },
  
    italic1: {
      type: 'onepass',
      func1: mds => mds.replace(/([^\\]|^)\*(([^\s]|\\.)([^\*\n]|\\\*)*[^\s\\\*]|[^\s\\\*])\*/g, `$1<i>¨i1´$2¨i1´</i>`),
      func2: mds => mds.replace(/¨i1´/g, `<span class='md-italic'>*</span>`)
    },
    italic2: {
      type: 'onepass',
      func1: mds => mds.replace(/([^\\]|^)_([^\s][^_\n]*[^\s]|[^\s])_/g, `$1<i>¨i2´$2¨i2´</i>`),
      func2: mds => mds.replace(/¨i2´/g, `<span class='md-italic'>_</span>`)
    },
  
    // test: https://regex101.com/r/pxbM5w/2
    inlineCode: {
      type: 'onepass',
      func1: (mds, count, storage) => {
        return mds.replace(/(?<!\\)`((([^`\n]|\\`)+([^\\`]|\\`))|[^\s\\`])`/g, (_, p1) => {
          storage.push(p1);
          return `<code>¨ic´${count()}¨ic´</code>`;
        })
      },
      func2: (mds, _, storage) => {
        return mds.replace(/¨ic´([\d]+)¨ic´/g, (_, p1) => {
          return `<span class='md-inline-code'>\`</span>${storage[parseInt(p1)]}<span class='md-inline-code'>\`</span>`
        })
      }
    },
  
    // test: https://regex101.com/r/B0Ui3g/1
    link: {
      type: 'onepass',
      func1: mds => mds.replace(/\[(([^\s\]]|[^\s\]]\s|\s[^\s\]])+)\]\(([^\)]*)\)/g, `<a href='$3'>¨l1´$1¨l2´¨l3´$3¨l4´</a>`),
      func2: mds => mds.replace(/¨l1´/g, `<span class='md-link'>[</span>`)
                       .replace(/¨l2´/g, `<span class='md-link'>]`)
                       .replace(/¨l3´/g, `(`)
                       .replace(/¨l4´/g, `)</span>`)
    },
  
    escaper: {
      type: 'onepass',
      func1: (mds, count, storage) => {
        return mds.replace(/\\(.)/g, (_, p1) => {
          storage.push(p1);
          return `<span class='md-escaper'>¨e´${count()}¨</span>`;
        });
      },
      func2: (mds, _, storage) => {
        return mds.replace(/¨e´(\d+)¨/g, (_, p1) => {
          return `<span class='md-escaperm'>\\</span>${storage[parseInt(p1)]}`
        })
      }
    },
  
    // test: https://regex101.com/r/hm1MSB/1
    strickethrough: {
      type: 'onepass',
      func1: mds => mds.replace(/([^\\])~~(([^\s]|\\.)([^~\n]|\\~)*[^\s\\]|[^\s\\])~~/g, `$1<del>¨s´$2¨s´</del>`),
      func2: mds => mds.replace(/¨s´/g, `<span class='md-strikethrough'>~~</span>`)
    },
  
    // test: https://regex101.com/r/dY5dYq/1
    seperator: {
      type: 'onepass',
      func1: (mds, count, storage) => {
        return mds.replace(/^([\s]*\*[\s]*\*[\s]*\*[\s\*]*|[\s]*-[\s]*-[\s]*-[\s-]*)$/g, (match, p1) => {
          storage.push(p1);
          if (match.match(/^\s*-+\s*$/)) {
            return `¨sl${count()}¨´`;
          } else {
            return `¨sl${count()}´`;
          }
        });
      },
      func2: (mds, _, storage) => {
        return mds = mds.replace(/^¨sl(\d+)¨?´$/, (_, p1) => {
          return `<span class='md-seperator'><span class='md-seperatorm'>${storage[parseInt(p1)]}</span></span>`;
        });
      }
    },

    // test: https://regex101.com/r/iXvwMu/1
    highlight: {
      type: 'onepass',
      func1: (mds, _, storage) => {
        return mds.replace(/(^|[^\\])==([^\n]*[^\\\n])==/g,  `<span class="md-highlight">¨hl$2¨hl</span>`);
      },
      func2: (mds, _, storage) => {
        return mds.replace(/¨hl/g, `<span class='md-highlightm'>==</span>`);
      }
    },

    header: {
      type: 'recursive',
      symbol: null,
      func1: mds => mds,
      func2: (mds, _, storage) => {
        const stateEnum = {'text': 0, 'match': 1, 'empty': 2};
        let state = stateEnum.other;
        for (let i = 0; i < mds.length; i++) {
          let line = mds[i];

          // atx style
          line = line.replace(/^#\ (\s*)([^#.]+)(#*)/g, `<span class='md-h1'><span class='md-h1m'># </span>$1$2<span class='md-h1m'>$3</span></span>`)
                     .replace(/^##\ (\s*)([^#.]+)(#*)/g, `<span class='md-h2'><span class='md-h2m'>## </span>$1$2<span class='md-h2m'>$3</span></span>`)
                     .replace(/^###\ (\s*)([^#.]+)(#*)/g, `<span class='md-h3'><span class='md-h3m'>### </span>$1$2<span class='md-h3m'>$3</span></span>`)
                     .replace(/^####\ (\s*)([^#.]+)(#*)/g, `<span class='md-h4'><span class='md-h4m'>#### </span>$1$2<span class='md-h4m'>$3</span></span>`)
                     .replace(/^#####\ (\s*)([^#.]+)(#*)/g, `<span class='md-h5'><span class='md-h5m'>##### </span>$1$2<span class='md-h5m'>$3</span></span>`)
                     .replace(/^######\ (\s*)([^#.]+)(#*)/g, `<span class='md-h6'><span class='md-h6m'>###### </span>$1$2<span class='md-h6m'>$3</span></span>`);

          // Setext style
          if (line == '') {
            state = stateEnum.empty;
          } else {
            if (state == stateEnum.text) { // state != stateEnum.empty means that this must not be the first line
              if (line.match(/^\s*==+\s*$/)) {
                mds[i - 1] = `<span class='md-h1'>` + mds[i - 1];
                line = `<span class='md-h1m md-visible'>` + line + '</span></span>';
                state = stateEnum.match;
              } else if (line.match(/^\s*--+\s*$/)) {
                mds[i - 1] = `<span class='md-h2'>` + mds[i - 1];
                line = `<span class='md-h2m md-visible'>` + line + '</span></span>';
                state = stateEnum.match;
              } else if (line.match(/^¨sl(\d+)¨´$/)) {
                mds[i - 1] = `<span class='md-h2'>` + mds[i - 1];
                line = line.replace(/^¨sl(\d+)¨´$/, (_, p1) => `<span class='md-h2m md-visible'>${storage[parseInt(p1)]}</span></span>`);
                state = stateEnum.match;
              } else {
                state = stateEnum.text;
              }
            } else {
              state = stateEnum.text;
            }
          }

          mds[i] = line;
        }

        return mds;
      }
    },

    ulist: {
      type: 'recursive',
      symbolPrefix: `¨ul`,
      func1: (mds, count, storage, options, prefixes, recursiveFunc, start, end) => {
        for (let i = start; i < end; i++) {
          mds[i] = mds[i].replace(/^(\s+)([=\-\*]\s)/, (_, p1, p2) => {
            storage.push(p2);
            let res = recursiveFunc(mds, i, i + 1, prefixes, 1);
            return `${p1}¨ul${count()}¨${res[0]}`;
          });
        }
        return mds;
      },
      func2: (mds, count, storage, options, prefixes, recursiveFunc, start, end, regs, depth) => {
        const stateEnum = {firstLine: 1, secondLine: 2, matchEmpty: 3, secondLevel: 4, normal: 5};
        let state = normal;
        let nextStart;
        let breakFlag = false;

        for (let i = start; i < end; i++) {
          if (breakFlag) {
            breakFlag = false;
          }
          // Check if current line match any other style
          // If so, change state back to normal and analyze these lines.
          // TODO...

          // Check state
          switch (state) {
            case normal:
              // Check if current line match ulist style.
              // If so, change state to firstLine
              mds[i] = mds[i].replace(/^(\s*)¨ul\d+¨.*$/, (match, p1) => {
                if (p1.length < options.tabSize) {
                  state = stateEnum.firstLine;
                  nextStart = i;
                }
                return match;
              });
              break;
            case firstLine:
              break;
            case secondLine:
              break;
            case matchEmpty:
              break;
            case secondLevel:
              break;
            default:
              console.error('Undefined state', state);
          }
        }

        return mds;
      }
    },

    olist: {
      type: 'recursive',
      symbolPrefix: `¨ol`,
      func1: () => {

      },
      func2: () => {

      }
    },

    checklist: {
      type: 'recursive',
      symbolPrefix: `¨cl`,
      func1: () => {

      },
      func2: () => {

      }
    }
  }
}

/*

Rules
-----

* Paragraph
  * One blank line seperates two paragraphs
* Quote
  1. Each line has 1 `>` as start
  2. Only the first line has `>`
  3. Nested quote with proper number of `>`
  4. Support all the other styles inside quote like list, table, and header <== Need re-organize parsing architecture
* List
  1. Support style like `+-*` and numbers
  2. Note that in the number list, each number should follow by a `.`
  3. The space before the next line can be any number
  4. Accept for multiple paragraphs, but the next paragarph should have at least the same number of spaces, and no more than 1 blank line between the two paragraphs
  5. Only the first line of the next paragraph should be indented properly
  6. Support quote in list, but quote should be indented for at least the same number of spaces
  7. Support code in list, but should be indented for 2 more spaces
* Code
  1. Start with 4 spaces or 1 tab or quote the block with ```
  2. The indent space/tab will be removed
  3. The code block will continue until the line without indent or EOF
  4. Support specifying language with ```. The following code is the example:
     ```cpp
     #include <iostream>
     using namespace std;

     int main() {
       return 0;
     }
     ```
* Table (Reference: https://blog.fntsr.tw/articles/726/)
  1. Component: title, seperator, and data
     1. Title: seperate column with `|`
     2. Seperator: seperate column with `|`, each column must has at least 3 symbol (`-` or `:`)
     3. Data: seperate each column with `|`

Bugs
----

*  ` in inline code block: `` ` `` should match
* link: [google] [http://www.google.com] should work, there can be multiple spaces between 2 quote


Not support right now
---------------------

* inline link, like <https://www.google.com> or <someone@gmail.com>
  * <email@google.com> should be encoded with a bit of randomized decimal and hex entity-encoding to help obscure users' address from address-harvesting spambots.
* link reference
  * show the reference in the document at anywheter, like the line below, and add like like this: 
    [id]: http://example.com/  "Optional Title Here"

*/