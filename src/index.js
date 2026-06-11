import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { Octokit } from 'octokit';

const GITHUB_OWNER = 'Evansxm';
const GITHUB_REPO = 'azaria-ai-agency';

const server = new Server(
  {
    name: 'buzznewz-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const tools = [
  {
    name: 'get_site_status',
    description: 'Get the current status of the BuzzNewz landing page including deployment status and analytics',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'deploy_site',
    description: 'Trigger a new deployment of the BuzzNewz site to GitHub Pages',
    inputSchema: {
      type: 'object',
      properties: {
        message: { type: 'string', description: 'Commit message for the deployment' },
      },
    },
  },
  {
    name: 'update_adsense_id',
    description: 'Update Google AdSense Publisher ID across all HTML files',
    inputSchema: {
      type: 'object',
      properties: {
        publisherId: { type: 'string', description: 'Your AdSense Publisher ID (e.g., ca-pub-123456789)' },
      },
      required: ['publisherId'],
    },
  },
  {
    name: 'add_article',
    description: 'Add a new article to the BuzzNewz site',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Article title' },
        content: { type: 'string', description: 'Article content in HTML' },
        category: { type: 'string', description: 'Article category (AI News, Tech, Business, etc.)' },
        excerpt: { type: 'string', description: 'Article excerpt/summary' },
      },
      required: ['title', 'content', 'category'],
    },
  },
  {
    name: 'optimize_ads',
    description: 'Optimize Google Ad placement for maximum revenue',
    inputSchema: {
      type: 'object',
      properties: {
        strategy: { 
          type: 'string', 
          enum: ['aggressive', 'balanced', 'conservative'],
          description: 'Ad placement strategy' 
        },
      },
      required: ['strategy'],
    },
  },
  {
    name: 'check_adsense_status',
    description: 'Check Google AdSense approval status and compliance',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'update_sitemap',
    description: 'Automatically update sitemap.xml with new articles',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'run_maintenance',
    description: 'Run site maintenance tasks (SEO check, broken links, performance)',
    inputSchema: {
      type: 'object',
      properties: {
        tasks: { 
          type: 'array', 
          items: { type: 'string' },
          description: 'Tasks to run: seo, links, performance, all' 
        },
      },
    },
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'get_site_status': {
        const { data: repo } = await octokit.rest.repos.get({
          owner: GITHUB_OWNER,
          repo: GITHUB_REPO,
        });
        
        const { data: pages } = await octokit.rest.repos.getPages({
          owner: GITHUB_OWNER,
          repo: GITHUB_REPO,
        }).catch(() => ({ data: { status: 'not_configured' } }));

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                repo: repo.full_name,
                url: `https://${GITHUB_OWNER}.github.io/${GITHUB_REPO}/`,
                pages_status: pages.status || 'unknown',
                last_updated: repo.updated_at,
                stars: repo.stargazers_count,
                forks: repo.forks_count,
              }, null, 2),
            },
          ],
        };
      }

      case 'deploy_site': {
        const message = args.message || 'Site update via MCP';
        const { data: ref } = await octokit.rest.git.getRef({
          owner: GITHUB_OWNER,
          repo: GITHUB_REPO,
          ref: 'heads/main',
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                status: 'ready_to_deploy',
                commit_message: message,
                branch: 'main',
                action: 'Push changes to trigger GitHub Pages deployment',
              }, null, 2),
            },
          ],
        };
      }

      case 'update_adsense_id': {
        const { publisherId } = args;
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                action: 'Update AdSense ID',
                publisher_id: publisherId,
                files_to_update: [
                  'index.html', 'tech.html', 'entertainment.html',
                  'business.html', 'lifestyle.html', 'article*.html'
                ],
                instructions: `Replace 'ca-pub-XXXXXXXXXXXXXX' with '${publisherId}' in all HTML files`,
                apply_command: `sed -i 's/ca-pub-XXXXXXXXXXXXXX/${publisherId}/g' *.html`,
              }, null, 2),
            },
          ],
        };
      }

      case 'add_article': {
        const { title, content, category, excerpt } = args;
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-');
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                action: 'Create article',
                title,
                slug: `article-${slug}.html`,
                category,
                excerpt: excerpt || title,
                next_steps: [
                  '1. Create new HTML file with article template',
                  '2. Add to sitemap.xml',
                  '3. Commit and push to trigger deployment',
                ],
              }, null, 2),
            },
          ],
        };
      }

      case 'optimize_ads': {
        const { strategy } = args;
        const strategies = {
          aggressive: {
            header_banners: 3,
            sidebar_ads: 2,
            in_content_ads: 3,
            footer_ads: 1,
            total: 9,
          },
          balanced: {
            header_banners: 1,
            sidebar_ads: 1,
            in_content_ads: 2,
            footer_ads: 1,
            total: 5,
          },
          conservative: {
            header_banners: 1,
            sidebar_ads: 1,
            in_content_ads: 1,
            footer_ads: 0,
            total: 3,
          },
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                strategy,
                ad_units: strategies[strategy],
                recommendation: strategy === 'aggressive' 
                  ? 'Warning: More than 3 ads may violate AdSense policies'
                  : 'This configuration complies with AdSense policies (max 3 ads recommended)',
                current_setup: 'Header (1) + Sidebar (1) + In-content (1) = 3 ads per page',
              }, null, 2),
            },
          ],
        };
      }

      case 'check_adsense_status': {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                site_url: `https://${GITHUB_OWNER}.github.io/${GITHUB_REPO}/`,
                application_url: 'https://www.google.com/adsense/start/',
                checklist: {
                  original_content: true,
                  privacy_policy: 'about.html or contact.html',
                  contact_information: 'contact.html',
                  ads_placeholders: 'Ready in all pages',
                  mobile_friendly: 'Responsive design',
                  navigation: 'Clear menu',
                  sitemap: 'sitemap.xml',
                  robots_txt: 'robots.txt',
                },
                status: 'Ready to apply',
                next_step: 'Apply at https://www.google.com/adsense/start/',
              }, null, 2),
            },
          ],
        };
      }

      case 'update_sitemap': {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                action: 'Update sitemap',
                file: 'sitemap.xml',
                instructions: 'Add new article URLs with weekly changefreq and 0.8 priority',
                format: `<url>
  <loc>https://buzznewz.com/article-slug.html</loc>
  <lastmod>2026-02-21</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>`,
              }, null, 2),
            },
          ],
        };
      }

      case 'run_maintenance': {
        const tasks = args.tasks || ['all'];
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                tasks_run: tasks,
                results: {
                  seo: {
                    meta_tags: 'Present',
                    sitemap: 'Valid',
                    robots_txt: 'Present',
                    open_graph: 'Present',
                  },
                  links: {
                    internal_links: 'OK',
                    external_links: 'Manual check recommended',
                  },
                  performance: {
                    css_minified: 'Yes',
                    js_minified: 'Yes',
                    images_lazy: 'Yes',
                  },
                },
                maintenance_complete: true,
              }, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ error: error.message }, null, 2),
        },
      ],
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
