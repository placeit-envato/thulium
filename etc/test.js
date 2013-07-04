repl = require('repl');

Tm = Thulium = require('thulium');
tm = Thulium.loadTemplateSync('etc/template.tm');
tm.render({i: 12, h: {testBlock : function(){ console.log("ran"); }}});

/*repl.start({
  prompt : "tm> ",
  input  : process.stdin,
  output : process.stdout
})*/
