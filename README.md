# BuzzNewz MCP Server

Model Context Protocol server for managing BuzzNewz landing page with Google Ads optimization and maintenance.

## Features

- **Site Status**: Get current deployment status
- **AdSense Management**: Update Publisher ID across all pages
- **Article Management**: Add new articles
- **Ad Optimization**: Configure ad placement strategy
- **Maintenance**: SEO checks, link validation, performance

## Installation

```bash
cd buzznewz-mcp
npm install
```

## Configuration

Set your GitHub token:

```bash
export GITHUB_TOKEN=your_github_token_here
```

## Usage

```bash
npm start
```

## Available Tools

| Tool | Description |
|------|-------------|
| `get_site_status` | Get deployment status and analytics |
| `deploy_site` | Trigger GitHub Pages deployment |
| `update_adsense_id` | Update AdSense Publisher ID |
| `add_article` | Create new article |
| `optimize_ads` | Configure ad placement strategy |
| `check_adsense_status` | Check AdSense compliance |
| `update_sitemap` | Auto-update sitemap |
| `run_maintenance` | Run maintenance tasks |

## AdSense Optimization

### Recommended Configuration (AdSense Compliant)

```javascript
{
  header_banners: 1,  // Top of page
  sidebar_ads: 1,      // Right sidebar  
  in_content_ads: 1,   // Within article
  total: 3             // Max recommended per page
}
```

### Aggressive (May Violate Policy)

```javascript
{
  header_banners: 3,
  sidebar_ads: 2,
  in_content_ads: 3,
  footer_ads: 1,
  total: 9
}
```

## Current Site Status

- **URL**: https://evansxm.github.io/buzznewz/
- **Pages**: 27 HTML files
- **Articles**: 17 AI news articles
- **Ad Units**: 3 per page (compliant)

## Maintenance Tasks

- SEO: Meta tags, sitemap, robots.txt
- Links: Internal link validation
- Performance: CSS/JS minification, lazy loading

---

Built for BuzzNewz by Evans Mathibe
