import { ExecutorContext, workspaceRoot } from '@nrwl/devkit';
import { spawn } from 'child_process';
import { dirname, resolve } from 'path';
import { BuildExecutorSchema } from './schema';

import { ensureDirSync } from 'fs-extra';

export default async function runExecutor(
  options: BuildExecutorSchema,
  context: ExecutorContext
) {
  console.log(context);

  ensureDirSync(resolve(workspaceRoot, dirname(options.outputFile)));

  const child = spawn('deno', ['bundle', options.main, options.outputFile], {
    // TODO: cwd should probably be the workspace root
    cwd: workspaceRoot,
    stdio: 'inherit',
  });

  const res = new Promise((res, rej) => {
    child.on('exit', (code) => {
      if (code === 0) {
        res({ success: true });
        return;
      }
      rej({ success: false });
    });
  });

  return res;
}
