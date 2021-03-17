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
  selectBlock,
  selectDirection,
} from '../states/editor';

/*************************************************
 * Import Components
 *************************************************/

/*************************************************
 * Styles
 *************************************************/
import '../styles/BlockSelector.css';

/*************************************************
 * Constant
 *************************************************/
const selectKey = {
  selectUp: 1,
  selectDown: 2,
  selectLeft: 3,
  selectRight: 4,
};

/*************************************************
 * Main components
 *************************************************/
const BasicBlock = props => {
  const pageUuid = props.pageUuid;
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
        return selectKey.selectLeft;
      case 38: // Arrow key Up
        return selectKey.selectUp;
      case 39: // Arrow key right
        return selectKey.selectRight;
      case 40: // Arrow key Down
        return selectKey.selectDown;
      default:
        return null;
    }
  };

  const handleKeyCommand = (command, editorState) => {
    switch (command) {
      case selectKey.selectLeft:
        selectBlock(dispatch, pageUuid, selectDirection.left);
        break;
      
      case selectKey.selectUp:
        selectBlock(dispatch, pageUuid, selectDirection.up);
        break;
      
      case selectKey.selectRight:
        selectBlock(dispatch, pageUuid, selectDirection.right);
        break;
      
      case selectKey.selectDown:
        selectBlock(dispatch, pageUuid, selectDirection.down);
        break;
      
      default:
        break;
    }

    return null;
  }

  return (
    <>
      <div className='test-selector'>
        {
          editorState === '' ? null :
          <Editor 
            ref={editor}
            editorState={editorState}
            onChange={setEditorState}
            keyBindingFn={mapKeyToEditorCommand}
            handleKeyCommand={handleKeyCommand}
          />
        }
      </div>
    </>
  )
}

export default BasicBlock;
 