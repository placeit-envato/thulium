Thulium.Parser = Class(Thulium, 'Parser')({
  prototype : {
    // lex contains the rules for string evaluation
    // this structure is used to parse and then tokenize the
    // template elements.
    lex : {
      // For normal text (Markup): <div class="my-class">My normal text and html code</div>
      text : {
        matcher : '^([\\s\\S]*?)',
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

      this._initRegex();

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

    /*
     * Compiles the lexer regexes, so we don't have to do it each time.
     */
    _initRegex : function () {
      var property, token;
      for (property in this.lex) {
        token = this.lex[property]

        if (token.hasText) {
          token.compiledRe = this.lex.text.matcher + token.matcher;
        } else {
          token.compiledRe = token.matcher;
        }

        token.compiledRe = new RegExp(token.compiledRe, "gi");
      }
    },

    // Implements the tokenization algorithm.
    // Recieves : source [string], nextToken [token]
    _tokenize : function (source, nextToken) {
      var tm = this,
          tokenizerRe,
          lastIndex,
          matches,
          textType;

      // Initialize for first run
      // if no template passed assume first pass
      // and use the main template.
      if (typeof source === "undefined") {
        source = tm.template;
      }

      // if no token passed, this is an open tag lookup
      if (typeof nextToken === "undefined") {
        tm._tokens = [];
        nextToken = tm.lex.tagOpen;
      }

      while (source) {
        // Use created token.
        tokenizerRe = nextToken.compiledRe;
        matches = tokenizerRe.exec(source);

        lastIndex = tokenizerRe.lastIndex;
        tokenizerRe.lastIndex = 0;

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
          } else {
            // push the token name into the array to mark the open/close/print status on it.
            tm._tokens.push({
              type : nextToken.name
            });
          }

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
          source    = source.substr(lastIndex);
          nextToken = tm._nextToken(nextToken);

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

            source = "";

          } else {
            // If it wasn't optional. GO!
            if (nextToken.optional) {
              // So continue from where we left with our new next token.
              source    = source.substr(lastIndex);
              nextToken = tm._nextToken(nextToken);

            // so it was not a printing tag, so something went wrong.
            } else {
              throw "Syntax Error: Expecting " + nextToken.name + " ... Nowhere to be found. So I was like, what?";
            }
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
        }

        if (text[i] === "}") {
          this._openBrackets--;
        }
      }

      this._closePrint();
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
