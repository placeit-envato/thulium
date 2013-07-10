repl = require('repl');

// Let's test the spying all up on this mf
require('etc/lithium/lithium.js');
Tm = Thulium = require('thulium');

// error engine.
Li.Engine.error.push(function executionEngine(data) {
  console.error(data);
});

Li.performance = [];
Li.nest = 0;

// Performance enginestuff
Li.Engine.before.push(function (data) {
    var perfObj = { 
        message : 'executing: ' + (data.spy.targetObject.className || data.scope.constructor.className) + '.' + data.spy.methodName, 
        nesting : window.top.Li.nest,
        startTime : window.top.performance.now()
    };
    window.top.Li.performance.push(perfObj);
    window.top.Li.nest++;
});

Li.Engine.after.push(function (data) {
    window.top.Li.nest--;
    perfObj = {
        message : 'executed: ' + (data.spy.targetObject.className || data.scope.constructor.className) + '.' + data.spy.methodName, 
        time : data.time, 
        nesting : window.top.Li.nest
    };

    window.top.Li.performance.push(perfObj);
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
