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

  Thulium = Class("Thulium")({
    prototype : {
      renderer : null,
      parser   : null,
      template : "",
      view     : "",

      init : function (config) {
        var tm = this;

        if (config) {
          Thulium.Util.extend(tm, config);
        }
      },

      parse : function (callback) {
        var tm = this;
        setTimeout(function (){
          tm._initParser();
          tm.parser.parse(function (tokens) {
            tm._tokens = tokens;
            if (callback) {
              callback();
            }
          });
        }, 0);
      },

      parseSync : function () {
        var tm = this;
        tm._initParser();
        tm._tokens = tm.parser.parseSync();
        return tm;
      },

      render : function (context, callback) {
        var tm = this;
        setTimeout(function (){
          tm._initRenderer(context);
          tm.renderer.render(function (view) {
            tm.view = view;
            if (callback) {
              callback(view);
            }
          });
        }, 0);
      },

      renderSync : function (context) {
        var tm = this;
        tm._initRenderer(context);
        tm.view = tm.renderer.renderSync();
        return tm.view;
      },

      _initParser : function () {
        if (!this.parser) {
          this.parser = new Thulium.Parser({
            template : this.template
          });
        }
      },

      _initRenderer : function (context) {
        if (!this.renderer) {
          this.renderer = new Thulium.Renderer({
            tokens : this._tokens,
            context : context
          });
        }
      }
    }
  });

  if (typeof global.exports !== "undefined") {
    Thulium.Util     = require("./Thulium/Util.js");
    Thulium.Parser   = require("./Thulium/Parser.js");
    Thulium.Renderer = require("./Thulium/Renderer.js");
    
    global.exports = Thulium;
  } else {
    global.Thulium = global.Tm = Thulium;
  }

}(typeof window !== 'undefined' ? window : (typeof module !== 'undefined' ? module : self)));
