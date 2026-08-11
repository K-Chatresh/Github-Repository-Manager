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

// ----- Repositories "+ New" elements -----
const newRepoBtn = document.getElementById('new-repo-btn') as HTMLButtonElement;
const newRepoMenu = document.getElementById('new-repo-menu')!;
const cloneFormSection = document.getElementById('clone-form-section')!;
const cloneUrlInput = document.getElementById('clone-url-input') as HTMLInputElement;
const cloneDestInput = document.getElementById('clone-dest-input') as HTMLInputElement;
const cloneBrowseBtn = document.getElementById('clone-browse-btn') as HTMLButtonElement;
const startCloneBtn = document.getElementById('start-clone-btn') as HTMLButtonElement;
const cancelCloneBtn = document.getElementById('cancel-clone-btn') as HTMLButtonElement;
const cloneStatus = document.getElementById('clone-status')!;

// Inline form elements
const newRepoForms = document.getElementById('new-repo-forms')!;
const formCreate = document.getElementById('form-create')!;
const formCreateName = document.getElementById('form-create-name') as HTMLInputElement;
const formCreateBtn = document.getElementById('form-create-btn') as HTMLButtonElement;
const formCreateStatus = document.getElementById('form-create-status')!;
const formLink = document.getElementById('form-link')!;
const formLinkUrl = document.getElementById('form-link-url') as HTMLInputElement;
const formLinkFolder = document.getElementById('form-link-folder') as HTMLInputElement;
const formLinkBrowseBtn = document.getElementById('form-link-browse-btn') as HTMLButtonElement;
const formLinkBtn = document.getElementById('form-link-btn') as HTMLButtonElement;
const formLinkStatus = document.getElementById('form-link-status')!;
const formCancelBtns = document.querySelectorAll('.form-cancel-btn');

// ----- Repositories view elements -----
const repoNoSelection = document.getElementById('repo-no-selection')!;
const repoContent = document.getElementById('repo-content')!;
const repoTreePath = document.getElementById('repo-tree-path')!;
const fileTreeContainer = document.getElementById('file-tree-container')!;
const repoCommitBtn = document.getElementById('repo-commit-btn') as HTMLButtonElement;
const repoUnlinkBtn = document.getElementById('repo-unlink-btn') as HTMLButtonElement;
const repoOverviewContent = document.getElementById('repo-overview-content')!;
const overviewRepoName = document.getElementById('overview-repo-name')!;
const overviewOwnerCard = document.getElementById('overview-owner-card')!;
const ownerAvatar = document.getElementById('owner-avatar') as HTMLImageElement;
const ownerUsername = document.getElementById('owner-username')!;

// Repo list elements
const repoListContainer = document.getElementById('repo-list-container')!;
const repoListDiv = document.getElementById('repo-list')!;
const repoListEmpty = document.getElementById('repo-list-empty')!;
const repoBackBtn = document.getElementById('repo-back-btn') as HTMLButtonElement;
const repoDetailName = document.getElementById('repo-detail-name')!;

// Recent repos on Dashboard
const recentReposSection = document.getElementById('recent-repos-section')!;
const recentReposList = document.getElementById('recent-repos-list')!;
const appBanner = document.getElementById('app-banner')!;

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
let currentRepoPath: string | null = null; // currently managed repo (Dashboard)
let currentRemoteUrl: string | null = null;
let currentTokenValue: string | null = null;
let pendingOpenFile: string | null = null;
let currentOverviewPath: string = '';
let viewingRepoPath: string | null = null; // repo being viewed in Repositories tab

// ----- View switching -----
function activateView(viewName: string) {
  Object.entries(views).forEach(([name, view]) => {
    view.classList.toggle('active', name === viewName);
  });
  sidebarItems.forEach(item => {
    item.classList.toggle('active', item.getAttribute('data-view') === viewName);
  });
  if (viewName === 'repositories') {
    if (viewingRepoPath) {
      showRepoDetail(viewingRepoPath);
    } else {
      showRepoList();
    }
  }
}

sidebarItems.forEach(item => {
  item.addEventListener('click', () => {
    const view = item.getAttribute('data-view')!;
    activateView(view);
  });
});

// Back button
repoBackBtn.addEventListener('click', () => {
  viewingRepoPath = null;
  showRepoList();
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
    if (tabName === 'code') {
      loadFileTree().then(() => {
        if (pendingOpenFile) {
          openFile(pendingOpenFile, pendingOpenFile.split('/').pop()!);
          pendingOpenFile = null;
        }
      });
    }
    if (tabName === 'settings') refreshSettingsTab();
  });
});

// ----- Dashboard logic -----
async function initialize() {
  const savedPath = await window.electronAPI.getCurrentRepoPath();
  if (savedPath) {
    // Keep the repo as current but don't display a card; just refresh recent list
    currentRepoPath = savedPath;
    try {
      const info = await window.electronAPI.getRepoInfo(savedPath);
      currentRemoteUrl = info.remoteUrl;
    } catch {
      currentRemoteUrl = null;
    }
  }
  await refreshRecentRepos();
}
async function refreshRecentRepos() {
  const list = await window.electronAPI.getRepoList();
  if (list.length > 0) {
    dashboardEmpty.style.display = 'none';
    recentReposSection.style.display = 'block';
    const recent = list.slice(0, 3);
    recentReposList.innerHTML = recent.map(repo => `
      <div class="repo-card-item">
        <span class="repo-path">${escapeHtml(repo.path)}</span>
        <button class="btn-primary manage-dashboard-repo-btn" data-path="${escapeHtml(repo.path)}">Manage</button>
      </div>
    `).join('');
    recentReposList.onclick = (e) => {
      const target = (e.target as HTMLElement).closest('.manage-dashboard-repo-btn');
      if (target) {
        const path = (target as HTMLElement).dataset.path!;
        showRepoDetail(path);
        activateView('repositories');
      }
    };
  } else {
    dashboardEmpty.style.display = 'flex';
    recentReposSection.style.display = 'none';
  }
}
async function navigateToRepo(folder: string) {
  currentRepoPath = folder;
  await addRepoToManagedList(folder);
  await refreshRecentRepos();
  showRepoDetail(folder);
  activateView('repositories');
}

// "+ New" button toggle menu
newRepoBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  newRepoMenu.style.display = newRepoMenu.style.display === 'block' ? 'none' : 'block';
});

// Close menu when clicking outside
document.addEventListener('click', () => {
  newRepoMenu.style.display = 'none';
});

// Menu item clicks
newRepoMenu.addEventListener('click', async (e) => {
  const target = (e.target as HTMLElement).closest('.context-menu-item') as HTMLElement;
  if (!target) return;
  const action = target.dataset.action;
  newRepoMenu.style.display = 'none';

  if (action === 'create') {
    hideAllInlineForms();
    newRepoForms.style.display = 'block';
    formCreate.style.display = 'block';
    formCreateName.value = '';
    formCreateStatus.textContent = '';
  } else if (action === 'link') {
    hideAllInlineForms();
    newRepoForms.style.display = 'block';
    formLink.style.display = 'block';
    formLinkUrl.value = '';
    formLinkFolder.value = '';
    formLinkStatus.textContent = '';
  } else if (action === 'clone') {
    hideAllInlineForms();
    cloneFormSection.style.display = 'block';
  }
});

// Helper to hide inline forms
function hideAllInlineForms() {
  newRepoForms.style.display = 'none';
  formCreate.style.display = 'none';
  formLink.style.display = 'none';
  cloneFormSection.style.display = 'none';
}

// Cancel buttons
formCancelBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    hideAllInlineForms();
  });
});

// Create form submit
formCreateBtn.addEventListener('click', async () => {
  const repoName = formCreateName.value.trim().replace(/\s+/g, '-');
  if (!repoName) {
    formCreateStatus.textContent = 'Repository name is required.';
    return;
  }
  const folder = await window.electronAPI.selectFolder();
  if (!folder) return;

  // Use stored credentials
  const creds = await window.electronAPI.getRepoCredentials(folder);
  if (!creds || !creds.token) {
    formCreateStatus.textContent = 'No credentials found. Set them in Repository Settings.';
    return;
  }

  try {
    formCreateStatus.textContent = 'Creating repository...';
    const cloneUrl = await window.electronAPI.createRepo(repoName, creds.token);
    const gitStatus = await window.electronAPI.checkGitStatus(folder);
    if (!gitStatus.isRepo) await window.electronAPI.initGitRepo(folder);
    await window.electronAPI.setRemote(folder, cloneUrl);
    await window.electronAPI.setCurrentRepoPath(folder);
    await addRepoToManagedList(folder);
    await refreshRecentRepos();
    hideAllInlineForms();
    showRepoDetail(folder);
    activateView('repositories');
  } catch (e: any) {
    formCreateStatus.textContent = 'Error: ' + e.message;
  }
});

// Browse button for link form
formLinkBrowseBtn.addEventListener('click', async () => {
  const folder = await window.electronAPI.selectFolder();
  if (folder) formLinkFolder.value = folder;
});

// Link form submit
formLinkBtn.addEventListener('click', async () => {
  let url = formLinkUrl.value.trim();
  const folder = formLinkFolder.value.trim();
  if (!url) {
    formLinkStatus.textContent = 'GitHub URL is required.';
    return;
  }
  if (!folder) {
    formLinkStatus.textContent = 'Please select a local folder.';
    return;
  }
  if (!url.endsWith('.git')) url += '.git';

  try {
    const gitStatus = await window.electronAPI.checkGitStatus(folder);
    if (!gitStatus.isRepo) await window.electronAPI.initGitRepo(folder);
    await window.electronAPI.setRemote(folder, url);
    await window.electronAPI.setCurrentRepoPath(folder);
    await addRepoToManagedList(folder);
    await refreshRecentRepos();
    hideAllInlineForms();
    showRepoDetail(folder);
    activateView('repositories');
  } catch (e: any) {
    formLinkStatus.textContent = 'Error: ' + e.message;
  }
});


// Clone form events (unchanged, but now inside Repositories view)
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
    await navigateToRepo(dest);
    cloneFormSection.style.display = 'none';
    cloneUrlInput.value = '';
    cloneDestInput.value = '';
  } catch (e: any) {
    cloneStatus.textContent = `Error: ${e.message}`;
  } finally {
    startCloneBtn.disabled = false;
  }
});

// (Unlink on Dashboard removed – now use the Repositories detail Unlink button)

// ----- Repositories view logic -----

// Show list of managed repos
async function showRepoList() {
  repoListContainer.style.display = 'block';
  repoContent.style.display = 'none';
  
  const list = await window.electronAPI.getRepoList();
  if (list.length === 0) {
    repoListEmpty.style.display = 'flex';
    repoListDiv.innerHTML = '';
  } else {
    repoListEmpty.style.display = 'none';
    repoListDiv.innerHTML = list.map(repo => `
      <div class="repo-card-item">
        <span class="repo-path">${escapeHtml(repo.path)}</span>
        <button class="btn-primary manage-repo-list-btn" data-path="${escapeHtml(repo.path)}">Manage</button>
      </div>
    `).join('');
    // Use event delegation
    repoListDiv.onclick = (e) => {
      const target = (e.target as HTMLElement).closest('.manage-repo-list-btn');
      if (target) {
        const path = (target as HTMLElement).dataset.path!;
        showRepoDetail(path);
      }
    };
  }
}

// Show detail for a specific repo
async function showRepoDetail(repoPath: string) {
  viewingRepoPath = repoPath;
  repoListContainer.style.display = 'none';
  repoContent.style.display = 'block';
  
  // Set the repo name
  const folderName = repoPath.split('/').pop() || repoPath;
  repoDetailName.textContent = folderName;
  
  // Get remote info
  const info = await window.electronAPI.getRepoInfo(repoPath);
  currentRemoteUrl = info.remoteUrl;
  currentRepoPath = repoPath; // for push/overview functions that rely on it
  
  // Show/hide commit button and load owner
  if (currentRemoteUrl) {
    repoCommitBtn.style.display = 'inline-block';
    updateCommitButtonState();
    const match = currentRemoteUrl.match(/github\.com[:\/]([^\/]+)\/([^\/]+?)(\.git)?$/);
    if (match) {
      loadOwnerCard(match[1]);
    } else {
      overviewOwnerCard.style.display = 'none';
    }
  } else {
    repoCommitBtn.style.display = 'none';
    overviewOwnerCard.style.display = 'none';
  }
  
  // Reset tabs
  repoTabs.forEach(t => t.classList.remove('active'));
  repoTabs[0].classList.add('active');
  Object.values(repoPanes).forEach(p => p.classList.remove('active'));
  repoPanes.overview.classList.add('active');
  
  currentOverviewPath = '';
  loadOverviewData();
  
  // Refresh settings tab if visible later
}

// Helper to add a repo to the list (call after linking/creating)
async function addRepoToManagedList(path: string) {
  await window.electronAPI.addRepoToList(path);
}

async function loadOwnerCard(owner: string) {
  try {
    const user = await window.electronAPI.getGitHubUser(owner);
    if (user) {
      ownerAvatar.src = user.avatar_url;
      ownerUsername.textContent = user.login;
      overviewOwnerCard.style.display = 'flex';
    } else {
      overviewOwnerCard.style.display = 'none';
    }
  } catch {
    overviewOwnerCard.style.display = 'none';
  }
}

async function loadOverviewData() {
  if (!currentRepoPath) return;
  try {
    const data = await window.electronAPI.getOverviewData(currentRepoPath, currentOverviewPath);
    renderOverview(data.files, data.readme, data.license, data.currentPath);
  } catch {
    repoOverviewContent.innerHTML = '<p>Error loading overview.</p>';
  }
}

function renderOverview(files: any[], readme: string | null, license: string | null, currentPath: string) {
  let html = '';
  
  // Breadcrumb navigation
  html += `<div class="overview-breadcrumb">`;
  html += `<span class="breadcrumb-item" data-path="">Root</span>`;
  if (currentPath) {
    const parts = currentPath.split('/');
    let cumulative = '';
    for (const part of parts) {
      cumulative = cumulative ? `${cumulative}/${part}` : part;
      html += ` <span class="breadcrumb-sep">/</span> <span class="breadcrumb-item" data-path="${cumulative}">${part}</span>`;
    }
  }
  html += `</div>`;
  
  // File table
  html += `<div class="overview-file-table">`;
  html += `<div class="file-row header">
    <span class="file-name">Name</span>
    <span class="file-message">Last commit</span>
    <span class="file-time">Time</span>
  </div>`;
  
  for (const file of files) {
    const icon = file.type === 'directory' ? '📁' : '📄';
    const timeStr = formatRelativeTime(file.lastCommitTimestamp);
    html += `<div class="file-row" data-file="${file.path}" data-type="${file.type}" data-name="${file.name}">
      <span class="file-name">${icon} ${file.name}</span>
      <span class="file-message">${escapeHtml(file.lastCommitMessage)}</span>
      <span class="file-time">${timeStr}</span>
    </div>`;
  }
  html += `</div>`;
  
  // README section (only at root)
  if (readme) {
    html += `<div class="overview-readme"><h3>README.md</h3><pre><code>${escapeHtml(readme)}</code></pre></div>`;
  }
  
  // LICENSE section (only at root)
  if (license) {
    html += `<div class="overview-license"><h3>LICENSE</h3><pre><code>${escapeHtml(license)}</code></pre></div>`;
  }
  
  repoOverviewContent.innerHTML = html;
  
  // Click handlers for breadcrumbs
  document.querySelectorAll('.breadcrumb-item').forEach(breadcrumb => {
    breadcrumb.addEventListener('click', (e) => {
      const targetPath = (breadcrumb as HTMLElement).dataset.path || '';
      currentOverviewPath = targetPath;
      loadOverviewData();
    });
  });
  
  // Click handlers for files and folders
  document.querySelectorAll('.file-row[data-type="file"], .file-row[data-type="directory"]').forEach(row => {
    row.addEventListener('click', (e) => {
      const type = (row as HTMLElement).dataset.type!;
      const filePath = (row as HTMLElement).dataset.file!;
      if (type === 'file') {
        // Open in Code tab
        pendingOpenFile = filePath;
        repoTabs.forEach(t => t.classList.remove('active'));
        const codeTab = document.querySelector('.repo-tab[data-repo-tab="code"]');
        if (codeTab) codeTab.classList.add('active');
        Object.values(repoPanes).forEach(p => p.classList.remove('active'));
        repoPanes.code.classList.add('active');
        loadFileTree().then(() => {
          if (pendingOpenFile) {
            openFile(pendingOpenFile, pendingOpenFile.split('/').pop()!);
            pendingOpenFile = null;
          }
        });
            } else if (type === 'directory') {
        // Navigate into subfolder
        // Build relative path from repo root
        const repoRoot = currentRepoPath!;
        let relPath = filePath.replace(repoRoot, '').replace(/\\/g, '/');
        // Remove leading slash if present
        if (relPath.startsWith('/')) relPath = relPath.substring(1);
        currentOverviewPath = relPath;
        loadOverviewData();
      }
    });
  });
}

function escapeHtml(text: string) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function formatRelativeTime(timestamp: number) {
  if (!timestamp) return '';
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;
  if (diff < 60) return 'now';
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 172800) return 'yesterday';
  return `${Math.floor(diff / 86400)} days ago`;
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
  if (viewingRepoPath) {
    await window.electronAPI.removeRepoFromList(viewingRepoPath);
  }
  viewingRepoPath = null;
  currentRepoPath = null;
  currentRemoteUrl = null;
  // Refresh Dashboard's recent repos list
  refreshRecentRepos();
  showRepoList();
});

// File tree (Code tab)
async function loadFileTree() {
  if (!currentRepoPath) return;
  try {
    const tree = await window.electronAPI.listFiles(currentRepoPath);
    renderTree(tree, fileTreeContainer);
  } catch {
    fileTreeContainer.textContent = 'Error loading files.';
  }
}

async function openFile(filePath: string, fileName: string) {
  const viewerFileName = document.getElementById('viewer-file-name')!;
  const fileContentViewer = document.getElementById('file-content-viewer')!;
  viewerFileName.textContent = fileName;
  try {
    const content = await window.electronAPI.readFile(filePath);
    fileContentViewer.textContent = content;
  } catch {
    fileContentViewer.textContent = 'Error reading file.';
  }
}

function renderTree(nodes: any[], container: HTMLElement) {
  container.innerHTML = '';
  
  function renderNode(node: any, indent: number = 0): HTMLElement {
    const div = document.createElement('div');
    div.className = 'tree-item';
    div.style.paddingLeft = indent * 16 + 'px';

    if (node.type === 'directory') {
      div.classList.add('directory');
      
      // Toggle icon
      const toggle = document.createElement('span');
      toggle.className = 'tree-toggle';
      toggle.textContent = '▶'; // collapsed by default
      div.appendChild(toggle);
      
      // Directory name
      const nameSpan = document.createElement('span');
      nameSpan.textContent = node.name;
      div.appendChild(nameSpan);
      
      // Container for children (hidden by default)
      const childrenContainer = document.createElement('div');
      childrenContainer.className = 'tree-children';
      if (node.children) {
        node.children.forEach((child: any) => {
          childrenContainer.appendChild(renderNode(child, indent + 1));
        });
      }
      div.appendChild(childrenContainer);
      
      // Click to toggle collapse
      div.addEventListener('click', (e) => {
        e.stopPropagation();
        const isExpanded = div.classList.contains('expanded');
        if (isExpanded) {
          div.classList.remove('expanded');
          toggle.textContent = '▶';
        } else {
          div.classList.add('expanded');
          toggle.textContent = '▼';
        }
      });
    } else {
      // File
      div.classList.add('file-item');
      div.textContent = node.name;
      div.dataset.filePath = node.path;
      div.style.cursor = 'pointer';
      div.addEventListener('click', (e) => {
        e.stopPropagation();
        openFile(node.path, node.name);
      });
    }
    
    return div;
  }
  
  nodes.forEach(node => {
    container.appendChild(renderNode(node));
  });
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
    if (creds.token) {
      // Show a mask and store the real token for later reveal
      repoSettingsToken.value = '••••••••';
      repoSettingsToken.type = 'password';
      currentTokenValue = creds.token;
      toggleTokenBtn.textContent = '👁️';
    } else {
      repoSettingsToken.value = '';
      currentTokenValue = null;
    }
  } else {
    repoSettingsUsername.value = '';
    repoSettingsEmail.value = '';
    repoSettingsToken.value = '';
    currentTokenValue = null;
  }
}

// Token visibility toggle
toggleTokenBtn.addEventListener('click', async () => {
  const input = repoSettingsToken;
  if (input.type === 'password') {
    // Reveal: if we don't have the real token yet, fetch it
    if (!currentTokenValue) {
      const creds = await window.electronAPI.getRepoCredentials(currentRepoPath!);
      if (creds && creds.token) {
        currentTokenValue = creds.token;
      }
    }
    if (currentTokenValue) {
      input.type = 'text';
      input.value = currentTokenValue;
      toggleTokenBtn.textContent = '🙈';
    }
  } else {
    // Hide again: replace with mask
    input.type = 'password';
    input.value = '••••••••';
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
  // After saving, show mask and store the token
  repoSettingsToken.value = '••••••••';
  repoSettingsToken.type = 'password';
  currentTokenValue = token;
  toggleTokenBtn.textContent = '👁️';
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
  // Since we're already in the detail view, update overview & commit button
  repoCommitBtn.style.display = 'inline-block';
  updateCommitButtonState();
  loadOverviewData();
  // Also show the owner card
  const match = remoteUrl.match(/github\.com[:\/]([^\/]+)\/([^\/]+?)(\.git)?$/);
  if (match) {
    loadOwnerCard(match[1]);
  }
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
