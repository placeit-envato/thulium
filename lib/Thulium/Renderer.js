(function (global) {
  var Ne, Class;

  if (typeof require === "function") {
    Ne = require('neon');
    Class = Ne.Class;
    Thulium = {};
    Thulium.Util = require('./Util.js');
  } else {
    Class = global.Class;
  }

  /*
   * Renderer instance
   * Grabs an array of tokens and outputs the final string for the template
   */
  Thulium.Renderer = Class(Thulium, 'Renderer')({
    prototype : {
      view           : "",            // The final, rendered view
      tokens         : null,          // The tokens we'll be rendering
      context        : null,          // Context under which to render
      captured       : [],            // Buffer for captured strings
      _preView       : "",            // Source code that will give us the view
      _shouldCapture : 0,             // Flag to check if we're in capture mode

      /*
       * Create new instance of the renderer. Extendable with config
       */
      init : function (config) {
        var tm = this;

        if (config) {
          Thulium.Util.extend(tm, config);
        }
      },

      /*
       * Async render: creates the view, and calls callback with the rendered
       * view if a callback is provided
       */
      render : function (callback) {
        var tm = this;

        setTimeout(function () {
          var rendered = tm.renderSync();

          if (callback) {
            callback(rendered);
          }
        }, 0)
      },

      /*
       * Sync version of render: creates the view, and returns it.
       */
      renderSync : function () {
        if (this.tokens) {
          this._render();
          this._evaluate();
          return this.view;
        } else {
          throw "RenderError: No tokens to render."
        }
      },

      /*
       * Appends a message to the view buffer, or if capturing, appends
       * to the captured buffer.
       */
      print : function (message) {
        var buffer = ""
        if (typeof message === "function") {
          buffer = message();
        } else {
          buffer = message;
        }

        if (this._shouldCapture) {
          this.captured[this.captured.length - 1] += buffer;
        } else {
          this.view += buffer;
        }
      },

      /*
       * Captures the output of the passed function and returns
       * the captured string
       */
      capture : function (toPrint) {
        var args = Array.prototype.slice.call(arguments, 1);

        this.captured.push("");
        this._shouldCapture += 1;
        toPrint.apply(this, args);
        this._shouldCapture -= 1;
        return this.captured.pop();
      },

      /*
       * Method that actually does the rendering
       * Substitutes tokens for the appropriate substitution
       */
      _render : function () {
        var tm = this, i, token, buffer = "";

        for (i = 0; i < this.tokens.length; i++) {
          token = this.tokens[i];

          if (token.type === 'text') {
              buffer += "\ntm.print(\""+Thulium.Util.sanitize(token.value)+"\");\n";
          } else if (token.type === 'code') {
              buffer += token.value;
          } else if (token.type === 'printIndicator') {
              buffer += "\ntm.print(";
          } else if (token.type === 'closePrintIndicator') {
              buffer += ");\n"
          }
        }

        this.preView = buffer;
      },

      /*
       * Evaluates the generated "template function"
       */
      _evaluate : function () {
        this.view = "";
        var fn = this._createFunction();
        fn.apply(this);
      },

      /*
       * Creates the "template function" which will be evaluated to
       * obtain the actual output.
       */
      _createFunction : function () {
        return new Function("var tm = this; with(tm.context) { \n" + this.preView + "\n}");
      }
    }
  });

  if (typeof global.exports !== "undefined") {
    global.exports = Thulium.Renderer;
  } else {
    global.Thulium.Renderer = Thulium.Renderer;
  }

}(typeof window !== 'undefined' ? window : (typeof module !== 'undefined' ? module : self)));
