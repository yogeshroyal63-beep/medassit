"use strict";

module.exports = {
  env: {
    node: true,
    es2022: true,
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "commonjs",
  },
  rules: {
    "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    "no-console": "warn",
    "no-undef": "error",
    eqeqeq: ["error", "always"],
    "no-var": "error",
    "prefer-const": "warn",
  },
};
