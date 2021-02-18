/*************************************************
 * @file BasicBlock.js
 * @description Basic block. This block provides
 *  basic editing features like bold, italic, and
 *  etc.
 *************************************************/

/*************************************************
 * React Components
 *************************************************/
import React, {useEffect, useState} from 'react';
import {
  Editor, 
  EditorState,
  getDefaultKeyBinding,
  RichUtils,
  KeyBindingUtil,
} from 'draft-js';
import {useDispatch} from 'react-redux';

/*************************************************
 * Utils & States
 *************************************************/
import {setSavintState} from '../states/editor.js';

/*************************************************
 * Import Components
 *************************************************/

/*************************************************
 * Styles
 *************************************************/
import '../styles/BasicBlock.css';

/*************************************************
 * Constant
 *************************************************/
const debouceTimeout = 3000;

/*************************************************
 * Main components
 *************************************************/
const BasicBlock = () => {
  const dispatch = useDispatch();
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());

  // TODO: Need a better solution
  useEffect(() => {
    setSavintState(dispatch, true);
    const handler = setTimeout(() => {
      setSavintState(dispatch, false); // TODO: Need to be moved after saving done event fired.
      console.log('debounceTimeout fired!');
    }, debouceTimeout);
    return () => clearTimeout(handler);
  }, [editorState]);

  const mapKeyToEditorCommand = e => {
    const preventDefault = null; // Prevent default action.
    let res = null;
    switch (e.keyCode) {
      case 13: // Enter
        if (e.shiftKey) {
        } else {
          e.preventDefault();
          return preventDefault;
        }
        break;
      case 76: // L
        res = (KeyBindingUtil.hasCommandModifier(e) && e.shiftKey) ? 'inline-latex' : null;
        break;
    }

    if (res != null) {
      return res;
    } else {
      return getDefaultKeyBinding(e);
    }
  };

  const handleKeyCommand = (command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return true;
    }
    return false;
  }

  return (
    <div className='test-outline'>
      <Editor 
        editorState={editorState}
        onChange={setEditorState}
        keyBindingFn={mapKeyToEditorCommand}
        handleKeyCommand={handleKeyCommand}
      />
    </div>
  )
}

export default BasicBlock;
