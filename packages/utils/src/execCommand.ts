import { spawn } from 'child_process';

export function exec(command: string, args: string[], options?: object): ReturnType<typeof spawn> {
  const win32 = process.platform === 'win32';

  const cmd = win32 ? 'cmd' : command;
  const cmdArgs = win32 ? ['/c'].concat(command, args) : args;

  return spawn(cmd, cmdArgs, options || {});
}
