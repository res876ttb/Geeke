/*************************************************
 * @file Page.js
 * @description Page component.
 *************************************************/

/*************************************************
 * React Components
 *************************************************/
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

/*************************************************
 * Utils & States
 *************************************************/
import {setSavintState} from '../states/editor';

/*************************************************
 * Import Components
 *************************************************/
import BasicBlock from './BasicBlock';

/*************************************************
 * Styles
 *************************************************/

/*************************************************
 * Main components
 *************************************************/
const Page = props => {
  const blockUuid = props['data-id'];
  const saving = useSelector(state => state.editor.editorState.saving);
  const dispatch = useDispatch();

  return (
    <>
      This is page
      <div onClick={() => setSavintState(dispatch, !saving)}>{saving ? 'true' : 'false'}</div>
    </>
  )
}

export default Page;
