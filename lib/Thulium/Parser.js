(function (global) {
  var Ne,
      Thulium = {},
      Class;

  if (typeof require === "function") {
    Ne = require('neon');
    Class = Ne.Class, Module = Ne.Module;
  } else {
    Class  = global.Class,
    Module = global.Module;
  }

  Thulium.Parser = Class(Thulium, 'Parser')({
    prototype : {
      // lex contains the rules for string evaluation
      // this structure is used to parse and then tokenize the
      // template elements.
      lex : {
        // For normal text (Markup): <div class="my-class">My normal text and html code</div>
        text : {
          matcher : '([\\s\\S]*?)',
          name : "text"
        },
        // For template code: <% var a = 3 + x; %>
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
        // For print variant code: <%= myVar+'?' %>
        printIndicator : {
          matcher : '^(=)',
          name : 'printIndicator',
          optional : true
        }
      },

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

      // render : function (context) {
      //   this.renderer = new Thulium.Renderer({
      //     tokens  : this._tokens,
      //     context : context
      //   });
      //   this.renderedTemplate = this.renderer.render();
      //   return this.renderedTemplate;
      // },

      //Creates the token array, there should be a template at this point.
      tokenize : function () {
        //check for template existance.
        if (this.template) {
          this._tokenize();
        } else {
          console.log("No template dude. C'mon.");
        }

        //return instance.
        return this;
      },

      // Implements the tokenization algorithm.
      // Recieves : source [string], nextToken [token]
      _tokenize : function (source, nextToken) {
        var tm = this,
            tokenizerRe,
            matches,
            textType;

        // Initialize for first run
        // if no template passed assume first pass
        // and use the main template.
        if (!source) {
          source = tm.template;
        }

        // if no token passed, this is an open tag lookup
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

        // Use created token.
        tokenizerRe = new RegExp(tokenizerRe, "gi");
        matches = tokenizerRe.exec(source);

        // This guy matched. So let's push the tokens.
        if (matches) {

          // Flags to see if code or text
          if (nextToken === tm.lex.tagOpen) {
            // if the match was done using the tagOpen, then everything we matched is normal text.
            textType = "text";
          } else {
            // assume the match was a closing tag, so everything we have is code.
            textType = "code";
          }

          // if the token is a tagOpen, or tagClose, we need to push it with the text value matched.
          if (nextToken.hasText) {
            tm._tokens.push({
              type : textType,
              value : matches[1]
            });
          }

          // push the token name into the array to mark the open/close/print status on it.
          tm._tokens.push({
            type : nextToken.name
          });

          // A print indicator just shows open prints, so we buffer the open print.
          if (nextToken === tm.lex.printIndicator) {
            tm._openPrints.push(tm._openBrackets);
          }

          // Closing an open print needs to count for open brackets, so we can separate the code blocks.
          if (nextToken === tm.lex.tagClose && tm._openPrints.length > 0) {
            tm._countBrackets(matches[1]);
          }

          // We matched, so let's keep going.
          // from where we left with our new next token.
          source    = source.substr(tokenizerRe.lastIndex);
          nextToken = tm._nextToken(nextToken);
          tm._tokenize(source, nextToken);

        //No match:
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
              // So continue from where we left with our new next token.
              source    = source.substr(tokenizerRe.lastIndex);
              nextToken = tm._nextToken(nextToken);
              tm._tokenize(source, nextToken);

            // so it was not a printing tag, so something went wrong.
            } else {
              throw "Syntax Error: Expecting " + nextToken.name + " ... Nowhere to be found. So I was like, what?";
            }
          }
        }
      },

      // Get the next logical token
      // Receives : token
      // Returns  : token
      _nextToken : function (token) {
        switch (token) {
          case this.lex.tagOpen:
            return this.lex.printIndicator;

          case this.lex.tagClose:
            return this.lex.tagOpen;

          case this.lex.printIndicator:
            return this.lex.tagClose;
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
    global.exports = Thulium.Renderer;
  } else {
    global.Thulium.Renderer = Thulium.Renderer;
  }

}(typeof window !== 'undefined' ? window : (typeof module !== 'undefined' ? module : self)));