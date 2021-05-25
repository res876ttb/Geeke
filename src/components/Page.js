/*************************************************
 * @file Page.js
 * @description Page component. There are two children
 * components: PageTitle and Editor. The later one is
 * from draft-js.
 *************************************************/

/*************************************************
 * React Components
 *************************************************/
import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  Editor,
  EditorState,
  convertToRaw,
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
import PageDragShadow from './PageDragShadow';

/*************************************************
 * Styles
 *************************************************/
import '../styles/Page.css';
import { onDragStart } from '../utils/DraggableBlockUtils';

/*************************************************
 * Constants
 *************************************************/
const testString = `{"blocks":[{"key":"feut4","text":"This is block 1","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"4uump","text":"This is block 2","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":1}},{"key":"7tegj","text":"This is block 3","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":1}},{"key":"7cl1n","text":"This is block 4\\nThis is the second line in block 4","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":2}},{"key":"dn4hc","text":"This is block 5","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}`;

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
  const [dragShadowPos, setDragShadowPos] = useState([-1, -1, false, null, []]); // [offset x, offset y, enable shadow, callback function, arrays of selected blocks]
  const [triggerDrag, setTriggerDrag] = useState(false);
  const editor = useRef(null);

  // Constants
  const dargShadowId = `geeke-dragShadow-${uuid}`;
  const commandConfig = {
    ...defaultKeyboardHandlingConfig,
  };

  // handleBlockDargStart
  const handleBlockDargStart = e => {
    e.preventDefault();
    e.stopPropagation();
    setTriggerDrag(e);
  };

  const defaultBlockProps = {
    pageUuid: uuid,
    readOnly,
    handleBlockDargStart,
  };

  // useEffect for onDragStart
  useEffect(() => {
    if (!triggerDrag) return;

    setTriggerDrag(false);
    onDragStart(triggerDrag, readOnly, dargShadowId, setDragShadowPos, editorState);
  }, [triggerDrag, editorState]); // eslint-disable-line

  // onChange
  const updateEditor = editorState => {
    if (!readOnly) setEditorState(editorState);
  };
  const updateEditorButIgnoreReadOnly = editorState => setEditorState(editorState);

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

  // handleFocusEditor
  const handleFocusEditor = () => editor.current.focus();

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
      <div id={`geeke-editor-${uuid}`}>
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
      </div>

      <PageDragShadow
        pageUuid={uuid}
        elementId={dargShadowId}
        editorState={editorState}
        dragShadowPos={dragShadowPos}
        setDragShadowPos={setDragShadowPos}
        setReadOnly={setReadOnly}
        updateEditor={updateEditorButIgnoreReadOnly}
        focusEditor={handleFocusEditor}
      />

      {/* TODO: make it work: drop on bottom of a page */}
      <div className='geeke-pageBottom'></div>

      {/* For debug only */}
      <button onClick={e => {
        copyTextToClipboard(JSON.stringify(convertToRaw(editorState.getCurrentContent())));
      }}>Copy content</button>
    </div>
  )
}

export default Page;

// For debug only
// Copied from https://stackoverflow.com/a/30810322/6868122
function copyTextToClipboard(text) {
  var textArea = document.createElement("textarea");

  //
  // *** This styling is an extra step which is likely not required. ***
  //
  // Why is it here? To ensure:
  // 1. the element is able to have focus and selection.
  // 2. if the element was to flash render it has minimal visual impact.
  // 3. less flakyness with selection and copying which **might** occur if
  //    the textarea element is not visible.
  //
  // The likelihood is the element won't even render, not even a
  // flash, so some of these are just precautions. However in
  // Internet Explorer the element is visible whilst the popup
  // box asking the user for permission for the web page to
  // copy to the clipboard.
  //

  // Place in the top-left corner of screen regardless of scroll position.
  textArea.style.position = 'fixed';
  textArea.style.top = 0;
  textArea.style.left = 0;

  // Ensure it has a small width and height. Setting to 1px / 1em
  // doesn't work as this gives a negative w/h on some browsers.
  textArea.style.width = '2em';
  textArea.style.height = '2em';

  // We don't need padding, reducing the size if it does flash render.
  textArea.style.padding = 0;

  // Clean up any borders.
  textArea.style.border = 'none';
  textArea.style.outline = 'none';
  textArea.style.boxShadow = 'none';

  // Avoid flash of the white box if rendered for any reason.
  textArea.style.background = 'transparent';


  textArea.value = text;

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand('copy');
    var msg = successful ? 'successful' : 'unsuccessful';
    console.log('Copying text command was ' + msg);
  } catch (err) {
    console.log('Oops, unable to copy');
  }

  document.body.removeChild(textArea);
}