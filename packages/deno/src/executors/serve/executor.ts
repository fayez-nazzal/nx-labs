import { runDeno } from '../../utils/run-deno';
import { ServeExecutorSchema } from './schema';

export default async function* runExecutor(options: ServeExecutorSchema) {
  console.log('Executor ran for Serve', options);

  const args = ['run', '-A', options.main, '--watch'];
  if (options.importMap) {
    args.push('--import-map', options.importMap);
  }

  const runningDenoProcess = runDeno(args);

  yield { success: true };

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  await new Promise(() => {});
}
