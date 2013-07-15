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

  /*
   * Main interface class for thulium.
   * Wraps the parser and renderer, because you didn't want to deal
   * with those guys anyways.
   */
  Thulium = Class("Thulium")({
    prototype : {
      renderer : null,                // Instance of the renderer
      parser   : null,                // Instance of the parser
      template : "",                  // Our template source
      view     : "",                  // Our template output

      /*
       * Extends and initializes an instance of Tm
       */
      init : function (config) {
        var tm = this;

        if (config) {
          Thulium.Util.extend(tm, config);
        }
      },

      /*
       * Initiates a parser, and has it parse our sweet sweet template
       * Async style: Executes callback if available.
       */
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

      /*
       * Initiates a parser, and has it parse our sweet sweet template
       * Sync style: Returns the instance back, because chaining!
       */
      parseSync : function () {
        var tm = this;
        tm._initParser();
        tm._tokens = tm.parser.parseSync();
        return tm;
      },

      /*
       * Initiates a renderer, and has it render our sour sour tokens
       * Async style: Executes callback with final output, if available
       */
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

      /*
       * Initiates a renderer, and has it render our sour sour tokens
       * Sync style: Returns the final view.
       */
      renderSync : function (context) {
        var tm = this;
        tm._initRenderer(context);
        tm.view = tm.renderer.renderSync();
        return tm.view;
      },

      /*
       * Checks if we already started a parser.
       * If we didn't, it does so you don't.
       */
      _initParser : function () {
        if (!this.parser) {
          this.parser = new Thulium.Parser({
            template : this.template
          });
        }
      },

      /*
       * Checks if we already started a renderer.
       * If we didn't, it does so you don't.
       */
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
