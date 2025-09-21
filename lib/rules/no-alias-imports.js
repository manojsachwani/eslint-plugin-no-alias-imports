/**
 * @fileoverview Rule to flag alias imports
 */
"use strict";

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "disallow alias imports",
      category: "Possible Errors",
      recommended: true,
    },
    fixable: null,
    schema: [
      {
        type: "object",
        properties: {
          aliases: {
            type: "array",
            items: {
              oneOf: [
                {
                  type: "string",
                },
                {
                  type: "object",
                  properties: {
                    alias: {
                      type: "string",
                    },
                    pattern: {
                      type: "string",
                    },
                  },
                  additionalProperties: false,
                  required: ["alias"],
                },
              ],
            },
            uniqueItems: true,
          },
          patterns: {
            type: "array",
            items: {
              type: "string",
            },
            uniqueItems: true,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      noAliasImport:
        'Alias import "{{alias}}" is not allowed. Use relative or absolute paths instead.',
      noAliasRequire:
        'Alias require "{{alias}}" is not allowed. Use relative or absolute paths instead.',
      noAliasExport:
        'Alias export "{{alias}}" is not allowed. Use relative or absolute paths instead.',
    },
  },

  create(context) {
    const options = context.options[0] || {};
    const aliases = options.aliases || ["@", "~"];
    const patterns = options.patterns || [];

    /**
     * Check if a module path is an alias import
     * @param {string} modulePath - The import/require path
     * @returns {boolean} - True if it's an alias import
     */
    function isAliasImport(modulePath) {
      // Check for simple alias prefixes
      for (const alias of aliases) {
        if (typeof alias === "string") {
          if (modulePath.startsWith(alias)) {
            return true;
          }
        } else if (typeof alias === "object" && alias.alias) {
          if (modulePath.startsWith(alias.alias)) {
            // If pattern is specified, check if it matches
            if (alias.pattern) {
              const regex = new RegExp(alias.pattern);
              return regex.test(modulePath);
            }
            return true;
          }
        }
      }

      // Check for regex patterns
      for (const pattern of patterns) {
        const regex = new RegExp(pattern);
        if (regex.test(modulePath)) {
          return true;
        }
      }

      return false;
    }

    /**
     * Reports an alias import violation
     * @param {Object} node - The AST node
     * @param {string} modulePath - The import/require path
     * @param {string} messageId - The message ID to use
     */
    function reportAliasImport(node, modulePath, messageId) {
      context.report({
        node,
        messageId,
        data: {
          alias: modulePath,
        },
      });
    }

    return {
      // Handle ES6 import declarations
      ImportDeclaration(node) {
        const modulePath = node.source.value;
        if (isAliasImport(modulePath)) {
          reportAliasImport(node, modulePath, "noAliasImport");
        }
      },

      // Handle ES6 export declarations with from clause
      ExportNamedDeclaration(node) {
        if (node.source && node.source.value) {
          const modulePath = node.source.value;
          if (isAliasImport(modulePath)) {
            reportAliasImport(node, modulePath, "noAliasExport");
          }
        }
      },

      // Handle export * from declarations
      ExportAllDeclaration(node) {
        if (node.source && node.source.value) {
          const modulePath = node.source.value;
          if (isAliasImport(modulePath)) {
            reportAliasImport(node, modulePath, "noAliasExport");
          }
        }
      },

      // Handle CommonJS require() calls
      CallExpression(node) {
        // Check for require() calls
        if (
          node.callee.type === "Identifier" &&
          node.callee.name === "require" &&
          node.arguments.length === 1 &&
          node.arguments[0].type === "Literal" &&
          typeof node.arguments[0].value === "string"
        ) {
          const modulePath = node.arguments[0].value;
          if (isAliasImport(modulePath)) {
            reportAliasImport(node, modulePath, "noAliasRequire");
          }
        }
      },

      // Handle dynamic import() expressions
      ImportExpression(node) {
        if (
          node.source &&
          node.source.type === "Literal" &&
          typeof node.source.value === "string"
        ) {
          const modulePath = node.source.value;
          if (isAliasImport(modulePath)) {
            reportAliasImport(node, modulePath, "noAliasImport");
          }
        }
      },
    };
  },
};
