const js = require('@eslint/js');
const prettier = require('eslint-plugin-prettier');
const prettierConfig = require('eslint-config-prettier');
const tseslint = require('typescript-eslint');
const reactPlugin = require('eslint-plugin-react');
const reactHooksPlugin = require('eslint-plugin-react-hooks');
const globals = require('globals');

module.exports = [
  {
    ignores: [
      'node_modules/**',
      'lib/**',
      'android/build/**',
      'ios/build/**',
      'example/node_modules/**',
      'docs/build/**',
      'docs/node_modules/**',
      'docs/.docusaurus/**',
      'plugin/build/**',
      '**/*.d.ts',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  {
    files: ['**/*.{js,ts,tsx}'],
    plugins: {
      prettier,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'prettier/prettier': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
];
