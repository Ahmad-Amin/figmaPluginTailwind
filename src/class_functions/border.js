const { borderRadiusMap, borderWidthMap } = require('../maps/maps');
const {RGBToHex} = require('../utils/util_functions');
const {colorMap} = require('../maps/maps');

//border radius
function getBorderRadiusClass(node){
    //the classes need to be like rounded-bl-3xl - rounded-md
    let topLeft = node.topLeftRadius;
    let topRight = node.topRightRadius;
    let bottomRight = node.bottomRightRadius;
    let bottomLeft = node.bottomLeftRadius;
    // console.log("_________", topLeft, topRight, bottomRight, bottomLeft)
    if(!(topLeft || topRight || bottomRight || bottomLeft)){
        return '';
    }

    let isLarge = topLeft>'24'?true:false;

    //Case 1: All radii are equal
    if(topLeft == topRight && topLeft == bottomRight && topLeft == bottomLeft){
        // console.log('')
        if(isLarge){
            return `rounded-full`;
        }
        return `rounded${borderRadiusMap[topLeft]}`;
    }

    return `border-tl${borderRadiusMap[topLeft]} border-tr${borderRadiusMap[topRight]} border-br${borderRadiusMap[bottomRight]} border-bl${borderRadiusMap[bottomLeft]}`;
}

function getBorderWidthClass(node){
    //get the border width property from the API
    //it lies in strokes
    if(!node.strokes || node.strokes.length == 0){
        return '';
    }
    return `border${borderWidthMap[node.strokeWeight]}`;
}

function getBorderColor(node){
    if(node.strokes.length > 0){
        let borderColor = node.strokes[0].color;
        return `border-${colorMap[RGBToHex(borderColor)]}`;
    }
}

module.exports = {
    getBorderRadiusClass,
    getBorderWidthClass,
    getBorderColor
}