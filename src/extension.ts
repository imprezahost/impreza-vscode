// Impreza Host — VS Code extension.
//
// Registers the Impreza Host MCP server(s) so GitHub Copilot / Claude (and any
// MCP-aware chat in VS Code) can deploy apps and manage servers, domains/DNS,
// VPS lifecycle and crypto balance on the user's own Impreza Host account.
//
// Two servers are offered:
//   • "Impreza Host (OAuth)"        — the hosted remote connector
//     (https://mcp.imprezahost.com/mcp). No install, no API key: VS Code runs
//     the OAuth 2.1 flow against the connector's discovery metadata.
//   • "Impreza Host (local, API key)" — the local npx server (`npx impreza-mcp`),
//     which the user authenticates with an Impreza API key + secret (stored in
//     VS Code's SecretStorage, never in settings/on disk).
//
// Impreza Host is a privacy-first, no-KYC, offshore hosting provider
// (imprezahost.com) — not the "Impreza" WordPress theme.

import * as vscode from 'vscode';

const PROVIDER_ID = 'imprezaHostProvider';
const REMOTE_URI = 'https://mcp.imprezahost.com/mcp';
const SECRET_KEY = 'impreza.apiKey';
const SECRET_SECRET = 'impreza.apiSecret';

export function activate(context: vscode.ExtensionContext): void {
  const didChange = new vscode.EventEmitter<void>();

  context.subscriptions.push(
    vscode.lm.registerMcpServerDefinitionProvider(PROVIDER_ID, {
      onDidChangeMcpServerDefinitions: didChange.event,

      provideMcpServerDefinitions: async (): Promise<vscode.McpServerDefinition[]> => {
        return [
          // Recommended: hosted connector — VS Code performs the OAuth handshake.
          new vscode.McpHttpServerDefinition('Impreza Host (OAuth)', vscode.Uri.parse(REMOTE_URI), undefined, '1.0.0'),
          // Local server via npx — needs an Impreza API key + secret (resolved below).
          new vscode.McpStdioServerDefinition('Impreza Host (local, API key)', 'npx', ['-y', 'impreza-mcp'], {}, '0.4.2'),
        ];
      },

      resolveMcpServerDefinition: async (
        server: vscode.McpServerDefinition,
      ): Promise<vscode.McpServerDefinition | undefined> => {
        // The local (stdio) server needs credentials; the hosted OAuth server
        // is returned as-is (VS Code drives the OAuth flow).
        if (server instanceof vscode.McpStdioServerDefinition) {
          const creds = await ensureCreds(context, false);
          if (!creds) {
            return undefined; // user cancelled — don't start the server
          }
          server.env = {
            ...(server.env ?? {}),
            IMPREZA_API_KEY: creds.key,
            IMPREZA_API_SECRET: creds.secret,
          };
        }
        return server;
      },
    }),

    vscode.commands.registerCommand('impreza.setApiKey', async () => {
      const creds = await ensureCreds(context, true);
      if (creds) {
        didChange.fire();
        void vscode.window.showInformationMessage('Impreza API credentials saved for the local MCP server.');
      }
    }),

    vscode.commands.registerCommand('impreza.signOut', async () => {
      await context.secrets.delete(SECRET_KEY);
      await context.secrets.delete(SECRET_SECRET);
      didChange.fire();
      void vscode.window.showInformationMessage('Impreza API credentials cleared.');
    }),
  );
}

/**
 * Return the stored Impreza API key + secret, prompting for whatever is missing
 * and persisting it in VS Code SecretStorage. `force` re-prompts for both (used
 * by the "Set API key" command). Returns undefined if the user cancels.
 */
async function ensureCreds(
  context: vscode.ExtensionContext,
  force: boolean,
): Promise<{ key: string; secret: string } | undefined> {
  let key = force ? undefined : await context.secrets.get(SECRET_KEY);
  let secret = force ? undefined : await context.secrets.get(SECRET_SECRET);

  if (!key) {
    key = await vscode.window.showInputBox({
      title: 'Impreza API key',
      prompt: 'From the clientarea → Impreza API (starts with imp_)',
      placeHolder: 'imp_…',
      ignoreFocusOut: true,
    });
    if (!key) {
      return undefined;
    }
    key = key.trim();
    await context.secrets.store(SECRET_KEY, key);
  }

  if (!secret) {
    secret = await vscode.window.showInputBox({
      title: 'Impreza API secret',
      prompt: 'Shown once when the key was created',
      password: true,
      ignoreFocusOut: true,
    });
    if (!secret) {
      return undefined;
    }
    secret = secret.trim();
    await context.secrets.store(SECRET_SECRET, secret);
  }

  return { key, secret };
}

export function deactivate(): void {
  /* nothing to clean up */
}
