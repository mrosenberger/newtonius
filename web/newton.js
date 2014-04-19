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
  return Math.sqrt(this.re * this.re + this.im * this.im);
};

Complex.prototype.relativeMagnitude = function() {
  return this.re * this.re + this.im + this.im;
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

Complex.prototype.conjugate = function() {
  return new Complex(this.re, -this.im);
};

Complex.prototype.divide = function(other) {
  var divisor = other.magnitude();
  var real_part = (this.re * other.re + this.im * other.im) / divisor;
  var imaginary_part = (-this.re * other.im + this.im * other.re) / divisor;
  return new Complex(real_part, imaginary_part);
};

Complex.prototype.toString = function() {
  return this.re + (this.im >= 0 ? " + " : " -") + Math.abs(this.im) + "i";
}

// Newton crap

var NewtonFractalRenderer = function(width, height) {
  this.zeroes = [];
  this.zeroes_colors = [];
  this.canvasWidth = width;
  this.canvasHeight = height;
  this.viewport = {
    left: -1,
    right: 2,
    bottom: -3,
    top: 4
  };
};

NewtonFractalRenderer.prototype.fromCanvasToPlane = function(x, y) {
  var plane_x = this.viewport.left + (this.viewport.right - this.viewport.left) * (x / this.canvasWidth);
  var plane_y = this.viewport.top + (this.viewport.bottom - this.viewport.top) * (y / this.canvasHeight);
  return new Complex(plane_x, plane_y);
};

NewtonFractalRenderer.prototype.addZero = function(zero, color) {
  this.zeroes.push(zero);
  this.zeroes_colors.push(color);
};

NewtonFractalRenderer.prototype.initHandlers = function(element) {
  var currentThis = this;
  element.click(function(e) {
    var in_plane = currentThis.fromCanvasToPlane(e.clientX, e.clientY);
    console.log("Adding zero: " + in_plane.toString());
    currentThis.addZero(in_plane);
    console.log("Now have " + currentThis.zeroes.length + " zeroes.");
  });
};

NewtonFractalRenderer.prototype.function_p = function(z) {
  var accum = new Complex(1, 0);
  _.each(this.zeroes, function(zero) {
    accum = accum.multiply(z.subtract(zero));
  });
  return accum;
};

NewtonFractalRenderer.prototype.function_p_prime = function(z) {
  var mult_accum = new Complex(1, 0);
  var add_accum = new Complex(0, 0);
  for (var i=0; i < this.zeroes.length; i++) {
    for (var j=0; j < this.zeroes.length; j++) {
      if (i != j) {
        mult_accum = mult_accum.multiply(z.subtract(this.zeroes[j]));
      }
    }
    add_accum = add_accum.add(mult_accum);
    mult_accum = new Complex(1, 0);
  }
  return add_accum;
};

NewtonFractalRenderer.prototype.iterateOnce = function(z) {
  return z.subtract(this.function_p(z).divide(this.function_p_prime(z)));
};

NewtonFractalRenderer.prototype.iterate = function(z, iterations) {
  console.log("Beginning iteration of '" + z.toString() + "'...");
  for (var i=0; i < iterations; i++) {
    z = this.iterateOnce(z);
    console.log(z.toString());
  }
  return z;
};

NewtonFractalRenderer.prototype.nearestZero = function(z) {
  if (this.zeroes.length == 0) return {color: "black", zero: new Complex(0, 0)};
  var min_distance = 1000000000;
  var min_index = -1;
  for (var i=0; i < this.zeroes.length; i++) {
    var current = this.zeroes[i];
    var rm = z.subtract(current).relativeMagnitude();
    if (rm <= min_distance) {
      min_distance = rm;
      min_index = i;
    }
  }
  return {color: this.zeroes_colors[min_index], zero: this.zeroes[min_index]};
};

NewtonFractalRenderer.prototype.redraw = function(context, iterations) {
  var dx = (this.viewport.right - this.viewport.left) / this.canvasWidth;
  var dy = (this.viewport.bottom - this.viewport.top) / this.canvasHeight;
  for (var pix_x=0; pix_x < this.canvasWidth; pix_x++) {
    for (var pix_y=0; pix_y < this.canvasHeight; pix_y++) {
      console.log(pix_x + ", " + pix_y);
      var pos_x = dx * pix_x + this.viewport.left;
      var pos_y = this.viewport.bottom - dy * pix_y;
      var z = new Complex(pos_x, pos_y);
      console.log(z.toString());
      //z = this.iterate(z, iterations);
      //var nearest = this.nearestZero(z);
      //console.log("Nearest zero: " + nearest.zero.toString());
      //console.log("Nearest color: " + nearest.color.toString());
      //context.fillStyle = nearest.color;
      //context.fillRect(pix_x, pix_y, pix_x+1, pix_y+1);
    }
  }
};

var nfr = new NewtonFractalRenderer(32, 32);

nfr.addZero(new Complex(-1, 0), "red");
nfr.addZero(new Complex(1, 0), "green");

var canvas_element = $("#simulation-canvas");
nfr.initHandlers(canvas_element);

var context = canvas_element[0].getContext("2d");
nfr.redraw(context, 10);
