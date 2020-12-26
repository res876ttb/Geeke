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

    // Bind this to functions
    this.getCounter = this.getCounter.bind(this);
    this.recursiveFunc = this.recursiveFunc.bind(this);

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
    let prefixes = {}; // Stores regex for each type
    for (let k in this.plugins) {
      let plugin = this.plugins[k];
      if (plugin.type == 'onepass') {
        onepass.push(plugin);
      } else if (plugin.type == 'recursive') {
        recursive.push(plugin);
        if (plugin.reg) {
          prefixes[k] = plugin.symbolPrefix;
        } 
      } else {
        console.error('Unknown plugin type:', plugin.type, k);
      }
    }

    this.plugins.onepass = onepass;
    this.plugins.recursive = recursive;
    this.plugins.prefixes = prefixes;
  }

  // Analyze paragraphs
  analyzeParagraph(mds) {
    mds = mds.replace(/\n/g, '¬');
    return mds.split('¬');
  }

  // Assemble paragraphs
  createInnerHTML(mds) {
    // The assmble result
    let doc = '';
    
    // Merge each lines
    for (let i = 0; i < mds.length; i++) doc += mds[i] + '¬';
    doc = doc.replace(/¬$/, ''); // Remove new line symbol at the last line

    // Analyze paragraph: replace `¬¬` into `¶`
    doc = doc.replace(/¬¬/g, '¶');
    mds = doc.split('¶');

    // Add paragraph symbol
    for (let i = 0; i < mds.length; i++) {
      mds[i] = `<div class='md-para'>${mds[i]}<span class=\"hide\">¶</span></div>`;
    }

    // Merge paragraphs
    doc = '';
    for (let i = 0; i < mds.length; i++) doc += mds[i];

    // Hide `¬`
    doc = doc.replace(/¬/g, '<span class="hide">¬</span><br>');

    return doc;
  }

  // Go through onepass plugins
  // phase must be 1 or 2
  // 1 return value: parsed result.
  onepassFunc(mds, phase) {
    // For each line...
    for (let i in mds) {
      let line = mds[i];

      // Go through func1 of `onepass` plugins
      if (phase == 1) {
        for (let k in this.plugins.onepass) {
          let plugin = this.plugins.onepass[k];
          line = plugin.func1(line, this.getCounter, this.storage, this.options);
        }
      }
  
      // Go through func2 of `onepass` plugins
      if (phase == 2) {
        for (let k in this.plugins.onepass) {
          let plugin = this.plugins.onepass[k];
          line = plugin.func2(line, this.getCounter, this.storage, this.options);
        }
      }

      mds[i] = line;
    }

    return mds;
  }

  // Go through recursive plugins
  // Plugins will process a paragraph at a time
  // 2 return values: parsed result, and whether the content match to the rules in the plugins
  recursiveFunc(mds, start, end, prefixes, phase, depth=0) {
    for (let i in this.plugins.recursive) {
      let plugin = this.plugins.recursive[i];
      if (phase == 1) mds = plugin.func1(mds, this.getCounter, this.storage, this.options, prefixes, this.recursiveFunc.bind(this), start, end);
      if (phase == 2) mds = plugin.func2(mds, this.getCounter, this.storage, this.options, prefixes, this.recursiveFunc.bind(this), start, end, this.plugins.prefixes, depth);
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
    this.storage = [null];
  }

  parse(mds, level=0) {
    let _, prefixes = [];

    // Reset counter and storage for parsing
    this.resetCounter();
    this.resetStorage();

    // Analyze paragraph
    mds = this.analyzeParagraph(mds);

    for (let i in mds) prefixes.push('');

    // Parse markdown:
    // 1. One pass parsing phase 1
    // 2. Parsing paragraph
    // 3. One pass parsing phase 2
    mds = this.onepassFunc(mds, 1);
    mds = this.recursiveFunc(mds, 0, mds.length, prefixes, 1);
    mds = this.recursiveFunc(mds, 0, mds.length, prefixes, 2);
    mds = this.onepassFunc(mds, 2);

    // Assemble paragraphs
    mds = this.createInnerHTML(mds);

    return mds;
  }
}
