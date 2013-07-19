fs = require("fs");
microtime = require('microtime');
Thulium = require('thulium');

template = fs.readFileSync('etc/template.tm', {encoding : 'utf8'});

var repetitions = 10000;

var times = {
  parse : [],
  render_init : [],
  render_render : [],
  render_eval : [],
  init : []
}
var currentTime, min, max, avg, tm;

var benchmark = function (type, fn) {
  currentTime = microtime.now();
  fn();
  times[type].push(microtime.now() - currentTime)
}

var context = {i: 12, helpers: {
  embolden : function(fn){
    fn();
  },
  reverse : function(toCapture) {
    toCapture();
  }
}};


for (var i = 0; i < repetitions; i++) {
  benchmark("init", function () {
    tm = new Thulium({template : template});
  });
  benchmark("parse", function () {
    tm.parseSync();
  });
  benchmark("render_init", function () {
    tm._initRenderer(context);
  });
  benchmark("render_render", function () {
    tm.renderer._render();
  });
  benchmark("render_eval", function () {
    tm.renderer._evaluate();
  });
}

console.log("== RESULTS ==")
for (var prop in times) {
  max = Math.max.apply(null, times[prop]);
  min = Math.min.apply(null, times[prop]);
  avg = times[prop].reduce(function (a, b) { return a + b }) / times[prop].length;
  console.log(prop, "max", max, "min", min, "avg", avg);
}
