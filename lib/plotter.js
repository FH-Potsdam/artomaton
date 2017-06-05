const util = require('util');
const EventEmitter = require('events').EventEmitter;
const five = require('johnny-five');
const mockFirmata = require('mock-firmata');
const board = new five.Board({
  repl: false,
  debug: true,
  io: new mockFirmata.Firmata()
});
// console.log(board);
// process.exit();
const step = 1;
const calibrationInterval = 10;
const servoUpAngle = 50;
const servoDownAngle = 120;


let currentLocation = [];
let calibrateXtimer = null; // will hold the timer for calibrating X
let calibrateYtimer = null; // will hold the timer for calibrating Y
let calibratedX = false;
let calibratedY = false;
let stepperX = null;
let stepperY = null;
let buttonX = null;
let buttonY = null;
let penServo = null;


function Plotter() {
  EventEmitter.call(this);
  let self = this;

  board.on('ready', function() {
    stepperX = new five.Stepper({
      type: five.Stepper.TYPE.DRIVER,
      stepsPerRev: 200,
      pins: [11, 13]
    });
    stepperY = new five.Stepper({
      type: five.Stepper.TYPE.DRIVER,
      stepsPerRev: 200,
      pins: [3, 4]
    });
    buttonX = new five.Button({
      pin: 49,
      isPullup: true
    });
    buttonY = new five.Button({
      pin: 47,
      isPullup: true
    });

    penServo = new five.Servo({
      pin: 8,
      startAt: servoUpAngle
    });

    buttonX.on('down', function(value) {
      clearInterval(calibrateXtimer);
      calibratedX = true;
      self.isCalibrated();
      self.emit('done', 'x-axis-calibrated');


    });
    buttonY.on('down', function(value) {
      clearInterval(calibrateYtimer);
      calibratedY = true;
      self.isCalibrated();
      self.emit('done', 'y-axis-calibrated');
    });
    self.emit('board-ready');
  });
}

util.inherits(Plotter, EventEmitter);

/**
 * Should be called once on startup to calibrate
 * the axis
 */

Plotter.prototype.isCalibrated = function () {

  if(calibratedY === true && calibratedX === true) {
    currentLocation = [0, 0];
    console.log('Plotter is calibrated');
    this.emit('calibrated');
  }

};
Plotter.prototype.calibrate = function() {
  this.on('board-ready', function() {
    console.log('Calibration start');
  // move the x and y axis to 0/0
  // needs 2 buttons and stepper control
    calibrateXtimer = setInterval(function() {
      stepperX.step({steps: 1, direction: 1}, function() {
        // console.log('Tick X');
      });
    }, calibrationInterval);
    calibrateYtimer = setInterval(function() {
      stepperY.step({steps: 1, direction: 1}, function() {
        // console.log('Tick Y');
      });
    }, calibrationInterval);
  });
};

/**
 * [goto description]
 * @param  {[type]} x [description]
 * @param  {[type]} y [description]
 * @return {[type]}   [description]
 */
Plotter.prototype.goto = function(xy) {
  let self = this;
  const cx = currentLocation[0];
  const tx = xy[0];
  const cy = currentLocation[1];
  const ty = xy[1];
  stepperX.step({steps: Math.abs(cx - tx), direction: cx > tx ? 1 : 0}, function() {
    console.log(`X done goto ${tx} from ${cx} by ${Math.abs(cx - tx)} in ${cx > tx ? 'CCW' : 'CW'}}`);
    self.emit('gotox');
  });
  stepperY.step({steps: Math.abs(cy - ty), direction: cy > ty ? 1 : 0}, function() {
    console.log(`Y done goto ${ty} from ${cy} by ${Math.abs(cy - ty)} in ${cy > ty ? 'CCW' : 'CW'}}`);
    self.emit('gotoy');
  });
  console.log(`x: ${xy[0]} y:${xy[1]}`);
  currentLocation = xy;
  this.emit('done', 'goto');
};

/**
 * [penUp description]
 * @param  {[type]} up [description]
 * @return {[type]}    [description]
 */
Plotter.prototype.penUp = function (up) {
  if(up === true) {
    console.log('Pen Up');
    penServo.to(servoUpAngle);
    // servo move to pos 1
  }else{
    console.log('Pen Down');
    // servo move to pos 2
    penServo.to(servoDownAngle);
    this.emit('penDown');
  }
  this.emit('done', 'penup');
};

/**
 * [lineFromTo description]
 * @param  {[type]} x1 [description]
 * @param  {[type]} y1 [description]
 * @param  {[type]} x2 [description]
 * @param  {[type]} y2 [description]
 * @return {[type]}    [description]
 */
Plotter.prototype.drawLine = function (xy1, xy2) {
  console.log('from');
  this.goto(xy1);
  console.log('to');
  this.goto(xy2);
  this.emit('done', 'line');
};

Plotter.prototype.drawPolygon = function(coordinates) {
  let self = this;
  this.goto(coordinates[0]);
  this.penUp(false);
  // this.on('penDown', function() {
  for(var i = 1; i < coordinates.length; i++) {
    this.goto(coordinates[i]);
  }
  // });
  this.penUp(true);
  this.emit('done', 'polygon');
};
module.exports = Plotter;
