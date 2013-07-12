(function (global) {
  var Ne,
      Thulium,
      Class;

  if (typeof require === "function") {
    Ne = require('neon');
    Class = Ne.Class,
    Module = Ne.Module;
  } else {
    Class  = global.Class,
    Module = global.Module;
  }

  Thulium = Class("Thulium")({});

  if (typeof global.exports !== "undefined") {
    Thulium.Util     = require("./Thulium/Util.js");
    Thulium.Parser   = require("./Thulium/Parser.js");
    Thulium.Renderer = require("./Thulium/Renderer.js");
    
    global.exports = Thulium;
  } else {
    global.Thulium = global.Tm = Thulium;
  }

}(typeof window !== 'undefined' ? window : (typeof module !== 'undefined' ? module : self)));