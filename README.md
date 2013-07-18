# Thulium (Tm) Templating #

A proper templating engine. With specs and a syntax that isn't crazy (ie. Not
Jade and not EJS).

It depends on [Neon](https://github.com/azendal/neon) for the class
system.


## Usage ##

It's easy to use. If you want it in the browser, just require the files.
If using node:

```
$ npm install thulium
```

From there, it's as easy as:

```
tm = new Thulium({template: "A template string"});
tm.parseSync().renderSync(context);
```

Of course, async methods are available:

```
tm.parse(function () {
  tm.render(context, function (view) {
    console.log(view);
  })
})
```

## Examples ##

### A simple template ###

#### The template ####

```
<h1>Hello, <%= name %></h1>
<% for (var i = 0; i < 10; i++) { %>
<p> You are awesome. </p>
<% } %>
```


#### The context ####

```javascript
{
 name: "Col. Mustard"
}
```

#### The output ####

```html
<h1>Hello, Col. Mustard</h1>

<p> You are awesome. </p>

<p> You are awesome. </p>

<p> You are awesome. </p>

<p> You are awesome. </p>

<p> You are awesome. </p>

<p> You are awesome. </p>

<p> You are awesome. </p>

<p> You are awesome. </p>

<p> You are awesome. </p>

<p> You are awesome. </p>
```

### A printable helper (capture style) ###

#### The template ####

```
<p>
<%= h.reverse(function (){ %>
This is my reversed string.
<% }) %>
</p>
```


#### The context ####

```javascript
{
 h: {
    reverse : function (toCapture) {
      // Let's imagine for a second that templateManager is a reference
      // to a ... um, template manager. That has an instance of the
      // current view. Which is our instance of Tm
      var buffer = templateManager.currentView.renderer.capture(toCapture);
      return buffer.split("").reverse().join("");
    }
 }
}
```

#### The output ####

```html
<p>

.gnirts desrever ym si sihT

</p>
```

### A printable helper (custom style) ###

#### The template ####

```
<p>
<%= h.embolden(function (){ %>
This guy will be bold.
<% }) %>
</p>
```


#### The context ####

```javascript
{
 h: {
    embolden : function (printable) {
      // Let's imagine for a second that templateManager is a reference
      // to a ... um, template manager. That has an instance of the
      // current view. Which is our instance of Tm
      templateManager.currentView.renderer.print("<strong>");

      // here we're printing that stuff inside the block by executing it
      printable();

      return "</strong>";
    }
 }
}
```

#### The output ####

```html
<p>
<strong>
This guy will be bold.
</strong>
</p>
```
