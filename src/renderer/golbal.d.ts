export {};

declare global {
  interface Window {
    electronAPI: {
      createRepo: (name: string, token: string) => Promise<string>;
      pushRepo: (folder: string, remoteUrl: string) => Promise<string>;
      selectFolder: () => Promise<string | null>;
      checkGitStatus: (folder: string) => Promise<{ isRepo: boolean; remoteUrl: string | null }>;
      initGitRepo: (folder: string) => Promise<boolean>;
      listFiles: (folder: string) => Promise<any[]>;
      setCurrentRepoPath: (folder: string | null) => Promise<void>;
      getCurrentRepoPath: () => Promise<string | null>;
      getRepoInfo: (folder: string) => Promise<{ folder: string; remoteUrl: string | null }>;
      setRemote: (folder: string, remoteUrl: string) => Promise<boolean>;
      onTerminalLog: (callback: (message: string) => void) => () => void;
      checkPushStatus: (folder: string) => Promise<{ hasUnpushed: boolean }>;
      cloneRepo: (repoUrl: string, destFolder: string, token?: string) => Promise<boolean>;
      saveRepoCredentials: (repoPath: string, username: string, email: string, token: string) => Promise<void>;
      getRepoCredentials: (repoPath: string) => Promise<{ username: string; email: string; token: string } | null>;
      readFile: (filePath: string) => Promise<string>;
      getOverviewData: (folder: string, subPath?: string) => Promise<{
        files: any[];
        readme: string | null;
        license: string | null;
        currentPath: string;
      }>;
      getGitHubUser: (username: string) => Promise<{ login: string; name: string; avatar_url: string } | null>;
      getRepoList: () => Promise<{ path: string; addedAt: number }[]>;
      addRepoToList: (repoPath: string) => Promise<void>;
      removeRepoFromList: (repoPath: string) => Promise<void>;
    };
  }
}
