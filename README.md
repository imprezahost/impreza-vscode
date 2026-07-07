# Impreza Host for VS Code

Deploy apps and manage your servers, domains/DNS, VPS lifecycle and account
balance on **[Impreza Host](https://imprezahost.com)** — privacy-first, no-KYC,
offshore/DMCA-resistant hosting paid in **Bitcoin / Monero** — straight from
**GitHub Copilot** or **Claude** in VS Code, via the Model Context Protocol (MCP).

> **Impreza Host** is the hosting provider (imprezahost.com). This is **not** the
> “Impreza” WordPress theme, and is unrelated to the Subaru Impreza.

## What it does

Once installed, the extension contributes the Impreza Host MCP server to VS
Code's MCP list. Enable it and your AI gains **32 tools** — deploy catalog or
custom (Docker / git) apps, manage deployments, domains/DNS, Proxmox VPS
lifecycle (status / power / backups / reinstall), and top up your balance in
crypto — all acting on your own Impreza account.

Two ways to connect (both appear under **MCP: List Servers**):

- **Impreza Host (OAuth)** — the hosted connector. No install, no API key:
  authorize in your browser (OAuth 2.1) and go. **Recommended.**
- **Impreza Host (local, API key)** — runs `npx impreza-mcp` locally. Run the
  command **“Impreza: Set API key + secret”** and paste your Impreza API key +
  secret (clientarea → Impreza API); they're stored in VS Code SecretStorage,
  never in settings. This path can also upload a local project folder to deploy.

## Usage

Open Copilot Chat in **Agent** mode, make sure the Impreza server is enabled
(the MCP tools icon), then talk naturally:

> “List my Impreza servers, then deploy this project and give me the URL.”
>
> “Add an A record for app.example.com pointing at my VPS.”
>
> “Top up my balance with \$20 in Monero.”

## Links

- **Docs / setup:** https://docs.imprezahost.com/tutorials/ai-mcp-integration.html
- **MCP server package:** https://www.npmjs.com/package/impreza-mcp
- **Impreza Host:** https://imprezahost.com

## Security

The OAuth path issues a **scoped, revocable** token (no API secret ever leaves
Impreza). The local path keeps your key/secret in VS Code SecretStorage and
sends them only as request headers over HTTPS. Full policy:
https://github.com/imprezahost/impreza-mcp/blob/main/SECURITY.md

## License

MIT
