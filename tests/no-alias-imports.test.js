/**
 * @fileoverview Tests for no-alias-imports rule
 */
"use strict";

const { RuleTester } = require("eslint");
const rule = require("../lib/rules/no-alias-imports");

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
});

ruleTester.run("no-alias-imports", rule, {
  valid: [
    // Relative imports - should be allowed
    "import foo from './foo';",
    "import bar from '../bar';",
    "import baz from '../../baz';",

    // Absolute imports - should be allowed
    "import fs from 'fs';",
    "import path from 'path';",
    "import lodash from 'lodash';",
    "import React from 'react';",

    // CommonJS requires - should be allowed
    "const foo = require('./foo');",
    "const bar = require('../bar');",
    "const fs = require('fs');",
    "const lodash = require('lodash');",

    // Export declarations without aliases
    "export { foo } from './foo';",
    "export * from '../bar';",
    "export { default as baz } from 'lodash';",

    // Dynamic imports - should be allowed
    "import('./foo');",
    "import('../bar');",
    "import('lodash');",

    // Custom configuration - paths that don't match aliases
    {
      code: "import foo from 'src/foo';",
      options: [{ aliases: ["@"] }],
    },
    {
      code: "import foo from '#internal/foo';",
      options: [{ aliases: ["@", "~"] }],
    },

    // Custom pattern configuration
    {
      code: "import foo from 'lib/foo';",
      options: [{ patterns: ["^@/"] }],
    },

    // Allowlist configuration - these should be allowed even though they match aliases
    {
      code: "import types from '@/types';",
      options: [{ aliases: ["@"], allowlist: ["@/types"] }],
    },
    {
      code: "import config from '@/config/app';",
      options: [{ aliases: ["@"], allowlist: ["@/config"] }],
    },
    {
      code: "import constants from '@/constants/ui';",
      options: [{ aliases: ["@"], allowlist: ["@/constants/*"] }],
    },
    {
      code: "const shared = require('~/shared/utils');",
      options: [{ aliases: ["~"], allowlist: ["~/shared"] }],
    },
    {
      code: "export { api } from '@/api/types';",
      options: [{ aliases: ["@"], allowlist: ["@/api/types"] }],
    },
  ],

  invalid: [
    // Basic alias imports with default @ and ~ prefixes
    {
      code: "import foo from '@/foo';",
      errors: [
        {
          messageId: "noAliasImport",
          data: { alias: "@/foo" },
        },
      ],
    },
    {
      code: "import bar from '~/bar';",
      errors: [
        {
          messageId: "noAliasImport",
          data: { alias: "~/bar" },
        },
      ],
    },

    // Alias imports with custom prefixes
    {
      code: "import foo from '@components/foo';",
      errors: [
        {
          messageId: "noAliasImport",
          data: { alias: "@components/foo" },
        },
      ],
    },
    {
      code: "import utils from '~/utils/helper';",
      errors: [
        {
          messageId: "noAliasImport",
          data: { alias: "~/utils/helper" },
        },
      ],
    },

    // CommonJS require with aliases
    {
      code: "const foo = require('@/foo');",
      errors: [
        {
          messageId: "noAliasRequire",
          data: { alias: "@/foo" },
        },
      ],
    },
    {
      code: "const bar = require('~/bar');",
      errors: [
        {
          messageId: "noAliasRequire",
          data: { alias: "~/bar" },
        },
      ],
    },

    // Export declarations with aliases
    {
      code: "export { foo } from '@/foo';",
      errors: [
        {
          messageId: "noAliasExport",
          data: { alias: "@/foo" },
        },
      ],
    },
    {
      code: "export * from '~/components';",
      errors: [
        {
          messageId: "noAliasExport",
          data: { alias: "~/components" },
        },
      ],
    },

    // Dynamic imports with aliases
    {
      code: "import('@/async-component');",
      errors: [
        {
          messageId: "noAliasImport",
          data: { alias: "@/async-component" },
        },
      ],
    },

    // Custom alias configuration
    {
      code: "import foo from '#internal/foo';",
      options: [{ aliases: ["#internal"] }],
      errors: [
        {
          messageId: "noAliasImport",
          data: { alias: "#internal/foo" },
        },
      ],
    },

    // Custom pattern configuration
    {
      code: "import foo from 'src/components/foo';",
      options: [{ patterns: ["^src/"] }],
      errors: [
        {
          messageId: "noAliasImport",
          data: { alias: "src/components/foo" },
        },
      ],
    },

    // Complex alias configuration with object format
    {
      code: "import foo from '@components/Button';",
      options: [
        {
          aliases: [{ alias: "@components", pattern: "^@components/" }, "~"],
        },
      ],
      errors: [
        {
          messageId: "noAliasImport",
          data: { alias: "@components/Button" },
        },
      ],
    },

    // Multiple violations in same file
    {
      code: `
        import foo from '@/foo';
        import bar from '~/bar';
        const baz = require('@/baz');
        export { qux } from '~/qux';
      `,
      errors: [
        {
          messageId: "noAliasImport",
          data: { alias: "@/foo" },
        },
        {
          messageId: "noAliasImport",
          data: { alias: "~/bar" },
        },
        {
          messageId: "noAliasRequire",
          data: { alias: "@/baz" },
        },
        {
          messageId: "noAliasExport",
          data: { alias: "~/qux" },
        },
      ],
    },

    // Mixed valid and invalid imports
    {
      code: `
        import React from 'react';
        import foo from '@/foo';
        import './styles.css';
        const bar = require('~/bar');
      `,
      errors: [
        {
          messageId: "noAliasImport",
          data: { alias: "@/foo" },
        },
        {
          messageId: "noAliasRequire",
          data: { alias: "~/bar" },
        },
      ],
    },
  ],
});
