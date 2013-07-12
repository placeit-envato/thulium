fs = require("fs");
Thulium = require('thulium');

var template = fs.readFileSync('etc/template.tm', {encoding : 'utf8'});

tm = new Thulium({template : template});

repl = require('repl');
repl.start({
  prompt : "tm> ",
  input  : process.stdin,
  output : process.stdout
})
