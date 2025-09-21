/**
 * @fileoverview ESLint plugin to flag alias imports
 */
"use strict";

const noAliasImports = require("./rules/no-alias-imports");

module.exports = {
  rules: {
    "no-alias-imports": noAliasImports,
  },
  configs: {
    recommended: {
      plugins: ["no-alias-imports"],
      rules: {
        "no-alias-imports/no-alias-imports": "error",
      },
    },
  },
};
