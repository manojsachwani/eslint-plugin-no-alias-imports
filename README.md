# eslint-plugin-no-alias-imports

An ESLint plugin that flags alias imports in JavaScript and TypeScript files. This plugin helps enforce the use of relative or absolute paths instead of custom path aliases, which can improve code clarity and reduce build configuration complexity.

## Installation

```bash
npm install --save-dev eslint-plugin-no-alias-imports
```

## Usage

### Basic Configuration

Add the plugin to your ESLint configuration:

**.eslintrc.js**

```javascript
module.exports = {
  plugins: ["no-alias-imports"],
  rules: {
    "no-alias-imports/no-alias-imports": "error",
  },
};
```

Or use the recommended configuration:

**.eslintrc.js**

```javascript
module.exports = {
  extends: ["plugin:no-alias-imports/recommended"],
};
```

### Configuration Options

The rule accepts an options object with the following properties:

#### `aliases` (Array)

An array of alias prefixes to flag. Can contain strings or objects with more specific configuration.

**Default:** `['@', '~']`

**Examples:**

```javascript
// String format - simple prefix matching
{
  "no-alias-imports/no-alias-imports": ["error", {
    "aliases": ["@", "~", "#"]
  }]
}

// Object format - more control with patterns
{
  "no-alias-imports/no-alias-imports": ["error", {
    "aliases": [
      "@",
      "~",
      {
        "alias": "@components",
        "pattern": "^@components/"
      }
    ]
  }]
}
```

#### `patterns` (Array)

An array of regex patterns to match against import paths.

**Default:** `[]`

**Example:**

```javascript
{
  "no-alias-imports/no-alias-imports": ["error", {
    "patterns": [
      "^src/",
      "^app/",
      "^@/"
    ]
  }]
}
```

## Examples

### What gets flagged (❌)

```javascript
// ES6 imports
import Button from "@/components/Button";
import utils from "~/utils/helpers";
import config from "@config/app";

// CommonJS requires
const Button = require("@/components/Button");
const utils = require("~/utils/helpers");

// ES6 exports
export { Button } from "@/components/Button";
export * from "~/utils";

// Dynamic imports
const Component = await import("@/components/AsyncComponent");
```

### What doesn't get flagged (✅)

```javascript
// Relative imports
import Button from "./components/Button";
import utils from "../utils/helpers";
import config from "../../config/app";

// Node modules
import React from "react";
import lodash from "lodash";
import fs from "fs";

// CommonJS requires
const Button = require("./components/Button");
const fs = require("fs");

// ES6 exports
export { Button } from "./components/Button";
export * from "../utils";

// Dynamic imports
const Component = await import("./components/AsyncComponent");
```

## Rule Details

This rule analyzes the following types of import/export statements:

- **ES6 import declarations**: `import foo from 'module'`
- **ES6 export declarations**: `export { foo } from 'module'` and `export * from 'module'`
- **CommonJS require calls**: `require('module')`
- **Dynamic imports**: `import('module')`

### Supported File Types

- JavaScript (`.js`, `.jsx`)
- TypeScript (`.ts`, `.tsx`)
- Both CommonJS and ES modules

## Configuration Examples

### Basic Usage with Default Aliases

Only flags imports starting with `@` or `~`:

```javascript
{
  "rules": {
    "no-alias-imports/no-alias-imports": "error"
  }
}
```

### Custom Aliases

```javascript
{
  "rules": {
    "no-alias-imports/no-alias-imports": ["error", {
      "aliases": ["@", "~", "#", "$"]
    }]
  }
}
```

### Pattern-Based Configuration

```javascript
{
  "rules": {
    "no-alias-imports/no-alias-imports": ["error", {
      "patterns": [
        "^src/",
        "^app/",
        "^components/",
        "^utils/"
      ]
    }]
  }
}
```

### Mixed Configuration

```javascript
{
  "rules": {
    "no-alias-imports/no-alias-imports": ["error", {
      "aliases": [
        "@",
        "~",
        {
          "alias": "@components",
          "pattern": "^@components/"
        }
      ],
      "patterns": [
        "^src/"
      ]
    }]
  }
}
```

## Integration with TypeScript

This plugin works seamlessly with TypeScript projects. Make sure to include the TypeScript parser in your ESLint configuration:

**.eslintrc.js**

```javascript
module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["no-alias-imports"],
  rules: {
    "no-alias-imports/no-alias-imports": "error",
  },
};
```

## Migration Guide

If you're currently using path aliases and want to migrate to relative/absolute paths:

1. **Start with warnings**: Set the rule to `'warn'` initially
2. **Identify patterns**: Use the plugin to see all alias usage in your codebase
3. **Gradual migration**: Convert aliases to relative paths file by file
4. **Enforce**: Change to `'error'` once migration is complete

## Why Avoid Path Aliases?

- **Simplicity**: Reduces build configuration complexity
- **Portability**: Code works without special bundler configuration
- **Clarity**: Import paths clearly show file relationships
- **Tool compatibility**: Better support across different tools and IDEs
- **Learning curve**: Easier for new developers to understand

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Changelog

### 1.0.3 (2025-09-21)

#### Added

- Automated CI/CD pipeline with GitHub Actions
- Automated npm publishing on release creation or tag push
- Comprehensive test coverage reporting
- Enhanced package scripts for development workflow
- Detailed publishing and release documentation

#### Changed

- Improved package.json with proper lifecycle hooks
- Enhanced development scripts (`test:coverage`, `prepublishOnly`, etc.)
- Updated package exclusions via .npmignore

#### Infrastructure

- Added GitHub Actions workflow for continuous integration
- Added automated release workflow supporting both GitHub releases and tag-based publishing
- Added npm provenance for enhanced security
- Multi-Node.js version testing (16.x, 18.x, 20.x)

### 1.0.2

#### Fixed

- Minor bug fixes and stability improvements
- Enhanced error messaging

### 1.0.1

#### Fixed

- Documentation improvements
- Package metadata updates

### 1.0.0

#### Added

- Initial release
- Support for ES6 imports/exports, CommonJS requires, and dynamic imports
- Configurable alias prefixes and regex patterns
- Comprehensive test suite
- TypeScript support
- Recommended ESLint configuration
