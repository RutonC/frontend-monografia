import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { globalIgnores } from 'eslint/config'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // O codebase usa `any` extensivamente há muito tempo (centenas de
      // ocorrências pré-existentes) — manter como aviso em vez de erro
      // para não bloquear o CI numa regra que nunca foi seguida, sem
      // perder a visibilidade do problema.
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // guards.tsx e main.context.tsx exportam deliberadamente helpers
      // e hooks a par de componentes (padrão comum de context+hook) —
      // aviso, não erro.
      'react-refresh/only-export-components': 'warn',
    },
  },
])
