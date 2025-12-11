'use strict';

if (process.env.NODE_ENV === "production") {
  module.exports = require("./sigma-layer-maplibre.cjs.prod.js");
} else {
  module.exports = require("./sigma-layer-maplibre.cjs.dev.js");
}
