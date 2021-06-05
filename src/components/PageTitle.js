/*************************************************
 * @file PageTitle.js
 * @description Page title.
 *************************************************/

/*************************************************
 * React Components
 *************************************************/
import React, {useState} from 'react';
// import { useSelector } from 'react-redux';
import {
  ContentState,
  Editor,
  EditorState,
  getDefaultKeyBinding,
} from 'draft-js';

/*************************************************
 * Utils & States
 *************************************************/

/*************************************************
 * Import Components
 *************************************************/

/*************************************************
 * Main components
 *************************************************/
const PageTitle = props => {
  // Props
  const uuid = props.uuid;

  // States & Reducers
  // const dispatch = useDispatch();
  // const state = useSelector(state => state.editor);
  const [title, setTitle] = useState(
    EditorState.createWithContent(
      ContentState.createFromText(
        'Untitled'
      )
    )
  ); // Create ContentState wit pure text: https://stackoverflow.com/a/35885589/6868122

  // Constants
  // const draggedBlockInfo = state.draggedBlock[uuid];

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
  // useEffect(() => {
  //   // Get plain text: https://stackoverflow.com/a/56275995/6868122
  //   updatePageTitle(dispatch, uuid, title.getCurrentContent().getPlainText('\u0001'));
  // }, [title]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      geeke-id={uuid}
      geeke-type='Title'
      depth={-1}

      // onDragEnter={e => draggableOnDragEnter(e, dispatch, uuid, uuid, draggedBlockInfo, false)}
      // onDrop={e => draggableOnDrop(e, dispatch, uuid, draggedBlockInfo, state)}
    >
      <Editor className='Geeke-Page-Title'
        editorState={title}
        onChange={setTitle}
        blockStyleFn={titleStyleFn}
        keyBindingFn={mapKeyToEditorCommand}
      />
    </div>
  );
}

export default PageTitle;