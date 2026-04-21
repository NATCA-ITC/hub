import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'

export default tseslint.config(
  // Base JS rules
  js.configs.recommended,

  // TypeScript rules
  ...tseslint.configs.recommended,

  // Vue 3 rules
  ...pluginVue.configs['flat/recommended'],

  // Vue files use the TypeScript parser
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },

  // Project-wide settings
  {
    languageOptions: {
      globals: {
        // Browser globals
        console: 'readonly',
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        // unplugin-vue-router auto-imports
        definePage: 'readonly',
      },
    },
    rules: {
      // Relax rules for gradual adoption
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'vue/multi-word-component-names': 'off', // file-based routing uses single-word names
      'vue/no-v-html': 'warn',
      'vue/valid-v-slot': ['error', { allowModifiers: true }], // Vuetify VDataTable uses #item.column
    },
  },

  // Ignore patterns
  {
    ignores: [
      'dist/',
      'node_modules/',
      'TEMP/',
      '*.d.ts',
      'components.d.ts',
      'auto-imports.d.ts',
      'typed-router.d.ts',
    ],
  },
)
