const  { colorMap,
    pixelToTailwind,
    fontPixelToTailwind,
    maxWidthPixelToTailwind,
    fontWeightMap, 
    fractionalPixelHaystack } = require('../maps/maps');

const {RGBToHex} = require('../utils/util_functions');

const { boxShadowMap } = require('../maps/boxShadow');        

function getBGColor(node){ 
    let bgColor, bgColorString;
    if(node.type != 'GROUP'){
        // console.log(node.type)
        if(node.fills){
            if(node.fills.length>0){
                bgColor = node.fills[0].color;
                bgColorString = JSON.stringify(bgColor);
                return `bg-${colorMap[RGBToHex(bgColor)]}`;
            }
        }else{  
            return '';
        }
    }
    return '';
}

const getFractionalWidth = (node) => {
    //---WIDTH---
    //only execute if the width/height > 384
    if(node.width<=384) return '';

    let parentWidth, width, nodeStartWidth, nodeEndWidth, widthPercentage;
    // parentHeight, height, nodeStartHeight, nodeEndHeight, heightPercentage;
    if(node.parent){
        parentWidth = node.parent.width;
        // parentHeight = node.parent.height;
    }
    width = node.width;
    // height = node.height;
    //calculate the width and height percentage
    widthPercentage = ((width/parentWidth).toFixed(2)*100);

    widthPercentage = fractionalPixelHaystack.reduce( (a, b) => {
        return Math.abs(a - widthPercentage) < Math.abs(b - widthPercentage) ? a : b;
    })
     
    widthPercentage += '%';

    let string;
    if(pixelToTailwind[widthPercentage]){
        string = `w-${pixelToTailwind[widthPercentage]}`
    }
    else{
        let maxWidth = checkForMaxWidth(width);
        if(maxWidth != false){
            string = `${maxWidth}`;
        }else{
            string = 'w-full'
        }
    }

    return string;
}

function checkForMaxWidth(width){
    let nodeWidth = width;
    let valueDeviation = [];
    // Checking the closest key from Max-width with respect to the width given;
    if(width <= 1280){
        let keysMaxWidth = Object.keys(maxWidthPixelToTailwind);
        keysMaxWidth.map(val => {
            valueDeviation.push(Math.abs(parseInt(val) - parseInt(nodeWidth)));
        });
        let finalIndex = valueDeviation.indexOf(Math.min(...valueDeviation));
        return maxWidthPixelToTailwind[keysMaxWidth[finalIndex]];
    }
    return false;
}

function getWidth(node){
    let w = Math.round(node.width, 1);
    if(w>384){
        return getFractionalWidth(node);
    }else if(w<=384){
        return pixelToTailwind[w]?`w-${pixelToTailwind[w]} `:'';
    }
    return ``;
}

function getHeight(node){
    let h = Math.round(node.height, 1);
    if(h>384){
        // return getFractionalHeight(node);
        return ``;
    }else if(h<=384){
        return pixelToTailwind[h]?`h-${pixelToTailwind[h]} `:'';
    }
    return ``;
}

//function for layouts of containers
function getLayout(node){
    let flex;
    let flexClasses = '';
    let layout = node.layoutMode;//gives vertical or horizontal
    if(layout){
        flexClasses=layout=='VERTICAL'?'flex flex-col items-center justify-center':'flex items-center justify-center';
        return flexClasses;
    }else {
        return '';
    }
}

//function for paddings
//TODO
function getPadding(node){
    let paddingX, paddingY;
    if(node && node.parent.children[1]){
        paddingX = node.parent.children[1].x - node.x; 
        // i.e. it acts like a container
    } 
    if(node.parent.children[1] && node){
        paddingY = node.parent.children[1].y - node.y ;
    }
    return `px-${pixelToTailwind[paddingX]?pixelToTailwind[paddingX]:''} py-${pixelToTailwind[paddingY]?pixelToTailwind[paddingY]:''}`;
}

// function for margins
function getMargin(node){
    //function for frames
    // let marginX, marginY;
    // //this margin is in the case when only one child
    // marginX = node.x - node.parent.x;
    // // marginXRight = node.parent.width - node.width - node.x;
    // marginY = node.y - node.parent.y;
    // return `mx-${pixelToTailwind[marginX]?pixelToTailwind[marginX]:''} my-${pixelToTailwind[marginY]?pixelToTailwind[marginY]:''}`;
    if(node.parent.chilren.length>1){//more than one child
    }
}

//TODO
// function getBorderRadius(node){
//     let radius = node.topLeftRadius;//assuming that all the radii are equal ... value in px
//     if (radius){
//         return borderRadiusMap[radius];
//     }
//     return '';
// }

function textClasses(node){
    // console.log(node.fills)
    let textColor;
    let textColorString;
    if(node.fills.length>0){
        textColor = node.fills[0].color;//gives an RGB value
        textColorString = JSON.stringify(textColor);
    }

    let fontSize = node.fontSize;
    let fontWeight;
    if(node.fontName){
        fontWeight = node.fontName.style?node.fontName.style:'';
    }

    //text align horizontal
    let horizontalAlignString = '';
    let horizontalAlignValue = node.textAlignHorizontal;
    switch(horizontalAlignValue){
        case 'LEFT':
            horizontalAlignString = 'text-left';
            break;
        case 'CENTER':
            horizontalAlignString = 'text-center';
            break;
        case 'RIGHT':
            horizontalAlignString = 'text-right';
            break; 
        default:
            horizontalAlignString = '';
    }

    //line height
    let lineHeightValue = node.lineHeight.value;
    let lineHeightString = pixelToTailwind[lineHeightValue];

    return `text-${colorMap[RGBToHex(textColor)]} ${fontPixelToTailwind[fontSize]} ${fontWeightMap[fontWeight]} ${horizontalAlignString} leading-${lineHeightString}`;
}  

//box shadow function
function getBoxShadow(node){
    //getting all the properties from the node to create a string and then mapping those properties to a single tailwind class
    let shadowEffectArray = [];
    if(node.effects){
        node.effects.forEach((effect, index) => {
            if(effect.type == 'DROP_SHADOW'){
                shadowEffectArray.push(effect);
            }
        });
    }
    // const shadowObject = node.effects[shadowEffectIndex];
    let shadowClassString = '';
    let shadowClass = '';
    shadowEffectArray.forEach(eff => {
            //properties
            //color is always 0 0 0 -> black
            let xOffset = eff.offset.x;
            let yOffset = eff.offset.y;
            let spread = eff.spread;
            let blur = eff.radius;
            let opacity = Math.round(eff.color.a * 100, 1)/100;
        
            shadowClassString = `${xOffset}_${yOffset}_${blur}_${spread}_${opacity}`;
    
            let howMuchClose = [];
            const ShadowKeys = Object.keys(boxShadowMap);

            ShadowKeys.map((v, i)=>{
                let result = closestPossibleShadow(shadowClassString, v);
                howMuchClose.push(result);
            })

            const finalIndex = howMuchClose.indexOf(Math.min(...howMuchClose));
            shadowClass =  boxShadowMap[ShadowKeys[finalIndex]];

    })
    return shadowClass;
}

function closestPossibleShadow(shadowClassString, v){
    let figmaShadowArray = shadowClassString.split('_');
    let tailwindShadowMap = v.split('_');
    let val = 0 
    for(let i=0; i<tailwindShadowMap.length; i++){
        val = val + (parseFloat(figmaShadowArray[i]) - parseFloat(tailwindShadowMap[i]));
    }
    return Math.abs(val);
}

module.exports = {
    getBGColor,
    getFractionalWidth,
    getWidth,
    getHeight,
    getLayout,
    textClasses,
    getPadding,
    getMargin,
    getBoxShadow
}