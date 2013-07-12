(function (global) {
  var Ne, Thulium = {};

  if (typeof require === "function") {
    Ne = require('neon');

    var Class = Ne.Class, Module = Ne.Module;
  } else {
    var Class = global.Class, Module = global.Module;
  }

  Thulium.Renderer = Class(Thulium, 'Renderer')({
    prototype : {
      view           : "",
      tokens         : null,
      context        : {},
      _preView       : "",
      _captured      : "",
      _shouldCapture : false,

      init : function (config) {
        var tm = this;

        if (config) {
          Thulium.Util.extend(tm, config);
        }
      },

      render : function (callback) {
        var tm = this;

        setTimeout(function () {
          var rendered = tm.renderSync();

          if (callback) {
            callback(rendered);
          }
        }, 0)
      },

      renderSync : function () {
        if (this.tokens) {
          this._render();
          this._evaluate();
          return this.view;
        } else {
          throw "RenderError: No tokens to render."
        }
      },

      print : function (message) {
        var buffer = ""
        if (typeof message === "function") {
          buffer = message();
        } else {
          buffer = message;
        }

        if (this.shouldCapture) {
          this.captured += buf;
        } else {
          this.view += buf;
        }
      },

      capture : function (toPrint) {
        this.captured = "";
        this.shouldcapture = true;
        tocapture();
        this.shouldcapture = false;
        return this.captured;
      },

      _render : function () {
        var tm = this, i, token, buffer = "";

        for (i = 0; i < this.tokens.length; i++) {
          token = this.tokens[i];

          switch(token.type) {
            case 'text':
              buffer += "\ntm.print(\""+Thulium.Util.sanitize(token.value)+"\");\n";
              break;
            case 'code':
              buffer += "\n"+token.value+"\n";
              break;
            case 'printIndicator':
              buffer += "\ntm.print(";
              break;
            case 'closePrintIndicator':
              buffer += ");\n"
              break;
          }

          this.preView = buffer;
        }
      },

      _evaluate : function () {
        this.view = "";
        var fn = this._createFunction();
        fn.apply(this);
      },

      _createFunction : function () {
        return new Function("var tm = this; with(tm.context) { \n" + this.preView + "\n}");
      }
    }
  });

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
    global.exports = Thulium.Renderer;
  } else {
    global.Thulium.Renderer = Thulium.Renderer;
  }

}(typeof window !== 'undefined' ? window : (typeof module !== 'undefined' ? module : self)));