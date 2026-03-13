import * as fs from 'node:fs';
import * as path from 'node:path';
import { ts } from 'ts-morph';

/** @internal */
export function resolveModulePath(specifier: string, fromFilePath: string): string | undefined {
  const cacheKey = `${fromFilePath}\0${specifier}`;
  if (resolveModuleCache.has(cacheKey)) {
    return resolveModuleCache.get(cacheKey);
  }

  const base = specifier.startsWith('@')
    ? resolveAliasedBase(specifier, fromFilePath)
    : path.resolve(path.dirname(fromFilePath), specifier);

  const result = resolveWithExtensions(base);
  resolveModuleCache.set(cacheKey, result);
  return result;
}

const resolveModuleCache = new Map<string, string | undefined>();
const tsConfigPathsCache = new Map<string, Array<{ prefix: string; target: string }>>();

function resolveAliasedBase(specifier: string, fromFilePath: string): string {
  const projectRoot = findProjectRoot(fromFilePath);
  const mappings = loadTsConfigPaths(projectRoot);
  const matched = mappings.find(
    (m) => specifier === m.prefix || specifier.startsWith(m.prefix + '/'),
  );
  if (matched) {
    return path.resolve(matched.target, specifier.slice(matched.prefix.length).replace(/^\//, ''));
  }
  return path.resolve(process.cwd(), specifier.replace(/^@\//, ''));
}

function resolveWithExtensions(base: string): string | undefined {
  for (const ext of ['', '.tsx', '.ts']) {
    const candidate = base + ext;
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }
  for (const ext of ['.tsx', '.ts']) {
    const candidate = path.join(base, `index${ext}`);
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return undefined;
}

function findProjectRoot(fromFilePath: string): string {
  let dir = path.dirname(fromFilePath);
  while (true) {
    if (fs.existsSync(path.join(dir, 'tsconfig.json'))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      return process.cwd();
    }
    dir = parent;
  }
}

function loadTsConfigPaths(cwd: string): Array<{ prefix: string; target: string }> {
  if (tsConfigPathsCache.has(cwd)) {
    return tsConfigPathsCache.get(cwd)!;
  }
  const mappings = buildTsConfigPathMappings(cwd);
  tsConfigPathsCache.set(cwd, mappings);
  return mappings;
}

function buildTsConfigPathMappings(cwd: string): Array<{ prefix: string; target: string }> {
  try {
    const tsconfigPath = path.join(cwd, 'tsconfig.json');
    const result = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
    if (result.error) {
      throw new Error('tsconfig read error');
    }
    const tsconfig = result.config as {
      compilerOptions?: { baseUrl?: string; paths?: Record<string, string[]> };
    };
    const baseUrl = tsconfig.compilerOptions?.baseUrl ?? '.';
    const paths = tsconfig.compilerOptions?.paths ?? {};
    return Object.entries(paths).map(([alias, targets]) => ({
      prefix: alias.replace(/\/\*$/, ''),
      target: path.resolve(cwd, baseUrl, (targets[0] ?? '').replace(/\/\*$/, '')),
    }));
  } catch {
    return [{ prefix: '@', target: process.cwd() }];
  }
}
