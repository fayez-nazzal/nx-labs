import { workspaceRoot } from '@nrwl/devkit';
import { spawn } from 'child_process';

export interface DenoExecOptions {
  /**
   * default is workspaceRoot
   **/
  cwd?: string;
  /**
   * custom env vars to set. default is process.env
   **/
  env?: Record<string, string>;
}
export function runDeno(args: string[], options: DenoExecOptions = {}) {
  const hasImportMap = args.find((a) => a === '--import-map');
  if (!hasImportMap) {
    args.push('--import-map', 'import_map.json');
  }

  const hasConfig = args.find((a) => a === '--config');
  const alreadySetNoConfig = args.find((a) => a === '--no-config');

  if (!hasConfig && !alreadySetNoConfig) {
    args.push('--no-config');
  }

  return spawn('deno', args, {
    stdio: 'inherit',
    cwd: options.cwd || workspaceRoot,
    env: options.env || process.env,
  });
}
