/*************************************************
 * @file CodeBlock.js
 * @description Write codes in Geeke!
 *************************************************/

/*************************************************
 * React Components
 *************************************************/
import React, { useRef } from 'react';
import { useDispatch } from 'react-redux';
import AceEditor from "react-ace";
import "ace-builds/webpack-resolver";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools";

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
  remToPx,
} from '../constant';
import { EditorState } from 'draft-js';

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
    mode: 'javascript',
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
    defaultValue: codeContent,
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
      style={{paddingLeft: `${paddingLeft + remToPx(editorLeftPadding)}px`}}
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

      <div
        onClick={focusAceEditor} // Need to force focus on mouse click because in some situation, click on the last line cannot focus the AceEditor...
        contentEditable={false}  // Make this block not contenteditable to prevent from modify some DOM by accident...
      >
        <AceEditor {...aceEditorProps} />
      </div>
    </div>
  )
}

export default CodeBlock;
