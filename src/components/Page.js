/*************************************************
 * @file Page.js
 * @description Page component. There are two children
 * components: PageTitle and Editor. The later one is
 * from draft-js.
 *************************************************/

/*************************************************
 * React Components
 *************************************************/
import React, { useRef } from 'react';
import {
  useDispatch,
  useSelector,
} from 'react-redux';
import {
  Editor,
  convertToRaw,
} from 'draft-js';
import throttle from 'lodash/throttle';

/*************************************************
 * Utils & States
 *************************************************/
import { toggleCheckList } from '../utils/CheckListUtils';
import { toggleToggleList } from '../utils/ToggleListUtils';
import {
  mapKeyToEditorCommand as _mapKeyToEditorCommand,
  handleKeyCommand as _handleKeyCommand,
  handleReturn as _handleReturn,
  defaultKeyboardHandlingConfig,
} from '../utils/KeyboardUtils';

/*************************************************
 * Import Components
 *************************************************/
import BasicBlock from './BasicBlock';
import BulletListBlock from './BulletListBlock';
import CheckListBlock from './CheckListBlock';
import CodeBlock from './CodeBlock';
import HeadingBlock from './HeadingBlock';
import NumberedListBlock from './NumberedListBlock';
import PageDragShadow from './PageDragShadow';
import PageTitle from './PageTitle';
import QuoteBlock from './QuoteBlock';
import ToggleListBlock from './ToggleListBlock';

/*************************************************
 * Constants
 *************************************************/
import { setSelectionStateByKey } from '../utils/Misc';
import { setEditorState, setSelectionState } from '../states/editor';
import { constBlockType } from '../constant';
import {
  focusSpecialBlock,
  pmsc,
  setFocusBlockKey,
  setMoveDirection,
  setSelectedBlocks,
} from '../states/editorMisc';

/*************************************************
 * Main components
 *************************************************/
const Page = props => {
  // Props
  const uuid = props.dataId;

  // Status & Reducers
  const dispatch = useDispatch();
  const editorState = useSelector(state => state.editor.cachedPages.get(uuid).get('content'));
  const readOnly = useSelector(state => state.editor.cachedPages.get(uuid).get('readOnly'));
  const editingCode = useSelector(state => state.editorMisc.pages.get(uuid).get(pmsc.editingCode));
  const editingMenu = useSelector(state => state.editorMisc.pages.get(uuid).get(pmsc.editingMenu));
  const selectedBlocks = useSelector(state => state.editorMisc.pages.get(uuid).get(pmsc.selectedBlocks));
  const editor = useRef(null);

  // Constants
  const dargShadowId = `geeke-dragShadow-${uuid}`;
  const commandConfig = {
    ...defaultKeyboardHandlingConfig,
  };

  // Find selected blocks
  const findSelectedBlocks = throttle(editorState => {
    // This function may consume lots of CPU resource, so use throttle to reduce CPU usage. (10Hz)
    setSelectedBlocks(dispatch, uuid, editorState);
  }, 100, {'trailing': false});

  const isSelectedBlock = blockKey => {
    return selectedBlocks.has(blockKey);
  };

  // onChange
  const updateEditor = editorState => {
    findSelectedBlocks(editorState);
    if (!readOnly) setEditorState(dispatch, uuid, editorState);
  };
  const updateEditorButIgnoreReadOnly = editorState => setEditorState(dispatch, uuid, editorState);

  // handleToggleCheckList
  const handleToggleCheckList = blockKey => {
    updateEditor(toggleCheckList(editorState, blockKey));
    // Automatically focus editor (focus will lose because of click on non-editable component)
    setTimeout(() => editor.current.focus(), 1);
  };

  // handleToggleToggleList
  const handleToggleToggleList = blockKey => {
    updateEditor(toggleToggleList(editorState, blockKey));
    // Automatically focus editor (focus will lose because of click on non-editable component)
    setTimeout(() => editor.current.focus(), 1);
  }

  // handleFocusEditor
  const handleFocusEditor = () => editor.current.focus();

  // keyBindingFn
  const mapKeyToEditorCommand = e => {
    if (!readOnly) return _mapKeyToEditorCommand(e, commandConfig, dispatch, editorState, uuid)
    return 'not-handled';
  }

  // handleKeyCommand
  const keyCommandDispatcher = {
    setEditorState: updateEditor,
    setSelectionState: selectionState => setSelectionState(dispatch, uuid, selectionState),
    setFocusBlockKey: focusBlockKey => setFocusBlockKey(dispatch, uuid, focusBlockKey),
    setMoveDirection: moveDirection => setMoveDirection(dispatch, uuid, moveDirection),
    focusSpecialBlock: (blockKey, moveDirection) => focusSpecialBlock(dispatch, uuid, blockKey, moveDirection),
    handleFocusEditor,
  };
  const handleKeyCommand = (command, editorState, blockKey) => _handleKeyCommand(editorState, command, keyCommandDispatcher, blockKey);

  // handleReturn
  const handleReturn = (e, editorState) => _handleReturn(e, editorState, {
    setEditorState: updateEditor,
  });

  // blockRendererFn
  const defaultBlockProps = {
    pageUuid: uuid,
    readOnly,
  };
  const blockDecorator = (contentBlock) => {
    const blockType = contentBlock.getType();
    switch (blockType) {
      case constBlockType.bulletList:
        return {
          component: BulletListBlock,
          props: defaultBlockProps,
        };

      case constBlockType.numberList:
        return {
          component: NumberedListBlock,
          props: defaultBlockProps,
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

      case constBlockType.quote:
        return {
          component: QuoteBlock,
          props: defaultBlockProps,
        };

      case constBlockType.heading:
        return {
          component: HeadingBlock,
          props: defaultBlockProps,
        };

      case constBlockType.code:
        return {
          component: CodeBlock,
          props: {
            ...defaultBlockProps,
            editorState,
            isSelectedBlock,
            handleFocusEditor,
            keyCommandDispatcher,
            updateSelectionState: blockKey => updateEditor(setSelectionStateByKey(editorState, blockKey)),
          },
        };

      default:
        return {
          component: BasicBlock,
          props: defaultBlockProps,
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
          readOnly={readOnly || editingCode || editingMenu}
          // placeholder={'Write something here...'}
        />
      </div>

      <PageDragShadow
        pageUuid={uuid}
        elementId={dargShadowId}
        editorState={editorState}
        updateEditor={updateEditorButIgnoreReadOnly}
        focusEditor={handleFocusEditor}
      />

      {/* TODO: focus editor when click this padding block */}
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


  text = text.replace(/\\/g, '\\\\');
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