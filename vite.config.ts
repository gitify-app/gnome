import { defineConfig } from 'vite-plus';

export default defineConfig({
  lint: {
    plugins: ['unicorn', 'oxc'],
    categories: {
      correctness: 'error',
    },
    // GNOME Shell injects its `global` object into every extension.
    globals: {
      global: 'readonly',
    },
    ignorePatterns: ['dist/**', 'node_modules/**'],
    rules: {
      'no-console': 'error',
      'no-unused-vars': [
        'error',
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'no-param-reassign': 'error',
      'default-param-last': 'error',
      'default-case': 'error',
      curly: 'error',
    },
  },
  fmt: {
    tabWidth: 2,
    useTabs: false,
    singleQuote: true,
    ignorePatterns: ['dist/**', 'node_modules/**', 'CHANGELOG.md', 'pnpm-lock.yaml'],
  },
});
