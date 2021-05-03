/*************************************************
 * @file Page.js
 * @description Page component. There are two children
 * components: PageTitle and Editor. The later one is
 * from draft-js.
 *************************************************/

/*************************************************
 * React Components
 *************************************************/
import React, { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import {
  Editor,
  EditorState,
  // convertToRaw,
  convertFromRaw,
} from 'draft-js';

/*************************************************
 * Utils & States
 *************************************************/
import {
  mapKeyToEditorCommand as _mapKeyToEditorCommand,
  handleKeyCommand as _handleKeyCommand,
  handleReturn as _handleReturn,
  defaultKeyboardHandlingConfig,
} from '../utils/BlockKeyboardUtils';

/*************************************************
 * Import Components
 *************************************************/
import PageTitle from './PageTitle';
import BasicBlock from './BasicBlock';

/*************************************************
 * Styles
 *************************************************/
import '../styles/Page.css';

/*************************************************
 * Constants
 *************************************************/
const testString = `{"blocks":[{"key":"feut4","text":"This is block 1","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"4uump","text":"This is block 2","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":1}},{"key":"7tegj","text":"This is block 3","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":1}},{"key":"7cl1n","text":"This is block 4","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":2}},{"key":"dn4hc","text":"This is block 5","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}`;

/*************************************************
 * Main components
 *************************************************/
const Page = props => {
  // Props
  const uuid = props.dataId;

  // Status & Reducers
  const dispatch = useDispatch();
  const [editorState, setEditorState] = useState(EditorState.createWithContent(convertFromRaw(JSON.parse(testString))));
  const [readOnly, setReadOnly] = useState(false);
  const editor = useRef(null);

  // Constant
  const commandConfig = {
    ...defaultKeyboardHandlingConfig,
  };
  const defaultBlockProps = {
    pageUuid: uuid,
    setReadOnly,
    readOnly,
  };

  // onChange
  const updateEditor = editorState => {
    // console.log(JSON.stringify(convertToRaw(editorState.getCurrentContent())));
    if (!readOnly) setEditorState(editorState);
  };

  // keyBindingFn
  const mapKeyToEditorCommand = e => _mapKeyToEditorCommand(e, commandConfig, dispatch, uuid);

  // handleKeyCommand
  const handleKeyCommand = (command, editorState) => _handleKeyCommand(editorState, command, {
    setEditorState,
  });

  // handleReturn
  const handleReturn = (e, editorState) => _handleReturn(e, editorState, {
    setEditorState,
  });

  // blockRendererFn
  const blockDecorator = (contentBlock) => {
    const blockType = contentBlock.getType();
    switch (blockType) {
      default:
        return {
          component: BasicBlock,
          props: {...defaultBlockProps},
        };
    }
  };

  return (
    <div>
      <PageTitle uuid={uuid} />
      <Editor
        ref={editor}
        editorState={editorState}
        onChange={updateEditor}
        keyBindingFn={mapKeyToEditorCommand}
        handleKeyCommand={handleKeyCommand}
        handleReturn={handleReturn}
        blockRendererFn={blockDecorator}
        spellCheck={true}
        readOnly={readOnly}
        // placeholder={'Write something here...'}
      />
      <div className='geeke-pageBottom'></div>
      {/* TODO: make it work: drop on bottom of a page */}
    </div>
  )
}

export default Page;
