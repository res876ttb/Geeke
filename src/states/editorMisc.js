/*************************************************
 * @file editorMisc.js
 * @description Reducers about mouse interaction or other frequently used states.
 *************************************************/

/*************************************************
 * IMPORT
 *************************************************/
import produce from 'immer';

/*************************************************
 * CONST
 *************************************************/
// The reducer is `editorMisc`
const type = 'editorMisc';

export const pmsc = {
  // Page Misc State Constants
  hover: 1,
  dragShadowPos: 2,
  editingCode: 3,
  editingMenu: 4,
  draggingBlock: 5,
  focusBlockKey: 6,
  specialFocusFunc: 7,
  moveDirection: 8,
  selectedBlocks: 9,
  popupMenuRange: 10,
  triggerEsc: 11,
  linkRange: 12,
  preLinkRange: 13,
  mathRange: 14,
  editingMath: 15,
};

const initPageMiscState = [
  [pmsc.hover, null],
  [pmsc.dragShadowPos, [-1, -1, false, null, []]], // [offset x, offset y, enable shadow, callback function, arrays of selected blocks]
  [pmsc.editingCode, false],
  [pmsc.editingMenu, false],
  [pmsc.draggingBlock, false],
  [pmsc.focusBlockKey, null], // Used for special block like code block, table, and etc.
  [pmsc.specialFocusFunc, new Map()], // Key: blockKey, Value: focus func
  [pmsc.moveDirection, null],
  [pmsc.selectedBlocks, new Set()],
  [pmsc.popupMenuRange, null],
  [pmsc.triggerEsc, 0],
  [pmsc.linkRange, null],
  [pmsc.preLinkRange, null], // Set selectionState and focus editor before editing the link
  [pmsc.mathRange, null],
  [pmsc.editingMath, false],
];

const initEditorMiscState = {
  pages: new Map(),
  focusEditor: null,
  selectionState: null,
};

/*************************************************
 * ACTION
 *************************************************/
export const initPage = (dispatch, pageUuid) => {
  dispatch({
    type,
    callback: (state) => {
      if (!state.pages.has(pageUuid)) {
        state.pages.set(pageUuid, new Map(initPageMiscState));
      }

      return state;
    },
  });
};

export const setFocusEditorUuid = (dispatch, pageUuid) => {
  dispatch({
    type,
    callback: (state) => {
      state.focusEditor = pageUuid;
      return state;
    },
  });
};

export const setSpecialFocusFunc = (dispatch, pageUuid, blockKey, focusFunc) => {
  dispatch({
    type,
    callback: (state) => {
      let page = state.pages.get(pageUuid);
      let specialFocusFuncs = page.get(pmsc.specialFocusFunc);
      specialFocusFuncs.set(blockKey, focusFunc);
      return state;
    },
  });
};

export const focusSpecialBlock = (dispatch, pageUuid, blockKey, moveDirection) => {
  dispatch({
    type,
    callback: (state) => {
      state.pages.get(pageUuid).get(pmsc.specialFocusFunc).get(blockKey)(moveDirection);
      return state;
    },
  });
};

export const setSelectedBlocks = (dispatch, pageUuid, editorState) => {
  dispatch({
    type,
    callback: (state) => {
      const selectionState = editorState.getSelection();

      let page = state.pages.get(pageUuid);
      let selectedBlocks = new Set();

      if (selectionState.isCollapsed()) {
        page.set(pmsc.selectedBlocks, selectedBlocks);
        return state;
      }

      const isBackward = selectionState.getIsBackward();
      const startBlockKey = isBackward ? selectionState.getFocusKey() : selectionState.getAnchorKey();
      const endBlockKey = isBackward ? selectionState.getAnchorKey() : selectionState.getFocusKey();
      const contentState = editorState.getCurrentContent();

      let curBlock = contentState.getBlockForKey(startBlockKey);
      while (true) {
        selectedBlocks.add(curBlock.getKey());
        if (curBlock.getKey() === endBlockKey) break;
        curBlock = contentState.getBlockAfter(curBlock.getKey());
      }

      page.set(pmsc.selectedBlocks, selectedBlocks);
      return state;
    },
  });
};

export const setPopupMenuRange = (dispatch, pageUuid, menuRange) =>
  setPageValue(dispatch, pageUuid, pmsc.popupMenuRange, menuRange);
export const setLinkRange = (dispatch, pageUuid, linkRange) =>
  setPageValue(dispatch, pageUuid, pmsc.linkRange, linkRange);
export const setPreLinkRange = (dispatch, pageUuid, preLinkRange) =>
  setPageValue(dispatch, pageUuid, pmsc.preLinkRange, preLinkRange);
export const setMathRange = (dispatch, pageUuid, mathRange) =>
  setPageValue(dispatch, pageUuid, pmsc.mathRange, mathRange);
export const setMouseOverBlockKey = (dispatch, pageUuid, blockKey) =>
  setPageValue(dispatch, pageUuid, pmsc.hover, blockKey);
export const setDragShadowPos = (dispatch, pageUuid, dragShadowPos) =>
  setPageValue(dispatch, pageUuid, pmsc.dragShadowPos, dragShadowPos);
export const setEditingCode = (dispatch, pageUuid, editingCode) =>
  setPageValue(dispatch, pageUuid, pmsc.editingCode, editingCode);
export const setEditingMenu = (dispatch, pageUuid, editingMenu) =>
  setPageValue(dispatch, pageUuid, pmsc.editingMenu, editingMenu);
export const setDraggingBlock = (dispatch, pageUuid, dragging) =>
  setPageValue(dispatch, pageUuid, pmsc.draggingBlock, dragging);
export const setFocusBlockKey = (dispatch, pageUuid, focusBlockKey) =>
  setPageValue(dispatch, pageUuid, pmsc.focusBlockKey, focusBlockKey);
export const setMoveDirection = (dispatch, pageUuid, moveDirection) =>
  setPageValue(dispatch, pageUuid, pmsc.moveDirection, moveDirection);
export const setEditingMath = (dispatch, pageUuid, editingMath) =>
  setPageValue(dispatch, pageUuid, pmsc.editingMath, editingMath);

const setPageValue = (dispatch, pageUuid, pmscKey, value) => {
  dispatch({
    type,
    callback: (state) => {
      let page = state.pages.get(pageUuid);
      page.set(pmscKey, value);
      return state;
    },
  });
};

export const triggerEsc = (dispatch, pageUuid) => {
  dispatch({
    type,
    callback: (state) => {
      let page = state.pages.get(pageUuid);
      let escNum = page.get(pmsc.triggerEsc);
      page.set(pmsc.triggerEsc, (escNum + 1) % 87);
      return state;
    },
  });
};

export const setSelectionState = (dispatch, selectionState) => {
  dispatch({
    type,
    callback: (state) => {
      state.selectionState = selectionState;
      return state;
    },
  });
};

/*************************************************
 * REDUCER
 * @brief Use immer to perform deep udpate of state.
 *************************************************/
export const editorMisc = (oldState = initEditorMiscState, action) =>
  action.type === type ? produce(oldState, (state) => (action.callback ? action.callback(state) : state)) : oldState;
