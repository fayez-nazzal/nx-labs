import { workspaceRoot } from '@nrwl/devkit';
import { spawn } from 'child_process';
import { dirname } from 'path';
import { ServeExecutorSchema } from './schema';

export default async function* runExecutor(options: ServeExecutorSchema) {
  console.log('Executor ran for Serve', options);

  const child = spawn(
    'deno',
    ['run', '-A', options.main, '--watch', dirname(options.main)],
    {
      cwd: workspaceRoot,
      stdio: 'inherit',
    }
  );

  yield { success: true };

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  await new Promise(() => {});
}
