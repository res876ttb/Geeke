/*************************************************
 * @file PageTitle.js
 * @description Page title.
 *************************************************/

/*************************************************
 * React Components
 *************************************************/
import React, {useEffect, useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  ContentState,
  Editor, 
  EditorState,
  getDefaultKeyBinding,
} from 'draft-js';

/*************************************************
 * Utils & States
 *************************************************/
import { 
  updatePageTitle,
} from '../states/editor';

/*************************************************
 * Import Components
 *************************************************/

/*************************************************
 * Styles
 *************************************************/
import '../styles/PageTitle.css';

/*************************************************
 * Main components
 *************************************************/

const PageTitle = props => {
  const uuid = props.uuid;
  const dispatch = useDispatch();
  const [title, setTitle] = useState(
    EditorState.createWithContent(
      ContentState.createFromText(
        useSelector(state => state.editor.cachedPages[uuid].title)
      )
    )
  ); // Create ContentState wit pure text: https://stackoverflow.com/a/35885589/6868122

  const titleStyleFn = contentBlock => {
    return 'Geeke-Page-Title';
  };

  const mapKeyToEditorCommand = e => {
    const preventDefault = null; // Prevent default action.
    switch (e.keyCode) {
      case 13: // Enter
        return preventDefault;
      default:
        break;
    }
    return getDefaultKeyBinding(e);
  };

  // Update page title to reducer
  useEffect(() => {
    // Get plain text: https://stackoverflow.com/a/56275995/6868122
    updatePageTitle(dispatch, uuid, title.getCurrentContent().getPlainText('\u0001'));
  }, [title]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Editor className='Geeke-Page-Title'
      editorState={title}
      onChange={setTitle}
      blockStyleFn={titleStyleFn}
      keyBindingFn={mapKeyToEditorCommand}
    />
  );
}

export default PageTitle;