repl = require('repl');

Tm = Thulium = require('thulium');

repl.start({
  prompt : "tm> ",
  input  : process.stdin,
  output : process.stdout
})
