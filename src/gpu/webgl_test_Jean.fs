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
}` ;

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
      vec2 RM = R_pix - M_pix;
      vec2 LM = L_pix - M_pix;
      vec2 somme = RM + LM;

      return signe(somme[i]);


      // // Law of cosines
      // float angleM = acos( (pow(RM, 2.0) + pow(ML, 2.0) - pow(RL, 2.0) ) / (2.0*RM*ML));
      //
      // return angleM;

    }

    vec2 checkAdjacentRowCol(vec2 coord, vec2 onePixel, float rvalue, float bord, int next){
      //next is 1 or O and tell if we check row or col.
      // if we check all col then X is incremented at each turn then next is 0
      // and on the contrary next is 1 when it the rows that we want
      // Bord is 1.0 or 0.0
      vec2 new_extrem;
      vec2 next_coord;

      int i = abs(next - 1); // if next is Y we want i as X and contrary
      float signe = sign(bord*(-1.0) + 0.5); //  when bord=1.0 => signe= -1 AND bord=0.0 => signe=1

      next_coord[next] += onePixel[next];
      next_coord[i] = bord; // tell if we start at the botom or at the top of the image

      vec2 extrem_pixel = rowColExtremFinder(coord, onePixel, rvalue, signe, i); // extrem pixel is initialise first as the extrem pixel of the adjacent row or col

      next_coord[next] += onePixel[next];
      next_coord[i] = bord; // tell if we start at the botom or at the top of the image

      while (extrem_pixel != vec2(-1.0, -1.0) && (0.0 <= next_coord[next]  && next_coord[next] <= 1.0)){
        new_extrem = rowColExtremFinder(next_coord, onePixel, rvalue, signe, i);
        float orientation = getAngleOrientation(); // check the angle

        if (orientation != 0.0 && orientation != signe){
          extrem_pixel = new_extrem;

        next_coord[next] += onePixel[next];
        next_coord[i] = bord; // tell if we start at the botom or at the top of the image
      }

    }
    vec2 rowColExtremFinder(vec2 coord, vec2 onePixel, float rvalue, float signe, int i){
    //  coord est un pixel de la colonne appartenant au blob
    //  On cherche le max de la colonne
    // bord est les coord en y du pixel du bord soit 1.0 soit 0.0
    // Si on cherche regarde les pixels situé du bord inferieur jusqu'au premier pixel du blob donc le signe est -1 pour retirer un pixel chaque tour de while
    //  signe +1 pour aller de 0.0 jusqu'au premier pixel du blob
    // i 0 ou 1 correspon à la composante X ou Y du vec2 d donc si on regarde les lignes ou les colonnes

      vec2 extrem_pixel = vec2(-1.0, -1.0); // if not change then no pixel of blob in the line/col analysed

      while (0.0 <= coord[i]  && coord[i] <= 1.0){
        if (texture(u_raster, coord).r == rvalue) {
          extrem_pixel = coord;
          break;
        }
        coord[i] += signe * onePixel[i];
      }

      return extrem_pixel;
    }

    void main() {
        // vec2 st = vec2(v_texCoord.x, v_texCoord.y);
        // vec4(rand(st), rand(1.0-st), rand(st+1.0), 1.0);

        // compute 1 pixel in texture coordinates.
        vec2 onePixel = vec2(1.0, 1.0) / u_textureSize;
        float rvalue = texture(u_raster, v_texCoord).r; // r value of the analysed blob

        outColor = vec4(0.0, 0.0, 0.0, 1.0);;

        if(texture(u_raster, v_texCoord).r < 1.0){

          if(texture(u_raster, v_texCoord).r < 1.0 && texture(u_raster, v_texCoord + vec2(0.0, onePixel.y)).r == 1.0){
            vec2 colcoord = vec2(v_texCoord.x + onePixel.x, 0.0); // botom of next col
            vec2 maxdroite = rowColExtremFinder(colcoord, onePixel, rvalue, 1.0, 1);
            if (maxdroite.y > v_texCoord.y){
              outColor = vec4(1.0, 0.0, 0.0, 1.0);
            }

            else {
              outColor = vec4(0.0, 0.0, 0.0, 1.0);
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

        }


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
