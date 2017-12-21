const circularity = function(raster_labeled, particule)
{
const peri = perimeter(raster_labeled, particule);
//const peri = 3;
const area = particule.length;
console.log("area");
console.log(area);
const circu = ((4*Math.PI)*(area/Math.pow(peri, 2)));
return circu;
//console.log("circu");

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

//let img = new T.Image('uint8',10,10);
img.setPixels(data);
labbeled_raster = labellingTwoPass(img);

particules = getListParticle(labbeled_raster);
console.log(particules[1]);
console.log("circu");
circularity(labbeled_raster, particules[1]);
