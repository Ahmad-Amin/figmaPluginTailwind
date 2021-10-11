const { flexMap,
        justifyMap,
        alignMap } = require('./maps/layoutMaps');


const { getValues, 
        getTailWindClasses,
        getSpacingFromParent } = require('./class_functions/layout.js');   

const { addBreakpointsClasses,
        addCustomClasses,
        addCustomInteractions,
        addTagName, 
        iter,
        changedBreakpoints,
        addedCustomClasses,
        addedCustomInteractions,
        addedTagName } = require('./utils/ui_functions');

const { getBorderRadiusClass,
        getBorderWidthClass,
        getBorderColor } = require('./class_functions/border');        


const { getBGColor,
        // getFractionalWidth,
        getWidth,
        getHeight,
        getLayout,
        textClasses,
        getPadding,
        getMargin,
        getBoxShadow } = require('./class_functions/classes');


//global variables
let tree = [];
let cc = '';

let bgExists;//a node with -bg in name

// this function will remove the values that are either undefined or have 0 number values
function removeGarbageValues(classString){
    let cleanString;
    // console.log(classString);

    let cleanStringArray = classString.split(' ');
    //finding the values that are either undefined or 0
    cleanStringArray.forEach((value, index) => {
        // console.log(value);
            let lastValue = value.split('-').reverse()[0];
            // const replaceString = '%';
            if(lastValue=='undefined' || lastValue==='0'){
                // value = value.split('-').slice(0, -1) + '-%';
                // cleanStringArray[index] = value;
                cleanStringArray[index] = "";
        }
    })
    cleanString = cleanStringArray.join(' ');
    return cleanString;
}

// function to Remove the Garbage Values from the Interactions Tab
function removeGarbageInteractions(val){
    let valArray = val.split(' '), finalArray = [];
    valArray.map((v, i) => { v.length <= 2 ? valArray.splice(i, 1) : null;})
    
    for(let i=0; i<valArray.length; i++){
        const ele = valArray[i];
        if(ele.indexOf(':') != (ele.length - 1)){
            finalArray.push(valArray[i]);
        }
    }
    return finalArray.join(' ');
}

function createTree(node, level){
    bgExists = false;

    if(!node) {
        return;
    }
    let node_name, parent_name, children;
    
    node_name = node.name;
    parent_name = node.parent?node.parent.name:null;
    // tree.push(node)

    let indent = '';
    for(var i = 0; i < level; i++){
        indent+='#';
    }

    //**** */
    let classString = '';

    if(node.children){
        children = node.children;

        const values = getValues(node);
        const flexString = getTailWindClasses(values);

        //if the thing is an image we use placeholder api for that
        if(node.fills.length >= 1){
            if(node.fills[0].type == "IMAGE"){
                let imgH = node.height;
                let imgW = node.width;
                //node is an image
    
                classString = `${addCustomInteractions(node)} ${addBreakpointsClasses(node)} ${addCustomClasses(node)} ${getBoxShadow(node)}`;
                cc+=`${indent}<img class='${removeGarbageValues(classString)}' src='https://via.placeholder.com/${imgW}x${imgH}'@ />\n`;
            
            }
        }

        classString = `${addCustomInteractions(node)} ${addBreakpointsClasses(node)} ${addCustomClasses(node)} ${getWidth(node)} ${getHeight(node)} ${getBGColor(node)} ${flexString} ${getBorderWidthClass(node)} ${getBorderColor(node)} ${getBorderRadiusClass(node)} ${getSpacingFromParent(node)} ${getBoxShadow(node)}`;
        cc += `${indent}<${addTagName(node)?addTagName(node):'div'} class='${removeGarbageValues(classString)}'>\n`; //${getLayout(node)}
        //${getPadding(node)}
        //getBGColor(node)} ${getFractionalWidth(node)}
 
        children.forEach(child => {
            // console.log(child.name)
            if(child.name.split('-')[1] == 'bg'){
                bgExists = true;
            }
        })
        // console.log('bg exists::', bgExists)
        let d = bgExists?level+2:level+1; //d = depth
        children.forEach(child => {
            createTree(child, d);
        })
        //this loop is for ending tags because otherwise the value of bgExists might be set to false 
        children.forEach(child => {
            // console.log(child.name)
            if(child.name.split('-')[1] == 'bg'){
                bgExists = true;
            }
        })

        //this piece of code provides the closing tags for rect nodes having -bg in their names.
        children.every(child => {
            if(child.name.split('-')[1] == 'bg'){
                cc += `${indent+'#'}</${addTagName(child)?addTagName(child):'div'}>\n`;
                return false
            }
        })

        cc += `${indent}</${addTagName(node)?addTagName(node):'div'}>\n`;
        return;
    }
    else {

        if(node.fills.length >= 1){
            if(node.fills[0].type == "IMAGE"){
                let imgH = node.height;
                let imgW = node.width;
                //node is an image
                classString = `${addCustomInteractions(node)} ${addBreakpointsClasses(node)} ${addCustomClasses(node)} ${getBoxShadow(node)}`;
                cc+=`${indent}<img class='${removeGarbageValues(classString)}' src='https://via.placeholder.com/${imgW}x${imgH}' />\n`;
            }
        }
        // if(node.name.split('-')[1]=='img'){
        //     let imgH = node.height;
        //     let imgW = node.width;
        //     //node is an image
        //     classString = `${addCustomInteractions(node)} ${addBreakpointsClasses(node)} ${addCustomClasses(node)} ${getBoxShadow(node)}`;
        //     cc+=`${indent}<img class='${removeGarbageValues(classString)}' src='https://via.placeholder.com/${imgW}x${imgH}' />\n`;
        // }
        //the node is either a text or a rectangular node
        if(node.type == 'RECTANGLE' && node.name.split('-')[1] == 'bg'){
            let bgIndent = indent.split('').splice(0, indent.length-1).join('');

            classString = `${addCustomInteractions(node)} ${addBreakpointsClasses(node)} ${addCustomClasses(node)} ${getBGColor(node)} ${getHeight(node)} ${getWidth(node)} ${getLayout(node)} ${getBorderWidthClass(node)} ${getBorderColor(node)} ${getBorderRadiusClass(node)} ${getSpacingFromParent(node)} ${getBoxShadow(node)}`;
            cc+=`${bgIndent}<${addTagName(node)?addTagName(node):'div'} class='${removeGarbageValues(classString)}'>\n`;
            //${getPadding(node)} ${getBGColor(node)}
        }
        if(node.type == 'RECTANGLE'){

            classString = `${addCustomInteractions(node)} ${addBreakpointsClasses(node)} ${addCustomClasses(node)} ${getBGColor(node)} ${getWidth(node)} ${getHeight(node)} ${getLayout(node)} ${getBorderWidthClass(node)} ${getBorderColor(node)} ${getBorderRadiusClass(node)} ${getSpacingFromParent(node)} ${getBoxShadow(node)}`;
            cc+=`${indent}<${addTagName(node)?addTagName(node):'div'} class='${removeGarbageValues(classString)}'></div>\n`;
            //${getPadding(node)}
        }
        if(node.type == 'TEXT'){
            if(node.characters){
                classString = `${addCustomInteractions(node)} ${addBreakpointsClasses(node)} ${addCustomClasses(node)} ${textClasses(node)} ${getSpacingFromParent(node)} ${getBoxShadow(node)}`;
                cc+=`${indent}<${addTagName(node)?addTagName(node):'p'} class='${removeGarbageValues(classString)}'>${node.characters.split('\n').join('&lt/br&gt')}</${addTagName(node)?addTagName(node):'p'}>\n`;
            }else{
                classString = `${addCustomInteractions(node)} ${addBreakpointsClasses(node)} ${addCustomClasses(node)} ${textClasses(node)} ${getSpacingFromParent(node)} ${getBoxShadow(node)}`;
                cc+=`${indent}<${addTagName(node)?addTagName(node):'p'} class='${removeGarbageValues(classString)}'></${addTagName(node)?addTagName(node):'p'}>\n`;
            }
        }
        return;
    }
}

function figmaToTailwind(selection){
    createTree(selection, 0);
    return cc;
}

function createTreeArray(node){
    tree.push(node)
    let chldrn = node.children;
    if(chldrn){
        chldrn.forEach(ch => {
            createTreeArray(ch);
        })
    }
}

figma.on('run', () => {

    const page = figma.currentPage;
    
    //resetting the variables
    let code;
    // tree = [];
    cc = ``;

    let selectedItem = figma.currentPage.selection[0];
    let selectedItemID;
    if(selectedItem){
        selectedItemID = selectedItem.id;
    }else{
        selectedItem = page.children[0];
        // console.log('selected item is:', selectedItem);
        selectedItemID = selectedItem.id;
    }


    // populating the maps for first time if no node is selected 
    createTreeArray(page.children[0])
    tree.forEach(el => {
        if(el.name.indexOf('(')>-1){ //breakpoints
            breakpointString = el.name.slice(el.name.indexOf('(')+1, el.name.indexOf(')'));
            //here we have 'sm:flex sm:flex-col' tec
            let breakpointsArr = breakpointString.split(' ');
            //here we have an array of indi classes
            breakpointsObj = {
                sm:'',md:'',lg:'',xl:'',_2xl:'',
            }
            breakpointsArr.forEach(e => { //e => class
                let splitWord = e.split(':')
                let cut = splitWord[0];
                let className = splitWord[1];
                switch(cut){
                    case 'sm':
                        breakpointsObj.sm += breakpointsObj.sm?breakpointsObj.sm+=className:className;
                        break;
                    case 'md':
                        breakpointsObj.md += className;
                        break;
                    case 'lg':
                        breakpointsObj.lg += className;
                        break;
                    case 'xl':
                        breakpointsObj.xl += className;
                        break;
                    case'2xl':
                        breakpointsObj._2xl += className;
                        break;
                }
            })
            //adding to the breakpoints map in case the breakpoints are not present beforeh
            breakpoints = breakpointsObj; 
            changedBreakpoints[el.id] = breakpointsObj; 
        }
        if(el.name.indexOf('[')>-1){
            customClassesString = el.name.slice(el.name.indexOf('[')+1, el.name.indexOf(']'));
    
            addedCustomClasses[el.id] = customClassesString;
            customClasses = customClassesString;
        }
        if(el.name.indexOf('<') > -1){
            customInteractionsString = el.name.slice(el.name.indexOf('<')+1, el.name.indexOf('>'));
            addedCustomInteractions[el.id] = customInteractionsString;
            customInteractions = customInteractionsString;
        }

        if(el.name.indexOf('{')>-1){
            tagNameString = el.name.slice(el.name.indexOf('{')+1, el.name.indexOf('}'));
    
            addedTagName[el.id] = tagNameString;
            tagName = tagNameString;
        }
    })

    // console.log('changed')
    let breakpointString, breakpointsObj, breakpoints;
    let customClassesString, customClasses, customClassesObj;
    let customInteractionsString, customInteractions, customInteractionsObj;
    let tagNameString, tagName, tagNameObj;

    //for sending the breakpoints of the selected node to the UI
    if(selectedItem.name.indexOf('(')>-1){
        breakpointString = selectedItem.name.slice(selectedItem.name.indexOf('(')+1, selectedItem.name.indexOf(')'));
        //here we have 'sm:flex sm:flex-col' tec
        let breakpointsArr = breakpointString.split(' ');
        //here we have an array of indi classes
        breakpointsObj = {
            sm:'',md:'',lg:'',xl:'',_2xl:'',
        }
        breakpointsArr.forEach(e => { //e => class
            let splitWord = e.split(':')
            let cut = splitWord[0];
            let className = splitWord[1];
            switch(cut){
                case 'sm':
                    breakpointsObj.sm += breakpointsObj.sm?breakpointsObj.sm+=className:className;
                    break;
                case 'md':
                    breakpointsObj.md += className;
                    break;
                case 'lg':
                    breakpointsObj.lg += className;
                    break;
                case 'xl':
                    breakpointsObj.xl += className;
                    break;
                case'2xl':
                    breakpointsObj._2xl += className;
                    break;
            }
        })
        // code = figmaToTailwind(selectedItem)

        //adding to the breakpoints map in case the breakpoints are not present beforeh
        breakpoints = breakpointsObj; 
        changedBreakpoints[selectedItemID] = breakpointsObj;
    }else{
        breakpointsObj = iter(changedBreakpoints, figma.currentPage.selection[0]?figma.currentPage.selection[0]:{})
        breakpoints = breakpointsObj.classes;   
    }

    //for sending the added custom classes (from the UI) back to the UI on selection change
    if(selectedItem.name.indexOf('[')>-1){
        customClassesString = selectedItem.name.slice(selectedItem.name.indexOf('[')+1, selectedItem.name.indexOf(']'));

        addedCustomClasses[selectedItemID] = customClassesString;
        customClasses = customClassesString;
    }
    else{
        customClassesObj = iter(addedCustomClasses, figma.currentPage.selection[0]?figma.currentPage.selection[0]:{})
        customClasses = customClassesObj.customClasses;   
    }

    //for sending the added custom Interactions (from the UI) back to the UI on selection change
    if(selectedItem.name.indexOf('<') > -1){
        customInteractionsString = selectedItem.name.slice(selectedItem.name.indexOf('<')+1, selectedItem.name.indexOf('>'));
        addedCustomInteractions[selectedItemID] = customInteractionsString;
        customInteractions = customInteractionsString;
    }else{
        customInteractionsObj = iter(addedCustomInteractions, figma.currentPage.selection[0] ? figma.currentPage.selection[0] : {});
        customInteractions = customInteractionsObj.customInteractions;
    }

    //for sending the tag name (from the UI) back to the UI on selection change
    if(selectedItem.name.indexOf('{')>-1){
            tagNameString = selectedItem.name.slice(selectedItem.name.indexOf('{')+1, selectedItem.name.indexOf('}'));
    
            addedTagName[selectedItemID] = tagNameString;
            tagName = tagNameString;
    }
    else{
            tagNameObj = iter(addedTagName, figma.currentPage.selection[0]?figma.currentPage.selection[0]:{})
            tagName = tagNameObj.tagName;   
    }
    if(selectedItem){
        code = figmaToTailwind(selectedItem);
    }else{
        code = figmaToTailwind(page.children[0]);
    }

    figma.ui.postMessage({code, selectedItemID, breakpoints, customClasses, tagName, customInteractions});
})

// selection change event listener --- the callback runs whenever we select something different from figma
figma.on('selectionchange', () => {

    const page = figma.currentPage;
    
    //resetting the variables
    let code;
    tree = [];
    cc = ``;
    let selectedItem = figma.currentPage.selection[0];
    let selectedItemID;

    if(selectedItem){
        selectedItemID = selectedItem.id;
    }else{
        selectedItem = page.children[0];
        selectedItemID = selectedItem.id;
    }

    // console.log('changed')
    let breakpointString, breakpointsObj, breakpoints;
    let customClassesString, customClasses, customClassesObj;
    let customInteractionsString, customInteractions, customInteractionsObj;
    let tagNameString, tagName, tagNameObj;

    //for sending the breakpoints of the selected node to the UI
    if(selectedItem.name.indexOf('(')>-1){
        breakpointString = selectedItem.name.slice(selectedItem.name.indexOf('(')+1, selectedItem.name.indexOf(')'));
        //here we have 'sm:flex sm:flex-col' tec
        let breakpointsArr = breakpointString.split(' ');
        //here we have an array of indi classes
        breakpointsObj = {
            sm:'',md:'',lg:'',xl:'',_2xl:'',
        }
        breakpointsArr.forEach(e => { //e => class
            let splitWord = e.split(':')
            let cut = splitWord[0];
            let className = splitWord[1];
            switch(cut){
                case 'sm':
                    breakpointsObj.sm += breakpointsObj.sm?breakpointsObj.sm+=className:className;
                    break;
                case 'md':
                    breakpointsObj.md += className;
                    break;
                case 'lg':
                    breakpointsObj.lg += className;
                    break;
                case 'xl':
                    breakpointsObj.xl += className;
                    break;
                case'2xl':
                    breakpointsObj._2xl += className;
                    break;
            }
        })
        // code = figmaToTailwind(selectedItem)

        //adding to the breakpoints map in case the breakpoints are not present beforeh
        breakpoints = breakpointsObj; 
        changedBreakpoints[selectedItemID] = breakpointsObj;
    }else{
        breakpointsObj = iter(changedBreakpoints, figma.currentPage.selection[0]?figma.currentPage.selection[0]:{})
        breakpoints = breakpointsObj.classes;   
    }

    //for sending the added custom classes (from the UI) back to the UI on selection change
    if(selectedItem.name.indexOf('[')>-1){
        customClassesString = selectedItem.name.slice(selectedItem.name.indexOf('[')+1, selectedItem.name.indexOf(']'));
        addedCustomClasses[selectedItemID] = customClassesString;
        customClasses = customClassesString;
    }
    else{
        customClassesObj = iter(addedCustomClasses, figma.currentPage.selection[0]?figma.currentPage.selection[0]:{})
        customClasses = customClassesObj.customClasses;   
    }

    //for sending the added custom Interactions (from the UI) back to the UI on selection change
    if(selectedItem.name.indexOf('<') > -1){
        customInteractionsString = selectedItem.name.slice(selectedItem.name.indexOf('<') +1, selectedItem.name.indexOf('>'));
        addedCustomInteractions[selectedItemID] = customInteractionsString;
        customInteractions = customInteractionsString;
    }else{
        customInteractionsObj = iter(addedCustomInteractions, figma.currentPage.selection[0] ? figma.currentPage.selection[0] : {});
        customInteractions = customInteractionsObj.customInteractions;
    }

    //for sending the tag name (from the UI) back to the UI on selection change
    if(selectedItem.name.indexOf('{')>-1){
            tagNameString = selectedItem.name.slice(selectedItem.name.indexOf('{')+1, selectedItem.name.indexOf('}'));
    
            addedTagName[selectedItemID] = tagNameString;
            tagName = tagNameString;
    }
    else{
            tagNameObj = iter(addedTagName, figma.currentPage.selection[0]?figma.currentPage.selection[0]:{})
            tagName = tagNameObj.tagName;   
    }
    if(selectedItem){
        code = figmaToTailwind(selectedItem);
    }else{
        code = figmaToTailwind(page.children[0]);
    }

    figma.ui.postMessage({code, selectedItemID, breakpoints, customClasses, tagName, customInteractions});
})

figma.showUI(__html__, {width: 648, height: 700, title:'Figma to Tailwind'});

figma.ui.onmessage = message => {
    if(message.category=='breakpoints'){
        //this message should have a format {node-id: added-classes}
        let key = message.nodeID;
        let value = message.classes;
        //value is now an object that contains 5 breakpoint classes 
        changedBreakpoints[key] = value;
        // console.log(changedBreakpoints);
        cc = ``
        // tree=[]
        let changedCode = figmaToTailwind(figma.currentPage.selection[0]?figma.currentPage.selection[0]:figma.currentPage.children[0]);

        let breakpointsObj = iter(changedBreakpoints, figma.currentPage.selection[0]?figma.currentPage.selection[0]:{})
        let breakpoints = breakpointsObj.classes;
        figma.ui.postMessage({code: changedCode, selectedItemID: key, breakpoints})
    }
    else if(message.category=='customClasses'){
        
        let key = message.nodeID;       // Getting the NodeId comming from ui.html file (Contains Current Slected Node id)
        let value = message.customClasses;  // Getting the classes parent from ui.html file

        addedCustomClasses[key] = value;  // An obj that contains the mapping of (nodeID --> addedClasses);
        console.log(addedCustomClasses);
        cc = ``
        
        let changedCode = figmaToTailwind(figma.currentPage.selection[0]?figma.currentPage.selection[0]:figma.currentPage.children[0]);
        let customClassObj = iter(addedCustomClasses, figma.currentPage.selection[0]?figma.currentPage.selection[0]:{})

        let customClasses = customClassObj.classes;
        figma.ui.postMessage({code: changedCode, selectedItemID: key, customClasses})
    }
    else if(message.category == 'customInteractions'){
        let key = message.nodeID;       // Getting the NodeId comming from ui.html file (Contains Current Slected Node id)
        let value = message.customInteractions; //Getting the classes parent from ui.html file


        let newVal = removeGarbageInteractions(value);

        addedCustomInteractions[key] = newVal;   // An obj that contains the mapping of (nodeID --> addedInteractions);
        cc = ``;    

        let changedCode = figmaToTailwind(figma.currentPage.selection[0] ? figma.currentPage.selection[0] : figma.currentPage.children[0]);
        let customInteractionObj = iter(addedCustomInteractions, figma.currentPage.selection[0] ? figma.currentPage.selection[0] : {});

        let customInteractions = customInteractionObj.classes;
        figma.ui.postMessage({code: changedCode, selectedItemID: key, customInteractions});
    }
    else if(message.category=='tagName'){
        let key = message.nodeID;
        let value = message.tagName;

        addedTagName[key] = value;
        // console.log(addedTagName)
        cc = ``
        // tree=[]
        let changedCode = figmaToTailwind(figma.currentPage.selection[0]?figma.currentPage.selection[0]:figma.currentPage.children[0]);

        let addedTagNameObj = iter(addedTagName, figma.currentPage.selection[0]?figma.currentPage.selection[0]:{})
        let tagName = addedTagNameObj.classes;
        figma.ui.postMessage({code: changedCode, selectedItemID: key, tagName})
    }
}

