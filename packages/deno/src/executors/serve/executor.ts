import { ServeExecutorSchema } from './schema';
import { spawn } from 'child_process';
export default async function runExecutor(options: ServeExecutorSchema) {
  console.log('Executor ran for Serve', options);
  const child = spawn('deno', ['run', '-A', options.main], {});

  return {
    success: true,
  };
}
