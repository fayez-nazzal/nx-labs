import { ExecutorContext } from '@nrwl/devkit';
import { runDeno } from '../../utils/run-deno';
import { TestExecutorSchema } from './schema';

export default async function runExecutor(
  options: TestExecutorSchema,
  context: ExecutorContext
) {
  const args = ['test', '-A'];
  if (options.watch) {
    args.push('--watch');
  }
  const projectConfig = context.projectGraph.nodes[context.projectName].data;

  args.push(projectConfig.root);
  const runningDenoProcess = runDeno(args);

  return new Promise((res) => {
    runningDenoProcess.on('close', (code) => {
      res({ success: code === 0 });
    });
  });
}
