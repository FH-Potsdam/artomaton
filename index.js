/**
 * using arduino mega
 */

const Plotter = require('./lib/plotter');

const plotter = new Plotter();
plotter.calibrate();

plotter.on('calibrated', function() {
  console.log('Plotter is ready');
  let coords = [
    [10, 20], [1000, 4000], [50, 10], [1000, 5000]
  ];
  plotter.penUp(false);
  plotter.goto(coords[0]);
  plotter.penUp(true);
});

plotter.on('done', function(str) {
  console.log(str);
});

