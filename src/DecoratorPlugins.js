const { options } = require("marked");
const { getCounter } = require("./deprecated/parser");

module.exports = {
  plugins: {
    header: {
      type: 'onepass',
      func1: mds => 
        mds.replace(/^#\ (\s*)(.+$)/g, `<span class='md-h1'>¨h1´$1$2</span>`)
           .replace(/^##\ (\s*)(.+$)/g, `<span class='md-h2'>¨h2´$1$2</span>`)
           .replace(/^###\ (\s*)(.+$)/g, `<span class='md-h3'>¨h3´$1$2</span>`)
           .replace(/^####\ (\s*)(.+$)/g, `<span class='md-h4'>¨h4´$1$2</span>`)
           .replace(/^#####\ (\s*)(.+$)/g, `<span class='md-h5'>¨h5´$1$2</span>`)
           .replace(/^######\ (\s*)(.+$)/g, `<span class='md-h6'>¨h6´$1$2</span>`),
      func2: mds => 
        mds.replace(/¨h1´/g, `<span class='md-h1m'># </span>`)
           .replace(/¨h2´/g, `<span class='md-h2m'>## </span>`)
           .replace(/¨h3´/g, `<span class='md-h3m'>### </span>`)
           .replace(/¨h4´/g, `<span class='md-h4m'>#### </span>`)
           .replace(/¨h5´/g, `<span class='md-h5m'>##### </span>`)
           .replace(/¨h6´/g, `<span class='md-h6m'>###### </span>`)
    },
  
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
      func1: mds => mds.replace(/([^\\]|^)`((([^`\n]|\\`)+([^\\`]|\\`))|[^\s\\`])`/g, `$1<code>¨ic´$2¨ic´</code>`),
      func2: mds => mds.replace(/¨ic´/g, `<span class='md-inline-code'>\`</span>`)
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
      func1: mds => mds.replace(/\\(.)/g, `<span class='md-escaper'>¨e´$1</span>`),
      func2: mds => mds.replace(/¨e´/g, `<span class='md-escaperm'>\\</span>`)
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
      func1: (mds, _, storage) => {
        return mds.replace(/^([\s]*\*[\s]*\*[\s]*\*[\s\*]*|[\s]*-[\s]*-[\s]*-[\s-]*)$/g, (match, p1) => {
          storage.seperator = p1;
          return `<span class='md-seperator'>¨sl´</span>`;
        });
      },
      func2: (mds, _, storage) => {
        mds = mds.replace(/¨sl´/, `<span class='md-seperatorm'>${storage.seperator}</span>`);
        return mds;
      }
    },

    list: {
      type: 'recursive',
      func: (paragraph, level, prefixes, storage, options, recursiveFunc) => {
        // If this is seperator, skip it.
        if (paragraph[0].match(/^([\s]*\*[\s]*\*[\s]*\*[\s\*]*|[\s]*-[\s]*-[\s]*-[\s-]*)$/)) return paragraph;

        // Find first line that match numbers rules, and start from it
        let matchResult;
        let listRegStr = `^([\\t\\ ]*(([\\*-\\+])|([\\d]+\\.)))\\s`;
        let matchRegStr = listRegStr + `([^\\*-\\+]|$)`;
        let listReg = new RegExp(listRegStr);
        let matchReg = new RegExp(matchRegStr);
        let startPoint = 0;
        for (; startPoint < paragraph.length; startPoint++) {
          let line = paragraph[startPoint];
          matchResult = line.match(matchReg);
          if (matchResult) break;
        }
        
        // If no, return directly
        if (!matchResult) return paragraph, false;

        // Find lines that match list rules
        let buffers = [];  // Used to run the recursive parsing
        let indexes = [];  // Used to remember the index mapping from buffers to paragraph
        let markers = [];  // Used to remember the prefix of each line
        let bufferStyle;

        // Run recursion on the bufferred lines
        let processBuffers = () => {
          let modified; // Whether the content is modified in next recursion

          // Add concatenate prefixes and markers
          for (let i = 0; i < markers.length; i++) {
            if (prefixes[indexes[i]] != null) {
              markers[i] = prefixes[indexes[i]] + markers[i];
            }
          }

          // Recursively call
          buffers, modified = recursiveFunc([buffers], level + 1, markers);

          // Put null back to prefixes so that upper layer can read it
          for (let i = 0; i < markers.length; i++) {
            prefixes[indexes[i]] = markers[i];
          }

          // Start to append style to this line. Only the first line is list style
          if (bufferStyle == 'ul') {
            buffers[0] = `<div class='md-ulist md-indent-${level}'><span class='md-ulist-dot'></span><span class='md-blockm'>${markers[0]}</span>${buffers[0]}</div>`;
            prefixes[indexes[0]] = null;
          } else {
            buffers[0] = `<div class='md-olist md-indent-${level}'><span class='md-olist-number' olist-number='${markers[0].replace(/^.*[^\d](\d+\.)\s*$/, `$1`)}'></span><span class='md-blockm'>${markers[0]}</span>${buffers[0]}</div>`;
            prefixes[indexes[0]] = null;
          }

          // Append style to normal text
          if (!modified) {
            for (let i = 1; i < buffers.length; i++) {
              if (buffers[i] === '') {
                buffers[i] = `<div class='md-ulist md-indent-${level}'></div>`;
              } else {
                buffers[i] = `<div class='md-ulist md-indent-${level}'><span class='md-blockm'>${markers[i]}</span>${buffers[i]}</div>`;
                prefixes[indexes[i]] = null;
              }
            }
          }

          // Put processed buffers back to paragraph
          for (let i in buffers) {
            paragraph[indexes[i]] = buffers[i];
          }

          // Reset buffers, indexes, and markers
          buffers = [];
          indexes = [];
          markers = [];
        }

        // Parse the paragraph
        for (let i = startPoint; i < paragraph.length; i++) {
          let line = paragraph[i];
          let marker = '';

          // Whether match list rule
          let lookLikeMatch = line.match(matchReg);
          let validIndent;
          if (lookLikeMatch) {
            // Check if the number of spaces before first symbol is valid
            let spaces = line.replace(/^([\t\ ]*)([\*\+-]|\d+\.).*$/, '$1');
            validIndent = options.useTab ? spaces.length < level : 
                                           spaces.length < level * options.tabSize;
          }

          if (lookLikeMatch && validIndent) { // MATCH!!
            // This line is the begining of a list
            // If buffer is not empty, then process it first
            if (buffers.length > 0) processBuffers();

            // Check the type of this list
            let firstSymbol = line.replace(/^[\t\ ]*([\*\+-]).*$/, '$1');
            if (firstSymbol.match(/[\*\+-]/)) {
              bufferStyle = 'ul';
            } else {
              bufferStyle = 'ol';
            }

            // Extract symbol into markers
            if (bufferStyle == 'ul') {
              marker = line.replace(/^([\t\ ]*[\*\+-].)(.*)$/, `$1`);
              line = line.replace(/^([\t\ ]*[\*\+-].)(.*)$/, `$2`);
            } else {
              marker = line.replace(/^([\t\ ]*([\d]+\.).)(.*)$/, `$1`);
              line = line.replace(/^([\t\ ]*([\d]+\.).)(.*)$/, `$3`);
            }
          } else {
            marker = line.replace(/^([\s]*)(.+)$/, `$1`);
            line = line.replace(/^([\s]*)(.+)$/, `$2`);
          }

          // This line is normal text
          buffers.push(line);
          indexes.push(i);
          markers.push(marker);
        }

        if (buffers) processBuffers();

        return paragraph, true;
      }
    },

    quote: {
      type: 'recursive',
      func: (paragraph, level, prefixes, storage, options, recursiveFunc) => {
        let matchReg = new RegExp(/^\s*>[>\s]*[^>\s]/);

        // Find first quote symbol
        let matchResult;
        let buffers = [];        // Used to run the recursive parsing
        let indexes = [];        // Used to remember the index mapping from buffers to paragraph
        let markers = [];        // Used to remember the prefix of each line
        let startPoint = 0;
        for (; startPoint < paragraph.length; startPoint++) {
          let line = paragraph[startPoint];
          matchResult = line.match(matchReg);
          if (matchResult) break;
        }

        if (!matchResult) return paragraph;

        // Start from the first quote symbol
        let processBuffers = () => {
          let modified;

          // Put prefixes into markers
          if (prefixes.length > 0) {
            for (let i = 0; i < markers.length; i++) {
              if (prefixes[indexes[i]] != null) {
                markers[i] = prefixes[indexes[i]] + markers[i];
              }
            }
          }

          // Recursively call
          buffers, modified = recursiveFunc([buffers], 1, markers);

          // Put null back to prefixes so that upper layer can read it
          for (let i = 0; i < markers.length; i++) {
            prefixes[indexes[i]] = markers[i];
          }

          // Add markers back
          for (let i = 0; i < buffers.length; i++) {
            if (markers[i] != null) {
              buffers[i] = `<span class='md-blockm'>${markers[i]}</span>` + buffers[i];
              prefixes[indexes[i]] = null;
            }
          }

          // Put buffers back to paragraph
          for (let i = 0; i < buffers.length; i++) {
            paragraph[indexes[i]] = buffers[i];
          }

          // Reset buffers, indexes, and markers
          buffers = [];
          indexes = [];
          markers = [];
        }

        // Keep scanning until a empty line or an indent
        let numEmpty = 0;
        for (let i = startPoint; i < paragraph.length; i++) {
          let line = paragraph[i];

          // check whether line is empty. If not, add it into buffers.
          if (line.match(/^\s*>/)) {              // start with `>`
            // remove first marker from line.
            let marker = line.match(/^\s*>\s*/)[0];
            line = line.split(marker);

            // If line is splited into more than 2 parts, add the marker back.
            if (line.length > 2) {
              for (let i = 2; i < line.length; i++) line[1] += marker + line[i];
            }

            if (line[1].match(/^\s*$/)) {
              processBuffers();
            }

            buffers.push(line[1]);
            indexes.push(i);
            markers.push(marker);
          } else if (line.match(/^\s*[^\s>]+/)) { // start without `>`
            buffers.push(line);
            indexes.push(i);
            markers.push('');
          }
        }

        if (buffers) processBuffers();

        // Add </div> to last line
        paragraph[startPoint] = `<div class='md-quote'>` + paragraph[startPoint];
        paragraph[paragraph.length - 1] += '</div>';

        return paragraph;
      }
    },

    checkBox: {
      type: 'recursive',
      func: (paragraph, level, prefixes, storage, options, recursiveFunc) => {

      }
    },

    code: {
      type: 'recursive',
      func: (paragraph, level, prefixes, storage, options, recursiveFunc) => {

      }
    },
  }
}
