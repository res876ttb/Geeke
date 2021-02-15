/*************************************************
 * @file BasicBlock.js
 * @description Basic block. This block provides
 *  basic editing features like bold, italic, and
 *  etc.
 *************************************************/

/*************************************************
 * React Components
 *************************************************/
import React, {useEffect, useState, useCallback} from 'react';
import {Editor, EditorState} from 'draft-js';

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

  // Debounce method from https://stackoverflow.com/a/61127960/6868122
  const callback = useCallback(() => {
    console.log('debounceTimeout fired!', editorState != null);
  }, [editorState]);
  useEffect(() => {
    const handler = setTimeout(() => callback(), debouceTimeout);
    return () => clearTimeout(handler);
  }, [callback]);

  return (
    <div className='test-outline'>
      <Editor editorState={editorState} onChange={setEditorState} />
    </div>
  )
}

export default BasicBlock;
