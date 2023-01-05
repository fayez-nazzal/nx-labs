import { ExecutorContext, workspaceRoot } from '@nrwl/devkit';
import { BuildExecutorSchema } from './schema';
import { spawn } from 'child_process';
import { join, resolve, relative } from 'path';

import { readProjectsConfigurationFromProjectGraph } from 'nx/src/project-graph/project-graph';

export default async function runExecutor(
  options: BuildExecutorSchema,
  context: ExecutorContext
) {
  const allConfigs = readProjectsConfigurationFromProjectGraph(
    context.projectGraph
  );
  const projectConfig = allConfigs.projects[context.projectName];

  const cwd = join(workspaceRoot, projectConfig.root);
  const main = relative(cwd, resolve(join(context.root, options.main)));
  const child = spawn('deno', ['compile', main], {
    // TODO: cwd should probably be the workspace root
    cwd,
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
