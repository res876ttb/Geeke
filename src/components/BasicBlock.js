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

// https://stackoverflow.com/a/61127960/6868122
const useDebouncedEffect = (effect, delay, deps) => {
  // useCallback will return a memoized version of the callback that only changes if one of the inputs has changed.
  const callback = useCallback(effect, deps);

  useEffect(() => {
    const handler = setTimeout(() => {
      callback();
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [callback, delay]);
}

const BasicBlock = () => {
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());

  useDebouncedEffect(() => {
    console.log('debounceTimeout fired!');
  }, debouceTimeout, [editorState]);

  return (
    <div style={{border: 'solid 2px gray', margin: '1rem', padding: '0.5rem'}}>
      <Editor editorState={editorState} onChange={setEditorState} />
    </div>
  )
}

export default BasicBlock;
