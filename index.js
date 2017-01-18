/**
 * using arduino mega
 */

const Plotter = require('./lib/plotter');

const plotter = new Plotter();

plotter.on('ready', function(obj) {
  console.log(obj);
  console.log('Plotter is ready');

});

plotter.calibrate();
