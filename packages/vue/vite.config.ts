import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import path from 'path';

export default defineConfig({
  plugins: [
    vue(),
    dts({
      include: ['src/**/*.ts', 'src/**/*.vue'],
      outDir: 'dist',
      staticImport: true,
      insertTypesEntry: true,
      // 跳过 core 包源码的类型检查（core 包自己生成 dts）
      exclude: ['../core/src/**'],
      tsconfigPath: './tsconfig.json',
      compilerOptions: {
        skipLibCheck: true
      }
    })
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'), // 入口文件
      name: 'DziViewerVue',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'cjs'}`
    },
    rollupOptions: {
      external: [
        'vue',
        'element-plus',
        '@element-plus/icons-vue',
        'openseadragon',
        '@wtsml/doodle',
        '@pathology/dzi-viewer-core'
      ],
      output: {
        globals: {
          vue: 'Vue',
          'element-plus': 'ElementPlus',
          openseadragon: 'OpenSeadragon'
        }
      }
    }
  }
});
