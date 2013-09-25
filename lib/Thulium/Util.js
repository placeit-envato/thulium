/*
 * A set of utility functions we use all the time
 */
Thulium.Util = Module(Thulium, 'Util')({

  backslashSanitize : /\\/g,
  newlineSanitize   : /\n/g,
  quotesSanitize    : /"/g,

  /* An implementation of the most implemented function in JS
   * Extends the object to with the properties of object from
   */
  extend : function (to, from) {
    var prop;

    for (prop in from) {
      to[prop] = from[prop];
    }
  },

  /*
   * Sanitizes text so it works proper inside JS strings
   */
  sanitize : function (text) {
    text = text.replace(this.backslashSanitize, "\\\\");
    text = text.replace(this.newlineSanitize, "\\n");
    text = text.replace(this.quotesSanitize, "\\\"");

    return text;
  }
});
