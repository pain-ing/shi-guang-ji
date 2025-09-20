module.exports = {
  appId: "com.shiguangji.app",
  productName: "拾光集",
  directories: {
    output: "dist",
    buildResources: "build"
  },
  files: [
    "electron-main.js",
    "preload.js",
    ".next/standalone/**/*",
    "public/**/*",
    "!node_modules/**/*"
  ],
  extraResources: [
    {
      from: ".next/standalone",
      to: "app",
      filter: ["**/*"]
    }
  ],
  win: {
    target: [
      {
        target: "nsis",
        arch: ["x64"]
      }
    ]
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: "拾光集"
  },
  // 防止打包 node_modules
  npmRebuild: false,
  nodeGypRebuild: false,
  buildDependenciesFromSource: false
};