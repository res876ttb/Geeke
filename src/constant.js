/**
 * @file constant.js
 * @description All global constant will be located in this file for configuration convenience.
 */

const getRem = () => {
  let getRemEle = document.getElementById('geeke-getRem');
  if (getRemEle) return parseFloat(getComputedStyle(getRemEle).fontSize);
  else return parseFloat(getComputedStyle(document.body).fontSize);
}
export const oneRem = getRem();
export const remToPx = rem => rem * oneRem; // Unit: px

export const indentWidth = 1.6; // Unit: rem
export const draggableLeftPadding = 2; // Unit: rem
export const editorLeftPadding = 3; // Unit: rem
export const editorTopPadding = 0.3; // Unit: rem
export const editorDraggableButtonLeftPadding = 1.6; // Unit: rem
export const editorDraggableButtonWidth = 1.6; // Unit: rem

export const dragMaskHeight = 0.25; // Unit: rem
export const dragMaskIndentInterval = 0.15; // Unit: rem

export const blockDataKeys = {
  indentLevel: 'indentLevel',
  numberListOrder: 'numberListOrder',
  checkListCheck: 'checkListCheck',
  toggleListToggle: 'toggleListToggle',
  parentKey: 'parentKey',
  headingType: 'headingType',
  codeContent: 'codeContent',
  codeLanguage: 'codeLanguage',
  codeWrapping: 'codeWrapping',
  codeTheme: 'codeTheme',
  codeLineNumber: 'codeLineNumber',
};

export const constBlockType = {
  default: 'unstyled',
  bulletList: 'bullet-list',
  numberList: 'number-list',
  checkList: 'check-list',
  toggleList: 'toggle-list',
  quote: 'quote',
  heading: 'heading',
  code: 'code',
};

export const headingType = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
};

export const constAceEditorAction = {
  left: 0,
  up: 1,
  down: 2,
  right: 3,
  backspace: 4,
};

export const constMoveDirection = {
  up: 0,
  down: 1,
};

export const languageMap = {
  'abap': 'abap',
  'assembly': 'assembly_x86',
  'autohotkey': 'autohotkey',
  'batch': 'batchfile',
  'c': 'c_cpp',
  'cpp': 'c_cpp',
  'cc': 'c_cpp',
  'clojure': 'clojure',
  'coffee': 'coffee',
  'c++': 'c_cpp',
  'c#': 'csharp',
  'csharp': 'csharp',
  'css': 'css',
  'dart': 'dart',
  'diff': 'diff',
  'docker': 'dockerfile',
  'elixir': 'elixir',
  'elm': 'elm',
  'erlang': 'erlang',
  'fortran': 'fortran',
  'f#': 'fsharp',
  'fsharp': 'fsharp',
  'gherkin': 'gherkin',
  'glsl': 'glsl',
  'go': 'golang',
  'golang': 'golang',
  'graphql': 'graphqlschema',
  'graphqlschema': 'graphqlschema',
  'groovy': 'groovy',
  'haskell': 'haskell',
  'html': 'html',
  'java': 'java',
  'javascript': 'javascript',
  'json': 'json',
  'kotlin': 'kotlin',
  'latex': 'latex',
  'less': 'less',
  'lisp': 'lisp',
  'livescript': 'livescript',
  'lua': 'lua',
  'makefile': 'makefile',
  'make': 'makefile',
  'markdown': 'markdown',
  'matlab': 'matlab',
  'nix': 'nix',
  'objectivec': 'objectivec',
  'objective-c': 'objectivec',
  'ocaml': 'ocaml',
  'pascal': 'pascal',
  'perl': 'perl',
  'php': 'php',
  'txt': 'plain_text',
  'text': 'plain_text',
  'plaintext': 'plain_text',
  'plain_text': 'plain_text',
  'powershell': 'powershell',
  'prolog': 'prolog',
  'python': 'python',
  'r': 'r',
  'ruby': 'ruby',
  'rust': 'rust',
  'sass': 'sass',
  'scala': 'scala',
  'scheme': 'scheme',
  'scss': 'scss',
  'sh': 'sh',
  'shell': 'sh',
  'sql': 'sql',
  'swift': 'swift',
  'tcl': 'tcl',
  'typescript': 'typescript',
  'verilog': 'verilog',
  'vhdl': 'vhdl',
  'xml': 'xml',
  'yaml': 'yaml',
  'yml': 'yaml',
};

export const languageList = [
  'ABAP',
  'Assembly',
  'AutoHotKey',
  'Batch',
  'C',
  'Clojure',
  'Coffee',
  'C++',
  'C#',
  'CSS',
  'Dart',
  'Diff',
  'Docker',
  'Elixir',
  'Elm',
  'Erlang',
  'Fortran',
  'F#',
  'Gherkin',
  'GLSL',
  'Go',
  'GraphQL',
  'Groovy',
  'Haskell',
  'HTML',
  'Java',
  'JavaScript',
  'JSON',
  'Kotlin',
  'LaTeX',
  'Less',
  'Lisp',
  'LiveScript',
  'Lua',
  'Makefile',
  'Markdown',
  'MATLAB',
  'Nix',
  'Objective-C',
  'OCaml',
  'Pascal',
  'Perl',
  'PHP',
  'PlainText',
  'Powershell',
  'Prolog',
  'Python',
  'R',
  'Ruby',
  'Rust',
  'Sass',
  'Scala',
  'Scheme',
  'Scss',
  'Shell',
  'SQL',
  'Swift',
  'TCL',
  'TypeScript',
  'Verilog',
  'VHDL',
  'XML',
  'YAML',
];

export const codeBlockThemeList = [
  'ambiance',
  'chaos',
  'chrome',
  'clouds_midnight',
  'clouds',
  'cobalt',
  'crimson_editor',
  'dawn',
  'dracula',
  'dreamweaver',
  'eclipse',
  'github',
  'gob',
  'gruvbox',
  'idle_fingers',
  'iplastic',
  'katzenmilch',
  'kr_theme',
  'kuroir',
  'merbivore_soft',
  'merbivore',
  'mono_industrial',
  'monokai',
  'nord_dark',
  'pastel_on_dark',
  'solarized_dark',
  'solarized_light',
  'sqlserver',
  'terminal',
  'textmate',
  'tomorrow_night_blue',
  'tomorrow_night_bright',
  'tomorrow_night_eighties',
  'tomorrow_night',
  'tomorrow',
  'twilight',
  'vibrant_ink',
  'xcode',
];

export const codeBlockThemeMap = new Map([
  ['Ambiance', 'ambiance'],
  ['Chaos', 'chaos'],
  ['Chrome', 'chrome'],
  ['Clouds Midnight', 'clouds_midnight'],
  ['Clouds', 'clouds'],
  ['Cobalt', 'cobalt'],
  ['Crimson Editor', 'crimson_editor'],
  ['Dawn', 'dawn'],
  ['Dracula', 'dracula'],
  ['Dreamweaver', 'dreamweaver'],
  ['Eclipse', 'eclipse'],
  ['GitHub', 'github'],
  ['Gob', 'gob'],
  ['Gruvbox', 'gruvbox'],
  ['Idle Fingers', 'idle_fingers'],
  ['Iplastic', 'iplastic'],
  ['Katzen-Milch', 'katzenmilch'],
  ['KR Theme', 'kr_theme'],
  ['Kuroir', 'kuroir'],
  ['Merbivore Soft', 'merbivore_soft'],
  ['Merbivore', 'merbivore'],
  ['Mono Industrial', 'mono_industrial'],
  ['Monokai', 'monokai'],
  ['Nord Dark', 'nord_dark'],
  ['Pastel on Dark', 'pastel_on_dark'],
  ['Solarized Dark', 'solarized_dark'],
  ['Solarized Light', 'solarized_light'],
  ['SQL Server', 'sqlserver'],
  ['Temrinal', 'terminal'],
  ['Textmate', 'textmate'],
  ['Tomorrow Night Blue', 'tomorrow_night_blue'],
  ['Tomorrow Night Bright', 'tomorrow_night_bright'],
  ['Tomorrow Night Eighties', 'tomorrow_night_eighties'],
  ['Tomorrow Night', 'tomorrow_night'],
  ['Tomorrow', 'tomorrow'],
  ['Twilight', 'twilight'],
  ['Vibrant Ink', 'vibrant_ink'],
  ['XCode', 'xcode'],
]);

export const languageOptions = languageList.map(v => {
  return {
    value: languageMap[v.toLowerCase()],
    label: v
  };
});

export const languageReverseMap = new Map(languageList.map(v => {
  let lv = v.toLowerCase();
  return [languageMap[lv], v];
}));

export const codeBlockThemeReverseMap = new Map(Array.from(codeBlockThemeMap.keys()).map(k => {
  let v = codeBlockThemeMap.get(k);
  return [v, k];
}));

export const themeOptions = codeBlockThemeList.map(v => {
  return {
    value: v,
    label: codeBlockThemeReverseMap.get(v),
  };
});
