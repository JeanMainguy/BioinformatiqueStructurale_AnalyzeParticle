/*
 *  TIMES: Tiny Image ECMAScript Application
 *  Copyright (C) 2017  Jean-Christophe Taveau.
 *
 *  This file is part of TIMES
 *
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,Image
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with TIMES.  If not, see <http://www.gnu.org/licenses/>.
 *
 *
 * Authors:
 * Jean-Christophe Taveau
 */

 /**
  * @module analyze
  */

  /**
   * Finds the objects in an image and return an object containing lists of coordinates such as :
   * o = {1:[[1, 1], [2, 1]], 2:[[4, 4]]}
   * 8-connected components
   * Implementing the algorithm from Chang et al. (2003) http://www.iis.sinica.edu.tw/papers/fchang/1362-F.pdf
   * The algorithm goes through the image one pixel at a time, from top left to bottom right. When it finds a black pixel, there are three possibilities :
   *          - The pixel is from an external contour
   *          - The pixel is from an internal contour
   *          - The pixel is not in a contour
   * In the first case, it means the pixel has a white unlabeled pixel above it. Then the function contourTracing is called, and will label the whole contour of the particule.
   * If the pixel is not in an external contour, and the pixel under it is white, then the same function as before, contourTracing, is called and will label the inner contour.
   * Finally, if the pixel does not belong to any contour, it simply takes the label from its left neighbor.
   *
   *
   *
   * @param {TImage} img - Input image
   * @param {boolean} copy - Copy mode
   * @return {type} A set of Regions Of Interest (ROI) as a list of lists of coordinates
   * @author Martin Binet
   */

  const labellingOnePass = function (img,copy=true) {

      function labelOuterContour(index){
        // Starts the tracer for the outer contour of the particule
          matrixLabel[index] = label;
          contourTracing(img_copy, w, h, [Math.floor(index/w), (index)%w], 7, matrixLabel, label);
          label++;
      }

      function labelInnerContour(index){
        // Starts the tracer for the inner contour of the particule
          checkPixel();
          contourTracing(img_copy, w, h, [Math.floor(index/w), (index)%w], 3, matrixLabel, pLabel);
      }

      function checkPixel(index){
        // If the pixel has no label, it gets the same as its left neighbor
          (pLabel === 0)? (
            pLabel = matrixLabel[index-1],
            matrixLabel[index] = matrixLabel[index-1]
          ) : null;
      }

    let w = img.width;
    let h = img.height;
    // Création d'une copie de l'image avec une ligne suplémentaire de pixels blanc au dessus
    // Creating a copy of the image with one extra row of white pixels on top
    let img_copy = Array.apply(null, Array(w)).map(Number.prototype.valueOf,0);
    img.getRaster().pixelData.forEach( value => img_copy.push(value));

    // Initialization of the label and the matrix containing it
    let label = 1;
    let matrixLabel = new Array(img.length + w).fill(0);

    img_copy.forEach( function(value, index) {
        pLabel = matrixLabel[index];
        (value === 255) ? (
          (img_copy[index-w] === 0 && pLabel === 0) ? (labelOuterContour(index)) : (
            (img_copy[index+w] === 0 && matrixLabel[index+w] != -1)? labelInnerContour(index) : checkPixel(index)
          )
        ) : null;
      });

      return matrixLabel;
  }

  /**
   * Starting from a pixel belonging to a contour, calls the tracer function in a loop, and checks at each iteration if two conditions are true :
   *          - The pixel returned by tracer is the same as the second pixel of the contour
   *          - The previous pixel that was returned by tracer is the same as the initial pixel
   * If both conditions are true, the function stops without returning anything.
   *
   *
   *
   * @param {TRaster} img - Input image
   * @param {int} w - width of the input image
   * @param {int} h - height of the input image
   * @param {Array} origin - Coordinates x and y of the first pixel of the contour
   * @param {int} angle - Angle at where to start looking for neighbor. This is used for the function tracer
   * @param {Array} matrixLabel - current matrix contening the labeled objects
   * @param {int} label - current label

   * @author Martin Binet
   */

  const contourTracing = function(img, w, h, origin, angle, matrixLabel, label){
    let second;
    let tmp;
    tmp = tracer(img, w, h, origin[0], origin[1], angle, matrixLabel);
    (tmp != null) ? (
      second = tmp.slice(1, 3),
      angle = (tmp[0] + 6) % 8) : null;
    let nextPixel = second;
    let previousPixel;
    while (second != null && !((JSON.stringify(origin) === JSON.stringify(previousPixel)) && (JSON.stringify(second) === JSON.stringify(nextPixel)))){
      previousPixel = nextPixel;
      tmp = tracer(img, w, h, nextPixel[0], nextPixel[1], angle, matrixLabel);
      (tmp != null) ? (
        nextPixel = tmp.slice(1, 3),
        angle = (tmp[0] + 6) % 8,
        matrixLabel[nextPixel[0] * w + nextPixel[1]] = label
      ) : null;
    }
  }

  /**
   * From a contour pixel, labels the next pixel in that contour and returns it
   * This function uses the following rotation matrix :
   * 5 6 7
   * 4   0
   * 3 2 1
   * Starting from the input angle, it cheks each neighbor pixel until it finds a black one.
   *
   * @param {TRaster} img - Input image
   * @param {int} w - width of the input image
   * @param {int} h - height of the input image
   * @param {int} i - x coordinate of the middle pixel
   * @param {int} j - y coordinate of the middle pixel
   * @param {int} angle - angle at which to start the rotation
   * @param {Array} matrixLabel - current matrix contening the labeled objects
   * @return {Array} An array containing the angle at which the next pixel was found and its coordinates
   * @author Martin Binet
   */
  const tracer = function(img, w, h, i, j, angle, matrixLabel = null){
    let rotationMatrixI = [0, 1, 1, 1, 0, -1, -1, -1];
    let rotationMatrixJ = [1, 1, 0, -1, -1, -1, 0, 1];
    let result = null;
    rotationMatrixI.forEach( function(element){
      (result === null) ? (
      nextI = i+rotationMatrixI[angle],
      nextJ = j+rotationMatrixJ[angle],
      (0 <= nextI && nextI <= h && 0 <= nextJ && nextJ < w ) ? (
        (img[nextI * w + nextJ] === 255) ? (
          result = [angle, nextI, nextJ]
        ) : (
          (matrixLabel != null) ? (
              matrixLabel[nextI * w + nextJ] = -1
          ) : null
        )
      ) : null,
      angle = (angle + 1) % 8
    ) : null;
    });
    return result;

  }

  /**
   * Label an image as a set of Regions Of Interest (ROI)
   *
   * @param {TRaster} img - Input image
   * @param {boolean} copy - Copy mode
   * @return {type} A set of Regions Of Interest (ROI)
   * @author Jean Mainguy
   */
  const labellingTwoPass = function (img,copy=true) {


    function label_pix (i, label_img, w, union_find) {

        let label_up = i-w < 0 ? 0 : label_img[i-w]; //store label of pixel above i. may bereal label or undefined/null
        let label_left = i % w == 0 ? 0 : label_img[i-1]; // store label of pixel right before i. may be real label or undefined/null

        let label_i = label_up !== 0 && label_left !== 0 ? ( //
                notify_union_find(label_up, label_left, union_find), //if the label up and label rigth are labbeled then the union find structure is notify
                label_up > label_left ? label_left : label_up  // label_i (label of the current pixel analysed) take the smalest label of the neigbor
            ) : (
                label_up == 0 && label_left == 0 ? (
                    new_label(union_find) // if the two the pixels up and left are backgrounf pixel then a new label is provided to label_i
                    ) : (
                    label_up == 0 ? label_left : label_up // and finally if the only one neighbor is label, label_i get this label
                        )
                );
        label_img[i] = label_i;
    }

    function notify_union_find(labelA, labelB, union_find){
        labelA < labelB ? (union_find[labelB] = union_find[labelA]) : (union_find[labelA] = union_find[labelB]);
    }

    function new_label(union_find){
        union_find.label_cmpt ++;
        union_find[union_find.label_cmpt] = union_find.label_cmpt;
        return union_find.label_cmpt;
    }


    let raster = img.getRaster();
    union_find = {label_cmpt:0, 0:0};

    let label_img = new Array(img.height*img.width); //empty array that will contain labels of the pixels
    label_img.fill(0);
    // First Pass
    raster.pixelData.forEach(function(pix, i){
      pix == 255 ? label_pix(i, label_img, raster.width, union_find) : undefined;
    });

    // Second Pass
    label_img = label_img.map((label, i) => union_find[label_img[i]]);

    label_raster = img.getRaster();
    label_raster.pixelData = label_img;


    return label_raster;
  }

  /**
   * Label an image as a set of Regions Of Interest (ROI)
   * Once the first pixel of a connected component is found, all the connected pixels of that connected component are labelled before going onto the next pixel in the image
   * @param {TImage} img - Input image
   * @param {boolean} copy - Copy mode
   * @return {Array} an Array of label
   * @author Rokhaya BA
   */
  const labellingOneComponent = function (img,copy=true) {

    const labelComponent = function(){
      while (pixelList.length != 0)
      {
        let index = pixelList[0]; // stores the index of the first pixel and then remove it from the pixel list
        pixelList.shift();
        let ind_up = index - width;
        let ind_down = index + width;
        let ind_right = ((index + 1) % width == 0) ? undefined : index + 1; // check if the pixel has a neighbour on the right
        let ind_left = (index % width == 0) ? undefined : index - 1; // check if the pixel has a neighbour on the left
        let indexList = [ind_up,ind_down,ind_right,ind_left];
        indexList.forEach(function(ind_neighbour)
        {
            (pixelArray[ind_neighbour] == 255 && labelData[ind_neighbour] == 0) ?
            (
          pixelList.push(parseInt(ind_neighbour)), // parseInt transform a string to int
          labelData[parseInt(ind_neighbour)] = label
        ) : null;
        });
      }
    }

      let raster = img.getRaster();
      let pixelArray = raster.pixelData;
      let pixelList = new Array(); // An empty array for keeping pixels
      let label = 1;
      let labelData = new Array(img.height*img.width).fill(0); // An empty array which stores labels for each pixel
      let width = img.width; //
      let length = pixelArray.length;
      pixelArray.forEach(function(elem,i)
      {
  	     (elem == 255 && labelData[i] == 0) ? (
    	    pixelList.push(i),
    	    labelData[i] = label,
          labelComponent(),
    	    label = label + 1
        ) : null;
  });

      return labelData;
  }

  const getListParticle = function(labbeled_raster){
    function getParticle(list_p, label, i ){
      return list_p = label < 1 ? (list_p) :(
      index = labels.indexOf(label),
      index != -1 ? label_array[index].push(labbeled_raster.xy(i)) : label_array.push([labbeled_raster.xy(i)]),
      list_p);
    }
    let label_list = new Array();
    let label_array = labbeled_raster.pixelData;
    let list_p = new Array();

    label_array.reduce(function(list_p, label, i){
      // console.log("label list", label_list);
      return list_p = label < 1 ? (list_p) :(
        // console.log("label",label , "  list_p", list_p, " "),
      index = label_list.indexOf(label),
      // console.log("index", index),
      index != -1 ? list_p[index].push(labbeled_raster.xy(i)) : (
                  list_p.push([labbeled_raster.xy(i)]),
                  label_list.push(label)),
      list_p);
    }, list_p);
    return list_p
  }

  /**
   * For each particule, takes the first pixel and create a chaincode of the boundary of the particule
   * Beside the matrixLabel, function the same way as contourTracing
   *
   * @param {Array} img - Labelised Image
   * @param {int} w - width of the input image
   * @param {int} h - height of the input image
   * @return {Array} First element is the coordinates of the starting pixel, the rests are angle values.

   * @author Martin Binet
   */
  const chainCode = function(img, particules, w, h){
      let chaincodes = new Array();
      let angle = 7;
      particules.forEach( function(elem){
          let origin = elem[0];
          //chaincodes.push(origin);
          let second;
          let tmp;
          tmp = tracer(img, w, h, origin[0], origin[1], angle);
          (tmp != null) ? (
            second = tmp.slice(1, 3),
            angle = (tmp[0] + 6) % 8) : null;
          let nextPixel = second;
          let previousPixel;
          while (second != null && !((JSON.stringify(origin) === JSON.stringify(previousPixel)) && (JSON.stringify(second) === JSON.stringify(nextPixel)))){
            previousPixel = nextPixel;
            tmp = tracer(img, w, h, nextPixel[0], nextPixel[1], angle);
            (tmp != null) ? (
              nextPixel = tmp.slice(1, 3),
              angle = (tmp[0] + 6) % 8,
              chaincodes.push(angle)
            ) : null;
          }
      })
      return chaincodes;
  }

  /**
   * Measure a set of Regions Of Interest (ROI)
   *
   * @param {type} params - Measurements Parameters (eg. Area, Centroid)
   * @param {type} roiset - A set of ROIs
   * @param {boolean} copy - Useless. Just here for compatibility
   * @return {type} Measurements and/or result image
   * @author TODO
   */
  // const measure = function (particules, params) {
  //     const headers_storage = {feretDiametefunction(particule)r : ["maxDiameter", "maxAngle", "minDiameter", "minProjection", "minAngle"],
  //               area : ["Area"],
  //               boundingRectangle : ["width", "height", "bx", "by"],
  //               centroid : ["CentroidX", "CentroidY"]}
  //       const headers = [params.reduce( (accu, elem) => accu.concat(headers_storage[elem.name]), [])];
  //   let lines = particules.map( function(particule){
  //        let result = params.map( function(param){
  //           return param.function(particule);
  //       });
  //       console.log(result);
  //       return result;
  //   });
  //   saveResults(headers.concat(lines));
  // }

  /**
   * Saves the data in a csv and offers to the user to download it
   *
   * @param {Array} rows - Measurements
   *
   * @author Imamudin Naseem//(StackOverFlow : https://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side)
   */
  const saveResults = function(rows){
      let csvContent = "data:text/csv;charset=utf-8,";
      rows.forEach(function(rowArray){
         let row = rowArray.join(",");
         csvContent += row + "\r\n"; // add carriage return
      });

      var encodedUri = encodeURI(csvContent);
      var link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "Measures.csv");
      document.body.appendChild(link); // Required for FF

      link.click(); // This will download the data file named "my_data.csv".
  }

  const findExtrem = function(particule){
    //particule is a list of coord
    let extrem = {xmin:particule[0][0], xmax:particule[0][0], ymin:particule[0][1], ymax:particule[0][1]};


    particule.reduce(function(extrem,coord){
      extrem.xmin = extrem.xmin > coord[0] ? coord[0] : extrem.xmin;
      extrem.xmax = extrem.xmax < coord[0] ? coord[0] : extrem.xmax;
      extrem.ymin = extrem.ymin > coord[1] ? coord[1] : extrem.ymin;
      extrem.ymax = extrem.ymax < coord[1] ? coord[1] : extrem.ymax;
      return extrem;
    }, extrem);
    return extrem;
}

  const area = function (particule){
    return particule.length;
  }
  const area_obj = {"name": "area", "function" : area}

  const centroid = function(particule){
    let Xs = particule.reduce( ((totalX, pixel) => totalX + pixel[0]), 0);
    let Ys = particule.reduce( ((totalY, pixel) => totalY += pixel[1]), 0);
    return ([Math.round(Xs / particule.length), Math.round(Ys / particule.length)]);
  }
  const centroid_obj = {"name": "centroid", "function" : centroid}

  const feretDiameter = function(particule){
      //let angles = chainCode(img, particules, w, h)
      let stepsize = 2.0 * (Math.PI/180.0);
      const rotation = [Math.cos(stepsize), Math.sin(stepsize)];//*(180 / Math.PI)];
      let directionsI = [0.0, 1.0, 1.0, 1.0, 0.0, -1.0, -1.0, -1.0];
      let directionsJ = [1.0, 1.0, 0.0, -1.0, -1.0, -1.0, 0.0, 1.0];
      let maxDiameter = -Infinity;
      let minDiameter = Infinity;
      let minProjection = Infinity;
      let maxAngle = 0;
      let minAngle = 0;
      for(let i=0;i <= 88;i+=1){
          let dir = particule.map( function(elem){
              return [directionsI[elem], directionsJ[elem]];
          });
          let x = 0.0;
          let y = 0.0;
          let coords = dir.map( function(elem, i){
              let result = (i === 0) ? elem : [x + elem[0], y + elem[1]];
              x += elem[0];
              y += elem[1];
              return result;
          });
          let extrems = findExtrem(coords);
          let size = [extrems.xmax - extrems.xmin + 1, extrems.ymax - extrems.ymin + 1];
          (maxDiameter < size[0]) ? (
              maxDiameter = size[0],
              maxAngle = i
          ) : null;
          (maxDiameter < size[1]) ? (
              maxDiameter = size[1],
              maxAnglCentroidXe = i + 90
          ) : null;
          (minDiameter > size[0]) ? (
              minDiameter = size[0],
              minProjection = size[1],
              minAngle = i
          ) : null;
          (minDiameter > size[1]) ? (
              minDiameter = size[1],
              minProjection = size[0],
              minAngle = i + 90
          ) : null;
          newDirectionsI = directionsI.map( function(elem, i){
              return elem * rotation[0] + directionsJ[i] * (rotation[1]);
          });
          newDirectionsJ = directionsJ.map( function(elem, i){
              return elem * rotation[1] - directionsI[i] * rotation[0];
          });
          directionsI = newDirectionsI;
          directionsJ = newDirectionsJ;
      }
      return [maxDiameter, maxAngle, minDiameter, minProjection, minAngle]
  }
  const feretDiameter_obj = {"name": "feretDiameter", "function" : feretDiameter};


  const boundingRectangle = function(particule){
    console.log("particule",particule);
    let extrem = {xmin:particule[0][0], xmax:particule[0][0], ymin:particule[0][1], ymax:particule[0][1]};


    particule.reduce(function(extrem,coord){
      extrem.xmin = extrem.xmin > coord[0] ? coord[0] : extrem.xmin;
      extrem.xmax = extrem.xmax < coord[0] ? coord[0] : extrem.xmax;
      extrem.ymin = extrem.ymin > coord[1] ? coord[1] : extrem.ymin;
      extrem.ymax = extrem.ymax < coord[1] ? coord[1] : extrem.ymax;
      return extrem;
    }, extrem);
    console.log("extrem", extrem);
    return [extrem.xmax-extrem.xmin+1, extrem.ymax-extrem.ymin+1, extrem.xmin, extrem.ymin]
  }
const boundingRectangle_obj = {"name": "boundingRectangle", "function" : boundingRectangle};
