import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { Tree, readProjectConfiguration } from '@nrwl/devkit';

import generator from './generator';
import { ApplicationGeneratorSchema } from './schema';

describe('application generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    await generator(tree, { name: 'my-deno-app' });
    console.log(tree.listChanges().map((c) => c.path));
    expect(tree.read('apps/my-deno-app/src/main.ts', 'utf-8'))
      .toMatchInlineSnapshot(`
      "// Start listening on port 8080 of localhost.
      const server = Deno.listen({ port: 8080 });
      console.log(\`HTTP webserver running.  Access it at:  http://localhost:8080/\`);

      // Connections to the server will be yielded up as an async iterable.
      for await (const conn of server) {
        // In order to not be blocking, we need to handle each connection individually
        // without awaiting the function
        serveHttp(conn);
      }

      async function serveHttp(conn: Deno.Conn) {
        // This \\"upgrades\\" a network connection into an HTTP connection.
        const httpConn = Deno.serveHttp(conn);
        // Each request sent over the HTTP connection will be yielded as an async
        // iterator from the HTTP connection.
        for await (const requestEvent of httpConn) {
          // The native HTTP server uses the web standard \`Request\` and \`Response\`
          // objects.
          const body = \`Hello world from my-deno-app. Your user-agent is:\\\\n\\\\n\${
            requestEvent.request.headers.get(\\"user-agent\\") ?? \\"Unknown\\"
          }\`;
          // The requestEvent's \`.respondWith()\` method is how we send the response
          // back to the client.
          requestEvent.respondWith(
            new Response(body, {
              status: 200,
            }),
          );
        }
      }
      "
    `);
  });
});
