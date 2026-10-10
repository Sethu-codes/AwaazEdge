declare namespace NodeJS {
  interface Process {
    argv: string[];
    exit(code?: number): void;
  }
}

declare const process: NodeJS.Process;
