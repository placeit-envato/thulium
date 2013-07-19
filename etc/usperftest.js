fs = require("fs");
microtime = require('microtime');
var _ = require('etc/underscore.js');

template = fs.readFileSync('etc/template.tm', {encoding : 'utf8'});

var times = {
  eval : [],
  initparse : []
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

for (var i = 0; i < 10000; i++) {
  benchmark("initparse", function () {
    tm = _.template(template);
  });
  benchmark("eval", function () {
    tm(context);
  });
}

console.log("== RESULTS ==")
for (var prop in times) {
  max = Math.max.apply(null, times[prop]);
  min = Math.min.apply(null, times[prop]);
  avg = times[prop].reduce(function (a, b) { return a + b }) / times[prop].length;
  console.log(prop, "max", max, "min", min, "avg", avg);
}

