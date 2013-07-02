This is the test template. If this compiles, we're all cool.

Just <strong> Add some tags </strong> and test away.

You can modify variables.
<% i = 0 %>

And print them.
<%= i %>

You can block the beejezus out of the template:

<% for (i = 0; i < 10; i++) { %>
LOL
<% } %>

<%= h.testBlock(function{ %>
  This will print the output of the function. Also this text.
  <%= "Also this." %>
<% }); %>

It doesn't make sense to have an equal in the bottom one. But hey! What do I know.
