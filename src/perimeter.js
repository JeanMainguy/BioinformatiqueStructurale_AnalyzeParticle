const perimeter = function(raster_labeled, particule){
  const w = raster_labeled.width;
  const h = raster_labeled.height;
  chain_code = chainCode(raster_labeled.pixelData, particule, w, h);
  chain_code = [3,2,2,0,0,4,5,7,6];
  let cmpt = chain_code.reduce(function(accu, angle, i, chain){
  angle % 2 == 0 ? accu.even ++ : accu.odd ++;
  i_next = chain[i+1] === undefined ? 0 : i+1; // When we arrive at the last element of the chain the next one is the first one
  angle != chain[i_next] ? accu.corner ++ : accu.corner;
  return accu;
  }, {odd:0, even:0, corner:0})

  let perimeter = cmpt.odd*0.980 + cmpt.even*1.406 - cmpt.corner*0.091;
}


data = [
  0, 255, 255, 255, 255, 255, 0, 0, 0, 0,
  0, 255, 0, 0, 0, 255, 255, 0, 0, 0,
  0, 255, 255, 0, 0, 255, 255, 0, 0, 0,
  0, 255, 255, 255, 255, 255, 255, 0, 0, 0,
  0, 255, 255, 255, 255, 255, 255, 0, 0, 0,
  0, 255, 255, 255, 255, 255, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 255, 0, 0, 0, 0,
  0, 0, 0,   0,     0,  255, 255, 0, 0, 0,
  0, 0, 0,   255, 255,   0, 0, 0, 0, 0,
  0, 0, 255, 255, 0, 0, 0, 0, 0, 0];

let img = new T.Image('uint8',10,10);
img.setPixels(data);

labbeled_raster = labellingTwoPass(img);

particules = getListParticle(labbeled_raster);
console.log(particules[1]);

perimeter(labbeled_raster, particules[1])
//
// particle_list = [[[0,0],[0,1], [1,1], [1,0]]];
//
// measure(particle_list, [boundingRectangle_obj, area_obj, centroid_obj, feretDiameter_obj]);
