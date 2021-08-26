/*************************************************
 * @file Geeke.js
 * @description Framework component of Geeke.
 *************************************************/

/*************************************************
 * React Components
 *************************************************/
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { convertFromRaw, EditorState } from 'draft-js';

/*************************************************
 * Utils & States
 *************************************************/
import { initPage as initPageMisc } from '../states/editorMisc';
import { initPage, setEditorState } from '../states/editor';
import { trimNumberListInWholePage } from '../utils/NumberListUtils';
import Dispatcher from '../utils/Dispatcher';
import { decorator } from '../utils/Decorator';

/*************************************************
 * Import Components
 *************************************************/
import Page from './Page';

/*************************************************
 * Styles
 *************************************************/
import '../Geeke.css';
import '../../node_modules/katex/dist/katex.css';

/*************************************************
 * Main components
 *************************************************/
// For debug only

// Normal case
const testString = `{"blocks":[{"key":"3g302","text":"About This Project","type":"heading","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":0,"parentKey":null,"headingType":"h1"}},{"key":"7gm57","text":"The goal of this project is to create a Notion-like editor, but open-source. Everyone can host a Geeke server on their machine.","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":0,"parentKey":null}},{"key":"dbr5l","text":"Geeke is still under development. Welcome to contribute code to this project!","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":0,"parentKey":null}},{"key":"9gqcq","text":"Demo","type":"heading","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":0,"parentKey":null,"headingType":"h1"}},{"key":"e2cn7","text":"Geeke support most basic function in Notion. ","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":0,"parentKey":null}},{"key":"6i52r","text":"Block Level Examples","type":"heading","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":0,"parentKey":null,"headingType":"h2"}},{"key":"ib9m","text":"Type 1. with a space to create a numbered list","type":"number-list","depth":0,"inlineStyleRanges":[{"offset":5,"length":2,"style":"CODE"}],"entityRanges":[],"data":{"indentLevel":0,"parentKey":null,"numberListOrder":1}},{"key":"dqhvf","text":"Type  * or - with a space to create a bullet list","type":"bullet-list","depth":0,"inlineStyleRanges":[{"offset":6,"length":1,"style":"CODE"},{"offset":11,"length":1,"style":"CODE"}],"entityRanges":[],"data":{"indentLevel":0,"parentKey":null}},{"key":"9psji","text":"Type [] with a space to create a check list","type":"check-list","depth":0,"inlineStyleRanges":[{"offset":5,"length":2,"style":"CODE"}],"entityRanges":[],"data":{"indentLevel":0,"parentKey":null}},{"key":"f97ur","text":"Press ctrl + enter on Windows/Linux or cmd + enter on macOS to toggle this check list","type":"check-list","depth":0,"inlineStyleRanges":[{"offset":6,"length":12,"style":"CODE"},{"offset":39,"length":11,"style":"CODE"}],"entityRanges":[],"data":{"indentLevel":1,"parentKey":"9psji","checkListCheck":true}},{"key":"84rsd","text":"Type > with a space to create a toggle list","type":"toggle-list","depth":0,"inlineStyleRanges":[{"offset":5,"length":1,"style":"CODE"}],"entityRanges":[],"data":{"indentLevel":0,"parentKey":null,"toggleListToggle":true}},{"key":"2olht","text":"This is a secret block :)","type":"toggle-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":1,"parentKey":"84rsd"}},{"key":"6lb63","text":"Press ctrl + enter on Windows/Linux or cmd + enter on macOS to toggle this block","type":"toggle-list","depth":0,"inlineStyleRanges":[{"offset":6,"length":12,"style":"CODE"},{"offset":39,"length":11,"style":"CODE"}],"entityRanges":[],"data":{"indentLevel":1,"parentKey":"84rsd","toggleListToggle":false}},{"key":"dbhbc","text":"Also, Users can type tab to increase indent level and shift + tab to decrease indent level.","type":"unstyled","depth":0,"inlineStyleRanges":[{"offset":21,"length":3,"style":"CODE"},{"offset":54,"length":11,"style":"CODE"}],"entityRanges":[],"data":{"indentLevel":0,"parentKey":null}},{"key":"5giol","text":"Just like this!","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":1,"parentKey":"dbhbc"}},{"key":"7c8lh","text":"If user want to create a heading block, just type # with a space at the start of a line to convert that line into heading block. The number of # represents the level you want to create.","type":"unstyled","depth":0,"inlineStyleRanges":[{"offset":50,"length":1,"style":"CODE"},{"offset":143,"length":1,"style":"CODE"}],"entityRanges":[],"data":{"indentLevel":0,"parentKey":null}},{"key":"3hliv","text":"Drag and Drop","type":"heading","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":0,"parentKey":null,"headingType":"h3"}},{"key":"5jr71","text":"Each block with a dot icon is draggable. Users can drag these blocks in any order, just like Notion.","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":0,"parentKey":null}},{"key":"bou36","text":"Inline Style Examples","type":"heading","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":0,"parentKey":null,"headingType":"h2"}},{"key":"64fmo","text":"Geeke supports lots of inline style.","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":0,"parentKey":null}},{"key":"coc7j","text":"bold (ctrl + B / cmd + B)","type":"number-list","depth":0,"inlineStyleRanges":[{"offset":0,"length":4,"style":"BOLD"}],"entityRanges":[],"data":{"indentLevel":0,"parentKey":null,"numberListOrder":1}},{"key":"a61ub","text":"italic (ctrl + I / cmd + I)","type":"number-list","depth":0,"inlineStyleRanges":[{"offset":0,"length":6,"style":"ITALIC"}],"entityRanges":[],"data":{"indentLevel":0,"parentKey":null,"numberListOrder":2}},{"key":"8ia36","text":"Underline (ctrl + U /  cmd + U)","type":"number-list","depth":0,"inlineStyleRanges":[{"offset":0,"length":9,"style":"UNDERLINE"}],"entityRanges":[],"data":{"indentLevel":0,"parentKey":null,"numberListOrder":3}},{"key":"b7k3u","text":"Strikethrough (ctrl + shift + S / cmd + shift + S)","type":"number-list","depth":0,"inlineStyleRanges":[{"offset":0,"length":13,"style":"STRIKETHROUGH"}],"entityRanges":[],"data":{"indentLevel":0,"parentKey":null,"numberListOrder":4}},{"key":"5m3m8","text":"code (ctrl + E / cmd + E)","type":"number-list","depth":0,"inlineStyleRanges":[{"offset":0,"length":4,"style":"CODE"}],"entityRanges":[],"data":{"indentLevel":0,"parentKey":null,"numberListOrder":5}},{"key":"4e15l","text":"Inline math: ¡™¡                              (ctrl + shift + E / cmd + shift + E)","type":"number-list","depth":0,"inlineStyleRanges":[],"entityRanges":[{"offset":13,"length":32,"key":0}],"data":{"indentLevel":0,"parentKey":null,"numberListOrder":6}},{"key":"17e7o","text":"Hover on the math equation, there are something surprise!","type":"bullet-list","depth":0,"inlineStyleRanges":[{"offset":38,"length":18,"style":"ITALIC"},{"offset":38,"length":18,"style":"UNDERLINE"}],"entityRanges":[],"data":{"indentLevel":1,"parentKey":"4e15l"}},{"key":"l6n6","text":"Link (ctrl + K / cmd + K)","type":"number-list","depth":0,"inlineStyleRanges":[],"entityRanges":[{"offset":0,"length":4,"key":1}],"data":{"indentLevel":0,"parentKey":null,"numberListOrder":7}},{"key":"c4dk1","text":"Hover on the link, there are something surprise!","type":"bullet-list","depth":0,"inlineStyleRanges":[{"offset":29,"length":18,"style":"BOLD"}],"entityRanges":[],"data":{"indentLevel":1,"parentKey":"l6n6"}},{"key":"25gih","text":"Press alt on Windows or option on macOS to open the link directly","type":"bullet-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":1,"parentKey":"l6n6"}},{"key":"7lq92","text":"Colorful text","type":"number-list","depth":0,"inlineStyleRanges":[{"offset":0,"length":1,"style":"TEXTRED"},{"offset":1,"length":1,"style":"TEXTORANGE"},{"offset":2,"length":1,"style":"TEXTYELLOW"},{"offset":3,"length":1,"style":"TEXTGREEN"},{"offset":4,"length":1,"style":"TEXTBLUE"},{"offset":5,"length":1,"style":"TEXTPURPLE"},{"offset":6,"length":1,"style":"TEXTPINK"},{"offset":7,"length":1,"style":"TEXTBROWN"}],"entityRanges":[],"data":{"indentLevel":0,"parentKey":null,"numberListOrder":8}},{"key":"6plar","text":"Colorful background","type":"number-list","depth":0,"inlineStyleRanges":[{"offset":0,"length":1,"style":"BGRED"},{"offset":1,"length":1,"style":"BGORANGE"},{"offset":2,"length":1,"style":"BGYELLOW"},{"offset":3,"length":1,"style":"BGGREEN"},{"offset":4,"length":1,"style":"BGBLUE"},{"offset":5,"length":1,"style":"BGPURPLE"},{"offset":6,"length":1,"style":"BGPINK"},{"offset":7,"length":1,"style":"BGBROWN"}],"entityRanges":[],"data":{"indentLevel":0,"parentKey":null,"numberListOrder":9}},{"key":"6bhk0","text":"To make the text colorful, select some words on the editor, then a menu will popup. Just select the style that you want!","type":"bullet-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":1,"parentKey":"6plar"}},{"key":"3livi","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":0,"parentKey":null}}],"entityMap":{"0":{"type":"MATH","mutability":"IMMUTABLE","data":{"math":"E=mc^2"}},"1":{"type":"LINK","mutability":"MUTABLE","data":{"url":"http://www.google.com/"}}}}`;

// Test parentmap
// const testString = `{"blocks":[{"key":"feut4","text":"Block 1000","type":"toggle-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"toggleListToggle":true,"parentKey":null}},{"key":"7nf3n","text":"Block 1100","type":"toggle-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":1,"parentKey":"feut4","toggleListToggle":true}},{"key":"de85","text":"Block 1110","type":"toggle-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"parentKey":"7nf3n","indentLevel":2,"toggleListToggle":true}},{"key":"588h9","text":"Block 1111","type":"toggle-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"parentKey":"de85","indentLevel":3,"toggleListToggle":true}},{"key":"f7tim","text":"Block 1200","type":"toggle-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"parentKey":"feut4","indentLevel":1,"toggleListToggle":true}},{"key":"1b10k","text":"Block 1210","type":"toggle-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"parentKey":"f7tim","indentLevel":2,"toggleListToggle":true}},{"key":"bqs8b","text":"Block 1211","type":"toggle-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"toggleListToggle":true,"parentKey":"1b10k","indentLevel":3}},{"key":"7u9t8","text":"Block 1300","type":"toggle-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"parentKey":"feut4","indentLevel":1,"toggleListToggle":true}},{"key":"8l2cq","text":"Block 1310","type":"toggle-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"parentKey":"7u9t8","indentLevel":2,"toggleListToggle":true}},{"key":"4pb5u","text":"Block 1311","type":"toggle-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"parentKey":"8l2cq","indentLevel":3,"toggleListToggle":true}},{"key":"9fvc2","text":"Block 2000","type":"toggle-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"parentKey":null,"toggleListToggle":true}},{"key":"32v8c","text":"Block 2100","type":"toggle-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"parentKey":"9fvc2","indentLevel":1,"toggleListToggle":true}},{"key":"1offb","text":"Block 2110","type":"toggle-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"parentKey":"32v8c","indentLevel":2,"toggleListToggle":true}},{"key":"9jj3t","text":"Block 2200","type":"toggle-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"parentKey":"9fvc2","indentLevel":1,"toggleListToggle":true}},{"key":"c86u","text":"Block 2210","type":"toggle-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"parentKey":"9jj3t","indentLevel":2,"toggleListToggle":true}},{"key":"a3e55","text":"Block 3000","type":"toggle-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"parentKey":null,"indentLevel":0,"toggleListToggle":true}},{"key":"3ma6o","text":"Block 3100","type":"toggle-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"parentKey":"a3e55","indentLevel":1,"toggleListToggle":true}},{"key":"frvin","text":"Block 4000","type":"toggle-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"parentKey":null,"toggleListToggle":true}},{"key":"1g1l0","text":"Block 4100","type":"toggle-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"parentKey":"frvin","indentLevel":1,"toggleListToggle":true}},{"key":"im3b","text":"Block 5000","type":"toggle-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"parentKey":null,"indentLevel":0}},{"key":"85bm0","text":"Block 5100","type":"toggle-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"parentKey":"im3b","indentLevel":1}},{"key":"chscq","text":"QQQ","type":"toggle-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"parentKey":null,"indentLevel":0}}],"entityMap":{}}`;

const Geeke = () => {
  const dispatch = useDispatch();
  const dispatcher = new Dispatcher(dispatch, true);
  const editorMiscPages = useSelector((state) => state.editorMisc.pages);

  const fakePageUuid = '100';
  useEffect(() => {
    initPage(dispatch, fakePageUuid);
    dispatcher
      .add(initPage, fakePageUuid)
      .add(
        setEditorState,
        fakePageUuid,
        EditorState.createWithContent(trimNumberListInWholePage(convertFromRaw(JSON.parse(testString))), decorator),
      )
      .run();
    dispatcher.add(initPageMisc, fakePageUuid).run();
  }, []); // eslint-disable-line

  return (
    <div>
      {/* For debug convenience */}
      <div style={{ display: 'inline-block', width: '123px' }}></div>
      <div style={{ display: 'inline-block', width: '789px', outline: 'solid 1px black' }}>
        {editorMiscPages.has(fakePageUuid) ? <Page dataId={fakePageUuid} /> : null}
      </div>
    </div>
  );
};

export default Geeke;
