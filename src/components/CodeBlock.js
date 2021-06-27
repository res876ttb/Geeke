/*************************************************
 * @file CodeBlock.js
 * @description Write codes in Geeke!
 *************************************************/

/*************************************************
 * React Components
 *************************************************/
import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button,
  Popover,
} from '@material-ui/core';
import Select from 'react-select';

import AceEditor from "react-ace";
import "ace-builds/webpack-resolver";

// TODO: Are there any better method to import these stuff...?
// Import ace mode
import "ace-builds/src-min-noconflict/mode-abap";
import "ace-builds/src-min-noconflict/mode-assembly_x86";
import "ace-builds/src-min-noconflict/mode-autohotkey";
import "ace-builds/src-min-noconflict/mode-batchfile";
import "ace-builds/src-min-noconflict/mode-c_cpp";
import "ace-builds/src-min-noconflict/mode-clojure";
import "ace-builds/src-min-noconflict/mode-coffee";
import "ace-builds/src-min-noconflict/mode-csharp";
import "ace-builds/src-min-noconflict/mode-css";
import "ace-builds/src-min-noconflict/mode-dart";
import "ace-builds/src-min-noconflict/mode-diff";
import "ace-builds/src-min-noconflict/mode-dockerfile";
import "ace-builds/src-min-noconflict/mode-elixir";
import "ace-builds/src-min-noconflict/mode-elm";
import "ace-builds/src-min-noconflict/mode-erlang";
import "ace-builds/src-min-noconflict/mode-fortran";
import "ace-builds/src-min-noconflict/mode-fsharp";
import "ace-builds/src-min-noconflict/mode-gherkin";
import "ace-builds/src-min-noconflict/mode-glsl";
import "ace-builds/src-min-noconflict/mode-golang";
import "ace-builds/src-min-noconflict/mode-graphqlschema";
import "ace-builds/src-min-noconflict/mode-groovy";
import "ace-builds/src-min-noconflict/mode-haskell";
import "ace-builds/src-min-noconflict/mode-html";
import "ace-builds/src-min-noconflict/mode-java";
import "ace-builds/src-min-noconflict/mode-javascript";
import "ace-builds/src-min-noconflict/mode-json";
import "ace-builds/src-min-noconflict/mode-kotlin";
import "ace-builds/src-min-noconflict/mode-latex";
import "ace-builds/src-min-noconflict/mode-less";
import "ace-builds/src-min-noconflict/mode-lisp";
import "ace-builds/src-min-noconflict/mode-livescript";
import "ace-builds/src-min-noconflict/mode-lua";
import "ace-builds/src-min-noconflict/mode-makefile";
import "ace-builds/src-min-noconflict/mode-markdown";
import "ace-builds/src-min-noconflict/mode-matlab";
import "ace-builds/src-min-noconflict/mode-nix";
import "ace-builds/src-min-noconflict/mode-objectivec";
import "ace-builds/src-min-noconflict/mode-ocaml";
import "ace-builds/src-min-noconflict/mode-pascal";
import "ace-builds/src-min-noconflict/mode-perl";
import "ace-builds/src-min-noconflict/mode-php";
import "ace-builds/src-min-noconflict/mode-plain_text";
import "ace-builds/src-min-noconflict/mode-powershell";
import "ace-builds/src-min-noconflict/mode-prolog";
import "ace-builds/src-min-noconflict/mode-python";
import "ace-builds/src-min-noconflict/mode-r";
import "ace-builds/src-min-noconflict/mode-ruby";
import "ace-builds/src-min-noconflict/mode-rust";
import "ace-builds/src-min-noconflict/mode-sass";
import "ace-builds/src-min-noconflict/mode-scala";
import "ace-builds/src-min-noconflict/mode-scheme";
import "ace-builds/src-min-noconflict/mode-scss";
import "ace-builds/src-min-noconflict/mode-sh";
import "ace-builds/src-min-noconflict/mode-sql";
import "ace-builds/src-min-noconflict/mode-swift";
import "ace-builds/src-min-noconflict/mode-tcl";
import "ace-builds/src-min-noconflict/mode-typescript";
import "ace-builds/src-min-noconflict/mode-verilog";
import "ace-builds/src-min-noconflict/mode-vhdl";
import "ace-builds/src-min-noconflict/mode-xml";
import "ace-builds/src-min-noconflict/mode-yaml";

// Import ace theme
import "ace-builds/src-min-noconflict/theme-ambiance";
import "ace-builds/src-min-noconflict/theme-merbivore";
import "ace-builds/src-min-noconflict/theme-chaos";
import "ace-builds/src-min-noconflict/theme-merbivore_soft";
import "ace-builds/src-min-noconflict/theme-chrome";
import "ace-builds/src-min-noconflict/theme-mono_industrial";
import "ace-builds/src-min-noconflict/theme-clouds";
import "ace-builds/src-min-noconflict/theme-monokai";
import "ace-builds/src-min-noconflict/theme-clouds_midnight";
import "ace-builds/src-min-noconflict/theme-nord_dark";
import "ace-builds/src-min-noconflict/theme-cobalt";
import "ace-builds/src-min-noconflict/theme-pastel_on_dark";
import "ace-builds/src-min-noconflict/theme-crimson_editor";
import "ace-builds/src-min-noconflict/theme-solarized_dark";
import "ace-builds/src-min-noconflict/theme-dawn";
import "ace-builds/src-min-noconflict/theme-solarized_light";
import "ace-builds/src-min-noconflict/theme-dracula";
import "ace-builds/src-min-noconflict/theme-sqlserver";
import "ace-builds/src-min-noconflict/theme-dreamweaver";
import "ace-builds/src-min-noconflict/theme-terminal";
import "ace-builds/src-min-noconflict/theme-eclipse";
import "ace-builds/src-min-noconflict/theme-textmate";
import "ace-builds/src-min-noconflict/theme-github";
import "ace-builds/src-min-noconflict/theme-tomorrow";
import "ace-builds/src-min-noconflict/theme-gob";
import "ace-builds/src-min-noconflict/theme-tomorrow_night";
import "ace-builds/src-min-noconflict/theme-gruvbox";
import "ace-builds/src-min-noconflict/theme-tomorrow_night_blue";
import "ace-builds/src-min-noconflict/theme-idle_fingers";
import "ace-builds/src-min-noconflict/theme-tomorrow_night_bright";
import "ace-builds/src-min-noconflict/theme-iplastic";
import "ace-builds/src-min-noconflict/theme-tomorrow_night_eighties";
import "ace-builds/src-min-noconflict/theme-katzenmilch";
import "ace-builds/src-min-noconflict/theme-twilight";
import "ace-builds/src-min-noconflict/theme-kr_theme";
import "ace-builds/src-min-noconflict/theme-vibrant_ink";
import "ace-builds/src-min-noconflict/theme-kuroir";
import "ace-builds/src-min-noconflict/theme-xcode";

// Import ace plugins
import "ace-builds/src-min-noconflict/ext-language_tools";

/*************************************************
 * Utils & States
 *************************************************/
import {
  onMouseOver as _onMouseOver,
  onMouseLeave as _onMouseLeave,
} from '../utils/DraggableBlockUtils';
import {
  GeekeMap,
  updateBlockData,
} from '../utils/Misc';
import { isShowBlock } from '../utils/NumberListUtils';
import { handleAceEditor } from '../utils/KeyboardUtils';

/*************************************************
 * Import Components
 *************************************************/
import BlockDargButton from './BlcokDragButton';

/*************************************************
 * Constant
 *************************************************/
import {
  blockDataKeys,
  constAceEditorAction,
  constMoveDirection,
  editorLeftPadding,
  indentWidth,
  languageOptions,
  languageReverseMap,
  remToPx,
} from '../constant';
import { EditorState } from 'draft-js';
import { pmsc } from '../states/editorMisc';

/*************************************************
 * Main components
 *************************************************/
const CodeBlock = props => {
  // Props
  const blockData = props.block.getData();
  const blockKey = props.block.key;
  const contentState = props.contentState;
  const getFocusBlockKey = props.blockProps.getFocusBlockKey;
  const handleBlockDargStart = props.blockProps.handleBlockDargStart;
  const moveCursor = props.blockProps.setMoveCursorArgs;
  const pageUuid = props.blockProps.pageUuid;
  const readOnly = props.blockProps.readOnly;
  const setEditingCode = props.blockProps.setEditingCode;
  const setFocusBlockKey = props.blockProps.setFocusBlockKey;
  const getMoveDirection = props.blockProps.getMoveDirection;
  const setEditorState = props.blockProps.setEditorState;
  const getEditorState = props.blockProps.getEditorState;
  const setEditingMenu = props.blockProps.setEditingMenu;

  // Reducers
  const dispatch = useDispatch();
  const aceEditor = useRef(null);

  // Check whether to show this block
  if (!isShowBlock(contentState, blockKey)) {
    return null;
  }

  // Variables
  const codeContent = blockData.has(blockDataKeys.codeContent) ? blockData.get(blockDataKeys.codeContent) : '';
  let indentLevel = 0;
  let codeLanguage = 'plain_text';

  // Functions
  const onMouseOver = e => _onMouseOver(e, dispatch, pageUuid, blockKey);
  const onMouseLeave = e => _onMouseLeave(e, dispatch, pageUuid);
  const onFocus = e => setEditingCode(true);
  const onBlur = e => setEditingCode(false);
  const focusAceEditor = () => aceEditor.current.editor.focus();
  const blurAceEditor = () => aceEditor.current.editor.blur();

  // If current block is focused, then automatically focus it.
  if (getFocusBlockKey() === blockKey) {
    setTimeout(() => { // Use timeout to delay focus operation and prevent from updating content when block is being rendered
      const moveDirection = getMoveDirection();
      if (moveDirection === constMoveDirection.up) {
        aceEditor.current.editor.navigateFileEnd();
      } else if (moveDirection === constMoveDirection.down) {
        aceEditor.current.editor.navigateFileStart();
      } else {
        console.error(`Unknown move direction: ${moveDirection}`);
      }
      focusAceEditor();       // Focus on editor
      setFocusBlockKey(null); // Unset it
    }, 1);
  } else if (getFocusBlockKey() === `${blockKey}blur`) {
    setTimeout(() => {
      blurAceEditor();
      setFocusBlockKey(null);
    }, 1);
  }

  // Calculate indent level
  if (blockData.has(blockDataKeys.indentLevel)) {
    indentLevel = blockData.get(blockDataKeys.indentLevel);
  }

  // Get code language
  if (blockData.has(blockDataKeys.codeLanguage)) {
    codeLanguage = blockData.get(blockDataKeys.codeLanguage);
  }

  // Calculate paddingLeft depends on indent level
  const paddingLeft = remToPx(indentWidth * indentLevel);

  // Function to update content
  const updateCodeContent = newValue => {
    let newBlockData = new GeekeMap(blockData);
    newBlockData.set(blockDataKeys.codeContent, newValue);
    let newContentState = updateBlockData(contentState, blockKey, newBlockData);
    let newEditorState = EditorState.push(getEditorState(), newContentState, 'insert-characters');
    setEditorState(newEditorState);
  };

  // Function to update language
  const updateCodeLanguage = language => {
    let newBlockData = new GeekeMap(blockData);
    newBlockData.set(blockDataKeys.codeLanguage, language);
    let newContentState = updateBlockData(contentState, blockKey, newBlockData);
    let newEditorState = EditorState.push(getEditorState(), newContentState, 'change-block-data');
    setEditorState(newEditorState);
  }

  // Compose aceEditor command
  const aceEditorCommands = [
    {
      name: 'moveCursorUp',
      bindKey: {win: 'up', mac: 'up'},
      exec: editor => handleAceEditor(editor, constAceEditorAction.up, {moveCursor}, blockKey)
    },
    {
      name: 'moveCursorDown',
      bindKey: {win: 'down', mac: 'down'},
      exec: editor => handleAceEditor(editor, constAceEditorAction.down, {moveCursor}, blockKey)
    },
    {
      name: 'moveCursorLeft',
      bindKey: {win: 'left', mac: 'left'},
      exec: editor => handleAceEditor(editor, constAceEditorAction.left, {moveCursor}, blockKey)
    },
    {
      name: 'moveCursorRight',
      bindKey: {win: 'right', mac: 'right'},
      exec: editor => handleAceEditor(editor, constAceEditorAction.right, {moveCursor}, blockKey)
    },
  ];

  // Compose aceEditor Props
  const aceEditorProps = {
    ref: aceEditor,
    className: 'geeke-codeEditor',
    mode: codeLanguage,
    theme: 'github',
    fontSize: '1rem',
    onFocus: onFocus,
    onBlur: onBlur,
    readOnly: readOnly,
    placeholder: 'Coding here...',
    minLines: 1,
    maxLines: Infinity,
    width: 'auto',
    highlightActiveLine: false,
    name: `${blockKey}-aceEditor`,
    value: codeContent,
    onChange: updateCodeContent,
    setOptions: {
      enableBasicAutocompletion: true,
      enableLiveAutocompletion: true,
      enableSnippets: true
    },
    commands: aceEditorCommands,
  };

  return (
    <div
      className='geeke-blockWrapper'
      style={{paddingLeft: `${paddingLeft + remToPx(editorLeftPadding)}px`, margin: '1.6rem 0rem'}}
      geeke='true'

      onMouseOver={onMouseOver}
      onMouseLeave={onMouseLeave}
    >
      <BlockDargButton
        blockKey={blockKey}
        pageUuid={pageUuid}
        readOnly={readOnly}
        handleBlockDargStart={handleBlockDargStart}
        paddingLeft={paddingLeft}
        topOffset={-0.1} // TODO: Need to be tuned...
      />

      <CodeBlockLanguageButton
        pageUuid={pageUuid}
        blockKey={blockKey}
        setEditingMenu={setEditingMenu}
        focusAceEditor={focusAceEditor}
        codeLanguage={codeLanguage}
        updateCodeLanguage={updateCodeLanguage}
      />

      <div
        onClick={focusAceEditor} // Need to force focus on mouse click because in some situation, click on the last line cannot focus the AceEditor...
        contentEditable={false}  // Make this block not contenteditable to prevent from modify some DOM by accident...
      >
        <AceEditor {...aceEditorProps} />
      </div>

    </div>
  )
}

const CodeBlockLanguageButton = props => {
  // Props
  const pageUuid = props.pageUuid;
  const blockKey = props.blockKey;
  const setEditingMenu = props.setEditingMenu;
  const updateCodeLanguage = props.updateCodeLanguage;
  const focusAceEditor = props.focusAceEditor;
  const codeLanguage = props.codeLanguage;
  const languageName = languageReverseMap.has(codeLanguage) ? languageReverseMap.get(codeLanguage) : 'PlainText';

  // Reducers
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const editorMiscPages = useSelector(state => state.editorMisc.pages);
  const mouseOverBlockKey = editorMiscPages.get(pageUuid).get(pmsc.hover);

  // handleClickMenu
  const handleClickMenu = e => {
    setAnchorEl(e.currentTarget);
    setEditingMenu(true);
  };

  // handleCloseMenu
  const handleCloseMenu = () => {
    setAnchorEl(null);
    setEditingMenu(false);
    setTimeout(() => {
      focusAceEditor();
    }, 1);
  };

  // onChange
  const onChange = v => {
    if (!v) return;
    handleCloseMenu();
    updateCodeLanguage(v.value);
  };

  // Styles...
  const languageStyle = {
    menu: (provided, state) => ({
      ...provided,
      boxShadow: 'unset',
      fontSize: '1rem',
    }),
    control: (provided, state) => ({
      ...provided,
      margin: '0.6rem 0.6rem 0rem',
      height: '1.8rem',
      minHeight: '1.8rem',
    }),
    indicatorsContainer: (provided, state) => ({
      display: 'none',
    }),
    valueContainer: (provided, state) => ({
      ...provided,
      top: '-0.15rem',
      left: '0.1rem',
    }),
    option: (provided, state) => ({
      ...provided,
      padding: '6px 12px',
      fontSize: '0.9rem',
    }),
  };

  return (
    <div className='geeke-codeEditor-dropdownWrapper' contentEditable={false}>
      <div className={'geeke-codeEditor-buttonWrapper' + (mouseOverBlockKey === blockKey ? ' geeke-codeEditor-button-active' : '')}>
        <Button
          className='geeke-codeEditor-button' variant="outlined" size="small"
          onClick={handleClickMenu}
        >
          {languageName} ▾
        </Button>
      </div>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleCloseMenu}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <div className='geeke-codeEditor-languageListWrapper'>
          <Select
            options={languageOptions}
            autoFocus={true}
            menuIsOpen={true}
            maxMenuHeight={255}
            styles={languageStyle}
            placeholder='Language'
            onChange={onChange}
          />
        </div>
      </Popover>
    </div>
  )
}

export default CodeBlock;
