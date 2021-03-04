/*************************************************
 * @file Page.js
 * @description Page component.
 *************************************************/

/*************************************************
 * React Components
 *************************************************/
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

/*************************************************
 * Utils & States
 *************************************************/
import { 
  addBlock,
  blockType,
  cursorDirection,
  loadAllBlocks,
  parseBlockParents
} from '../states/editor';

/*************************************************
 * Import Components
 *************************************************/
import BasicBlock from './BasicBlock';
import PageTitle from './PageTitle';

/*************************************************
 * Styles
 *************************************************/

/*************************************************
 * Main components
 *************************************************/
const Page = props => {
  const uuid = props.dataId;
  const dispatch = useDispatch();
  const page = useSelector(state => state.editor.cachedPages[uuid]);
  const cachedBlocks = useSelector(state => state.editor.cachedBlocks);
  const [focusedBlock, setFocusBlock] = useState({});

  // Synchornize current page with server every 3 seconds.

  // Handle create new block
  const handleNewBlock = curUuid => {
    return addBlock(dispatch, uuid, uuid, curUuid);
  };

  // Handle load all blocks
  useEffect(() => {
    loadAllBlocks(dispatch, uuid);
    parseBlockParents(dispatch, uuid);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Get child blocks
  const blocks = 
  <div>
    {page.blocks.map(blockUuid => {
      switch(cachedBlocks[blockUuid].type) {
        case blockType.basic:
          return (
            <BasicBlock key={blockUuid}
              dataId={blockUuid}
              pageId={uuid}
              handleNewBlock={handleNewBlock}
            />
          );
        
        default:
          console.error(`Unknown block type: ${cachedBlocks[blockUuid].type}`);
          return null;
      }
    })}
  </div>;

  return (
    <div>
      <PageTitle uuid={uuid} />
      {blocks}
    </div>
  )
}

export default Page;