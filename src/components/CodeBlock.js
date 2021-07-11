/*************************************************
 * @file CodeBlock.js
 * @description Write codes in Geeke!
 *************************************************/

/*************************************************
 * React Components
 *************************************************/
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { EditorState } from 'draft-js';
import Select from 'react-select';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import Snackbar from '@material-ui/core/Snackbar';
import {
  Button,
  ButtonGroup,
  Popover,
} from '@material-ui/core';

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
import { isShowBlock } from '../utils/NumberListUtils';
import { handleAceEditor, handleKeyCommand } from '../utils/KeyboardUtils';
import {
  onMouseOver as _onMouseOver,
  onMouseLeave as _onMouseLeave,
} from '../utils/DraggableBlockUtils';
import {
  GeekeMap,
  updateBlockData,
} from '../utils/Misc';

import { setEditorState } from '../states/editor';
import {
  pmsc,
  setEditingCode,
  setEditingMenu,
  setSpecialFocusFunc,
} from '../states/editorMisc';

/*************************************************
 * Import Components
 *************************************************/
import BlockDargButton from './BlcokDragButton';

/*************************************************
 * Constant
 *************************************************/
import {
  blockDataKeys,
  codeBlockThemeReverseMap,
  constAceEditorAction,
  constMoveDirection,
  editorLeftPadding,
  indentWidth,
  languageOptions,
  languageReverseMap,
  remToPx,
  themeOptions,
} from '../constant';
import { Alert } from '@material-ui/lab';

/*************************************************
 * Main components
 *************************************************/
const CodeBlock = props => {
  // Props
  const blockData = props.block.getData();
  const blockKey = props.block.key;
  const contentState = props.contentState;
  const selectionState = props.selection;
  const handleBlockDargStart = props.blockProps.handleBlockDargStart;
  const pageUuid = props.blockProps.pageUuid;
  const readOnly = props.blockProps.readOnly;
  const handleFocusEditor = props.blockProps.handleFocusEditor;
  const updateSelectionState = props.blockProps.updateSelectionState;
  const keyCommandDispatcher = props.blockProps.keyCommandDispatcher;
  const editorState = useSelector(state => state.editor.cachedPages.get(pageUuid).get('content'));

  // Reducers
  const dispatch = useDispatch();
  const aceEditor = useRef(null);
  const [editorKeyCommand, setEditorKeyCommand] = useState(null);

  // Register focus function
  const focusCodeBlock = moveDirection => {
    if (moveDirection === constMoveDirection.up) {
      aceEditor.current.editor.navigateFileEnd();
    } else if (moveDirection === constMoveDirection.down) {
      aceEditor.current.editor.navigateFileStart();
    } else {
      console.error(`Unknown move direction: ${moveDirection}`);
    }
    // Use timeout to prevent dispatch runs in dispatch because onFocus dispatch something
    setTimeout(() => aceEditor.current.editor.focus(), 1);
  };
  useEffect(() => setSpecialFocusFunc(dispatch, pageUuid, blockKey, focusCodeBlock), []); // eslint-disable-line

  // Focus code block if it is created by converting from other type of block
  useEffect(() => {
    if (selectionState.getFocusKey() !== blockKey) return;
    setTimeout(() => aceEditor.current.editor.focus(), 1);
  }, []); // eslint-disable-line

  // Variables
  const codeContent = blockData.has(blockDataKeys.codeContent) ? blockData.get(blockDataKeys.codeContent) : '';
  let indentLevel = 0;
  let codeLanguage = 'plain_text';
  let codeWrapping = false; // TODO: make the default value to user-specieifed.
  let codeTheme = 'github'; // TODO: make the default value to user-specieifed.

  // Functions
  const onMouseOver = e => _onMouseOver(e, dispatch, pageUuid, blockKey);
  const onMouseLeave = e => _onMouseLeave(e, dispatch, pageUuid);
  const focusAceEditor = () => aceEditor.current.editor.focus();
  const blurAceEditor = () => aceEditor.current.editor.blur();
  const onBlur = e => setEditingCode(dispatch, pageUuid, false);
  const onFocus = e => {
    setEditingCode(dispatch, pageUuid, true);
    updateSelectionState();
  };

  // Calculate indent level
  if (blockData.has(blockDataKeys.indentLevel)) {
    indentLevel = blockData.get(blockDataKeys.indentLevel);
  }

  // Get code language
  if (blockData.has(blockDataKeys.codeLanguage)) {
    codeLanguage = blockData.get(blockDataKeys.codeLanguage);
  }

  // Get wrapping status
  if (blockData.has(blockDataKeys.codeWrapping)) {
    codeWrapping = blockData.get(blockDataKeys.codeWrapping);
  }

  // Get code theme
  if (blockData.has(blockDataKeys.codeTheme)) {
    codeTheme = blockData.get(blockDataKeys.codeTheme);
  }

  // Calculate paddingLeft depends on indent level
  const paddingLeft = remToPx(indentWidth * indentLevel);

  // Function to update blockData of block data
  const updateCodeBlockData = (blockDataKey, changeType, newValue) => {
    let newBlockData = new GeekeMap(blockData);
    newBlockData.set(blockDataKey, newValue);
    let newContentState = updateBlockData(contentState, blockKey, newBlockData);
    let newEditorState = EditorState.push(editorState, newContentState, changeType);
    setEditorState(dispatch, pageUuid, newEditorState);
  };

  // Function to update content, language, theme, and wrapping status
  const updateCodeContent = newValue => updateCodeBlockData(blockDataKeys.codeContent, 'insert-characters', newValue);
  const updateCodeLanguage = language => updateCodeBlockData(blockDataKeys.codeLanguage, 'change-block-data', language);
  const updateCodeTheme = theme => updateCodeBlockData(blockDataKeys.codeTheme, 'change-block-data', theme);
  const updateCodeWrapping = wrapping => updateCodeBlockData(blockDataKeys.codeWrapping, 'change-block-data', wrapping);

  // Handle moveCursor
  // Because moveCursor cannot be updated to Ace Editor when editorState is updated (i.e. using useCallback),
  // we have to use useEffect to get the latest editorState when editorKeyCommand is updated.
  const moveCursor = editorKeyCommand => setEditorKeyCommand(editorKeyCommand);
  useEffect(() => {
    if (!editorKeyCommand) return;
    setEditorKeyCommand(null);
    handleKeyCommand(editorState, editorKeyCommand, keyCommandDispatcher, blockKey, {blurAceEditor, handleFocusEditor});
  }, [editorKeyCommand, editorState]); // eslint-disable-line

  // Compose aceEditor command
  const aceEditorCommands = [
    {
      name: 'moveCursorUp',
      bindKey: {win: 'up', mac: 'up'},
      exec: editor => handleAceEditor(editor, constAceEditorAction.up, {moveCursor})
    },
    {
      name: 'moveCursorDown',
      bindKey: {win: 'down', mac: 'down'},
      exec: editor => handleAceEditor(editor, constAceEditorAction.down, {moveCursor})
    },
    {
      name: 'moveCursorLeft',
      bindKey: {win: 'left', mac: 'left'},
      exec: editor => handleAceEditor(editor, constAceEditorAction.left, {moveCursor})
    },
    {
      name: 'moveCursorRight',
      bindKey: {win: 'right', mac: 'right'},
      exec: editor => handleAceEditor(editor, constAceEditorAction.right, {moveCursor})
    },
    {
      name: 'removeBlockType',
      bindKey: {win: 'backspace', mac: 'backspace'},
      exec: editor => handleAceEditor(editor, constAceEditorAction.backspace, {moveCursor, onBlur, handleFocusEditor, updateSelectionState}),
    },
  ];

  // Check whether to show this block
  if (!isShowBlock(contentState, blockKey)) {
    return null;
  }

  // Compose aceEditor Props
  const aceEditorProps = {
    ref: aceEditor,
    className: 'geeke-codeEditor',
    mode: codeLanguage,
    wrapEnabled: codeWrapping,
    theme: codeTheme,
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

      <CodeBlockMenuButtons
        pageUuid={pageUuid}
        blockKey={blockKey}
        focusAceEditor={focusAceEditor}
        codeLanguage={codeLanguage}
        codeTheme={codeTheme}
        codeContent={codeContent}
        codeWrapping={codeWrapping}
        updateCodeLanguage={updateCodeLanguage}
        updateCodeTheme={updateCodeTheme}
        updateCodeWrapping={updateCodeWrapping}
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

const CodeBlockMenuButtons = props => {
  // Props
  const pageUuid = props.pageUuid;
  const blockKey = props.blockKey;
  const updateCodeLanguage = props.updateCodeLanguage;
  const updateCodeTheme = props.updateCodeTheme;
  const updateCodeWrapping = props.updateCodeWrapping;
  const focusAceEditor = props.focusAceEditor;
  const codeLanguage = props.codeLanguage;
  const codeTheme = props.codeTheme;
  const codeContent = props.codeContent;
  const codeWrapping = props.codeWrapping;
  const languageName = languageReverseMap.has(codeLanguage) ? languageReverseMap.get(codeLanguage) : 'PlainText';
  const themeName = codeBlockThemeReverseMap.has(codeTheme) ? codeBlockThemeReverseMap.get(codeTheme) : 'GitHub';

  // Reducers
  const dispatch = useDispatch();
  const [languageAnchorEl, setLanguageAnchorEl] = useState(null);
  const [themeAnchorEl, setThemeAnchorEl] = useState(null);
  const [showCopyMessage, setShowCopyMessage] = useState(false);
  const languageMenuOpen = Boolean(languageAnchorEl);
  const themeMenuOpen = Boolean(themeAnchorEl);
  const editorMiscPages = useSelector(state => state.editorMisc.pages);
  const mouseOverBlockKey = editorMiscPages.get(pageUuid).get(pmsc.hover);

  // handleClickLanguageMenu
  const handleClickLanguageMenu = e => {
    setLanguageAnchorEl(e.currentTarget);
    setEditingMenu(dispatch, pageUuid, true);
  };

  // handleCloseLanguageMenu
  const handleCloseLanguageMenu = () => {
    setLanguageAnchorEl(null);
    setEditingMenu(dispatch, pageUuid, false);
    setTimeout(() => {
      focusAceEditor();
    }, 1);
  };

  // handleChangeCodeLanguage
  const handleChangeCodeLanguage = v => {
    if (!v) return;
    handleCloseLanguageMenu();
    updateCodeLanguage(v.value);
  };

  // handleClickThemeMenu
  const handleClickThemeMenu = e => {
    setThemeAnchorEl(e.currentTarget);
    setEditingMenu(dispatch, pageUuid, true);
  };

  // handleCloseThemeMenu
  const handleCloseThemeMenu = e => {
    setThemeAnchorEl(null);
    setEditingMenu(dispatch, pageUuid, false);
    setTimeout(() => {
      focusAceEditor();
    }, 1);
  };

  // handleChangeCodeTheme
  const handleChangeCodeTheme = v => {
    if (!v) return;
    handleCloseThemeMenu();
    updateCodeTheme(v.value);
  };

  // handleShowCopyMessage
  const handleShowCopyMessage = () => {
    setShowCopyMessage(true);
    setTimeout(() => {
      focusAceEditor();
    }, 1);
  };
  const handleCloseCopyMessage = () => {
    setShowCopyMessage(false);
  };

  // handleToggleCodeWrapping
  const handleToggleCodeWrapping = () => updateCodeWrapping(!codeWrapping);

  // Styles...
  const codeBlockMenuStyles = {
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

  // Wrapping icon
  const wrappingIcon = codeWrapping ? <CheckIcon fontSize='inherit' /> : <CloseIcon fontSize='inherit' />;

  return (
    <div className='geeke-codeEditor-dropdownWrapper' contentEditable={false}>
      <div className={'geeke-codeEditor-buttonWrapper' + (mouseOverBlockKey === blockKey ? ' geeke-codeEditor-button-active' : '')}>
        <ButtonGroup className='geeke-codeEditor-buttonGroup' variant="outlined" size="small">
          <Button
            className='geeke-codeEditor-button'
            onClick={handleClickLanguageMenu}
          >{languageName} ▾</Button>

          <Button
            className='geeke-codeEditor-button'
            onClick={handleClickThemeMenu}
          >{themeName} ▾</Button>

          <Button
            className='geeke-codeEditor-button'
            onClick={handleToggleCodeWrapping}
          >{wrappingIcon} Wrapping</Button>

          <CopyToClipboard text={codeContent}>
            <Button
              style={{textTransform: 'none'}} // I don't know why className not work when using button group...
              onClick={handleShowCopyMessage}
            >Copy</Button>
          </CopyToClipboard>
        </ButtonGroup>
      </div>

      {/* Code Language */}
      <Popover
        open={languageMenuOpen}
        anchorEl={languageAnchorEl}
        onClose={handleCloseLanguageMenu}
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
            styles={codeBlockMenuStyles}
            placeholder='Language'
            onChange={handleChangeCodeLanguage}
          />
        </div>
      </Popover>

      {/* Code Themes */}
      <Popover
        open={themeMenuOpen}
        anchorEl={themeAnchorEl}
        onClose={handleCloseThemeMenu}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <div className='geeke-codeEditor-themeListWrapper'>
          <Select
            options={themeOptions}
            autoFocus={true}
            menuIsOpen={true}
            maxMenuHeight={255}
            styles={codeBlockMenuStyles}
            placeholder='Theme'
            onChange={handleChangeCodeTheme}
          />
        </div>
      </Popover>

      {/* Copy Message */}
      <Snackbar
        open={showCopyMessage} autoHideDuration={5000} onClose={handleCloseCopyMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseCopyMessage} severity='success'>
          Copied!
        </Alert>
      </Snackbar>
    </div>
  )
}

export default CodeBlock;
