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

    // test: https://regex101.com/r/iXvwMu/1
    highlight: {
      type: 'onepass',
      func1: (mds, _, storage) => {
        return mds.replace(/(^|[^\\])==([^\n]*[^\\\n])==/g,  `<span class="md-highlight">¨hl$2¨hl</span>`);
      },
      func2: (mds, _, storage) => {
        return mds.replace(/¨hl/g, `<span class='md-highlightm'>==</span>`);
      }
    }
  }
}
