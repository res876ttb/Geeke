/*************************************************
 * @file BlockSelector.js
 * @description Block Selector. This component is used for controlling block selection.
 *************************************************/

/*************************************************
 * React Components
 *************************************************/
import React, {useEffect, useRef, useState} from 'react';
import {
  Editor,
  EditorState,
} from 'draft-js';
import {useDispatch, useSelector} from 'react-redux';

/*************************************************
 * Utils & States
 *************************************************/
import {
  setFocusedBlock,
  isSelectionDirectionUp,
} from '../states/editor';
import {
  keyCommandConst,
  handleKeyCommand as _handleKeyCommand,
} from '../utils/BlockKeyboardUtils';

/*************************************************
 * Import Components
 *************************************************/

/*************************************************
 * Constant
 *************************************************/

/*************************************************
 * Main components
 *************************************************/
const BasicBlock = props => {
  const pageUuid = props.pageId;
  const uuid = pageUuid + '_blockSelector';

  const state = useSelector(state => state.editor);
  const dispatch = useDispatch();
  const editor = useRef(null);
  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  const focusedBlock = state.focusedBlock[pageUuid];
  const focus = uuid === focusedBlock;

  useEffect(() => {
    if (editor.current) {
      if (focus) {
        editor.current.focus();
      } else {
        editor.current.blur();
      }
    }
  }, [focus]);

  const mapKeyToEditorCommand = e => {
    switch (e.keyCode) {
      case 37: // Arrow key left
        if (e.shiftKey)
          return keyCommandConst.selectLeft; // eslint-disable-next-line
      case 38: // Arrow key Up
        if (e.shiftKey)
          return keyCommandConst.selectUp;

      // if shift is not pressed, then go to the first block
      if (isSelectionDirectionUp(state, pageUuid))
        return keyCommandConst.selectFocus;
      else
        return keyCommandConst.selectAnchor;

      case 39: // Arrow key right
        if (e.shiftKey)
          return keyCommandConst.selectRight; // eslint-disable-next-line
      case 40: // Arrow key Down
        if (e.shiftKey)
          return keyCommandConst.selectDown;

      // if shift is not pressed, then go to the last block
      if (isSelectionDirectionUp(state, pageUuid))
        return keyCommandConst.selectAnchor;
      else
        return keyCommandConst.selectFocus;

      case 27: // Escape
      case 13: // Enter
        return keyCommandConst.escapeSelectionMode;
      default:
        return null;
    }
  };

  const handleKeyCommand = (command, editorState) => {
    return _handleKeyCommand(dispatch, pageUuid, pageUuid, uuid, state, editorState, command);
  }

  return (
    <>
      <div className='geeke-selector'>
        {
          editorState === '' ? null :
          <Editor
            ref={editor}
            editorState={editorState}
            onChange={setEditorState}
            keyBindingFn={mapKeyToEditorCommand}
            handleKeyCommand={handleKeyCommand}
            onBlur={() => {setFocusedBlock(dispatch, pageUuid, null)}}
          />
        }
      </div>
    </>
  )
}

export default BasicBlock;
