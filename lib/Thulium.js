(function (global) {
  var Module, Class;

  // Load up dependencies
  if (typeof require === 'function') {
    var Ne = require('neon');
    Module = Ne.Module;
    Class = Ne.Class;
  } else {
    Module = global.Module;
    Class = global.Class;
  }

  var Thulium = {};

  Thulium.Parser = Class(Thulium, 'Parser')({
    prototype : {
      init : function (config) {
        var tm = this,
            property;

        if (config) {
          for (property in config) {
            co[property] = config[property];
          }
        }
      }
    }
  });

  if (typeof require === 'function') {
    global.Parser = Thulium.Parser;
  } else {
    global.Thulium = Thulium;
    globa.Tm = Thulium;
  }

}(typeof window !== 'undefined' ? window : (typeof module.exports !== 'undefined' ? module.exports : self)));
