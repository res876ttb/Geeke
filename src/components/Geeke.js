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
const testString = `{"blocks":[{"key":"3g302","text":"This is H1","type":"heading","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":0,"parentKey":null,"headingType":"h1"}},{"key":"btged","text":"This is normal text","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":0,"parentKey":null}},{"key":"s9eu","text":"This is H2","type":"heading","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":0,"parentKey":null,"headingType":"h2"}},{"key":"4molc","text":"This is normal text","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":0,"parentKey":null}},{"key":"em9ls","text":"This is H3","type":"heading","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":0,"parentKey":null,"headingType":"h3"}},{"key":"d27ls","text":"This is normal text","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[{"offset":8,"length":6,"key":0}],"data":{"indentLevel":0,"parentKey":null}},{"key":"7lqso","text":"This is H4","type":"heading","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":0,"parentKey":null,"headingType":"h4"}},{"key":"b8op1","text":"This is normal text","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[{"offset":0,"length":4,"key":1},{"offset":15,"length":4,"key":2}],"data":{"indentLevel":0,"parentKey":null}},{"key":"9l7q1","text":"This is H5","type":"heading","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":0,"parentKey":null,"headingType":"h5"}},{"key":"4quqe","text":"This is normal text with math equation ¡™¡ here!","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[{"offset":39,"length":3,"key":3}],"data":{"indentLevel":0,"parentKey":null}},{"key":"eb0eg","text":"This is H6","type":"heading","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":0,"parentKey":null,"headingType":"h6"}},{"key":"4gi3h","text":"This is normal text","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":0,"parentKey":null}},{"key":"ev4j8","text":"","type":"code","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":0,"parentKey":null,"headingType":1,"codeContent":"// This is a code block\\nconsole.log(\\"Hello world!\\");","codeLanguage":"javascript","codeTheme":"solarized_light"}},{"key":"feut4","text":"","type":"code","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"parentKey":null,"codeContent":"// This is another code block\\n#include<iostream>\\nint main() {\\n    std::cout << \\"Hello world!\\" << std::endl;\\n    return 0;\\n}\\n\\n// This is a very long comment, so it will take for two lines in this example if the wrapping feature is turned on.","codeLanguage":"c_cpp","codeTheme":"github","codeWrapping":true,"codeLineNumber":false}},{"key":"c7tr3","text":"This numbered list 1","type":"number-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"numberListOrder":1,"parentKey":null}},{"key":"3i7b3","text":"This numbered list 2","type":"number-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"numberListOrder":2,"parentKey":null}},{"key":"9bbfj","text":"This is numbered list 3","type":"number-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":1,"numberListOrder":1,"parentKey":"3i7b3"}},{"key":"1ljkf","text":"This is numbered list 4","type":"number-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":1,"numberListOrder":2,"parentKey":"3i7b3"}},{"key":"d54n0","text":"This is a normal list","type":"bullet-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":1,"parentKey":"3i7b3"}},{"key":"cqoo","text":"This is the second section of numbered list","type":"number-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":1,"numberListOrder":1,"parentKey":"3i7b3"}},{"key":"be498","text":"This is the second section of numbered list 2","type":"number-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":1,"numberListOrder":2,"parentKey":"3i7b3"}},{"key":"e6ppg","text":"This is normal text","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":0,"parentKey":null}},{"key":"6puud","text":"This is block 1","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"parentKey":null}},{"key":"4uump","text":"This is block 2","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":1,"parentKey":"6puud"}},{"key":"7tegj","text":"This is block 3","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":1,"parentKey":"6puud"}},{"key":"7cl1n","text":"This is block 4","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":2,"parentKey":"7tegj"}},{"key":"dn4hc","text":"This is block 5","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"parentKey":null}},{"key":"fhs2i","text":"This is toggle list 1","type":"toggle-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"parentKey":null}},{"key":"2cf43","text":"This is toggle list 2","type":"toggle-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"toggleListToggle":true,"parentKey":null}},{"key":"8idd4","text":"This is bullet list 1","type":"bullet-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":1,"parentKey":"2cf43"}},{"key":"9btli","text":"This is bullet list 2","type":"bullet-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":1,"parentKey":"2cf43"}},{"key":"45f6v","text":"This is bullet list 3","type":"bullet-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":2,"parentKey":"9btli"}},{"key":"2c9i4","text":"This is toggle list inside toggle list","type":"toggle-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":1,"toggleListToggle":false,"parentKey":"2cf43"}},{"key":"3vfhs","text":"This is check list 1","type":"check-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":0,"checkListCheck":true,"parentKey":null}},{"key":"5ur9n","text":"This is check list 2","type":"check-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":0,"parentKey":null}},{"key":"1960r","text":"This is check list 3","type":"check-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":1,"checkListCheck":true,"parentKey":"5ur9n"}},{"key":"368b5","text":"This is check list 4","type":"check-list","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":1,"parentKey":"5ur9n"}},{"key":"9cpdu","text":"This is the first line in a quote","type":"quote","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":0,"parentKey":null}},{"key":"fvl0h","text":"This is the second line in a quote","type":"quote","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":0,"parentKey":null}},{"key":"31sn9","text":"Text in a quote block is italic.","type":"quote","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":0,"parentKey":null}},{"key":"jjv1","text":"Text style is normal in a unstyled block.","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"indentLevel":0,"parentKey":null}}],"entityMap":{"0":{"type":"LINK","mutability":"MUTABLE","data":{"url":"http://www.google.com/"}},"1":{"type":"MATH","mutability":"IMMUTABLE","data":{"math":"This"}},"2":{"type":"MATH","mutability":"IMMUTABLE","data":{"math":"text"}},"3":{"type":"MATH","mutability":"IMMUTABLE","data":{"math":"E=mc^2"}}}}`;

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
