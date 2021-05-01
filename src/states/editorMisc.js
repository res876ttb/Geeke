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
const type = 1;

export const pmsc = { // Page Misc State Constants
  hover: 1,
};

const initPageMiscState = [
  [pmsc.hover, null],
];

const initEditorMiscState = {
  pages: new Map(),
};

/*************************************************
 * ACTION
 *************************************************/
export const initPage = (dispatch, pageUuid) => {
  _initPage(dispatch, pageUuid);
};

export const setMouseOverBlockKey = (dispatch, pageUuid, blockKey) => {
  _setMouseOverBlockKey(dispatch, pageUuid, blockKey);
};

export const unsetMouseOverBlockKey = (dispatch, pageUuid) => {
  _setMouseOverBlockKey(dispatch, pageUuid, null);
}

/*************************************************
 * MIDDLE FUNCTION
 *************************************************/
const _initPage = (dispatch, pageUuid) => {
  dispatch({type, callback: state => {
    if (!state.pages.has(pageUuid)) {
      state.pages.set(pageUuid, new Map(initPageMiscState));
    }

    return state;
  }});
};

const _setMouseOverBlockKey = (dispatch, pageUuid, blockKey) => {
  dispatch({type, callback: state => {
    let page = state.pages.get(pageUuid)
    page.set(pmsc.hover, blockKey);

    return state;
  }});
};

/*************************************************
 * REDUCER
 * @brief Use immer to perform deep udpate of state.
 *************************************************/
export const editorMisc = (oldState=initEditorMiscState, action) => produce(oldState, state => action.callback ? action.callback(state) : state);