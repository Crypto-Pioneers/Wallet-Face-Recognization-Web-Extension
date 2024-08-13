// vite.config.ts
import react from "file:///E:/Work/React%20App/anonid-web-extension/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { resolve } from "path";
import fs from "fs";
import { defineConfig } from "file:///E:/Work/React%20App/anonid-web-extension/node_modules/vite/dist/node/index.js";
import { crx } from "file:///E:/Work/React%20App/anonid-web-extension/node_modules/@crxjs/vite-plugin/dist/index.mjs";

// manifest.json
var manifest_default = {
  manifest_version: 3,
  name: "Anonid Wallet",
  description: "This wallet is using face-recognization module",
  options_ui: {
    page: "src/pages/options/index.html"
  },
  background: {
    service_worker: "src/pages/background/index.ts",
    type: "module"
  },
  action: {
    default_popup: "src/pages/popup/index.html",
    default_icon: {
      "32": "icon-32.png"
    }
  },
  icons: {
    "128": "icon-128.png"
  },
  permissions: [
    "activeTab",
    "webcam"
  ],
  content_scripts: [
    {
      matches: [
        "http://*/*",
        "https://*/*",
        "<all_urls>"
      ],
      js: [
        "src/pages/content/index.tsx"
      ],
      css: [
        "contentStyle.css"
      ]
    }
  ],
  devtools_page: "src/pages/devtools/index.html",
  web_accessible_resources: [
    {
      resources: [
        "contentStyle.css",
        "icon-128.png",
        "icon-32.png"
      ],
      matches: []
    }
  ],
  content_security_policy: {
    extension_pages: "script-src 'self' 'wasm-unsafe-eval'; object-src 'self';"
  }
};

// manifest.dev.json
var manifest_dev_default = {
  action: {
    default_icon: "public/dev-icon-32.png",
    default_popup: "src/pages/popup/index.html"
  },
  icons: {
    "128": "public/dev-icon-128.png"
  },
  permissions: [
    "activeTab",
    "webcam"
  ],
  web_accessible_resources: [
    {
      resources: [
        "contentStyle.css",
        "dev-icon-128.png",
        "dev-icon-32.png"
      ],
      matches: []
    }
  ],
  content_security_policy: {
    extension_pages: "script-src 'self' 'wasm-unsafe-eval'; object-src 'self';"
  }
};

// package.json
var package_default = {
  name: "vite-web-extension",
  version: "1.2.0",
  description: "A simple chrome extension template with Vite, React, TypeScript and Tailwind CSS.",
  license: "MIT",
  repository: {
    type: "git",
    url: "https://github.com/JohnBra/web-extension.git"
  },
  scripts: {
    build: "vite build",
    dev: "nodemon"
  },
  type: "module",
  dependencies: {
    "@polkadot/api": "^12.3.1",
    "@polkadot/apps-config": "^0.142.1",
    "@polkadot/keyring": "^13.0.2",
    "@wojtekmaj/react-qr-svg": "^2.0.0",
    antd: "^5.20.0",
    axios: "^1.7.3",
    "cess-js-sdk-frontend": "^0.2.3",
    "face-api.js": "^0.22.2",
    lodash: "^4.17.21",
    moment: "^2.30.1",
    react: "^18.3.1",
    "react-bodymovin": "^2.0.0",
    "react-dom": "^18.3.1",
    "react-webcam": "^7.2.0",
    "styled-components": "^6.1.12",
    viem: "^2.18.8",
    wagmi: "^2.12.2",
    "webextension-polyfill": "^0.11.0"
  },
  devDependencies: {
    "@crxjs/vite-plugin": "^2.0.0-beta.23",
    "@types/chrome": "^0.0.268",
    "@types/lodash": "^4.17.7",
    "@types/node": "^20.12.11",
    "@types/react": "^18.3.1",
    "@types/react-dom": "^18.3.0",
    "@types/webextension-polyfill": "^0.10.7",
    "@typescript-eslint/eslint-plugin": "^7.8.0",
    "@typescript-eslint/parser": "^7.8.0",
    "@vitejs/plugin-react": "^4.2.1",
    autoprefixer: "^10.4.19",
    eslint: "^8.57.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-import": "^2.29.1",
    "eslint-plugin-jsx-a11y": "^6.8.0",
    "eslint-plugin-react": "^7.34.1",
    "eslint-plugin-react-hooks": "^4.6.2",
    "fs-extra": "^11.2.0",
    nodemon: "^3.1.0",
    postcss: "^8.4.38",
    tailwindcss: "^3.4.3",
    "ts-node": "^10.9.2",
    typescript: "^5.4.5",
    vite: "^5.2.11"
  }
};

// vite.config.ts
var __vite_injected_original_dirname = "E:\\Work\\React App\\anonid-web-extension";
var root = resolve(__vite_injected_original_dirname, "src");
var pagesDir = resolve(root, "pages");
var assetsDir = resolve(root, "assets");
var outDir = resolve(__vite_injected_original_dirname, "dist");
var publicDir = resolve(__vite_injected_original_dirname, "public");
var isDev = process.env.__DEV__ === "true";
var extensionManifest = {
  ...manifest_default,
  ...isDev ? manifest_dev_default : {},
  name: isDev ? `DEV: ${manifest_default.name}` : manifest_default.name,
  version: package_default.version
};
function stripDevIcons(apply) {
  if (apply)
    return null;
  return {
    name: "strip-dev-icons",
    resolveId(source) {
      return source === "virtual-module" ? source : null;
    },
    renderStart(outputOptions, inputOptions) {
      const outDir2 = outputOptions.dir;
      fs.rm(resolve(outDir2, "dev-icon-32.png"), () => console.log(`Deleted dev-icon-32.png frm prod build`));
      fs.rm(resolve(outDir2, "dev-icon-128.png"), () => console.log(`Deleted dev-icon-128.png frm prod build`));
    }
  };
}
var vite_config_default = defineConfig({
  resolve: {
    alias: {
      "@src": root,
      "@assets": assetsDir,
      "@pages": pagesDir
    }
  },
  plugins: [
    react(),
    crx({
      manifest: extensionManifest,
      contentScripts: {
        injectCss: true
      }
    }),
    stripDevIcons(isDev)
  ],
  publicDir,
  build: {
    outDir,
    sourcemap: isDev,
    emptyOutDir: !isDev
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAibWFuaWZlc3QuanNvbiIsICJtYW5pZmVzdC5kZXYuanNvbiIsICJwYWNrYWdlLmpzb24iXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFxXb3JrXFxcXFJlYWN0IEFwcFxcXFxhbm9uaWQtd2ViLWV4dGVuc2lvblwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRTpcXFxcV29ya1xcXFxSZWFjdCBBcHBcXFxcYW5vbmlkLXdlYi1leHRlbnNpb25cXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0U6L1dvcmsvUmVhY3QlMjBBcHAvYW5vbmlkLXdlYi1leHRlbnNpb24vdml0ZS5jb25maWcudHNcIjtpbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHsgY3J4LCBNYW5pZmVzdFYzRXhwb3J0IH0gZnJvbSAnQGNyeGpzL3ZpdGUtcGx1Z2luJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IG1hbmlmZXN0IGZyb20gJy4vbWFuaWZlc3QuanNvbic7XG5pbXBvcnQgZGV2TWFuaWZlc3QgZnJvbSAnLi9tYW5pZmVzdC5kZXYuanNvbic7XG5pbXBvcnQgcGtnIGZyb20gJy4vcGFja2FnZS5qc29uJztcblxuY29uc3Qgcm9vdCA9IHJlc29sdmUoX19kaXJuYW1lLCAnc3JjJyk7XG5jb25zdCBwYWdlc0RpciA9IHJlc29sdmUocm9vdCwgJ3BhZ2VzJyk7XG5jb25zdCBhc3NldHNEaXIgPSByZXNvbHZlKHJvb3QsICdhc3NldHMnKTtcbmNvbnN0IG91dERpciA9IHJlc29sdmUoX19kaXJuYW1lLCAnZGlzdCcpO1xuY29uc3QgcHVibGljRGlyID0gcmVzb2x2ZShfX2Rpcm5hbWUsICdwdWJsaWMnKTtcblxuY29uc3QgaXNEZXYgPSBwcm9jZXNzLmVudi5fX0RFVl9fID09PSAndHJ1ZSc7XG5cbmNvbnN0IGV4dGVuc2lvbk1hbmlmZXN0ID0ge1xuICAuLi5tYW5pZmVzdCxcbiAgLi4uKGlzRGV2ID8gZGV2TWFuaWZlc3QgOiB7fSBhcyBNYW5pZmVzdFYzRXhwb3J0KSxcbiAgbmFtZTogaXNEZXYgPyBgREVWOiAkeyBtYW5pZmVzdC5uYW1lIH1gIDogbWFuaWZlc3QubmFtZSxcbiAgdmVyc2lvbjogcGtnLnZlcnNpb24sXG59O1xuXG4vLyBwbHVnaW4gdG8gcmVtb3ZlIGRldiBpY29ucyBmcm9tIHByb2QgYnVpbGRcbmZ1bmN0aW9uIHN0cmlwRGV2SWNvbnMgKGFwcGx5OiBib29sZWFuKSB7XG4gIGlmIChhcHBseSkgcmV0dXJuIG51bGxcblxuICByZXR1cm4ge1xuICAgIG5hbWU6ICdzdHJpcC1kZXYtaWNvbnMnLFxuICAgIHJlc29sdmVJZCAoc291cmNlOiBzdHJpbmcpIHtcbiAgICAgIHJldHVybiBzb3VyY2UgPT09ICd2aXJ0dWFsLW1vZHVsZScgPyBzb3VyY2UgOiBudWxsXG4gICAgfSxcbiAgICByZW5kZXJTdGFydCAob3V0cHV0T3B0aW9uczogYW55LCBpbnB1dE9wdGlvbnM6IGFueSkge1xuICAgICAgY29uc3Qgb3V0RGlyID0gb3V0cHV0T3B0aW9ucy5kaXJcbiAgICAgIGZzLnJtKHJlc29sdmUob3V0RGlyLCAnZGV2LWljb24tMzIucG5nJyksICgpID0+IGNvbnNvbGUubG9nKGBEZWxldGVkIGRldi1pY29uLTMyLnBuZyBmcm0gcHJvZCBidWlsZGApKVxuICAgICAgZnMucm0ocmVzb2x2ZShvdXREaXIsICdkZXYtaWNvbi0xMjgucG5nJyksICgpID0+IGNvbnNvbGUubG9nKGBEZWxldGVkIGRldi1pY29uLTEyOC5wbmcgZnJtIHByb2QgYnVpbGRgKSlcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAnQHNyYyc6IHJvb3QsXG4gICAgICAnQGFzc2V0cyc6IGFzc2V0c0RpcixcbiAgICAgICdAcGFnZXMnOiBwYWdlc0RpcixcbiAgICB9LFxuICB9LFxuICBwbHVnaW5zOiBbXG4gICAgcmVhY3QoKSxcbiAgICBjcngoe1xuICAgICAgbWFuaWZlc3Q6IGV4dGVuc2lvbk1hbmlmZXN0IGFzIE1hbmlmZXN0VjNFeHBvcnQsXG4gICAgICBjb250ZW50U2NyaXB0czoge1xuICAgICAgICBpbmplY3RDc3M6IHRydWUsXG4gICAgICB9XG4gICAgfSksXG4gICAgc3RyaXBEZXZJY29ucyhpc0RldilcbiAgXSxcbiAgcHVibGljRGlyLFxuICBidWlsZDoge1xuICAgIG91dERpcixcbiAgICBzb3VyY2VtYXA6IGlzRGV2LFxuICAgIGVtcHR5T3V0RGlyOiAhaXNEZXYsXG4gIH0sXG59KTtcbiIsICJ7XG4gIFwibWFuaWZlc3RfdmVyc2lvblwiOiAzLFxuICBcIm5hbWVcIjogXCJBbm9uaWQgV2FsbGV0XCIsXG4gIFwiZGVzY3JpcHRpb25cIjogXCJUaGlzIHdhbGxldCBpcyB1c2luZyBmYWNlLXJlY29nbml6YXRpb24gbW9kdWxlXCIsXG4gIFwib3B0aW9uc191aVwiOiB7XG4gICAgXCJwYWdlXCI6IFwic3JjL3BhZ2VzL29wdGlvbnMvaW5kZXguaHRtbFwiXG4gIH0sXG4gIFwiYmFja2dyb3VuZFwiOiB7XG4gICAgXCJzZXJ2aWNlX3dvcmtlclwiOiBcInNyYy9wYWdlcy9iYWNrZ3JvdW5kL2luZGV4LnRzXCIsXG4gICAgXCJ0eXBlXCI6IFwibW9kdWxlXCJcbiAgfSxcbiAgXCJhY3Rpb25cIjoge1xuICAgIFwiZGVmYXVsdF9wb3B1cFwiOiBcInNyYy9wYWdlcy9wb3B1cC9pbmRleC5odG1sXCIsXG4gICAgXCJkZWZhdWx0X2ljb25cIjoge1xuICAgICAgXCIzMlwiOiBcImljb24tMzIucG5nXCJcbiAgICB9XG4gIH0sXG4gIFwiaWNvbnNcIjoge1xuICAgIFwiMTI4XCI6IFwiaWNvbi0xMjgucG5nXCJcbiAgfSxcbiAgXCJwZXJtaXNzaW9uc1wiOiBbXG4gICAgXCJhY3RpdmVUYWJcIiwgXCJ3ZWJjYW1cIlxuICBdLFxuICBcImNvbnRlbnRfc2NyaXB0c1wiOiBbXG4gICAge1xuICAgICAgXCJtYXRjaGVzXCI6IFtcbiAgICAgICAgXCJodHRwOi8vKi8qXCIsXG4gICAgICAgIFwiaHR0cHM6Ly8qLypcIixcbiAgICAgICAgXCI8YWxsX3VybHM+XCJcbiAgICAgIF0sXG4gICAgICBcImpzXCI6IFtcbiAgICAgICAgXCJzcmMvcGFnZXMvY29udGVudC9pbmRleC50c3hcIlxuICAgICAgXSxcbiAgICAgIFwiY3NzXCI6IFtcbiAgICAgICAgXCJjb250ZW50U3R5bGUuY3NzXCJcbiAgICAgIF1cbiAgICB9XG4gIF0sXG4gIFwiZGV2dG9vbHNfcGFnZVwiOiBcInNyYy9wYWdlcy9kZXZ0b29scy9pbmRleC5odG1sXCIsXG4gIFwid2ViX2FjY2Vzc2libGVfcmVzb3VyY2VzXCI6IFtcbiAgICB7XG4gICAgICBcInJlc291cmNlc1wiOiBbXG4gICAgICAgIFwiY29udGVudFN0eWxlLmNzc1wiLFxuICAgICAgICBcImljb24tMTI4LnBuZ1wiLFxuICAgICAgICBcImljb24tMzIucG5nXCJcbiAgICAgIF0sXG4gICAgICBcIm1hdGNoZXNcIjogW11cbiAgICB9XG4gIF0sXG4gIFwiY29udGVudF9zZWN1cml0eV9wb2xpY3lcIjoge1xuICAgIFwiZXh0ZW5zaW9uX3BhZ2VzXCI6IFwic2NyaXB0LXNyYyAnc2VsZicgJ3dhc20tdW5zYWZlLWV2YWwnOyBvYmplY3Qtc3JjICdzZWxmJztcIlxuICB9XG59XG4iLCAie1xuICBcImFjdGlvblwiOiB7XG4gICAgXCJkZWZhdWx0X2ljb25cIjogXCJwdWJsaWMvZGV2LWljb24tMzIucG5nXCIsXG4gICAgXCJkZWZhdWx0X3BvcHVwXCI6IFwic3JjL3BhZ2VzL3BvcHVwL2luZGV4Lmh0bWxcIlxuICB9LFxuICBcImljb25zXCI6IHtcbiAgICBcIjEyOFwiOiBcInB1YmxpYy9kZXYtaWNvbi0xMjgucG5nXCJcbiAgfSxcbiAgXCJwZXJtaXNzaW9uc1wiOiBbXG4gICAgXCJhY3RpdmVUYWJcIiwgXCJ3ZWJjYW1cIlxuICBdLFxuICBcIndlYl9hY2Nlc3NpYmxlX3Jlc291cmNlc1wiOiBbXG4gICAge1xuICAgICAgXCJyZXNvdXJjZXNcIjogW1xuICAgICAgICBcImNvbnRlbnRTdHlsZS5jc3NcIixcbiAgICAgICAgXCJkZXYtaWNvbi0xMjgucG5nXCIsXG4gICAgICAgIFwiZGV2LWljb24tMzIucG5nXCJcbiAgICAgIF0sXG4gICAgICBcIm1hdGNoZXNcIjogW11cbiAgICB9XG4gIF0sXG4gIFwiY29udGVudF9zZWN1cml0eV9wb2xpY3lcIjoge1xuICAgIFwiZXh0ZW5zaW9uX3BhZ2VzXCI6IFwic2NyaXB0LXNyYyAnc2VsZicgJ3dhc20tdW5zYWZlLWV2YWwnOyBvYmplY3Qtc3JjICdzZWxmJztcIlxuICB9XG59XG4iLCAie1xuICBcIm5hbWVcIjogXCJ2aXRlLXdlYi1leHRlbnNpb25cIixcbiAgXCJ2ZXJzaW9uXCI6IFwiMS4yLjBcIixcbiAgXCJkZXNjcmlwdGlvblwiOiBcIkEgc2ltcGxlIGNocm9tZSBleHRlbnNpb24gdGVtcGxhdGUgd2l0aCBWaXRlLCBSZWFjdCwgVHlwZVNjcmlwdCBhbmQgVGFpbHdpbmQgQ1NTLlwiLFxuICBcImxpY2Vuc2VcIjogXCJNSVRcIixcbiAgXCJyZXBvc2l0b3J5XCI6IHtcbiAgICBcInR5cGVcIjogXCJnaXRcIixcbiAgICBcInVybFwiOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9Kb2huQnJhL3dlYi1leHRlbnNpb24uZ2l0XCJcbiAgfSxcbiAgXCJzY3JpcHRzXCI6IHtcbiAgICBcImJ1aWxkXCI6IFwidml0ZSBidWlsZFwiLFxuICAgIFwiZGV2XCI6IFwibm9kZW1vblwiXG4gIH0sXG4gIFwidHlwZVwiOiBcIm1vZHVsZVwiLFxuICBcImRlcGVuZGVuY2llc1wiOiB7XG4gICAgXCJAcG9sa2Fkb3QvYXBpXCI6IFwiXjEyLjMuMVwiLFxuICAgIFwiQHBvbGthZG90L2FwcHMtY29uZmlnXCI6IFwiXjAuMTQyLjFcIixcbiAgICBcIkBwb2xrYWRvdC9rZXlyaW5nXCI6IFwiXjEzLjAuMlwiLFxuICAgIFwiQHdvanRla21hai9yZWFjdC1xci1zdmdcIjogXCJeMi4wLjBcIixcbiAgICBcImFudGRcIjogXCJeNS4yMC4wXCIsXG4gICAgXCJheGlvc1wiOiBcIl4xLjcuM1wiLFxuICAgIFwiY2Vzcy1qcy1zZGstZnJvbnRlbmRcIjogXCJeMC4yLjNcIixcbiAgICBcImZhY2UtYXBpLmpzXCI6IFwiXjAuMjIuMlwiLFxuICAgIFwibG9kYXNoXCI6IFwiXjQuMTcuMjFcIixcbiAgICBcIm1vbWVudFwiOiBcIl4yLjMwLjFcIixcbiAgICBcInJlYWN0XCI6IFwiXjE4LjMuMVwiLFxuICAgIFwicmVhY3QtYm9keW1vdmluXCI6IFwiXjIuMC4wXCIsXG4gICAgXCJyZWFjdC1kb21cIjogXCJeMTguMy4xXCIsXG4gICAgXCJyZWFjdC13ZWJjYW1cIjogXCJeNy4yLjBcIixcbiAgICBcInN0eWxlZC1jb21wb25lbnRzXCI6IFwiXjYuMS4xMlwiLFxuICAgIFwidmllbVwiOiBcIl4yLjE4LjhcIixcbiAgICBcIndhZ21pXCI6IFwiXjIuMTIuMlwiLFxuICAgIFwid2ViZXh0ZW5zaW9uLXBvbHlmaWxsXCI6IFwiXjAuMTEuMFwiXG4gIH0sXG4gIFwiZGV2RGVwZW5kZW5jaWVzXCI6IHtcbiAgICBcIkBjcnhqcy92aXRlLXBsdWdpblwiOiBcIl4yLjAuMC1iZXRhLjIzXCIsXG4gICAgXCJAdHlwZXMvY2hyb21lXCI6IFwiXjAuMC4yNjhcIixcbiAgICBcIkB0eXBlcy9sb2Rhc2hcIjogXCJeNC4xNy43XCIsXG4gICAgXCJAdHlwZXMvbm9kZVwiOiBcIl4yMC4xMi4xMVwiLFxuICAgIFwiQHR5cGVzL3JlYWN0XCI6IFwiXjE4LjMuMVwiLFxuICAgIFwiQHR5cGVzL3JlYWN0LWRvbVwiOiBcIl4xOC4zLjBcIixcbiAgICBcIkB0eXBlcy93ZWJleHRlbnNpb24tcG9seWZpbGxcIjogXCJeMC4xMC43XCIsXG4gICAgXCJAdHlwZXNjcmlwdC1lc2xpbnQvZXNsaW50LXBsdWdpblwiOiBcIl43LjguMFwiLFxuICAgIFwiQHR5cGVzY3JpcHQtZXNsaW50L3BhcnNlclwiOiBcIl43LjguMFwiLFxuICAgIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjogXCJeNC4yLjFcIixcbiAgICBcImF1dG9wcmVmaXhlclwiOiBcIl4xMC40LjE5XCIsXG4gICAgXCJlc2xpbnRcIjogXCJeOC41Ny4wXCIsXG4gICAgXCJlc2xpbnQtY29uZmlnLXByZXR0aWVyXCI6IFwiXjkuMS4wXCIsXG4gICAgXCJlc2xpbnQtcGx1Z2luLWltcG9ydFwiOiBcIl4yLjI5LjFcIixcbiAgICBcImVzbGludC1wbHVnaW4tanN4LWExMXlcIjogXCJeNi44LjBcIixcbiAgICBcImVzbGludC1wbHVnaW4tcmVhY3RcIjogXCJeNy4zNC4xXCIsXG4gICAgXCJlc2xpbnQtcGx1Z2luLXJlYWN0LWhvb2tzXCI6IFwiXjQuNi4yXCIsXG4gICAgXCJmcy1leHRyYVwiOiBcIl4xMS4yLjBcIixcbiAgICBcIm5vZGVtb25cIjogXCJeMy4xLjBcIixcbiAgICBcInBvc3Rjc3NcIjogXCJeOC40LjM4XCIsXG4gICAgXCJ0YWlsd2luZGNzc1wiOiBcIl4zLjQuM1wiLFxuICAgIFwidHMtbm9kZVwiOiBcIl4xMC45LjJcIixcbiAgICBcInR5cGVzY3JpcHRcIjogXCJeNS40LjVcIixcbiAgICBcInZpdGVcIjogXCJeNS4yLjExXCJcbiAgfVxufVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUE4UyxPQUFPLFdBQVc7QUFDaFUsU0FBUyxlQUFlO0FBQ3hCLE9BQU8sUUFBUTtBQUNmLFNBQVMsb0JBQW9CO0FBQzdCLFNB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
