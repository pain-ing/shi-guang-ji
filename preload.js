const { contextBridge, ipcRenderer } = require('electron');

// 暴露安全的 API 到渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 版本信息
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  },
  
  // 平台信息
  platform: process.platform,
  
  // IPC 通信
  send: (channel, data) => {
    const validChannels = [
      'menu-new-record',
      'menu-export',
      'app-message'
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  
  receive: (channel, func) => {
    const validChannels = [
      'menu-new-record',
      'menu-export',
      'app-message'
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
  
  // 文件操作
  saveFile: async (options) => {
    return await ipcRenderer.invoke('save-file', options);
  },
  
  openFile: async (options) => {
    return await ipcRenderer.invoke('open-file', options);
  },
  
  // 显示通知
  showNotification: (title, body) => {
    new Notification(title, { body });
  }
});

// 监听主进程消息
ipcRenderer.on('app-message', (event, message) => {
  console.log('收到主进程消息:', message);
});