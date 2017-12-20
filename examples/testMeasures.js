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

result = labellingTwoPass(img);

particle_list = [[[0,0],[0,1], [1,1], [1,0]]];

measure(particle_list, [boundingRectangle_obj, area_obj, centroid_obj, feretDiameter_obj]);
