import { app, BrowserWindow, ipcMain, dialog, safeStorage } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import Store from 'electron-store';
import simpleGit from 'simple-git';
import { Octokit } from '@octokit/rest';
import { IPC } from '../shared/ipc-channels';

interface StoreSchema {
  currentRepoPath: string;
  globalCredentials?: {
    username: string;
    email: string;
    token: string;
  };
  repoCredentials?: {
    [repoPath: string]: {
      username: string;
      email: string;
      token: string;
    };
  };
}

const store = new Store<StoreSchema>({});
let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'hiddenInset',
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
}

// ---------- Helpers ----------

function logToTerminal(message: string) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(IPC.TERMINAL_LOG, message);
  }
}

function encryptCredential(value: string): string {
  if (safeStorage.isEncryptionAvailable()) {
    return safeStorage.encryptString(value).toString('hex');
  }
  return value; // fallback plaintext
}

function decryptCredential(encrypted: string | undefined): string | null {
  if (!encrypted) return null;
  if (safeStorage.isEncryptionAvailable()) {
    return safeStorage.decryptString(Buffer.from(encrypted, 'hex'));
  }
  return encrypted;
}

// Gets the effective credentials for a repo (repo-level overrides global)
function getCredentialsForRepo(repoPath: string): { username: string; email: string; token: string } | null {
  const repoCreds = store.get('repoCredentials')?.[repoPath];
  if (repoCreds) {
    return {
      username: decryptCredential(repoCreds.username) ?? '',
      email: decryptCredential(repoCreds.email) ?? '',
      token: decryptCredential(repoCreds.token) ?? '',
    };
  }
  const globalCreds = store.get('globalCredentials');
  if (globalCreds) {
    return {
      username: decryptCredential(globalCreds.username) ?? '',
      email: decryptCredential(globalCreds.email) ?? '',
      token: decryptCredential(globalCreds.token) ?? '',
    };
  }
  return null;
}

// ---------- IPC Handlers ----------

// Global credentials
ipcMain.handle(IPC.SAVE_GLOBAL_CREDENTIALS, async (_, username: string, email: string, token: string) => {
  store.set('globalCredentials', {
    username: encryptCredential(username),
    email: encryptCredential(email),
    token: encryptCredential(token),
  });
});

ipcMain.handle(IPC.GET_GLOBAL_CREDENTIALS, async () => {
  const creds = store.get('globalCredentials');
  if (!creds) return null;
  return {
    username: decryptCredential(creds.username),
    email: decryptCredential(creds.email),
    token: decryptCredential(creds.token),
  };
});

// Per-repository credentials
ipcMain.handle(IPC.SAVE_REPO_CREDENTIALS, async (_, repoPath: string, username: string, email: string, token: string) => {
  const repoCreds = store.get('repoCredentials') || {};
  repoCreds[repoPath] = {
    username: encryptCredential(username),
    email: encryptCredential(email),
    token: encryptCredential(token),
  };
  store.set('repoCredentials', repoCreds);
});

ipcMain.handle(IPC.GET_REPO_CREDENTIALS, async (_, repoPath: string) => {
  const creds = store.get('repoCredentials')?.[repoPath];
  if (!creds) return null;
  return {
    username: decryptCredential(creds.username),
    email: decryptCredential(creds.email),
    token: decryptCredential(creds.token),
  };
});

ipcMain.handle(IPC.CREATE_REPO, async (_, repoName: string, token: string) => {
  if (!token) throw new Error('No token provided.');

  const octokit = new Octokit({ auth: token });
  const { data } = await octokit.repos.createForAuthenticatedUser({
    name: repoName,
    auto_init: false,
  });
  return data.clone_url;
});

ipcMain.handle(IPC.PUSH_REPO, async (_, folder: string, remoteUrl: string) => {
  const creds = getCredentialsForRepo(folder);
  if (!creds || !creds.token) throw new Error('No credentials for this repository.');

  const git = simpleGit(folder);
  logToTerminal(`[PUSH] Starting push for ${folder}`);

  const cleanUrl = remoteUrl.replace(/^https:\/\/([^@]+@)+/, 'https://');
  const tokenUrl = cleanUrl.replace('https://', `https://${creds.token}@`);
  logToTerminal(`[PUSH] Using remote: ${cleanUrl}`);

  try {
    // Set git author for this repo (local config)
    await git.addConfig('user.name', creds.username);
    await git.addConfig('user.email', creds.email);
    logToTerminal(`[PUSH] Commit author set to ${creds.username} <${creds.email}>`);

    try { 
      await git.addRemote('origin', tokenUrl);
      logToTerminal(`[PUSH] Added remote origin`);
    } catch { 
      logToTerminal(`[PUSH] Remote origin exists, updating URL`);
    }
    await git.remote(['set-url', 'origin', tokenUrl]);
    logToTerminal(`[PUSH] Remote set (token embedded)`);

    logToTerminal(`[PUSH] Adding files...`);
    await git.add('.');
    logToTerminal(`[PUSH] Committing...`);
    await git.commit('GitHub Repo Manager auto-commit');

    logToTerminal(`[PUSH] Pushing to origin HEAD (force)...`);
    await git.push('origin', 'HEAD', ['--force', '--verbose']);
    logToTerminal(`[PUSH] Push successful`);

    await git.remote(['set-url', 'origin', cleanUrl]);
    logToTerminal(`[PUSH] Remote URL cleaned`);
    return 'success';
  } catch (e: any) {
    logToTerminal(`[PUSH] ERROR: ${e.message}`);
    try { await git.remote(['set-url', 'origin', cleanUrl]); } catch {}
    throw e;
  }
});

// Check if local branch has unpushed commits or uncommitted changes
ipcMain.handle(IPC.CHECK_PUSH_STATUS, async (_, folder: string) => {
  const git = simpleGit(folder);
  try {
    // 1. Check if working directory is dirty (uncommitted changes)
    const status = await git.status();
    if (!status.isClean()) {
      // There are modified, deleted, or new files not yet committed
      return { hasUnpushed: true };
    }

    // 2. Compare local HEAD with remote HEAD (only if clean)
    const branch = await git.revparse(['--abbrev-ref', 'HEAD']);
    const localHash = await git.revparse(['HEAD']);
    const remoteRefs = await git.raw(['ls-remote', 'origin', `refs/heads/${branch}`]).catch(() => '');
    const remoteHash = remoteRefs.split(/\s+/)[0]; // first field is hash

    if (!remoteHash) {
      // No remote branch yet → even if clean, a commit exists locally
      return { hasUnpushed: true };
    }

    return { hasUnpushed: localHash !== remoteHash };
  } catch {
    return { hasUnpushed: true };
  }
});

// Clone a repository
ipcMain.handle(IPC.CLONE_REPO, async (_, repoUrl: string, destFolder: string) => {
  const git = simpleGit();
  logToTerminal(`[CLONE] Cloning ${repoUrl} into ${destFolder}`);
  try {
    const globalCreds = store.get('globalCredentials');
    const token = decryptCredential(globalCreds?.token);
    let cloneUrl = repoUrl;
    if (token && repoUrl.startsWith('https://')) {
      cloneUrl = repoUrl.replace('https://', `https://${token}@`);
      logToTerminal(`[CLONE] Token embedded for private repo access`);
    }
    await git.clone(cloneUrl, destFolder);
    logToTerminal(`[CLONE] Clone successful`);
    return true;
  } catch (e: any) {
    logToTerminal(`[CLONE] ERROR: ${e.message}`);
    throw e;
  }
});

// Open folder dialog from renderer
ipcMain.handle(IPC.SELECT_FOLDER, async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
  });
  if (result.canceled) return null;
  return result.filePaths[0];
});

ipcMain.handle(IPC.CHECK_GIT_STATUS, async (_, folder: string) => {
  const git = simpleGit(folder);
  try {
    const isRepo = await git.checkIsRepo();
    let remoteUrl: string | null = null;
    if (isRepo) {
      try {
        const url = await git.remote(['get-url', 'origin']);
        remoteUrl = url ? url.trim() : null;
      } catch {}
    }
    return { isRepo, remoteUrl };
  } catch {
    return { isRepo: false, remoteUrl: null };
  }
});

ipcMain.handle(IPC.INIT_GIT_REPO, async (_, folder: string) => {
  const git = simpleGit(folder);
  logToTerminal(`[INIT] Initializing Git repository in ${folder}`);
  await git.init();
  logToTerminal(`[INIT] Repository initialized`);
  return true;
});

function getDirectoryTree(dirPath: string): any[] {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  return entries
    .filter(e => e.name !== '.git')
    .map(e => ({
      name: e.name,
      type: e.isDirectory() ? 'directory' : 'file',
      path: path.join(dirPath, e.name),
      children: e.isDirectory() ? getDirectoryTree(path.join(dirPath, e.name)) : undefined,
    }));
}

ipcMain.handle(IPC.LIST_FILES, async (_, folder: string) => {
  return getDirectoryTree(folder);
});



ipcMain.handle(IPC.SET_CURRENT_REPO_PATH, async (_, folder: string | null) => {
  if (folder) store.set('currentRepoPath', folder);
  else store.delete('currentRepoPath');
});

ipcMain.handle(IPC.GET_CURRENT_REPO_PATH, async () => {
  return store.get('currentRepoPath') || null;
});

ipcMain.handle(IPC.GET_REPO_INFO, async (_, folder: string) => {
  const git = simpleGit(folder);
  let remoteUrl: string | null = null;
  try {
    const url = await git.remote(['get-url', 'origin']);
    remoteUrl = url ? url.trim() : null;
  } catch {}
  return { folder, remoteUrl };
});

ipcMain.handle(IPC.SET_REMOTE, async (_, folder: string, remoteUrl: string) => {
  const git = simpleGit(folder);
  try {
    await git.addRemote('origin', remoteUrl);
  } catch {
    await git.remote(['set-url', 'origin', remoteUrl]);
  }
  return true;
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
