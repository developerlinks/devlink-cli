import path from 'path';

export default function formatPath(p: string): string {
  return path.sep === '/' ? p : p.replace(/\\/g, '/');
}
