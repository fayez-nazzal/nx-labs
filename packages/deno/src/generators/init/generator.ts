import {
  updateWorkspaceConfiguration,
  readWorkspaceConfiguration,
  generateFiles,
  Tree,
} from '@nrwl/devkit';
import * as path from 'path';

function addFiles(tree: Tree) {
  if (!tree.exists('import_map.json')) {
    generateFiles(tree, path.join(__dirname, 'files'), '.', {});
  }
}

function updateNxJson(tree: Tree) {
  const nxJson = readWorkspaceConfiguration(tree);

  const plugins = new Set<string>(nxJson.plugins || []);
  plugins.add('@nrwl/deno');
  nxJson.plugins = Array.from(plugins);

  updateWorkspaceConfiguration(tree, nxJson);
}

export async function initDeno(tree: Tree) {
  addFiles(tree);
  updateNxJson(tree);
}

export default initDeno;
