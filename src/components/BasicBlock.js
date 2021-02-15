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

  useEffect(() => {
    const handler = setTimeout(() => {
      console.log('debounceTimeout fired!');
    }, debouceTimeout);
    return () => clearTimeout(handler);
  }, [editorState]);

  return (
    <div className='test-outline'>
      <Editor editorState={editorState} onChange={setEditorState} />
    </div>
  )
}

export default BasicBlock;
