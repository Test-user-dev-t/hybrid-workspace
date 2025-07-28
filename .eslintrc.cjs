module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "prettier", "import", "react"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
    "plugin:react/recommended"
  ],
  env: { browser: true, es2021: true, node: true },
  ignorePatterns: ["dist/**", "build/**"],
  rules: {
    "prefer-const": "error",
    "no-param-reassign": ["error", { props: true }],
    "no-direct-mutation": "error",            
    "import/no-default-export": "error",
    "import/order": [
      "error",
      {
        groups: ["builtin", "external", "internal", "parent", "sibling"],
        pathGroups: [
          { pattern: "y*", group: "external", position: "before" }, // Yjs first
          { pattern: "@/**", group: "internal" }
        ]
      }
    ],

    /* ⚡  React & performance  */
    "react-hooks/exhaustive-deps": "error",
    "react/jsx-key": "error",
    "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],

    /* 🧹  Type-safety  */
    "@typescript-eslint/no-non-null-assertion": "error"
  },
  settings: { react: { version: "detect" } }
};
