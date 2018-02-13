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

let img = new T.Image('uint8',200,100);
img.setPixels(new Uint8ClampedArray(particlesROIinv_pixels));
// let img = new T.Image('uint8',20,10);
// img.setPixels(new Uint8ClampedArray(test_line10x20));


raster = img.getRaster();
let view = cpu.view(raster);
// Create the window content from the view
let win = new T.Window(`Particles`);
win.addView(view);
// Add the window to the DOM and display it
win.addToDOM('workspace');

let gpuEnv = gpu.getGraphicsContext();

let src_vs = `#version 300 es
    in vec2 a_vertex;
    in vec2 a_texCoord;
    uniform vec2 u_resolution;
    out vec2 v_texCoord;

    void main() {
        v_texCoord = a_texCoord;
        vec2 clipSpace = a_vertex * u_resolution * 2.0 - 1.0;
        gl_Position = vec4(clipSpace * vec2(1.0, -1.0), 0.0, 1.0);
}`;

let src_fs = `#version 300 es
    precision mediump float;
    in vec2 v_texCoord;

    uniform sampler2D u_raster;
    uniform vec2 u_textureSize;



    // Declare an output for the fragment shader
    out vec4 outColor;

    float getAngleOrientation(vec2 R_pix, vec2 M_pix, vec2 L_pix, int i){
      // R est le pixel de droite, M le pixel du milieu et L le pixel de Gauche
      //On cherche le signe de la composante Y de la somme du vecteur MR et ML si on regarde les colonne
      // ou le signe de la composante X si on regarde les lignes
      // vec2 RM = R_pix - M_pix;
      // vec2 LM = L_pix - M_pix;
      // vec2 somme = RM + LM;
      // return sign(somme[i]);
      float RM = R_pix[i] - M_pix[i];
      float LM = L_pix[i] - M_pix[i];
      float somme = RM + LM;
      return sign(somme);

    }

    vec2 rowColExtremFinder(vec2 coord, vec2 onePixel, float rvalue, float signe, int i){
    //  coord est un pixel de la colonne appartenant au blob
    //  On cherche le max de la colonne
    // bord est les coord en y du pixel du bord soit 1.0 soit 0.0
    // Si on cherche regarde les pixels situé du bord inferieur jusqu'au premier pixel du blob donc le signe est -1 pour retirer un pixel chaque tour de while
    //  signe +1 pour aller de 0.0 jusqu'au premier pixel du blob
    // i 0 ou 1 correspon à la composante X ou Y du vec2 d donc si on regarde les lignes ou les colonnes

      vec2 extrem_pixel = vec2(-1.0, -1.0); // if not change then no pixel of blob in the line/col analysed

      int cpt = 0;

      while (0.0 <= coord[i]  && coord[i] <= 1.0){
        cpt =+ 1;

        if (texture(u_raster, coord).r == rvalue) {
          extrem_pixel = coord;
          return extrem_pixel;
        }

        coord[i] = signe * onePixel[i] + coord[i];

      }
      return extrem_pixel;
    }

    vec2 checkAdjacentRowCol(vec2 coord, vec2 onePixel, float rvalue, float bord, int next, float direction){
      //next is 1 or O and tell if we check row or col.
      // if we check all col then X is incremented at each turn then next is 0
      // and on the contrary next is 1 when it the rows that we want
      // Bord is 1.0 or 0.0
      // direction tell if we go on the left or on the right
      // -1.0 if left and 1.0 if right
      vec2 new_extrem;
      vec2 next_coord = coord;
      float orientation;

      int i = abs(next - 1); // if next is Y we want i as X and contrary
      float signe = sign(bord*(-1.0) + 0.5); //  when bord=1.0 => signe= -1 AND bord=0.0 => signe=1

      next_coord[next] = onePixel[next]*direction + next_coord[next];

      next_coord[i] = bord; // tell if we start at the botom or at the top of the image
      // vec2 extrem_pixel = rowColExtremFinder(coord, onePixel, rvalue, 1.0, 1);
      // if (next_coord == vec2(coord[next] + onePixel[next]*direction, bord)){

      vec2 extrem_pixel = rowColExtremFinder(next_coord, onePixel, rvalue, signe, i); // extrem pixel is initialise first as the extrem pixel of the adjacent row or col
      if (extrem_pixel[next] == -1.0){
          return extrem_pixel;
      }
      next_coord[next] += onePixel[next]*direction;
      next_coord[i] = bord; // tell if we start at the botom or at the top of the image

      while (0.0 <= next_coord[next]  && next_coord[next] <= 1.0){
        new_extrem = rowColExtremFinder(next_coord, onePixel, rvalue, signe, i);
        if (new_extrem == vec2(-1.0, -1.0)){
          break;
        }
        orientation = getAngleOrientation(coord, extrem_pixel, new_extrem, i); // check the angle
        // orientation = sign(orientation);
        // orientation= -1.0, 0.0, 1.0
        // it tell the orientation of the angle between coord => eextrem_pixel => new_extrem
        // to see if coord xan be linked direcly to new_extrem, if so new_extrem become the new
        if (orientation != signe){ // diff de signe ou bien == 0.0 on définit le nouveau extrem comme l'extrem_pixel
          extrem_pixel = new_extrem;
        }

        next_coord[next] += onePixel[next]*direction;
        next_coord[i] = bord; // tell if we start at the botom or at the top of the image
      }


    return   extrem_pixel;
  }

    void main() {
        // vec2 st = vec2(v_texCoord.x, v_texCoord.y);
        // vec4(rand(st), rand(1.0-st), rand(st+1.0), 1.0);

        // compute 1 pixel in texture coordinates.
        vec2 onePixel = vec2(1.0, 1.0) / u_textureSize;
        float rvalue = texture(u_raster, v_texCoord).r; // r value of the analysed blob

        outColor = vec4(v_texCoord[1]+0.5, v_texCoord[1]+0.5, v_texCoord[1]+0.5, 1.0);

          // if(texture(u_raster, v_texCoord).r < 1.0 && texture(u_raster, v_texCoord + vec2(0.0, onePixel.y)).r == 1.0){
          if(rvalue < 1.0 && texture(u_raster, v_texCoord + vec2(onePixel[0], 0.0)).r != rvalue){
            outColor = vec4(1.0, 0.0, 0.0, 1.0);
            float bord = 1.0; // because the current pixel has no blob pixel at Y+1 then we start looking for blob from 1.0 in the next colonne
            int next = 1; // because we are looking for pixel  in the next colonnes then we add 1 to X. And X is indice 0.

            // Find Extrem to the right
            float direction = 1.0;
            vec2 extrem_pixelR = checkAdjacentRowCol(v_texCoord, onePixel, rvalue, bord, next, direction);
            // Find Extrem to the left
            direction = -1.0;
            vec2 extrem_pixelL = checkAdjacentRowCol(v_texCoord, onePixel, rvalue, bord, next, direction);

            // ADJUST WEIRD SHIFTTING
            if (extrem_pixelR.y  < v_texCoord.y + onePixel.y/2.0 && extrem_pixelR.y > v_texCoord.y - onePixel.y/2.0){
              extrem_pixelR.y = v_texCoord.y;
            }
            if (extrem_pixelL.y  < v_texCoord.y + onePixel.y/2.0 && extrem_pixelL.y > v_texCoord.y - onePixel.y/2.0){
              extrem_pixelL.y = v_texCoord.y;
            }

            // Orientation of extem_pixelR, currentPicel and  extem_pixelR
            int i = 1; // because we are looking for extrml in the colonne so in Y so we xant the Y composante of the vector
            // float  orientation = -1.0;
            float orientation = getAngleOrientation(extrem_pixelL , v_texCoord,  extrem_pixelR, i);

            if (orientation < 0.0){
              outColor = vec4(0.0, 0.0, 1.0, 1.0);
            }
            if (orientation == 0.0){
              outColor = vec4(0.0, 1.0, 0.0, 1.0);
            }
            if (orientation > 0.0){
              outColor = vec4(1.0, 1.0, 0.0, 1.0);
            }
            // WHEN THERE IS NO OTHER PIXEL OF THE BLOB ON ONE SIDE OF THE CURRENT pixel
            // The function rowColExtremFinder give an extrem value of -1.0
            // Then an extrem value of -1.0 means that the current pixel is a vertex of the convexHull
            // true only if we deal with 4 connected pixel
            if (extrem_pixelL.y == -1.0){
              outColor = vec4(1.0, 0.0, 0.0, 1.0);
            }

            if (extrem_pixelR.y == -1.0){
              outColor = vec4(1.0, 0.0, 0.0, 1.0);
            }


          }

          // if(texture(u_raster, v_texCoord).r < 1.0 && texture(u_raster, v_texCoord - vec2(0.0, onePixel.y)).r == 1.0){
          //     outColor = vec4(1.0, 0.0, 0.0, 1.0);
          // }
          // if(texture(u_raster, v_texCoord).r < 1.0 && texture(u_raster, v_texCoord + vec2(onePixel.x, 0.0)).r == 1.0){
          //     outColor = vec4(1.0, 1.0, 5.0, 1.0);
          // }
          // if(texture(u_raster, v_texCoord).r < 1.0 && texture(u_raster, v_texCoord - vec2(onePixel.x,0.0)).r == 1.0){
          //     outColor = vec4(1.0, 0.5, 0.5, 1.0);
          // }

        // }


        // outColor = vec4(rand(st) - texture(u_raster, v_texCoord).rgb, 1.0);
        // if(v_texCoord.x>0.5){
        //     outColor = texture(u_raster, v_texCoord);
        // }
}` ;

let program = gpu.createProgram(gpuEnv,src_vs,src_fs);

w = raster.width;
h = raster.height;

let gproc = gpu.createGPU(gpuEnv,w,h);

gproc.geometry(gpu.rectangle(raster.width,raster.height));

// gproc.geometry({
//     type : 'TRIANGLE_STRIP',
//     num : 4,
//     vertices : new Float32Array([
//         0.0,0.0,0.0,0.0,
//         0.0,h  ,0.0,1.0,
//         w  ,0.0,1.0,0.0,
//         w  ,h  ,1.0,1.0])
// })


gproc.attribute('a_vertex',2,'float', 16,0)   // X, Y
    .attribute('a_texCoord',2, 'float', 16, 8)  // S, T
    .packWith(program)                         // VAO
gproc.texture(raster,0) ;


gproc.clearCanvas([0.0,1.0,0.0,1.0]);

gproc.preprocess()
    .uniform('u_resolution',
            new Float32Array([1.0/w,1.0/h]))
        .uniform('u_raster',0)
        .uniform('u_textureSize', new Float32Array([w, h]));

gproc.run();


// gpu.invert(img.getRaster(),gpuEnv);
