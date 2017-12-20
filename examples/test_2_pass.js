console.log("labelling 2 pass");

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
let win0 = new T.Window('Binary');
let view0 = T.view(img.getRaster());
// Create the window content from the view
win0.addView(view0);
// Add the window to the DOM and display it
win0.addToDOM('workspace');

result = labelling(img);

// for(let i=0;i<result.length;i++){
//     if (result[i] == undefined){
//         result[i] = 0;
//     }
// }
console.log("RESULT ");
console.log(result);

console.log(getListParticle(result));
// let particle_list = convert_index_to_xy_particle(result, img.getRaster());
// particule_list = Object.values(particle_list);
// console.log("LENGTH particule list",particule_list.length);
// console.log(particle_list);
// for(let i=0; i<particule_list.length; i++){
//     // console.log(particle_list[i]);
// //     // console.log(particle_list[k]);
//     console.log(i, particle_list[i].length);
// }
//
// console.log("LENGTH", Object.keys(particle_list).length);
// console.log("AREA");
// // console.log(area(particle_list[1]));
// console.log(particle_list[1]);
// console.log(particle_list[1].length);
//
// console.log(boundingRectangle(particle_list[1]));


// show(result, img.height, img.width)
// result = result.map(function(i){i*50})
// show(result, img.height, img.width)
let img_result = new T.Image('uint8',img.width,img.height);
// result.fill(0xff1994e4)
img_result.setPixels(result);
let win1 = new T.Window('Binary result');
let view1 = T.view(img_result.getRaster());
console.log(img_result.getRaster().pixeData);
// Create the window content from the view
win1.addView(view1);
// Add the window to the DOM and display it
win1.addToDOM('workspace');
// show(result, img.height, img.width)


// let win1 = new T.Window('Labbeling');
// let view1 = T.view(img.getRaster());
// Create the window content from the view
// win0.addView(view0);
// // Add the window to the DOM and display it
// win0.addToDOM('workspace');


// data = [
//   0, 255, 255, 255, 255, 255, 0, 0, 0, 0,
//   0, 255, 0, 0, 0, 255, 255, 0, 0, 0,
//   0, 255, 255, 0, 0, 255, 255, 0, 0, 0,
//   0, 255, 255, 255, 255, 255, 255, 0, 0, 0,
//   0, 255, 255, 255, 255, 255, 255, 0, 0, 0,
//   0, 255, 255, 255, 255, 255, 0, 0, 0, 0,
//   0, 0, 0, 0, 0, 255, 0, 0, 0, 0,
//   0, 0, 0, 0, 0, 255, 255, 0, 0, 0,
//   0, 0, 0, 255, 255, 0, 0, 0, 0, 0,
//   0, 0, 255, 255, 0, 0, 0, 0, 0, 0];
//
// let img;
// img = new T.Image('uint8',10,10);


// img.setPixels(data);


console.log(findExtrem([[1,5], [6,8], [-87,51]]));
