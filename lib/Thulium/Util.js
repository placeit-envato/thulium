(function (global) {
  var Ne;

  if (typeof require === "function") {
    Ne = require('neon');
    var Class = Ne.Class, Module = Ne.Module;
  } else {
    var Class = global.Class, Module = global.Module;
  }

  var Thulium = {};

  Thulium.Util = Module(Thulium, 'Util')({
    extend : function (to, from) {
      var prop;

      for (prop in from) {
        to[prop] = from[prop];
      }
    },

    sanitize : function (text) {
      text = text.replace(/\\/g, "\\\\");
      text = text.replace(/\n/g, "\\n");
      text = text.replace(/"/g, "\\");

      return text;
    }
  });

  if (typeof global.exports !== "undefined") {
    global.exports = Thulium.Util;
  } else {
    global.Thulium.Util = Thulium.Util;
  }

}(typeof window !== 'undefined' ? window : (typeof module !== 'undefined' ? module : self)));
