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
 * Label an image as a set of Regions Of Interest (ROI)
 *
 * @param {TRaster} img - Input image
 * @param {boolean} copy - Copy mode
 * @return {type} A set of Regions Of Interest (ROI)
 * @author Jean Mainguy
 */
const labelling = function (img,copy=true) {


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
 * Measure a set of Regions Of Interest (ROI)
 *
 * @param {type} params - Measurements Parameters (eg. Area, Centroid)
 * @param {type} roiset - A set of ROIs
 * @param {boolean} copy - Useless. Just here for compatibility
 * @return {type} Measurements and/or result image
 * @author Jean Mainguy
 */
const measure = function (params) {
  return function (roiset,copy=true) {
    // TODO
    console.log(`measure ${params}`);
    return new TMeasurements();
  }
}


const convert_index_to_xy_particle = function (labbeling_img, raster){
    function is_background(index){
        return index != 0;
    }
    function add_xy_to_dict(index, label){

        listparticle.hasOwnProperty(label) ? ( listparticle[label].push(raster.xy(index)) ):( listparticle[label] =  new Array(raster.xy(index)));
    }


    // let listparticle = new Object();
    let listparticle = new Object();
    labbeling_img.forEach(function(label, index){
        // console.log(label);
        // console.log(listparticle);
        label != 0 ? add_xy_to_dict(index, label, raster) : undefined;
    })
    return listparticle;
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
    console.log("label list", label_list);
    return list_p = label < 1 ? (list_p) :(
      console.log("label",label , "  list_p", list_p, " "),
    index = label_list.indexOf(label),
    console.log("index", index),
    // if (index == -1){
    //   console.log("index is -1 donc on ajoute une nouevlle list à label_array");
    //   list_p.push([labbeled_raster.xy(i)])
    // }
    // else{
    //   list_p[index].push(labbeled_raster.xy(i))
    // }
    index != -1 ? list_p[index].push(labbeled_raster.xy(i)) : (
                list_p.push([labbeled_raster.xy(i)]),
                label_list.push(label)),
    list_p);
  }, list_p);
  // for (let i; i<label_array.length; i++){
  //   if (label_array)
  // };
  return list_p
}



const area = function (particule){
  return particule.reduce( (number) => number+=1);
}

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
  return {width:extrem.xmax-extrem.xmin+1, height:extrem.ymax-extrem.ymin+1, bx:extrem.xmin, by:extrem.ymin }
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
  return extrem
}

const show = function(result, h, w){
    let line = "";
    let show = "";
    for(let i=0;i<(h*w);i++){

        if(i % w == 0){
            console.log(line);
            console.log('  ______________')
            line = "";
            // console.log(i);
        }
        if( result[i] == undefined){
            show = 'X';
        }
        else{
            show = result[i];
        }
        line += "   " + show;
    }
    console.log(line);
}
