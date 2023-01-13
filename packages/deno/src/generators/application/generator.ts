import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  getWorkspaceLayout,
  names,
  offsetFromRoot,
  Tree,
} from '@nrwl/devkit';
import * as path from 'path';
import { ApplicationGeneratorSchema } from './schema';
import { initDeno } from '../init/generator';

interface NormalizedSchema extends ApplicationGeneratorSchema {
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
  parsedTags: string[];
}

function normalizeOptions(
  tree: Tree,
  options: ApplicationGeneratorSchema
): NormalizedSchema {
  const name = names(options.name).fileName;
  const projectDirectory = options.directory
    ? `${names(options.directory).fileName}/${name}`
    : name;
  const projectName = projectDirectory.replace(new RegExp('/', 'g'), '-');
  const projectRoot = `${getWorkspaceLayout(tree).appsDir}/${projectDirectory}`;
  const parsedTags = options.tags
    ? options.tags.split(',').map((s) => s.trim())
    : [];

  return {
    ...options,
    projectName,
    projectRoot,
    projectDirectory,
    parsedTags,
  };
}

function addFiles(tree: Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
    ...names(options.name),
    offsetFromRoot: offsetFromRoot(options.projectRoot),
    template: '',
  };
  generateFiles(
    tree,
    path.join(__dirname, 'files'),
    options.projectRoot,
    templateOptions
  );
}

export default async function (
  tree: Tree,
  options: ApplicationGeneratorSchema
) {
  const normalizedOptions = normalizeOptions(tree, options);
  initDeno(tree);
  addProjectConfiguration(tree, normalizedOptions.projectName, {
    root: normalizedOptions.projectRoot,
    projectType: 'application',
    name: normalizedOptions.projectName,
    sourceRoot: `${normalizedOptions.projectRoot}/src`,
    targets: {
      build: {
        executor: '@nrwl/deno:build',
        outputs: [`dist/apps/${normalizedOptions.projectName}`],
        options: {
          main: `apps/${normalizedOptions.projectName}/src/main.ts`,
          outputFile: `dist/apps/${normalizedOptions.projectName}/main.js`,
        },
      },
      serve: {
        executor: '@nrwl/deno:serve',
        options: {
          main: `apps/${normalizedOptions.projectName}/src/main.ts`,
        },
      },
      test: {
        executor: '@nrwl/deno:test',
        outputs: [`coverage/apps/${normalizedOptions.projectName}`],
        options: {
          coverageDirectory: `coverage/apps/${normalizedOptions.projectName}`,
          typecheck: false,
        },
      },
      lint: {
        executor: '@nrwl/deno:lint',
        options: {
          rules: [],
        },
      },
    },
    tags: normalizedOptions.parsedTags,
  });
  addFiles(tree, normalizedOptions);
  await formatFiles(tree);
}
