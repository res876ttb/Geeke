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
import { 
  blockType,
  addBlock,
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

  // Handle create new block
  const handleNewBlock = curUuid => {
    console.log(curUuid);
    addBlock(dispatch, uuid, curUuid);
  };

  // Get child blocks
  const blocks = 
  <div>
    {page.blocks.map(blockUuid => {
      switch(cachedBlocks[blockUuid].type) {
        case blockType.basic:
          return (
            <BasicBlock key={blockUuid}
              dataId={blockUuid}
              handleNewBlock={handleNewBlock}
            />
          );
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
