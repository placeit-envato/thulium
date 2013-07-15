(function (global) {
  var Ne;

  if (typeof require === "function") {
    Ne = require('neon');
    var Class = Ne.Class, Module = Ne.Module;
  } else {
    var Class = global.Class, Module = global.Module;
  }

  var Thulium = {};

  /*
   * A set of utility functions we use all the time
   */
  Thulium.Util = Module(Thulium, 'Util')({

    /* An implementation of the most implemented function in JS
     * Extends the object to with the properties of object from
     */
    extend : function (to, from) {
      var prop;

      for (prop in from) {
        to[prop] = from[prop];
      }
    },

    /*
     * Sanitizes text so it works proper inside JS strings
     */
    sanitize : function (text) {
      text = text.replace(/\\/g, "\\\\");
      text = text.replace(/\n/g, "\\n");
      text = text.replace(/"/g, "\\\"");

      return text;
    }
  });

  if (typeof global.exports !== "undefined") {
    global.exports = Thulium.Util;
  } else {
    global.Thulium.Util = Thulium.Util;
  }

}(typeof window !== 'undefined' ? window : (typeof module !== 'undefined' ? module : self)));
