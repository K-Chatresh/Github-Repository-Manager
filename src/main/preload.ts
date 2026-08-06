import { contextBridge, ipcRenderer } from 'electron';

const IPC = {
  CREATE_REPO: 'create-repo',
  PUSH_REPO: 'push-repo',
  SELECT_FOLDER: 'select-folder',
  CHECK_GIT_STATUS: 'check-git-status',
  INIT_GIT_REPO: 'init-git-repo',
  LIST_FILES: 'list-files',
  SET_CURRENT_REPO_PATH: 'set-current-repo-path',
  GET_CURRENT_REPO_PATH: 'get-current-repo-path',
  GET_REPO_INFO: 'get-repo-info',
  SET_REMOTE: 'set-remote',
  TERMINAL_LOG: 'terminal-log',
  CHECK_PUSH_STATUS: 'check-push-status',
  CLONE_REPO: 'clone-repo',
  SAVE_REPO_CREDENTIALS: 'save-repo-credentials',
  GET_REPO_CREDENTIALS: 'get-repo-credentials',
  READ_FILE: 'read-file',
  GET_OVERVIEW_DATA: 'get-overview-data',
} as const;

contextBridge.exposeInMainWorld('electronAPI', {
  createRepo: (name: string, token: string) => ipcRenderer.invoke(IPC.CREATE_REPO, name, token),
  pushRepo: (folder: string, remoteUrl: string) => ipcRenderer.invoke(IPC.PUSH_REPO, folder, remoteUrl),
  selectFolder: () => ipcRenderer.invoke(IPC.SELECT_FOLDER),
  checkGitStatus: (folder: string) => ipcRenderer.invoke(IPC.CHECK_GIT_STATUS, folder),
  initGitRepo: (folder: string) => ipcRenderer.invoke(IPC.INIT_GIT_REPO, folder),
  listFiles: (folder: string) => ipcRenderer.invoke(IPC.LIST_FILES, folder),
  setCurrentRepoPath: (folder: string | null) => ipcRenderer.invoke(IPC.SET_CURRENT_REPO_PATH, folder),
  getCurrentRepoPath: () => ipcRenderer.invoke(IPC.GET_CURRENT_REPO_PATH),
  getRepoInfo: (folder: string) => ipcRenderer.invoke(IPC.GET_REPO_INFO, folder),
  setRemote: (folder: string, remoteUrl: string) => ipcRenderer.invoke(IPC.SET_REMOTE, folder, remoteUrl),
  onTerminalLog: (callback: (message: string) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, message: string) => callback(message);
    ipcRenderer.on(IPC.TERMINAL_LOG, handler);
    return () => ipcRenderer.removeListener(IPC.TERMINAL_LOG, handler);
  },
  checkPushStatus: (folder: string) => ipcRenderer.invoke(IPC.CHECK_PUSH_STATUS, folder),
  cloneRepo: (repoUrl: string, destFolder: string) => ipcRenderer.invoke(IPC.CLONE_REPO, repoUrl, destFolder),
  saveRepoCredentials: (repoPath: string, username: string, email: string, token: string) =>
    ipcRenderer.invoke(IPC.SAVE_REPO_CREDENTIALS, repoPath, username, email, token),
  getRepoCredentials: (repoPath: string) => ipcRenderer.invoke(IPC.GET_REPO_CREDENTIALS, repoPath),
  readFile: (filePath: string) => ipcRenderer.invoke(IPC.READ_FILE, filePath),
  getOverviewData: (folder: string) => ipcRenderer.invoke(IPC.GET_OVERVIEW_DATA, folder),
});
