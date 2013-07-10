# Thulium (Tm) Templating #

A proper templating engine. With specs and a syntax that isn't crazy (ie. Not
Jade and not EJS).


## Usage ##

Right now it's in heavy testing/dev mode. Not reallk "a thing". But this
will make your life easier:

```
$ npm install
$ npm link
$ npm link thulium
$ node etc/test.js
```

You'll be in a console with thulium already loaded. Yay!

# Spec Draft 2013-07-08 #

Thulium (Tm) is a templating engine written in javascript. It is based on
EJS, but attempts to solve several problems with it: It formalizes the
syntax and it attempts to make it more debuggable. This was a result of
the EJS implementation being in dire need of both specification and
debuggability in order to be used with projects at freshout.

It does not support a way of adding helpers or other fancy features, and
instead recommends that all/any of these should be added with the
context. Included in fancy features is no built-in methods for loading
urls or files. The input is a string.

It works the same in both the browser and node environments.

## Constraints ##

* Javascript compatibility
* EJS Compatibility (Vanilla features only)
* Will not support any type of file handling or url expanding.
* It will not support any way of adding "built-in" helpers.

## Assumptions ##

* The user will be able to build a context object independently
* The user will be able to obtain the template string independently

## Blackbox ##

```
                   +------------------------------------------------+
+----------+       |            +-----------+       +-------------+ |
| Template | ----> | Tm   ----> | Tm.Parser | ----> | Tm.Renderer | |
+----------+       |            +-----------+       +-------------+ |
                   +---------------------------------------|--------+
                                             +------+      |
                                             | HTML |<-----+
                                             +------+
```

## Theory of Operation ##

An instance of Thulium is created with a string that represents the
template. Tm then proceeds to parse the document to create the tokens it
will use to render it. When it is to be rendered, Tm takes the tokens
created by the parser, and a context object and executes any JS code in
the template with the passed context (So any helper methods, variables
and such should be passed in the context object). Finally, the render
returns an HTML document.

## Tm Tags ##

Thulium only has two types of tags: Non-printable code tags, and
printable code tags. With just these two, we have found it to be
expressive enough, yet simple enough, to allow the developer great
flexibility and control.

These tags are based on the EJS provided ones. Of note is that none of
these tags do any escaping, so that has to be handled by the
application.

**NOTE: Could we implement escape print tags? If we're already wrapping,
I think it's trivial. Just a note to keep in mind**

### `<% %>` — The code tags ###

These tags denote javascript code that MUST be executed. Any JS code
found inside these tags must be executed, but not printed.

```
<% for (i = 0; i < entries.length; i++ ) { %>
  <%= "Hey, this has been printed before: " + i + " times" %>
<% } %>
```

### `<%= %>` - The printable code tags ###

These tags denote javascript code that MUST be executed. If a block of
code is broken up, it should follow these rules:

  * The printable tags should only appear in the opening fragment of the
    block.
  * The closing of the block should be with regular code tags
  * The result of the function is to be printed. (ie. Any printing
    operations inside the block will occurr before the block result)
  * If the helper function has acces to an instance of the template
    (e.g. by closure), it should be able to access the renderer and from
    it the rendering function. (for example, if it has a closure to a
    manager, it could easily just use `templateManager.view.renderer.render("hi")`)
    This is very useful for helpers that need to wrap text around (e.g.
    a formFor helper that wraps the passed function with the open and close
    form tags.)
  * Printable code should not be terminated with a semicolon.

#### Example ####

```
<%= formHelper.formFor(function (f) { %>

  This is normal text, so it will be printed when the function is
executed.

  <%= "same goes for this" %>

<% }) %>
```

## Architecture ##

### Components ###

* Thulium: The main class used to handle the templates.
* Thulium.Parser: Parses a template and generates tokens.
* Thulium.Renderer: Parses a token array and generates a document.

### Dependencies ###

* Neon.js: Class system

### Requirements ###

* EJS Compatibility.
* Breaking of Printable Blocks.
* Debuggable.
* Expose a reference to the view to allow for custom printing inside of
  blocks.
* Should work in node and in browser.
* Should work sync and async.

*NOTE: These six points were tested out in an experiment with
satisfactory results*

### Separation of Parser and Renderer ###

While the most important part for alternate implementations must be to
respect the Thulium API, this document presents a separation of a Parser
and Renderer. This is, however, only a recommendation and any
implementation could change this as long as the core API behaves as expected.

### API ###

```
Thulium
  #init(config)
  #parse()
  #render()
```

```
Thulium.Parser
  #parse()
```

```
Thulium.Renderer
  #render()
```

More TBD:
* Instance methods and properties reference. (Technical)
* Optional: Caching (to improve rendering) (Renderer + Parser)
* Tech Spec (Algorithmia and such)
* The thulium default implementation token array (Parser)
