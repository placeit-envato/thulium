(function (global) {
  var Ne;

  // System deps
  fs = require('fs');

  // Vendor deps
  Ne = require('neon');

  var Thulium = {};

  Thulium.loadTemplate = function (path, callback) {
    fs.readFile(path, {encoding : 'utf8'}, function (err, data) {
      if (err) throw err;
      var template = new Thulium.Parser({template : data});
      callback(template);
    });
  };

  Thulium.loadTemplateSync = function (path) {
    var data = fs.readFileSync(path, {encoding : 'utf8'});
    return new Thulium.Parser({template : data});
  };

  Thulium.Parser = Ne.Class(Thulium, 'Parser')({
    prototype : {
      lex : {
        text : {
          matcher : '([\\s\\S]*?)',
          name : "text"
        },
        tagOpen : {
          matcher : '(<%)',
          name : 'tagOpen',
          hasText : true
        },
        tagClose : {
          matcher : '(%>)',
          name : 'tagClose',
          hasText : true
        },
        printIndicator : {
          matcher : '^(=)',
          name : 'printIndicator',
          optional : true,
        }
      },
      template      : null,
      _openBrackets : 0,
      _openPrints   : [],
      init : function (config) {
        var tm = this,
            property;

        if (config) {
          Thulium.Util.extend(tm, config);
        }

        if (tm.template) {
          tm._tokenize();
          console.log(tm._tokens);
        }
      },
      render : function (context) {
        return new Thulium.Renderer({
          tokens  : this._tokens,
          context : context
        }).render();
      },
      tokenize : function () {
        if (this.template) {
          this._tokenize();
        } else {
          console.log("No template dude. C'mon.");
        }
      },
      _tokenize : function (source, nextToken) {
        var tm = this, tokenizerRe, matches, textType;

        // Initialize for first run.
        if (!source) {
          source = tm.template;
        }

        if (!nextToken) {
          tm._tokens = [];
          nextToken = tm.lex.tagOpen;
        }

        // Build the regexp to match.
        if (nextToken.hasText) {
          tokenizerRe = tm.lex.text.matcher + nextToken.matcher;
        } else {
          tokenizerRe = nextToken.matcher;
        }

        tokenizerRe = new RegExp(tokenizerRe, "gi");
        matches = tokenizerRe.exec(source);

        // This guy matched. So let's push the tokens.
        if (matches) {

          // Flags to see if code or text
          if (nextToken === tm.lex.tagOpen) {
            textType = "text"
          } else {
            textType = "code"
          }

          if (nextToken.hasText) {
            tm._tokens.push({
              type : textType,
              value : matches[1]
            });
          }

          tm._tokens.push({
            type : nextToken.name
          })

          // A print indicator just shows open prints
          if (nextToken === tm.lex.printIndicator) {
            tm._openPrints.push(tm._openBrackets);
          }

          if (nextToken === tm.lex.tagClose && tm._openPrints.length > 0) {
            tm._countBrackets(matches[1]);
          }

          // We matched, so let's keep going.
          tm._tokenize(source.substr(tokenizerRe.lastIndex), tm._nextToken(nextToken));
        } else {
          // We couldn't match anything else. So: Either it's a syntax error,
          // or it's just text. If we were awaiting another token we fail, otherwise
          // assume it's just text.
          if (nextToken == tm.lex.tagOpen) {
            tm._tokens.push({
              type  : "text",
              value : source
            });
          } else {
            // If it wasn't optional. GO!
            if (nextToken.optional) {
              tm._tokenize(source.substr(tokenizerRe.lastIndex), tm._nextToken(nextToken));
            } else {
              throw "Syntax Error: Expecting " + nextToken.name + " ... Nowhere to be found. So I was like, what?";
            }
          }
        }
      },

      _nextToken : function (token) {
        switch (token) {
          case this.lex.tagOpen:
            return this.lex.printIndicator;
            break;
          case this.lex.tagClose:
            return this.lex.tagOpen;
            break;
          case this.lex.printIndicator:
            return this.lex.tagClose;
            break;
        }
      },

      _countBrackets : function (text) {
        // step 1, for every { or }, add and remove.
        // step 2, if the current number of open brackets is === to an element
        // inside the openPrints stack, close the stack and remove.
        var i, foundBrackets;

        for (i = 0; i < text.length; i++) {
          if (text[i] === "{") {
            this._openBrackets++;
            foundBrackets = true;
          }

          if (text[i] === "}") {
            this._openBrackets--;
            this._closePrint();
            foundBrackets = true;
          }
        }

        // Maybe no brackets were found!
        if (!foundBrackets) {
          this._closePrint();
        }
      },

      _closePrint : function () {
        var i;
        i = this._openPrints.indexOf(this._openBrackets);

        if (i >= 0) {
          this._tokens.push({
            type : "closePrintIndicator"
          });
          this._openPrints.splice(i, 1);
        }
      }
    }
  });

  Thulium.Renderer = Ne.Class(Thulium, 'Renderer')({
    prototype : {
      tokens : null,
      buffer : "",
      preBuffer : "",
      context : {},
      init : function (config) {
        var tm = this;

        if (config) {
          Thulium.Util.extend(tm, config);
        }
      },

      render : function () {
        if (this.tokens) {
          this._render();
          this._evaluate();
          //TODO: Needs to evaluate the preBuffer
        } else {
          throw "No tokens to render found. Dude."
        }
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

          this.preBuffer = buffer;
        }
      },

      _evaluate : function () {
            this.buffer = "";
            var fn = this._createFunction();
            fn.apply(this);
            console.log(this.buffer)
      },

      _createFunction : function () {
        return new Function("var tm = this; with(tm.context) { \n" + this.preBuffer + "\n}");
      },

      print : function (printable) {
        if (typeof printable === "function") {
          this.buffer += printable();
        } else {
          this.buffer += printable;
        }
      }
    }
  });

  Thulium.Util = Ne.Module(Thulium, 'Util')({
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

  global.loadTemplate = Thulium.loadTemplate;
  global.loadTemplateSync = Thulium.loadTemplateSync;
  global.Parser = Thulium.Parser;
  global.Renderer = Thulium.Renderer;
  global.Util = Thulium.Util;

}(typeof window !== 'undefined' ? window : (typeof module.exports !== 'undefined' ? module.exports : self)));
