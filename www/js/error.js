"use strict";

window.addEventListener("error", function(error) {
  alert(error.filename + " " + error.message);
  return true;
});