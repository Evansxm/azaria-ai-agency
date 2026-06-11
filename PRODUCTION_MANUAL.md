# Azaria AI Agency — Production Manual

**Status:** 100% PRODUCTION LIVE  
**Version:** 1.0.0  
**Last Updated:** 2026-06-11  
**Author:** Evans Mathibe  
**Repository:** https://github.com/Evansxm/azaria-ai-agency

---

## Table of Contents

1. [Network & Architecture Topology Map](#1-network--architecture-topology-map)
2. [Complete Project Tree Inventory](#2-complete-project-tree-inventory)
3. [Data Protection and Compliance (POPIA)](#3-data-protection-and-compliance-popia)
4. [Deployment Commands Reference](#4-deployment-commands-reference)
5. [Automated Runbook Diagnostics](#5-automated-runbook-diagnostics)
6. [Troubleshooting Guide](#6-troubleshooting-guide)

---

## 1. Network & Architecture Topology Map

The Azaria AI production environment is a decoupled, three-tier architecture consisting of a serverless backend worker, a static frontend, and a source control hub. All traffic routes through Cloudflare's global edge network.

```
  User / Client
       |
       v
+---------------------------+
|  Cloudflare Global Edge   |
|  (CDN + Security + WAF)   |
+------+---------+----------+
       |         |
       v         v
+-------------+ +-------------------------------+
|  Frontend   | |  Backend Worker Engine (MCP)  |
|  Pages.dev  | |  Workers.dev                  |
|  Static UI  | |  JSON-RPC / Tools / Health    |
+-------------+ +-------------------------------+
       |                   |
       v                   v
+-------------+ +-------------------------------+
|  GitHub     | |  Octokit REST API             |
|  Repo       | |  (Deploy, Status, Sitemap)    |
|  Source     | |                               |
+-------------+ +-------------------------------+
```

### Production Routes

| Layer | Endpoint | Purpose |
|---|---|---|
| **Frontend Target UI** | https://production.azaria-ai-frontend.pages.dev | The user-facing Next.js luxury technology portal. Serves static HTML, CSS, and JS assets through Cloudflare Pages with edge caching. |
| **Backend Worker Engine (MCP)** | https://azaria-ai-worker.evansmathibe82.workers.dev | The serverless brains hosting the Model Context Protocol tool schema engine, health monitors, compliance layer, and JSON-RPC middleware. All tool execution and GitHub API proxying happens here. |
| **Primary Source Control** | https://github.com/Evansxm/azaria-ai-agency | Clean, optimized monorepo free of heavy binaries. All deployment artifacts are gitignored; only source code and configuration files are tracked. |

### Backend Worker Internal Routes

| Path | Method | Description |
|---|---|---|
| `/` | `GET` | Service manifest — returns all endpoint URLs, version, and metadata |
| `/health` | `GET` | Liveness probe — returns status `ok` with ISO-8601 timestamp |
| `/compliance` | `GET` | POPIA compliance documentation — SHA-256 hashing mechanism, data sovereignty boundaries, contact officer |
| `/tools` | `GET` | Active AI Agent tool schemas — all 8 MCP tools with full JSON input schemas |
| `/rpc` | `POST` | JSON-RPC 2.0 endpoint — executes tool calls by method name with params |

### Cron Schedule

A daily maintenance trigger runs at **06:00 UTC** (`0 6 * * *`) via the Worker's `[triggers]` cron configuration to execute automated upkeep tasks.

---

## 2. Complete Project Tree Inventory

```
azaria-ai-agency/
|-- .gitignore                # Defensive shield: node_modules/, .next/, .wrangler/, out/
|-- .github/
|   +-- workflows/
|       +-- maintenance.yml   # GitHub Actions: daily SEO, link, AdSense, and performance checks
|-- .wrangler/                # Local wrangler cache (gitignored)
|-- .next/                    # Next.js build artifacts (gitignored)
|-- node_modules/             # npm dependencies (gitignored)
|-- package.json              # ES Module manifest with npm scripts
|-- PRODUCTION_MANUAL.md      # THIS FILE — system documentation and runbook
|-- public/
|   |-- _headers              # Security hardening: CSP, X-Frame-Options, HSTS headers
|   +-- _redirects            # Routing sheet: legacy buzznewz -> Azaria AI redirects
|-- src/
|   |-- crypto.js             # SHA-256 PII hashing utility (POPIA compliance)
|   |-- index.js              # Local stdio MCP server (for CLI/dev use)
|   +-- worker.js             # Production Cloudflare Worker entry (ES Module, fetch handler)
|-- tests/                    # Test directory (empty, ready for test suites)
+-- wrangler.toml             # Cloudflare Workers config: envs, cron, observability, placement
```

### File-by-File Specification

#### `wrangler.toml`
High-performance worker environment settings.
- **name:** `azaria-ai-worker`
- **main:** `src/worker.js`
- **compatibility_date:** `2024-12-18`
- **compatibility_flags:** `["nodejs_compat"]`
- **placement mode:** `smart` — Cloudflare dynamically places the worker close to traffic origin
- **Environments:** `production` (with custom domain route) and `preview`
- **Cron triggers:** `0 6 * * *` — daily maintenance at 06:00 UTC
- **Observability:** Enabled with 10% head sampling rate for telemetry and log debugging

#### `src/worker.js`
The newly refactored ES Module worker engine serving four GET endpoints and one POST endpoint:
1. `GET /` — JSON service manifest with all URLs and version
2. `GET /health` — Liveness profiler with connectivity timestamps
3. `GET /compliance` — POPIA data protection disclosures
4. `GET /tools` — Full MCP tool schema inventory (8 tools)
5. `POST /rpc` — JSON-RPC 2.0 secure execution endpoint

All responses include CORS headers for cross-origin frontend access.

#### `src/crypto.js`
Dedicated POPIA compliance module exporting two functions:
- `hashPII(input)` — Accepts a string, returns its SHA-256 hex digest using the Web Crypto API
- `stripPII(payload)` — Accepts an object, replaces known sensitive fields with `[REDACTED-SHA256]`

#### `src/index.js`
Local stdio-based MCP server for development and CLI use. Uses `StdioServerTransport` from the MCP SDK. Intended for local-only execution; not deployed to Cloudflare.

#### `public/_headers`
Security-hardening asset layout:
- `X-Content-Type-Options: nosniff` — MIME-type sniffing protection
- `X-Frame-Options: DENY` — Clickjacking prevention; no iframe embedding
- `Referrer-Policy: strict-origin-when-cross-origin` — Browser referrer leak prevention
- `Permissions-Policy` — Camera, microphone, and geolocation API blocks
- `Content-Security-Policy` — Script source restricted to `self` and `pagead2.googlesyndication.com`

#### `public/_redirects`
Cloudflare routing sheet mapping all legacy `buzznewz` strings seamlessly into the new `Azaria AI` proxy channels via 301 permanent redirects.

#### `.gitignore`
Defensive shield preventing four heavyweight artifact classes from choking GitHub repository tracking history:
- `node_modules/` — npm dependency payloads
- `.next/` — Next.js compilation output
- `out/` — Static export directory
- `.wrangler/` — Local Cloudflare cache and temporary files

---

## 3. Data Protection and Compliance (POPIA)

All personal identifiable information (PII) that enters the Azaria AI system is processed under the **Protection of Personal Information Act (POPIA)** of the Republic of South Africa.

### SHA-256 Hashing Mechanism

A native SHA-256 cryptographic hashing layer is built into the backend worker at `src/crypto.js:1-9`. The mechanism uses the **Web Crypto API** (`crypto.subtle.digest`) available natively in the Cloudflare Workers runtime:

```javascript
export async function hashPII(input) {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
```

This hashing function strips and locks personal identifiable information fields **before they ever touch Cloudflare backend table spaces**. No raw email, phone number, ID number, passport, SSN, or credit card data is stored on the edge or in any persistent store.

### Data Sovereignty Boundaries

| Boundary | Implementation |
|---|---|
| **PII transit** | All PII is hashed via SHA-256 before any network transmission |
| **Storage** | Zero raw PII is persisted in Cloudflare KV, D1, R2, or any other storage backend |
| **Logging** | Observability logs are sampled at 10% head rate; PII fields are redacted before log emission |
| **Input sanitization** | `stripPII()` function in `src/crypto.js` filters 6 sensitive field keys |
| **Algorithm** | SHA-256 (FIPS 180-4) — collision-resistant, one-way cryptographic hash |

### Redacted Field Keys

```javascript
['email', 'phone', 'idNumber', 'passport', 'ssn', 'creditCard']
```

### Compliance Contact

All data protection inquiries and POPIA requests should be directed to:

```
Evans Mathibe — Data Protection Officer
evans.mathibe@mail.com
```

### Compliance Endpoint

`GET https://azaria-ai-worker.evansmathibe82.workers.dev/compliance`

Returns a JSON document with the full compliance framework, hashing algorithm specification, and contact information.

---

## 4. Deployment Commands Reference

### Deploy Backend Worker to Cloudflare

```bash
npm run worker:deploy
```

This runs `wrangler deploy`, bundling `src/worker.js` with all dependencies and uploading it to Cloudflare's edge. The worker is live at `https://azaria-ai-worker.evansmathibe82.workers.dev` immediately after deployment.

### Deploy to Production Environment

```bash
npx wrangler deploy --env production
```

Targets the `[env.production]` configuration block in `wrangler.toml` with the custom domain routing.

### Local Development

```bash
# Run the stdio MCP server locally (for MCP-compatible clients)
npm run dev

# Run the worker locally via wrangler
npm run worker:dev
```

### View Live Worker Logs

```bash
npm run worker:tail
```

Streams real-time logs from the deployed worker for debugging.

### Deploy Frontend to Cloudflare Pages

```bash
npx wrangler pages deploy public/
```

Deploys the contents of the `public/` directory (including `_headers` and `_redirects`) to Cloudflare Pages at `https://production.azaria-ai-frontend.pages.dev`.

---

## 5. Automated Runbook Diagnostics

The following shell commands can be run at any time to verify the live health of the Azaria AI production network. Each command targets a specific layer of the architecture.

### Diagnostic 1: Verify the Backend Service Manifest Structure

```bash
curl -s https://azaria-ai-worker.evansmathibe82.workers.dev/
```

**Expected output:** A JSON object with `service`, `version`, `endpoints`, `worker_url`, `frontend_url`, and `github` fields.

### Diagnostic 2: Query the Edge Engine Latency Profiler

```bash
curl -w "\nHTTP Status: %{http_code} | Core Connect Time: %{time_connect}s\n" -s https://azaria-ai-worker.evansmathibe82.workers.dev/health
```

**Expected output:** A JSON body `{"status":"ok","service":"azaria-ai-worker","timestamp":"..."}` followed by the HTTP status code (200) and TCP connection time in seconds.

### Diagnostic 3: Extract Active AI Agent Tool Schemas

```bash
curl -s https://azaria-ai-worker.evansmathibe82.workers.dev/tools
```

**Expected output:** A JSON object with a `tools` array containing all 8 tool definitions. Each tool includes `name`, `description`, and `inputSchema`.

### Diagnostic 4: Validate the POPIA Compliance Layer

```bash
curl -s https://azaria-ai-worker.evansmathibe82.workers.dev/compliance | python3 -m json.tool
```

**Expected output:** A formatted JSON document containing the POPIA framework, SHA-256 mechanism, redacted fields list, and the DPO contact email (`evans.mathibe@mail.com`).

### Diagnostic 5: Execute a Live RPC Tool Call

```bash
curl -s -X POST https://azaria-ai-worker.evansmathibe82.workers.dev/rpc \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"get_site_status","params":{},"id":1}' | python3 -m json.tool
```

**Expected output:** A JSON-RPC 2.0 response with the GitHub repository data (full name, stars, forks, last updated timestamp, worker URL, and frontend URL).

### Diagnostic 6: Full Automated Health Sweep

Run all diagnostics sequentially with a single command:

```bash
echo "=== AZARIA AI — FULL HEALTH SWEEP ===" && \
echo "" && \
echo "--- [1] Service Manifest ---" && \
curl -s https://azaria-ai-worker.evansmathibe82.workers.dev/ && \
echo "" && \
echo "--- [2] Latency Profiler ---" && \
curl -w "\nHTTP: %{http_code} | Connect: %{time_connect}s | Total: %{time_total}s\n" -s https://azaria-ai-worker.evansmathibe82.workers.dev/health && \
echo "" && \
echo "--- [3] Tool Schemas ---" && \
curl -s https://azaria-ai-worker.evansmathibe82.workers.dev/tools | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'Active tools: {len(d[\"tools\"])}')" && \
echo "" && \
echo "--- [4] Compliance Layer ---" && \
curl -s https://azaria-ai-worker.evansmathibe82.workers.dev/compliance | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'Framework: {d[\"framework\"]} | Officer: {d[\"contact_officer\"]}')" && \
echo "" && \
echo "--- [5] RPC Tool Execution ---" && \
curl -s -X POST https://azaria-ai-worker.evansmathibe82.workers.dev/rpc -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"get_site_status","params":{},"id":1}' | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'Repo: {d[\"result\"][\"repo\"]} | Pages: {d[\"result\"][\"pages_status\"]}')" && \
echo "" && \
echo "=== SWEEP COMPLETE — ALL SYSTEMS NOMINAL ==="
```

---

## 6. Troubleshooting Guide

### Worker Deploy Fails with Build Errors

**Symptom:** `wrangler deploy` exits with module resolution or syntax errors.

**Remedies:**
1. Run `node --check src/worker.js` to verify JavaScript syntax.
2. Run `node --check src/crypto.js` to verify the crypto utility.
3. Ensure all imports in `src/worker.js` resolve to installed packages (`npm ls`).
4. Verify `nodejs_compat` is in `wrangler.toml` `compatibility_flags`.

### Worker Returns 500 on RPC Calls

**Symptom:** `POST /rpc` returns `{"jsonrpc":"2.0","error":{"code":-32603,"message":"..."}}`.

**Remedies:**
1. Check `GITHUB_TOKEN` is set as a secret in the Cloudflare Worker dashboard or `wrangler secret put GITHUB_TOKEN`.
2. Verify the GitHub token has `repo` scope for the `Evansxm/azaria-ai-agency` repository.
3. Run `npm run worker:tail` to view real-time error logs.

### CORS Errors from Frontend

**Symptom:** Browser console shows `Cross-Origin Request Blocked`.

**Remedies:**
1. Verify the worker's `corsHeaders` include `Access-Control-Allow-Origin: *`.
2. Check that `OPTIONS` preflight requests return HTTP 204 with correct headers.
3. Confirm the frontend domain is not blocked by Cloudflare WAF custom rules.

### Cron Trigger Not Firing

**Symptom:** Daily maintenance tasks are not executing.

**Remedies:**
1. Verify `[triggers]` section exists in `wrangler.toml` with `crons = ["0 6 * * *"]`.
2. Redeploy the worker: `npm run worker:deploy` (cron triggers are registered at deploy time).
3. Check the Cloudflare Dashboard > Workers & Pages > azaria-ai-worker > Cron Triggers.

### Pages Redirects Not Working

**Symptom:** Legacy `buzznewz` URLs return 404 instead of redirecting.

**Remedies:**
1. Verify `public/_redirects` exists and has the correct format (one rule per line, space-separated).
2. Redeploy Pages: `npx wrangler pages deploy public/`.
3. Note that `_redirects` rules are evaluated top-to-bottom; check for conflicting rules.
