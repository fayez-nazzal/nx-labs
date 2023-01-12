import {
  ProjectGraph,
  ProjectGraphBuilder,
  ProjectGraphProcessorContext,
  readJsonFile,
  workspaceRoot,
} from '@nrwl/devkit';
import { existsSync } from 'fs-extra';
import { dirname, join } from 'path';

export function processProjectGraph(
  graph: ProjectGraph,
  context: ProjectGraphProcessorContext
): ProjectGraph {
  const importMapPath = join(workspaceRoot, 'import_map.json');
  // no import_map, bail
  if (!existsSync(importMapPath)) return graph;

  const builder = new ProjectGraphBuilder(graph);
  const importMapJson: { imports: Record<string, string> } =
    readJsonFile(importMapPath);

  const projectAliases = new Map<string, string>();

  for (const [projectAlias, entryPointPath] of Object.values(
    importMapJson.imports
  )) {
    if (entryPointPath.startsWith('.')) {
      // TODO: we slice(2) to get rid of the leading "./". Find better way?!
      projectAliases.set(projectAlias, entryPointPath.slice(2));
    }
  }

  // we don't find any Deno projects, bail
  if (!projectAliases.size) {
    return graph;
  }

  /**
   *
   *  what we have:
   *  - map of Project aliases (alias --> pathToProjectEntryPoint)
   *  - have a way of finding a projectName by passing in a path (eg: pathToProjectEntryPoint)
   *
   *  what we need to do:
   *  - figure out in each applicable files (eg: ts, tsx, js etc...) that contains which aliases
   *  - which gives us a map of <sourceFilePath -> {sourceProject, targets: Array<projectPath>}>
   *  - loop over this map to build the edges (eg: builder.addExplicitDependency)
   */

  console.log(JSON.stringify(context, null, 2));
  console.log(importMapJson);

  // console.dir(graph);
  // console.dir(context);

  return builder.getUpdatedProjectGraph();
}

function createProjectRootMappings(nodes: ProjectGraph['nodes']) {
  const projectRootMappings = new Map<string, string>();
  for (const [projectName, projectNode] of Object.entries(nodes)) {
    const root = projectNode.data.root;
    projectRootMappings.set(normalizeProjectRoot(root), projectName);
  }
  return projectRootMappings;
}

function normalizeProjectRoot(root: string): string {
  root = root === '' ? '.' : root;
  return root && root.endsWith('/') ? root.substring(0, root.length - 1) : root;
}

function findProjectForPath(
  filePath: string,
  projectRootMap: Map<string, string>
): string | undefined {
  let currentPath = filePath;
  for (
    ;
    currentPath != dirname(currentPath);
    currentPath = dirname(currentPath)
  ) {
    const p = projectRootMap.get(currentPath);
    if (p) {
      return p;
    }
  }
  return projectRootMap.get(currentPath);
}
