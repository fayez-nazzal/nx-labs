import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { Tree, readProjectConfiguration } from '@nrwl/devkit';

import { denoLibraryGenerator } from './library';

describe('library generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    await denoLibraryGenerator(tree, { name: 'my-lib' });
    const config = readProjectConfiguration(tree, 'my-lib');
    expect(config).toEqual(
      expect.objectContaining({
        name: 'my-lib',
        root: 'libs/my-lib',
        sourceRoot: 'libs/my-lib/src',
        projectType: 'library',
        tags: [],
      })
    );
    expect(tree.read('libs/my-lib/src/index.ts', 'utf-8'))
      .toMatchInlineSnapshot(`
      "export * from './lib/my-lib.ts';
      "
    `);
  });

  describe('test target', () => {
    it('should add test target', async () => {
      await denoLibraryGenerator(tree, { name: 'my-lib' });
      const config = readProjectConfiguration(tree, 'my-lib');

      expect(config.targets.test).toMatchInlineSnapshot(`
        Object {
          "executor": "@nx-labs/deno:test",
        }
      `);
    });
    it('should add test file', async () => {
      await denoLibraryGenerator(tree, { name: 'my-lib' });

      expect(tree.read('libs/my-lib/src/lib/my-lib.spec.ts', 'utf-8'))
        .toMatchInlineSnapshot(`
        "import {myLib} from './my-lib.ts';

        describe('myLib', () => {
          it('should return \\"my-lib\\"', () => {
            expect(myLib()).toEqual('my-lib');
          })
        })
        "
      `);
    });
    it('should not add test target', async () => {
      await denoLibraryGenerator(tree, {
        name: 'my-lib',
        unitTestRunner: 'none',
      });
      const config = readProjectConfiguration(tree, 'my-lib');

      expect(config.targets.test).toBeFalsy();
    });
  });
  describe('lint target', () => {
    it('should add lint target', async () => {
      await denoLibraryGenerator(tree, { name: 'my-lib' });
      const config = readProjectConfiguration(tree, 'my-lib');

      expect(config.targets.lint).toMatchInlineSnapshot(`
        Object {
          "executor": "@nx-labs/deno:lint",
        }
      `);
    });
    it('should not add lint target', async () => {
      await denoLibraryGenerator(tree, {
        name: 'my-lib',
        linter: 'none',
      });
      const config = readProjectConfiguration(tree, 'my-lib');

      expect(config.targets.lint).toBeFalsy();
    });
  });
});
