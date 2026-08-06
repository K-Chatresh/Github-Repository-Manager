// Sidebar elements
const sidebar = document.getElementById('sidebar')!;
const sidebarToggle = document.getElementById('sidebar-toggle') as HTMLButtonElement;
const sidebarItems = document.querySelectorAll('.sidebar-item');

sidebarToggle.addEventListener('click', () => {
  sidebar.classList.toggle('collapsed');
});

// Main views
const views = {
  dashboard: document.getElementById('dashboard-view')!,
  repositories: document.getElementById('repositories-view')!,
  terminal: document.getElementById('terminal-view')!,
};

// ----- Dashboard elements -----
const dashboardEmpty = document.getElementById('dashboard-empty')!;
const dashboardRepo = document.getElementById('dashboard-repo')!;
const pickFolderBtn = document.getElementById('pick-folder-btn')!;
const repoFolderPath = document.getElementById('repo-folder-path')!;
const repoRemoteUrl = document.getElementById('repo-remote-url')!;
const unlinkBtn = document.getElementById('unlink-btn') as HTMLButtonElement;
const manageRepoBtn = document.getElementById('manage-repo-btn') as HTMLButtonElement;

// Clone elements
const showCloneFormBtn = document.getElementById('show-clone-form-btn') as HTMLButtonElement;
const cloneFormSection = document.getElementById('clone-form-section')!;
const cloneUrlInput = document.getElementById('clone-url-input') as HTMLInputElement;
const cloneDestInput = document.getElementById('clone-dest-input') as HTMLInputElement;
const cloneBrowseBtn = document.getElementById('clone-browse-btn') as HTMLButtonElement;
const startCloneBtn = document.getElementById('start-clone-btn') as HTMLButtonElement;
const cancelCloneBtn = document.getElementById('cancel-clone-btn') as HTMLButtonElement;
const cloneStatus = document.getElementById('clone-status')!;
const createLocalRepoBtn = document.getElementById('create-local-repo-btn') as HTMLButtonElement;

// ----- Repositories view elements -----
const repoNoSelection = document.getElementById('repo-no-selection')!;
const repoContent = document.getElementById('repo-content')!;
const repoTreePath = document.getElementById('repo-tree-path')!;
const fileTreeContainer = document.getElementById('file-tree-container')!;
const repoCommitBtn = document.getElementById('repo-commit-btn') as HTMLButtonElement;
const repoUnlinkBtn = document.getElementById('repo-unlink-btn') as HTMLButtonElement;
const repoOverviewContent = document.getElementById('repo-overview-content')!;

// Repo tabs
const repoTabs = document.querySelectorAll('.repo-tab');
const repoPanes = {
  overview: document.getElementById('repo-tab-overview')!,
  code: document.getElementById('repo-tab-code')!,
  settings: document.getElementById('repo-tab-settings')!,
};

// Settings elements (linked state)
const settingsNotLinked = document.getElementById('settings-not-linked')!;
const settingsLinked = document.getElementById('settings-linked')!;
const settingsRemoteDisplay = document.getElementById('settings-remote-display')!;
const repoSettingsUsername = document.getElementById('repo-settings-username') as HTMLInputElement;
const repoSettingsEmail = document.getElementById('repo-settings-email') as HTMLInputElement;
const repoSettingsToken = document.getElementById('repo-settings-token') as HTMLInputElement;
const saveRepoSettingsBtn = document.getElementById('save-repo-settings-btn') as HTMLButtonElement;
const repoSettingsStatus = document.getElementById('repo-settings-status')!;
const toggleTokenBtn = document.getElementById('toggle-token-visibility-btn') as HTMLButtonElement;

// Link form elements
const makeGithubBtn = document.getElementById('make-github-btn') as HTMLButtonElement;
const settingsLinkForm = document.getElementById('settings-link-form')!;
const linkOptionExisting = document.getElementById('link-option-existing')!;
const linkOptionNew = document.getElementById('link-option-new')!;
const linkExistingFields = document.getElementById('link-existing-fields')!;
const linkNewFields = document.getElementById('link-new-fields')!;
const linkExistingUrl = document.getElementById('link-existing-url') as HTMLInputElement;
const linkNewRepoName = document.getElementById('link-new-repo-name') as HTMLInputElement;
const linkUsername = document.getElementById('link-username') as HTMLInputElement;
const linkEmail = document.getElementById('link-email') as HTMLInputElement;
const linkToken = document.getElementById('link-token') as HTMLInputElement;
const performLinkBtn = document.getElementById('perform-link-btn') as HTMLButtonElement;
const cancelLinkBtn = document.getElementById('cancel-link-btn') as HTMLButtonElement;
const linkStatus = document.getElementById('link-status')!;

// ----- Terminal elements -----
const terminalOutput = document.getElementById('terminal-output')!;
const clearTerminalBtn = document.getElementById('clear-terminal-btn') as HTMLButtonElement;

// ----- State -----
let currentRepoPath: string | null = null;
let currentRemoteUrl: string | null = null;

// ----- View switching -----
function activateView(viewName: string) {
  Object.entries(views).forEach(([name, view]) => {
    view.classList.toggle('active', name === viewName);
  });
  sidebarItems.forEach(item => {
    item.classList.toggle('active', item.getAttribute('data-view') === viewName);
  });
  if (viewName === 'repositories' && currentRepoPath) {
    showRepoContent();
  }
}

sidebarItems.forEach(item => {
  item.addEventListener('click', () => {
    const view = item.getAttribute('data-view')!;
    activateView(view);
  });
});

// ----- Repo tab switching -----
repoTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const tabName = tab.getAttribute('data-repo-tab')!;
    repoTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    Object.entries(repoPanes).forEach(([name, pane]) => {
      pane.classList.toggle('active', name === tabName);
    });
    if (tabName === 'code') loadFileTree();
    if (tabName === 'settings') refreshSettingsTab();
  });
});

// ----- Dashboard logic -----
async function initialize() {
  const savedPath = await window.electronAPI.getCurrentRepoPath();
  if (savedPath) {
    try {
      const info = await window.electronAPI.getRepoInfo(savedPath);
      if (info.folder) {
        currentRepoPath = info.folder;
        currentRemoteUrl = info.remoteUrl;
        showRepoCard(info.folder, info.remoteUrl);
      } else {
        await window.electronAPI.setCurrentRepoPath(null);
        showEmptyState();
      }
    } catch {
      showEmptyState();
    }
  } else {
    showEmptyState();
  }
}

function showEmptyState() {
  dashboardEmpty.style.display = 'flex';
  dashboardRepo.style.display = 'none';
  if (cloneFormSection) cloneFormSection.style.display = 'none';
}

async function showRepoCard(folder: string, remoteUrl: string | null) {
  dashboardEmpty.style.display = 'none';
  dashboardRepo.style.display = 'block';
  repoFolderPath.textContent = folder;
  if (remoteUrl) {
    repoRemoteUrl.textContent = sanitizeUrl(remoteUrl);
  } else {
    repoRemoteUrl.textContent = 'Not linked';
  }
}

// Dashboard: Link existing folder
pickFolderBtn.addEventListener('click', async () => {
  const folder = await window.electronAPI.selectFolder();
  if (!folder) return;
  // No automatic init – just store the folder
  currentRepoPath = folder;
  currentRemoteUrl = null; // we'll check actual remote later
  await window.electronAPI.setCurrentRepoPath(folder);
  // Check if it's already a git repo with a remote
  const status = await window.electronAPI.checkGitStatus(folder);
  const info = await window.electronAPI.getRepoInfo(folder);
  currentRemoteUrl = info.remoteUrl;
  showRepoCard(folder, info.remoteUrl);
});

// Dashboard: Create new local repo (just init)
createLocalRepoBtn.addEventListener('click', async () => {
  const folder = await window.electronAPI.selectFolder();
  if (!folder) return;
  await window.electronAPI.initGitRepo(folder);
  currentRepoPath = folder;
  currentRemoteUrl = null;
  await window.electronAPI.setCurrentRepoPath(folder);
  showRepoCard(folder, null);
});

// Dashboard: Clone
showCloneFormBtn.addEventListener('click', () => { cloneFormSection.style.display = 'block'; });
cloneBrowseBtn.addEventListener('click', async () => {
  const folder = await window.electronAPI.selectFolder();
  if (folder) cloneDestInput.value = folder;
});
cancelCloneBtn.addEventListener('click', () => {
  cloneFormSection.style.display = 'none';
  cloneUrlInput.value = '';
  cloneDestInput.value = '';
  cloneStatus.textContent = '';
});
startCloneBtn.addEventListener('click', async () => {
  const url = cloneUrlInput.value.trim();
  const dest = cloneDestInput.value.trim();
  if (!url || !dest) { cloneStatus.textContent = 'Both URL and destination are required.'; return; }
  try {
    cloneStatus.textContent = 'Cloning...';
    startCloneBtn.disabled = true;
    await window.electronAPI.cloneRepo(url, dest);
    const info = await window.electronAPI.getRepoInfo(dest);
    currentRepoPath = dest;
    currentRemoteUrl = info.remoteUrl;
    await window.electronAPI.setCurrentRepoPath(dest);
    showRepoCard(dest, info.remoteUrl);
    cloneFormSection.style.display = 'none';
    cloneUrlInput.value = '';
    cloneDestInput.value = '';
  } catch (e: any) {
    cloneStatus.textContent = `Error: ${e.message}`;
  } finally {
    startCloneBtn.disabled = false;
  }
});

// Dashboard: Unlink
unlinkBtn.addEventListener('click', async () => {
  await window.electronAPI.setCurrentRepoPath(null);
  currentRepoPath = null;
  currentRemoteUrl = null;
  showEmptyState();
});

// Dashboard: Manage button -> navigate to Repositories
manageRepoBtn.addEventListener('click', () => {
  activateView('repositories');
});

// ----- Repositories view logic -----
function showRepoContent() {
  repoNoSelection.style.display = 'none';
  repoContent.style.display = 'block';
  // Populate overview tab
  const remote = currentRemoteUrl;
  repoOverviewContent.innerHTML = `
    <p><strong>Folder:</strong> ${currentRepoPath}</p>
    <p><strong>Remote:</strong> ${remote ? sanitizeUrl(remote) : 'Not linked'}</p>
  `;
  // Show/hide commit button
  if (remote) {
    repoCommitBtn.style.display = 'inline-block';
    updateCommitButtonState();
  } else {
    repoCommitBtn.style.display = 'none';
  }
  // Reset tabs to overview
  repoTabs.forEach(t => t.classList.remove('active'));
  repoTabs[0].classList.add('active');
  Object.values(repoPanes).forEach(p => p.classList.remove('active'));
  repoPanes.overview.classList.add('active');
}

function sanitizeUrl(url: string): string {
  return url.replace(/\/\/([^@]{1,6})([^@]*)@/, (_, start, rest) => `//${start}${'*'.repeat(rest.length)}@`);
}

async function updateCommitButtonState() {
  if (currentRemoteUrl && currentRepoPath) {
    try {
      const status = await window.electronAPI.checkPushStatus(currentRepoPath);
      repoCommitBtn.disabled = !status.hasUnpushed;
      repoCommitBtn.title = status.hasUnpushed ? 'Commit and push to GitHub' : 'Already up-to-date';
    } catch {
      repoCommitBtn.disabled = false;
    }
  }
}

// Commit button (Push)
repoCommitBtn.addEventListener('click', async () => {
  if (!currentRepoPath || !currentRemoteUrl) return;
  try {
    repoCommitBtn.disabled = true;
    repoCommitBtn.textContent = 'Pushing...';
    await window.electronAPI.pushRepo(currentRepoPath, currentRemoteUrl);
    alert('Push successful!');
    updateCommitButtonState();
  } catch (e: any) {
    alert('Push failed: ' + e.message);
  } finally {
    repoCommitBtn.disabled = false;
    repoCommitBtn.textContent = '⚡ Commit to GitHub';
  }
});

repoUnlinkBtn.addEventListener('click', async () => {
  await window.electronAPI.setCurrentRepoPath(null);
  currentRepoPath = null;
  currentRemoteUrl = null;
  repoNoSelection.style.display = 'block';
  repoContent.style.display = 'none';
  showEmptyState();
});

// File tree (Code tab)
async function loadFileTree() {
  if (!currentRepoPath) return;
  repoTreePath.textContent = currentRepoPath;
  try {
    const tree = await window.electronAPI.listFiles(currentRepoPath);
    renderTree(tree, fileTreeContainer);
  } catch {
    fileTreeContainer.textContent = 'Error loading files.';
  }
}

function renderTree(nodes: any[], container: HTMLElement) {
  container.innerHTML = '';
  function renderNode(node: any, indent: number = 0) {
    const div = document.createElement('div');
    div.className = 'tree-item ' + (node.type === 'directory' ? 'directory' : '');
    div.style.paddingLeft = indent * 20 + 'px';
    div.textContent = node.name;
    container.appendChild(div);
    if (node.children && node.type === 'directory') {
      node.children.forEach((child: any) => renderNode(child, indent + 1));
    }
  }
  nodes.forEach(node => renderNode(node));
}

// ----- Settings tab logic -----
function refreshSettingsTab() {
  if (!currentRepoPath) return;
  if (currentRemoteUrl) {
    // Linked
    settingsNotLinked.style.display = 'none';
    settingsLinked.style.display = 'block';
    settingsRemoteDisplay.textContent = sanitizeUrl(currentRemoteUrl);
    // Load saved credentials
    loadRepoSettingsFields();
  } else {
    // Not linked
    settingsNotLinked.style.display = 'block';
    settingsLinked.style.display = 'none';
    settingsLinkForm.style.display = 'none';
  }
}

async function loadRepoSettingsFields() {
  const creds = await window.electronAPI.getRepoCredentials(currentRepoPath!);
  if (creds) {
    repoSettingsUsername.value = creds.username || '';
    repoSettingsEmail.value = creds.email || '';
    repoSettingsToken.value = ''; // never fill
  }
}

// Token visibility toggle
toggleTokenBtn.addEventListener('click', () => {
  const input = repoSettingsToken;
  if (input.type === 'password') {
    input.type = 'text';
    toggleTokenBtn.textContent = '🙈';
  } else {
    input.type = 'password';
    toggleTokenBtn.textContent = '👁️';
  }
});

// Save credentials (linked state)
saveRepoSettingsBtn.addEventListener('click', async () => {
  const username = repoSettingsUsername.value.trim();
  const email = repoSettingsEmail.value.trim();
  const token = repoSettingsToken.value.trim();
  if (!username || !email || !token) {
    repoSettingsStatus.textContent = 'All fields are required.';
    return;
  }
  await window.electronAPI.saveRepoCredentials(currentRepoPath!, username, email, token);
  repoSettingsStatus.textContent = 'Credentials saved.';
  repoSettingsToken.value = '';
});

// "Make this a Github Repository" button
makeGithubBtn.addEventListener('click', () => {
  settingsNotLinked.style.display = 'none';
  settingsLinkForm.style.display = 'block';
  // Reset link form fields
  linkExistingUrl.value = '';
  linkNewRepoName.value = '';
  linkUsername.value = '';
  linkEmail.value = '';
  linkToken.value = '';
  linkStatus.textContent = '';
  // Default to existing option
  linkOptionExisting.classList.add('selected');
  linkOptionNew.classList.remove('selected');
  linkExistingFields.style.display = 'block';
  linkNewFields.style.display = 'none';
});

// Link option cards
linkOptionExisting.addEventListener('click', () => {
  linkOptionExisting.classList.add('selected');
  linkOptionNew.classList.remove('selected');
  linkExistingFields.style.display = 'block';
  linkNewFields.style.display = 'none';
});
linkOptionNew.addEventListener('click', () => {
  linkOptionNew.classList.add('selected');
  linkOptionExisting.classList.remove('selected');
  linkExistingFields.style.display = 'none';
  linkNewFields.style.display = 'block';
});

// Cancel link form
cancelLinkBtn.addEventListener('click', () => {
  settingsLinkForm.style.display = 'none';
  settingsNotLinked.style.display = 'block';
});

// Perform the link
performLinkBtn.addEventListener('click', async () => {
  const username = linkUsername.value.trim();
  const email = linkEmail.value.trim();
  const token = linkToken.value.trim();
  if (!username || !email || !token) {
    linkStatus.textContent = 'Username, email, and token are required.';
    return;
  }

  const isExisting = linkOptionExisting.classList.contains('selected');
  let remoteUrl: string | null = null;

  if (isExisting) {
    let url = linkExistingUrl.value.trim();
    if (!url) { linkStatus.textContent = 'Repository URL is required.'; return; }
    // Append .git if missing
    if (!url.endsWith('.git')) url += '.git';
    remoteUrl = url;
  } else {
    let repoName = linkNewRepoName.value.trim();
    if (!repoName) { linkStatus.textContent = 'Repository name is required.'; return; }
    // Replace spaces with hyphens
    repoName = repoName.replace(/\s+/g, '-');
    try {
      linkStatus.textContent = 'Creating repository...';
      remoteUrl = await window.electronAPI.createRepo(repoName, token);
    } catch (e: any) {
      linkStatus.textContent = 'Error creating repo: ' + e.message;
      return;
    }
  }

  // Save credentials for this repo
  await window.electronAPI.saveRepoCredentials(currentRepoPath!, username, email, token);

  // Initialize git if needed
  const gitStatus = await window.electronAPI.checkGitStatus(currentRepoPath!);
  if (!gitStatus.isRepo) {
    await window.electronAPI.initGitRepo(currentRepoPath!);
  }

  // Set remote
  try {
    await window.electronAPI.setRemote(currentRepoPath!, remoteUrl);
  } catch (e: any) {
    linkStatus.textContent = 'Error setting remote: ' + e.message;
    return;
  }

  // Update state
  currentRemoteUrl = remoteUrl;
  // Refresh UI
  settingsLinkForm.style.display = 'none';
  refreshSettingsTab();
  showRepoContent(); // update overview
  linkStatus.textContent = 'Repository linked successfully!';
});

// ----- Terminal -----
function appendLog(message: string) {
  const line = document.createElement('div');
  line.textContent = `> ${message}`;
  terminalOutput.appendChild(line);
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
}
window.electronAPI.onTerminalLog((message: string) => appendLog(message));
clearTerminalBtn.addEventListener('click', () => {
  terminalOutput.innerHTML = '<code>Cleared.</code>';
});

// Start
initialize();
