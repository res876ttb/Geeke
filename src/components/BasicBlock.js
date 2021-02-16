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
} from 'draft-js';

/*************************************************
 * Utils & States
 *************************************************/

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
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());

  useEffect(() => {
    const handler = setTimeout(() => {
      console.log('debounceTimeout fired!');
    }, debouceTimeout);
    return () => clearTimeout(handler);
  }, [editorState]);

  const mapKeyToEditorCommand = e => {
    return getDefaultKeyBinding(e);
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
