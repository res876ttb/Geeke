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
import {
  Editor,
  EditorState,
  DefaultDraftBlockRenderMap,
} from 'draft-js';
import Immutable from 'immutable';

/*************************************************
 * Utils & States
 *************************************************/
import {
  mapKeyToEditorCommand as _mapKeyToEditorCommand,
  handleKeyCommand as _handleKeyCommand,
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
 * Main components
 *************************************************/
const Page = props => {
  // Props
  const uuid = props.dataId;
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const editor = useRef(null);

  // Constant
  const commandConfig = {
    ...defaultKeyboardHandlingConfig,
  };

  // keyBindingFn
  const mapKeyToEditorCommand = e => _mapKeyToEditorCommand(e, commandConfig);

  // handleKeyCommand
  const handleKeyCommand = (command, editorState) => _handleKeyCommand(editorState, command, {
    setEditorState,
  });

  // blockRendererFn
  const blockDecorator = (contentBlock) => {
    // const blockType = contentBlock.getType();
    // switch (blockType) {
    //   default:
    //     return {
    //       component: BasicBlock,
    //     };
    // }
  };

  // blockRenderMap
  const blockRenderMap = DefaultDraftBlockRenderMap.merge(Immutable.Map({
    'unstyled': {
      element: BasicBlock,
    }
  }));

  return (
    <div>
      <PageTitle uuid={uuid} />
      <Editor
        ref={editor}
        editorState={editorState}
        onChange={setEditorState}
        keyBindingFn={mapKeyToEditorCommand}
        handleKeyCommand={handleKeyCommand}
        blockRendererFn={blockDecorator}
        blockRenderMap={blockRenderMap}
        spellCheck={true}
        // placeholder={'Write something here...'}
      />
      <div className='geeke-pageBottom'></div>
      {/* TODO: make it work: drop on bottom of a page */}
    </div>
  )
}

export default Page;
