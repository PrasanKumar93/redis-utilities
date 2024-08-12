interface ImportStats {
  totalFiles: number;
  processed: 0;
  failed: 0;
  totalTimeInMs: 0;
}

interface ImportFileError {
  message?: string;
  filePath?: string;
  error?: any;
}

export type { ImportStats, ImportFileError };
