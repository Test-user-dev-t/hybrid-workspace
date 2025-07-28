export default {
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{js,jsx,md,json}": ["prettier --write"],
  "docs/adr/*.md": ["adr-lint"]          // placeholder for future ADR checker
};
