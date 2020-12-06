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

    // Bind this to function getCounter
    this.getCounter = this.getCounter.bind(this);

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
    this.storage = [null];
  }

  parse(mds, level=0) {
    let _;

    // Reset counter and storage for parsing
    this.resetCounter();
    this.resetStorage();

    // Analyze paragraph
    mds = this.analyzeParagraph(mds);

    // Parse markdown:
    // 1. One pass parsing phase 1
    // 2. Parsing paragraph
    // 3. One pass parsing phase 2
    mds = this.onepassFunc(mds, 1);
    // mds, _ = this.recursiveFunc(mds);
    mds = this.onepassFunc(mds, 2);

    // Assemble paragraphs
    mds = this.createInnerHTML(mds);

    return mds;
  }
}
