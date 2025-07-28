module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier', 'import', 'react', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react/jsx-runtime',
  ],
  env: { browser: true, es2021: true, node: true },
  ignorePatterns: ['dist/**', 'build/**'],
  rules: {
    'prefer-const': 'error',
    'no-param-reassign': ['error', { props: true }],
    'no-direct-mutation': 'off',
    'import/no-default-export': 'off',
    'import/order': [
      'off',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling'],
        pathGroups: [
          { pattern: 'y*', group: 'external', position: 'before' }, // Yjs first
          { pattern: '@/**', group: 'internal' },
        ],
      },
    ],

    /* ⚡  React & performance  */
    'react-hooks/exhaustive-deps': 'error',
    'react/jsx-key': 'error',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'react/react-in-jsx-scope': 'off', // ADD THIS LINE to turn off the old React in scope rule

    /* 🧹  Type-safety  */
    // "@typescript-eslint/no-non-null-assertion": "error" // COMMENT OUT or CHANGE TO "off"
    '@typescript-eslint/no-non-null-assertion': 'off', // Use 'off' to disable the non-null assertion error
  },
  settings: { react: { version: 'detect' } },
};
