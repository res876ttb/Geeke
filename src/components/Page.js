/*************************************************
 * @file Page.js
 * @description Page component. There are two children
 * components: PageTitle and Editor. The later one is
 * from draft-js.
 *************************************************/

/*************************************************
 * React Components
 *************************************************/
import React, { useState, useRef, useEffect, useCallback } from 'react';
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
import {
  trimNumberListInWholePage,
} from '../utils/NumberListUtils';
import {
  onDragStart
} from '../utils/DraggableBlockUtils';
import {
  toggleCheckList
} from '../utils/CheckListUtils';
import {
  toggleToggleList
} from '../utils/ToggleListUtils';

/*************************************************
 * Import Components
 *************************************************/
import PageTitle from './PageTitle';
import BasicBlock from './BasicBlock';
import PageDragShadow from './PageDragShadow';
import BulletListBlock from './BulletListBlock';
import NumberedListBlock from './NumberedListBlock';
import CheckListBlock from './CheckListBlock';
import ToggleListBlock from './ToggleListBlock';

/*************************************************
 * Constants
 *************************************************/
import {
  constBlockType,
} from '../constant';

/*************************************************
 * Main components
 *************************************************/
// For debug only
const testString = `{"blocks":[{"key":"feut4","text":"This numbered list 1","type":"number-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"numberListOrder":1}},{"key":"3i7b3","text":"This numbered list 2","type":"number-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"numberListOrder":2}},{"key":"9bbfj","text":"This is numbered list 3","type":"number-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":1,"numberListOrder":1}},{"key":"1ljkf","text":"This is numbered list 4","type":"number-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":1,"numberListOrder":2}},{"key":"d54n0","text":"This is a normal list","type":"bullet-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":1}},{"key":"cqoo","text":"This is the second section of numbered list","type":"number-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":1,"numberListOrder":1}},{"key":"be498","text":"This is the second section of numbered list 2","type":"number-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":1,"numberListOrder":2}},{"key":"6puud","text":"This is block 1","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"4uump","text":"This is block 2","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":1}},{"key":"7tegj","text":"This is block 3","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":1}},{"key":"7cl1n","text":"This is block 4","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":2}},{"key":"dn4hc","text":"This is block 5","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"2cf43","text":"This is toggle list","type":"toggle-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"toggleListToggle":true}},{"key":"8idd4","text":"This is bullet list 1","type":"bullet-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":1}},{"key":"9btli","text":"This is bullet list 2","type":"bullet-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":1}},{"key":"45f6v","text":"This is bullet list 3","type":"bullet-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":2}},{"key":"2c9i4","text":"This is toggle list inside toggle list","type":"toggle-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":1,"toggleListToggle":false}},{"key":"3vfhs","text":"This is check list 1","type":"check-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":0,"checkListCheck":true}},{"key":"5ur9n","text":"This is check list 2","type":"check-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":0}},{"key":"1960r","text":"This is check list 3","type":"check-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":1,"checkListCheck":true}},{"key":"368b5","text":"This is check list 4","type":"check-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":1}}],"entityMap":{}}`;

const Page = props => {
  // Props
  const uuid = props.dataId;

  // Status & Reducers
  const dispatch = useDispatch();
  const [editorState, setEditorState] = useState(EditorState.createWithContent(trimNumberListInWholePage(convertFromRaw(JSON.parse(testString)))));
  const [readOnly, setReadOnly] = useState(false);
  const [dragShadowPos, setDragShadowPos] = useState([-1, -1, false, null, []]); // [offset x, offset y, enable shadow, callback function, arrays of selected blocks]
  const [triggerDrag, setTriggerDrag] = useState(false);
  const editor = useRef(null);

  // Constants
  const dargShadowId = `geeke-dragShadow-${uuid}`;
  const commandConfig = {
    ...defaultKeyboardHandlingConfig,
  };

  // onChange
  const updateEditor = editorState => {
    if (!readOnly) setEditorState(editorState);
  };
  const updateEditorButIgnoreReadOnly = editorState => setEditorState(editorState);

  // handleBlockDargStart
  const handleBlockDargStart = e => {
    e.preventDefault();
    e.stopPropagation();
    setTriggerDrag(e);
  };

  // handleToggleCheckList
  const handleToggleCheckList = useCallback(blockKey => {
    updateEditor(toggleCheckList(editorState, blockKey));
    setTimeout(() => editor.current.focus(), 10);
  }, [editorState]); // eslint-disable-line

  const handleToggleToggleList = useCallback(blockKey => {
    updateEditor(toggleToggleList(editorState, blockKey));
    setTimeout(() => editor.current.focus(), 10);
  }, [editorState]); // eslint-disable-line

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

  // keyBindingFn
  const mapKeyToEditorCommand = useCallback(e => {
    if (!readOnly) return _mapKeyToEditorCommand(e, commandConfig, dispatch, editorState, uuid)
    return 'not-handled';
  }, [editorState]); // eslint-disable-line

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
      case constBlockType.bulletList:
        return {
          component: BulletListBlock,
          props: {...defaultBlockProps},
        };

      case constBlockType.numberList:
        return {
          component: NumberedListBlock,
          props: {...defaultBlockProps},
        };

      case constBlockType.checkList:
        return {
          component: CheckListBlock,
          props: {...defaultBlockProps, handleToggleCheckList},
        };

      case constBlockType.toggleList:
        return {
          component: ToggleListBlock,
          props: {...defaultBlockProps, handleToggleToggleList},
        };

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