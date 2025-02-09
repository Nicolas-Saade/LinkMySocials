import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { viteCommonjs, esbuildCommonjs } from '@originjs/vite-plugin-commonjs';
import { isTypeAliasDeclaration } from 'typescript';
import tsconfigPaths from 'vite-tsconfig-paths';

const extensions = [
  ".web.tsx",
  ".tsx",
  ".web.ts",
  ".ts",
  ".web.jsx",
  ".jsx",
  ".web.js",
  ".js",
  ".css",
  ".json",
];

export default defineConfig({
  define: {
    global: 'window', // Define `global` for compatibility with some libraries
    __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'), // Define __DEV__ for React Native
    'process.env': {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      EXPO_OS: JSON.stringify('web'),
    },
    'process.platform': JSON.stringify('web'),
  },
  optimizeDeps: {
    esbuildOptions: {
      resolveExtensions: extensions,
      loader: { 
        '.js': 'jsx',
        '.ts': 'tsx',
      },
      plugins: [
        {
          name: 'commonjs-resolver',
          setup(build) {
            build.onResolve({ filter: /.*/ }, args => {
              if (args.path.includes('@react-native/assets-registry')) {
                return { path: require.resolve('react-native-web/dist/cjs/modules/AssetRegistry') }
              }
            })
          }
        }
      ],
    },
    exclude: ['react-native-document-picker'], // Exclude from dependency optimization
  },
  resolve: {
    alias: {
      'react-native-image-picker': 'react-native-web',
      'react-native': path.resolve(__dirname, 'node_modules/react-native-web'),
      'react-native/Libraries/Animated/NativeAnimatedHelper':
      'react-native-web/dist/cjs/exports/Animated/NativeAnimatedHelper',
      'react-native-reanimated': '/Users/nicolassaade/notcloud_project/TTmigtool/TikTok_Parser/FrontEnd/react-native-reanimated.js', // Reanimated for web
      'react-native/Libraries/TurboModule/TurboModuleRegistry': path.resolve(
        __dirname,
        'src/stubs/TurboModuleRegistry.js'
      ), // Stub TurboModuleRegistry
      'expo-linear-gradient': 'react-native-web-linear-gradient',
      'react-native-modal-dropdown': 'react-select',
      '@react-native/assets-registry': 'react-native-web/dist/cjs/modules/AssetRegistry',
      'expo-asset': 'react-native-web/dist/cjs/modules/AssetRegistry',
    },
    extensions: extensions,
  },
  plugins: [viteCommonjs(), react(), tsconfigPaths()], // Include viteCommonjs plugin
  base: '/static/', // Base path for Django
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
      include: [/node_modules/, /@react-native/, /expo-asset/],
    },
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name][extname]',
        manualChunks: {
          vendor: ['react', 'react-dom'], // Example: Split React and React DOM into a separate chunk
        },
      },
      external: ['react-native-document-picker'], // Exclude the library from the bundle
      input: ['./src/main.jsx', './index.html'],
    },
    manifest: true, // Generates a manifest file for hashed assets
  },
  esbuild: {
    jsx: 'automatic',
  },
  server: {
    port: 3000,
  },
});