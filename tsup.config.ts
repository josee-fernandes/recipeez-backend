import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: 'esm',
  target: 'es2023',
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  bundle: true,
  splitting: false,
  dts: false,
  noExternal: [/^@\//]
})