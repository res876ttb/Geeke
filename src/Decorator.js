import {plugins} from './DecoratorPlugins.js';

export class Decorator {
  constructor(options) {
    // Get user options
    this.options = options;

    // Load default plugins and user-defined plugins
    this.loadPlugin();

    // Reset counter and storage for parsing
    this.resetCounter();
    this.resetStorage();

    console.log('All plugins loaded');
  }

  // Load plugins int decorator
  // 3 types of plugins: onepass, recursive, entire
  // onepass: type: 'onepass', func1, func2
  // recursive: type: 'recursive', func
  // entire: type: 'entire', func
  loadPlugin() {
    // Plugins list
    this.plugins = [];

    // Load default plugins
    for (let i in this.options.defaultPlugins) {
      this.plugins.push(plugins[this.options.defaultPlugins[i]]);
    }

    // Load user-defined plugins
    for (let i in this.options.plugins) {
      this.plugins.push(this.options.plugins[i]);
    }

    // Sort plugins
    let onepass = [];
    let recursive = [];
    for (let k in this.plugins) {
      let plugin = this.plugins[k];
      if (plugin.type == 'onepass') onepass.push(plugin);
      else if (plugin.type == 'recursive') recursive.push(plugin);
      else (console.error('Unknown plugin type:', plugin.type, k));
    }

    this.plugins.onepass = onepass;
    this.plugins.recursive = recursive;
  }

  // Analyze paragraphs
  analyzeParagraph(mds) {
    // 1. parse original \n to ¶ and ¬
    // 2. convert 2 new line into 1 paragraph
    // 3. split new line
    mds = mds.replace(/\n\n/g, '¶');
    mds = mds.replace(/\n/g, '¬');
    mds = mds.replace(/¬¬/g, '¶');
    mds = mds.split('¶');
    for (let i = 0; i < mds.length; i++) {
      mds[i] = mds[i].split('¬');
    }

    return mds;
  }

  // Assemble paragraphs
  createInnerHTML(mds) {
    // The assemble result
    let doc = ''

    // Iterate through each paragraph
    for (let i = 0; i < mds.length; i++) {
      let paragraph = '';

      // Iterate through each line in the paragraph
      for (let j = 0; j < mds[i].length; j++) {
        // If this line is empty, set it to `<br/>`
        if (mds[i][j] == '') {
          mds[i][j] = '<br>';
        }

        // Add newline symbol to each line
        paragraph += mds[i][j] + '†'; // use † to represent'<span class="hide">¬</span>'
      }

      // Remove the newline symbol of the last line, then replace each line with <div>
      paragraph = paragraph.replace(/†$/, '').replace(/\<\/div\>†/g, '†</div>').replace(/†/g, '<span class="hide">¬</span><br>');

      // Add new paragraph symbol to each paragraph
      doc += `<div class='md-para'>${paragraph}<span class=\"hide\">¶</span></div>`;
    }

    // Remove last new paragraph symbol and
    // remove redundant `<br>`
    doc = doc.replace(/\<span class=\"hide\"\>¶\<\/span\>\<\/div\>$/, '</div>')
             .replace(/<br><\/div>/g, `</div>`);

    return doc;
  }

  // Go through onepass plugins
  // 1 return value: parsed result.
  onepassFunc(mds) {
    // For each paragraph...
    for (let i in mds) {
      let paragraph = mds[i];

      // For each line in a paragraph...
      for (let j in paragraph) {
        let line = paragraph[j];
        // Go through func1 of `onepass` plugins
        for (let k in this.plugins.onepass) {
          let plugin = this.plugins.onepass[k];
          line = plugin.func1(line, this.getCounter, this.storage, this.options);
        }
    
        // Go through func2 of `onepass` plugins
        for (let k in this.plugins.onepass) {
          let plugin = this.plugins.onepass[k];
          line = plugin.func2(line, this.getCounter, this.storage, this.options);
        }

        paragraph[j] = line;
      }

      mds[i] = paragraph;
    }

    return mds;
  }

  // Go through recursive plugins
  // Plugins will process a paragraph at a time
  // 2 return values: parsed result, and whether the content match to the rules in the plugins
  recursiveFunc(mds, prefixes, range) {
    // Record whether content is modified
    // let modified = false;

    // For each paragraph...
    for (let i in mds) {
      let paragraph = mds[i];

      for (let j in this.plugins.recursive) {
        let plugin = this.plugins.recursive[j];
        // let m;
        // mds[i], m = plugin.func(paragraph, prefixes, range, this.storage, this.options, this.recursiveFunc.bind(this));
        // modified |= m;
        mds[i] = plugin.func(paragraph, prefixes, range, this.storage, this.options, this.recursiveFunc.bind(this));
      }
    }

    // return mds, modified;
    return mds;
  }

  getCounter() {
    this.counter += 1;
    return this.counter;
  }

  resetCounter() {
    this.counter = 0;
  }
  
  resetStorage() {
    this.storage = {};
  }

  parse(mds, level=0) {
    let _;

    // Reset counter and storage for parsing
    this.resetCounter();
    this.resetStorage();

    // Analyze paragraph
    mds = this.analyzeParagraph(mds);

    // Parse markdown:
    // 1. One pass parsing
    // 2. Recursively parsing
    mds = this.onepassFunc(mds);
    // mds, _ = this.recursiveFunc(mds);

    // Assemble paragraphs
    mds = this.createInnerHTML(mds);

    return mds;
  }
}
