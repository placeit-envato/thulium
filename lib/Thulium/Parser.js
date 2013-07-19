(function (global) {
  var Ne,
      Class;

  if (typeof require === "function") {
    Ne = require('neon');
    Class = Ne.Class, Module = Ne.Module;
    Thulium = {};
    Thulium.Util = require('./Util.js');
  } else {
    Class  = global.Class,
    Module = global.Module;
  }

  Thulium.Parser = Class(Thulium, 'Parser')({
    lex : {
      matcher : /(<%=)|(<%)|(%>)|([\s\S]+?)(?:<%|%>|$)/gi,
      tokens  : ["text", "tagOpen", "printOpen", "printClose"]
    },
    prototype : {

      // Holds the template string.
      template      : null,

      // Open bracket counters
      _openBrackets : 0,
      _openPrints   : [],

      // Instanciate the parser and returns an instance of it.
      // Recieves: config object.
      // Returns : parser instance.
      // config example : {
      //   template : '<div class="my-class"><% title %></div>'
      // }
      init : function (config) {
        // Extend our config to out instance:
        if (config) {
          Thulium.Util.extend(this, config);
        }

        // Check for template value.
        if (!this.template) {
          console.warn('Warning, no template passed.');
        }

        // return instance.
        return this;
      },

      //Creates the token array, there should be a template at this point.
      parseSync : function () {
        //check for template existance.
        if (this.template) {
          this._tokenize();
        } else {
          throw "ParseError: No template to parse.";
        }

        //return instance.
        return this._tokens;
      },

      // Creates the token array and sends them to a callback
      parse : function( callback ){
        var tm = this;

        setTimeout(function () {
          var returnValue;

          //check for template existance.
          if (tm.template) {
            tm._tokenize();
            returnValue = tm._tokens;

            // execute callback.
            if (callback) {
              callback( returnValue );
            }
          } else {
            throw "ParseError: No template to parse.";
          }
        }, 0);
      },

      // Implements the tokenization algorithm.
      // Recieves : source [string], nextToken [token]
      _tokenize : function () {
        var tm = this,
            tokenizerRe,
            lastIndex,
            matches,
            isCode;

        source                = tm.template;
        tokenizerRe           = tm.constructor.lex.matcher;
        lastIndex             = 0;
        tokenizerRe.lastIndex = lastIndex;
        isCode                = false;


        tm._tokens = [];

        while (matches = tokenizerRe.exec(source)) {

          if (matches[4]) {
            // Match 1 -> text or code.
            lastIndex += matches[4].length;
            tm._tokens.push({
              type : isCode ? "code" : "text",
              value : matches[4]
            });

            if (isCode && tm._openPrints.length > 0) {
              tm._countBrackets(matches[4]);
            }
          } else {
            lastIndex += matches[0].length;

            if (matches[2]) {
              // Match 2 -> set to Code
              isCode = true;
            } else if (matches[1]) {
              isCode = true;

              tm._tokens.push({
                type : "printIndicator"
              });

              tm._openPrints.push(tm._openBrackets);
            } else {
              isCode = false;
            }
          }

          tokenizerRe.lastIndex = lastIndex;
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

      // Remove the printIndicator buffer if no open brackets were found.
      _closePrint : function () {
        var i;
        i = this._openPrints.indexOf(this._openBrackets);

        // if print indicators where found
        if (i >= 0) {
          // close it
          this._tokens.push({
            type : "closePrintIndicator"
          });
          // remove the print from the stack
          this._openPrints.splice(i, 1);
        }
      }
    }
  });

  if (typeof global.exports !== "undefined") {
    global.exports = Thulium.Parser;
  } else {
    global.Thulium.Parser = Thulium.Parser;
  }

}(typeof window !== 'undefined' ? window : (typeof module !== 'undefined' ? module : self)));
