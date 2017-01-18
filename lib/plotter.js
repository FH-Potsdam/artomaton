const util = require('util');
const EventEmitter = require('events').EventEmitter;
const five = require('johnny-five');
const board = new five.Board({repl: false});
const step = 1;

var exports = module.exports = {};

// let boardReady = false;
let initDone = false;
let calibrateX = null;
let calibrateY = null;
let stepperX = null;
let stepperY = null;
let buttonX = null;
let buttonY = null;


function Plotter() {
  EventEmitter.call(this);
  let self = this;
  // setTimeout(function() {
  //   console.log('Board is ready after 5000 sec');
  //   self.emit('board-ready');
  // }, 5000);
  board.on('ready', function() {
    // stepperX = new five.Stepper({
    //   type: five.Stepper.TYPE.DRIVER,
    //   stepsPerRev: 200,
    //   pins: [11, 13]
    // });
    // stepperY = new five.Stepper({
    //   type: five.Stepper.TYPE.DRIVER,
    //   stepsPerRev: 200,
    //   pins: [3, 4]
    // });
    buttonX = new five.Button({
      pin: 3,
      isPullup: true
    });

    buttonX.on('down', function(value) {
      clearInterval(calibrateX);
    });
    self.emit('board-ready');
  });
}

util.inherits(Plotter, EventEmitter);

Plotter.prototype.calibrate = function() {
  let obj = {};
  let self = this;
  this.on('board-ready', function() {


    console.log('Done calibration for x:y');
    self.emit('ready', obj);
  });
};

/**
 * Should be called once on startup to calibrate
 * the axis
 */
// exports.calibrate = function () {
//   // move the x and y axis to 0/0
//   // needs 2 buttons and stepper control
//   // calibrateX = setInterval(function() {
//   //   stepperX.step({steps: 1, direction: 1}, function() {
//   //     console.log('Tick');
//   //   });
//   // }, 100);
//   console.log('Done calibrating');
// };
/**
 * [goto description]
 * @param  {[type]} x [description]
 * @param  {[type]} y [description]
 * @return {[type]}   [description]
 */
// exports.goto = function(x, y) {
//   console.log(`x: ${x} y:${y}`);
// };

/**
 * [updown description]
 * @param  {[type]} up [description]
 * @return {[type]}    [description]
 */
// exports.updown = function (up) {
//   if(up === true) {
//     console.log('Pen Up');
//     // servo move to pos 1
//   }else{
//     console.log('Pen Down');
//     // servo move to pos 2
//   }
// };

/**
 * [lineFromTo description]
 * @param  {[type]} x1 [description]
 * @param  {[type]} y1 [description]
 * @param  {[type]} x2 [description]
 * @param  {[type]} y2 [description]
 * @return {[type]}    [description]
 */
// exports.lineFromTo = function (x1, y1, x2, y2) {
//   console.log('from');
//   this.goto(x1, y1);
//   console.log('to');
//   this.goto(x2, y2);
// };
//
module.exports = Plotter;
