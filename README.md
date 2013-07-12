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

# Spec Draft 2013-07-10 #

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
  +renderer
  +parser
  +template
  #init(config)
  #parse(callback)
  #parseSync()
  #render(context, callback)
  #renderSync(context)
```

*(NOTE: sync and async methods are grouped below. The main difference is
that whatever a sync function would return, the async version will pass
as an argument to the callback function.)*

*(NOTE: We have no clear definition for how to work the caching atm.
especially on how we'll override it. Important for this part)*

#### +renderer ####

Reference to the template's renderer.

#### +parser ####

Reference to the template's parser.

#### #init(config) ####

Initializes a new instance of a Thulium template.

##### parameters #####

* **config**: Configuration to extend the template.

##### returns #####

New instance of a Template.

#### #parse(callback) / #parseSync() ####

Instantiates a new parser with self's template property as a string, to
obtain the tokens.

##### parameters #####

N/A

##### returns #####

The resulting tokens from parsing the template.

#### #render(context, callback) / #renderSync(context) ####

Instantiates a new renderer and passes to it a token structure returned
by the parser.

##### parameters #####

* **context**: The context under which to render the template.

##### returns #####

The string of the rendered document.

--------------------------------------------------------------------------------

```
Thulium.Parser
  +tokens
  -template
  #init(config)
  #parse(callback)
  #parseSync()
```

#### +tokens ####

A generated structure with tokens. This property does not exist before
parsing.

#### #init(config) ####

Initializes a new instance of a Thulium parser.

##### parameters #####

* **config**: Configuration to extend the parser.

##### returns #####

New instance of a Parser.

#### #parse(callback) / #parseSync() ####

Parses the view into tokens. The tokens represent an abstract version of
the template that is easier to process/render. It will use its template
property to do so.

##### parameters #####

N/A

##### returns #####

The resulting token structure.

--------------------------------------------------------------------------------

```
Thulium.Renderer
  +preView
  +view
  -captured
  -shouldCapture
  -tokens
  -context
  #init(config)
  #render(callback)
  #renderSync()
  #print(message)
  #capture(toPrint)
```

#### +preView ####

The "source code" in javascript of the view. This is what will be
evaluated to generate the final render.

#### +view ####

The rendered view. A string containing the final HTML string.

#### #init(config) ####

Initializes a new instance of a Thulium renderer.

##### parameters #####

* **config**: Configuration to extend the renderer.

##### returns #####

New instance of a Renderer.

#### #render(callback) / #renderSync() ####

Takes its own tokens property and generates a preView, then evaluates the
preView to generate the final HTML view. 

##### parameters #####

N/A

##### returns #####

The final view.

#### #print(message) ####

Appends the passed message to the view. This is useful for doing custom
text insertion with helpers.

##### parameters #####

* **message**: The message to append.

##### returns #####

N/A

#### #capture(toPrint) ####

Captures toPrint, so anything it executes that would be printed to the
view, is instead returned.

##### parameters #####

* **toCapture**: A function that should print something to the view.

##### returns #####

The string of whatever the function would have printed to the view.


### API Technical Specification ###

```
Thulium
  TBD
```

```
Thulium.Parser
  TBD
```

```
Thulium.Renderer
  #init(config)
    for every key and value in config
      set self's key property to value
  #render(callback)
    call renderSync
    if callback
      call callback with self's view as arguments
  #renderSync()
    if self has property tokens
      let buffer be an empty string
      for every token in self's tokens
        if token type is text
          sanitize token value, wrap in print statement and append to buffer
        if token type is code
          append value to buffer
        if token type is printIndicator
          append open print statement to buffer
        if token type is closePrintIndicator
          append close print statement to buffer
      set self's preView to buffer
      create a function with buffer as body, wrapped with self's context property
      apply the function to self
      return self's view property
    else
      raise error
  #print(message)
    let buffer be an empty string
    if message is a function
      append result of function to buffer
    else
      append message to buffer

    if self should capture
      append buffer to self's captured property
    else
      append buffer to self's view property
  #capture(toCapture)
    set self's captured to an empty string
    set self's should capture to true
    call toCapture
    set self's should capture to false
    return self's captured property
```

### Structure of the Tokens Array ###

#### The array ####
```
[token, token, token]
```

Yup, that's it.

#### The Tokens ####

##### text #####

```
{
  type: "text",
  value: "some text"
}
```

##### code #####

```
{
  type: "code",
  value: "JS Code"
}
```

#### printIndicator #####

```
{
  type: "printIndicator"
}
```

#### closePrintIndicator #####

```
{
  type: "closePrintIndicator"
}
```
