# ESLint Plugin No Alias Imports - Technical Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Rule Implementation](#rule-implementation)
4. [Configuration Schema](#configuration-schema)
5. [AST Node Handling](#ast-node-handling)
6. [Testing Strategy](#testing-strategy)
7. [Code Examples](#code-examples)
8. [Development Guide](#development-guide)
9. [API Reference](#api-reference)
10. [Troubleshooting](#troubleshooting)

## Overview

The `eslint-plugin-no-alias-imports` is a custom ESLint plugin designed to enforce the use of relative or absolute import paths instead of custom path aliases. This plugin helps improve code portability, reduces build configuration complexity, and enhances code clarity.

### Key Features

- **Multi-format Support**: Handles ES6 imports, CommonJS requires, export statements, and dynamic imports
- **Configurable Detection**: Supports custom alias prefixes and regex patterns
- **TypeScript Compatible**: Works seamlessly with TypeScript projects
- **Comprehensive Testing**: Includes 34+ test cases covering edge cases
- **Performance Optimized**: Minimal overhead during linting

## Architecture

### Plugin Structure

```
eslint-plugin-no-alias-imports/
├── lib/
│   ├── index.js              # Plugin entry point
│   └── rules/
│       └── no-alias-imports.js # Core rule implementation
├── tests/
│   └── no-alias-imports.test.js # Test suite
├── package.json              # Plugin metadata
└── README.md                 # User documentation
```

### Plugin Entry Point (`lib/index.js`)

```javascript
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
```

## Rule Implementation

### Core Rule Structure

The rule follows ESLint's standard rule format with the following components:

#### Meta Information

```javascript
meta: {
  type: 'problem',              // Rule type: problem, suggestion, or layout
  docs: {
    description: 'disallow alias imports',
    category: 'Possible Errors',
    recommended: true,
  },
  fixable: null,               // Not auto-fixable
  schema: [...],               // Configuration schema
  messages: {...},             // Error message templates
}
```

#### Rule Messages

```javascript
messages: {
  noAliasImport: 'Alias import "{{alias}}" is not allowed. Use relative or absolute paths instead.',
  noAliasRequire: 'Alias require "{{alias}}" is not allowed. Use relative or absolute paths instead.',
  noAliasExport: 'Alias export "{{alias}}" is not allowed. Use relative or absolute paths instead.',
}
```

### Configuration Schema

The rule accepts a configuration object with the following structure:

```javascript
schema: [
  {
    type: "object",
    properties: {
      aliases: {
        type: "array",
        items: {
          oneOf: [
            {
              type: "string", // Simple string prefix
            },
            {
              type: "object",
              properties: {
                alias: { type: "string" }, // Alias prefix
                pattern: { type: "string" }, // Optional regex pattern
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
        items: { type: "string" }, // Regex patterns
        uniqueItems: true,
      },
    },
    additionalProperties: false,
  },
];
```

### Configuration Examples

#### Basic Configuration

```javascript
{
  "rules": {
    "no-alias-imports/no-alias-imports": "error"
  }
}
```

- Uses default aliases: `['@', '~']`
- No custom patterns

#### Advanced Configuration

```javascript
{
  "rules": {
    "no-alias-imports/no-alias-imports": ["error", {
      "aliases": [
        "@",                              // Simple string alias
        "~",
        {
          "alias": "@components",         // Object-based alias
          "pattern": "^@components/"      // With regex pattern
        }
      ],
      "patterns": [
        "^src/",                          // Regex patterns
        "^app/",
        "^utils/"
      ]
    }]
  }
}
```

## AST Node Handling

The rule processes different types of AST nodes to detect alias imports:

### 1. ImportDeclaration (ES6 Imports)

```javascript
ImportDeclaration(node) {
  const modulePath = node.source.value;
  if (isAliasImport(modulePath)) {
    reportAliasImport(node, modulePath, 'noAliasImport');
  }
}
```

**Handles:**

- `import foo from '@/bar'`
- `import { named } from '~/utils'`
- `import * as all from '@components/Button'`

### 2. ExportNamedDeclaration (ES6 Named Exports)

```javascript
ExportNamedDeclaration(node) {
  if (node.source && node.source.value) {
    const modulePath = node.source.value;
    if (isAliasImport(modulePath)) {
      reportAliasImport(node, modulePath, 'noAliasExport');
    }
  }
}
```

**Handles:**

- `export { foo } from '@/bar'`
- `export { default as baz } from '~/utils'`

### 3. ExportAllDeclaration (ES6 Re-exports)

```javascript
ExportAllDeclaration(node) {
  if (node.source && node.source.value) {
    const modulePath = node.source.value;
    if (isAliasImport(modulePath)) {
      reportAliasImport(node, modulePath, 'noAliasExport');
    }
  }
}
```

**Handles:**

- `export * from '@/components'`

### 4. CallExpression (CommonJS Requires)

```javascript
CallExpression(node) {
  // Check for require() calls
  if (
    node.callee.type === 'Identifier' &&
    node.callee.name === 'require' &&
    node.arguments.length === 1 &&
    node.arguments[0].type === 'Literal' &&
    typeof node.arguments[0].value === 'string'
  ) {
    const modulePath = node.arguments[0].value;
    if (isAliasImport(modulePath)) {
      reportAliasImport(node, modulePath, 'noAliasRequire');
    }
  }
}
```

**Handles:**

- `const foo = require('@/bar')`
- `require('~/utils/helper')`

### 5. ImportExpression (Dynamic Imports)

```javascript
ImportExpression(node) {
  if (
    node.source &&
    node.source.type === 'Literal' &&
    typeof node.source.value === 'string'
  ) {
    const modulePath = node.source.value;
    if (isAliasImport(modulePath)) {
      reportAliasImport(node, modulePath, 'noAliasImport');
    }
  }
}
```

**Handles:**

- `import('@/async-component')`
- `await import('~/lazy-module')`

## Alias Detection Algorithm

### Core Detection Function

```javascript
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
```

### Detection Logic Flow

1. **Simple String Matching**: Check if module path starts with any configured alias string
2. **Object-based Matching**: For object aliases, check prefix and optional regex pattern
3. **Pattern Matching**: Test module path against configured regex patterns
4. **Return Result**: True if any match is found, false otherwise

## Testing Strategy

### Test Structure

The test suite uses ESLint's `RuleTester` and is organized into:

1. **Valid Cases**: Imports that should NOT be flagged
2. **Invalid Cases**: Imports that SHOULD be flagged

### Valid Test Cases

```javascript
valid: [
  // Relative imports
  "import foo from './foo';",
  "import bar from '../bar';",

  // Node modules
  "import fs from 'fs';",
  "import React from 'react';",

  // Custom configurations
  {
    code: "import foo from 'src/foo';",
    options: [{ aliases: ["@"] }],
  },
];
```

### Invalid Test Cases

```javascript
invalid: [
  {
    code: "import foo from '@/foo';",
    errors: [
      {
        messageId: "noAliasImport",
        data: { alias: "@/foo" },
      },
    ],
  },
  // ... more test cases
];
```

### Test Coverage

- **34 total tests** covering:
  - All import/export/require patterns
  - Default and custom configurations
  - Edge cases and error scenarios
  - Multiple violations in single files

## Code Examples

### Example 1: Basic Usage

**Input Code:**

```javascript
import Button from "@/components/Button";
import utils from "~/utils/helpers";
const config = require("@/config/app");
export { Modal } from "@/components/Modal";
```

**ESLint Errors:**

```
  2:1  error  Alias import "@/components/Button" is not allowed  no-alias-imports/no-alias-imports
  3:1  error  Alias import "~/utils/helpers" is not allowed     no-alias-imports/no-alias-imports
  4:1  error  Alias require "@/config/app" is not allowed       no-alias-imports/no-alias-imports
  5:1  error  Alias export "@/components/Modal" is not allowed  no-alias-imports/no-alias-imports
```

### Example 2: Custom Configuration

**ESLint Config:**

```javascript
{
  "rules": {
    "no-alias-imports/no-alias-imports": ["error", {
      "aliases": ["#internal"],
      "patterns": ["^src/"]
    }]
  }
}
```

**Input Code:**

```javascript
import utils from "#internal/utils"; // ❌ Flagged
import Button from "src/components"; // ❌ Flagged
import React from "react"; // ✅ Allowed
import config from "./config"; // ✅ Allowed
```

### Example 3: Complex Alias Configuration

**ESLint Config:**

```javascript
{
  "rules": {
    "no-alias-imports/no-alias-imports": ["error", {
      "aliases": [
        "@",
        {
          "alias": "@components",
          "pattern": "^@components/"
        }
      ]
    }]
  }
}
```

**Behavior:**

- `@/anything` → Flagged (simple string match)
- `@components/Button` → Flagged (object match with pattern)
- `@comp/Button` → Flagged (simple string match for "@")

## Development Guide

### Setting Up Development Environment

1. **Clone the repository**

```bash
git clone <repository-url>
cd eslint-plugin-no-alias-imports
```

2. **Install dependencies**

```bash
npm install
```

3. **Run tests**

```bash
npm test
npm run test:watch  # Watch mode
```

4. **Run linting**

```bash
npm run lint
npm run lint:fix
```

### Adding New Features

#### 1. Modify the Rule

Edit `lib/rules/no-alias-imports.js`:

```javascript
// Add new AST node handler
NewNodeType(node) {
  // Implementation
}
```

#### 2. Update Schema

Update the configuration schema if new options are added:

```javascript
schema: [
  {
    type: "object",
    properties: {
      // Add new property
      newOption: {
        type: "boolean",
        default: false,
      },
    },
  },
];
```

#### 3. Add Tests

Add test cases to `tests/no-alias-imports.test.js`:

```javascript
// Valid case
{
  code: "new syntax example",
  options: [{ newOption: true }],
},

// Invalid case
{
  code: "invalid syntax example",
  options: [{ newOption: true }],
  errors: [
    {
      messageId: 'newMessageId',
      data: { alias: 'example' },
    },
  ],
},
```

#### 4. Update Documentation

Update both `README.md` and this `DOC.md` file with new features.

### Debugging

#### Enable Debug Mode

Add console logging to the rule:

```javascript
create(context) {
  const options = context.options[0] || {};
  console.log('Rule options:', options);

  function isAliasImport(modulePath) {
    const result = /* detection logic */;
    console.log(`Checking "${modulePath}": ${result}`);
    return result;
  }
}
```

#### Test Specific Cases

Create isolated test files:

```javascript
// debug-test.js
const rule = require("./lib/rules/no-alias-imports");
const { RuleTester } = require("eslint");

const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 2020, sourceType: "module" },
});

ruleTester.run("debug", rule, {
  valid: [],
  invalid: [
    {
      code: "import foo from 'debug-case';",
      errors: [{ messageId: "noAliasImport" }],
    },
  ],
});
```

## API Reference

### Plugin Exports

```javascript
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
```

### Rule Configuration Options

#### `aliases` (Array)

Array of alias configurations. Each item can be:

- **String**: Simple prefix matching

  ```javascript
  "aliases": ["@", "~", "#"]
  ```

- **Object**: Advanced configuration with pattern matching
  ```javascript
  "aliases": [
    {
      "alias": "@components",
      "pattern": "^@components/.*\\.jsx?$"
    }
  ]
  ```

#### `patterns` (Array)

Array of regex pattern strings:

```javascript
"patterns": [
  "^src/",
  "^app/",
  "^utils/.*helper"
]
```

### Rule Messages

- `noAliasImport`: For ES6 imports and dynamic imports
- `noAliasRequire`: For CommonJS require statements
- `noAliasExport`: For ES6 export statements

## Troubleshooting

### Common Issues

#### 1. Plugin Not Found

**Error:**

```
Definition for rule 'no-alias-imports/no-alias-imports' was not found
```

**Solution:**
Ensure the plugin is properly installed and configured:

```javascript
{
  "plugins": ["no-alias-imports"],
  "rules": {
    "no-alias-imports/no-alias-imports": "error"
  }
}
```

#### 2. TypeScript Import Issues

**Error:**

```
Parsing error: Unexpected token 'import'
```

**Solution:**
Add TypeScript parser to ESLint config:

```javascript
{
  "parser": "@typescript-eslint/parser",
  "plugins": ["no-alias-imports"],
  "rules": {
    "no-alias-imports/no-alias-imports": "error"
  }
}
```

#### 3. Dynamic Imports Not Detected

**Issue:**
Dynamic imports (`import()`) are not being flagged.

**Solution:**
Ensure your ESLint config supports dynamic imports:

```javascript
{
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module"
  }
}
```

#### 4. False Positives

**Issue:**
Node modules being flagged as aliases.

**Solution:**
Check your alias configuration. Ensure patterns are specific:

```javascript
// Too broad
"aliases": ["react"]

// Better
"aliases": ["@", "~"]
"patterns": ["^src/", "^app/"]
```

### Performance Considerations

#### Large Codebases

For large codebases, consider:

1. **Specific Patterns**: Use precise regex patterns to avoid unnecessary checks
2. **Minimal Aliases**: Keep the aliases array small
3. **Targeted Rules**: Apply the rule only to specific file patterns

```javascript
{
  "overrides": [
    {
      "files": ["src/**/*.{js,ts,jsx,tsx}"],
      "rules": {
        "no-alias-imports/no-alias-imports": "error"
      }
    }
  ]
}
```

#### Memory Usage

The rule has minimal memory footprint but for very large files:

- Regex compilation is cached
- No file system operations
- O(n) complexity where n = number of import statements

### Version Compatibility

#### ESLint Versions

- **Minimum**: ESLint 7.0.0+
- **Recommended**: ESLint 8.0.0+
- **Tested**: ESLint 8.57.1

#### Node.js Versions

- **Minimum**: Node.js 12.0.0+
- **Recommended**: Node.js 16.0.0+
- **Tested**: Node.js 18.x, 20.x

### Contributing

#### Pull Request Process

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Update documentation
6. Submit pull request

#### Code Standards

- Follow existing code style
- Add JSDoc comments for new functions
- Maintain test coverage above 95%
- Update CHANGELOG.md for new features

---

_This documentation covers the complete technical implementation of the eslint-plugin-no-alias-imports. For user-facing documentation, see README.md._
