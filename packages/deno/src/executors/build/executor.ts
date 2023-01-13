import { ExecutorContext, workspaceRoot } from '@nrwl/devkit';
import { spawn } from 'child_process';
import { dirname, resolve } from 'path';
import { BuildExecutorSchema } from './schema';

import { ensureDirSync } from 'fs-extra';
import { runDeno } from '../../utils/run-deno';

export default async function runExecutor(
  options: BuildExecutorSchema,
  context: ExecutorContext
) {
  console.log(context);

  ensureDirSync(resolve(workspaceRoot, dirname(options.outputFile)));

  const args = ['bundle', options.main, options.outputFile];

  if (options.importMap) {
    args.push('--import-map', options.importMap);
  }

  // const child = spawn('deno', args, {
  //   cwd: workspaceRoot,
  //   stdio: 'inherit',
  // });

  const runningDenoProcess = runDeno(args);

  const res = new Promise((res, rej) => {
    runningDenoProcess.on('exit', (code) => {
      if (code === 0) {
        res({ success: true });
        return;
      }
      rej({ success: false });
    });
  });

  return res;
}
