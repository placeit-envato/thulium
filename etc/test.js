repl = require('repl');

// Let's test the spying all up on this mf
require('etc/lithium/lithium.js');
Tm = Thulium = require('thulium');

// error engine.
Li.Engine.error.push(function executionEngine(data) {
  console.error(data);
});

Thulium.Parser.__objectSpy = new Li.ObjectSpy();
Thulium.Parser.__objectSpy.spy(Thulium.Parser);
Thulium.Parser.__objectSpy.spy(Thulium.Parser.prototype);

Thulium.Renderer.__objectSpy = new Li.ObjectSpy();
Thulium.Renderer.__objectSpy.spy(Thulium.Renderer);
Thulium.Renderer.__objectSpy.spy(Thulium.Renderer.prototype);

tm = Thulium.loadTemplateSync('etc/template.tm');
tm.render({i: 12, helpers: {embolden : function(fn){ tm.renderer.print("<strong>"); fn(); return "</strong>";  }}});

/*repl.start({
  prompt : "tm> ",
  input  : process.stdin,
  output : process.stdout
})*/
