// Complex class

var Complex = function(x, y) {
  this.re = x;
  this.im = y;
};

Complex.prototype.add = function(other) {
  return new Complex(this.re + other.re, this.im + other.im);
};

Complex.prototype.subtract = function(other) {
  return new Complex(this.re - other.re, this.im - other.im);
};

Complex.prototype.magnitude = function() {
  return Math.sqrt(Math.pow(this.re, 2.0) + Math.pow(this.im, 2.0));
};

Complex.prototype.scale = function(scalar) {
  return new Complex(this.re * scalar, this.im * scalar);
};

Complex.prototype.normalize = function() {
  var magnitude = this.magnitude();
  return new Complex(this.re / magnitude, this.im / magnitude);
}; 

Complex.prototype.multiply = function(other) {
  return new Complex(this.re * other.re - this.im * other.im, this.re * other.im + this.im * other.re);
};

Complex.prototype.toString = function() {
  return this.re + (this.im >= 0 ? " + " : " -") + Math.abs(this.im) + "i";
}

// Newton crap

var NewtonFractalRenderer = function(width, height) {
  this.zeroes = [];
  this.canvasWidth = width;
  this.canvasHeight = height;
  this.viewport = {
    left: -1,
    right: 1,
    bottom: 1,
    top: -1
  };
};

NewtonFractalRenderer.prototype.fromCanvasToPlane = function(x, y) {
  var plane_x = this.viewport.left + (this.viewport.right - this.viewport.left) * (x / this.canvasWidth);
  var plane_y = this.viewport.top + (this.viewport.bottom - this.viewport.top) * (y / this.canvasHeight);
  return new Complex(plane_x, plane_y);
};

NewtonFractalRenderer.prototype.addZero = function(c) {
  this.zeroes.push(c);
};

NewtonFractalRenderer.prototype.initHandlers = function() {
  var currentThis = this;
  $("#simulation-canvas").click(function(e) {
    var in_plane = currentThis.fromCanvasToPlane(e.clientX, e.clientY);
    console.log(in_plane.toString());
  });
};

var nfr = new NewtonFractalRenderer(256, 256);
nfr.initHandlers();