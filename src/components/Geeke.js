/*************************************************
 * @file Geeke.js
 * @description Framework component of Geeke.
 *************************************************/

/*************************************************
 * React Components
 *************************************************/
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

/*************************************************
 * Utils & States
 *************************************************/
import {
  initPage
} from '../states/editorMisc';

/*************************************************
 * Import Components
 *************************************************/
import Page from './Page';

/*************************************************
 * Styles
 *************************************************/
import '../Geeke.css';

/*************************************************
 * Main components
 *************************************************/
const Geeke = () => {
  const dispatch = useDispatch();
  const editorMiscPages = useSelector(state => state.editorMisc.pages);
  const fakePageUuid = '100';

  useEffect(() => {
    initPage(dispatch, fakePageUuid);
  }, []); // eslint-disable-line

  return (
    <div>
      {/* For debug convenience */}
      <div style={{display: 'inline-block', width: '123px'}}></div>
      <div style={{display: 'inline-block', width: '789px', outline: 'solid 1px black'}}>
        {editorMiscPages.has(fakePageUuid) ? <Page dataId={fakePageUuid} /> : null}
      </div>
    </div>
  )
}

export default Geeke;
