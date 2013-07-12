fs = require("fs");
Thulium = require('thulium');

template = fs.readFileSync('etc/template.tm', {encoding : 'utf8'});
tm = new Thulium({template : template});
context = {i: 12, helpers: {
  embolden : function(fn){
    tm.renderer.print("<strong>");
    fn();
    return "</strong>";  
  },
  reverse : function(toCapture) {
    var buf = tm.renderer.capture(toCapture);

    return buf.split("").reverse().join("");
  }
}};

repl = require('repl');
repl.start({
  prompt : "tm> ",
  input  : process.stdin,
  output : process.stdout
})
