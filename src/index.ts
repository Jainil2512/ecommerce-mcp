import { McpServer, ResourceTemplate } from '@modelcontextprotocol/server';
import { StdioServerTransport } from '@modelcontextprotocol/server/stdio';
import * as z from 'zod/v4';
import { products, policies } from './data.js';

const server = new McpServer({ name: 'ecom-mcp', version: '1.1.0' });

const productSchema = z.object({
  sku: z.string(),
  name: z.string(),
  price: z.number(),
  stock: z.number(),
});

server.registerTool(
  'search_products',
  {
    title: 'Search Products',
    description: 'Search the product catalog by keyword, optionally under a max price (INR).',
    inputSchema: z.object({
      query: z.string().describe('Keyword to match in the product name'),
      maxPrice: z.number().optional().describe('Maximum price in INR'),
    }),
    outputSchema: z.object({ results: z.array(productSchema) }),
    annotations: { readOnlyHint: true },
  },
  async ({ query, maxPrice }) => {
    const results = products.filter(
      (p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) &&
        (maxPrice === undefined || p.price <= maxPrice),
    );
    const output = { results };
    return {
      content: [{ type: 'text', text: JSON.stringify(output, null, 2) }],
      structuredContent: output,
    };
  },
);

server.registerTool(
  'check_stock',
  {
    title: 'Check Stock',
    description: 'Check live stock for a product by SKU.',
    inputSchema: z.object({ sku: z.string().describe('Product SKU, e.g. NK-001') }),
    annotations: { readOnlyHint: true },
  },
  async ({ sku }) => {
    const p = products.find((x) => x.sku === sku);
    if (!p) {
      return { isError: true, content: [{ type: 'text', text: `No product with SKU ${sku}` }] };
    }
    return { content: [{ type: 'text', text: `${p.name}: ${p.stock} in stock` }] };
  },
);

// ---------- RESOURCES ----------
// Static resource: fixed URI
server.registerResource(
  'store-policies',
  'store://policies',
  {
    title: 'Store Policies',
    description: 'Shipping, returns and COD policies',
    mimeType: 'text/plain',
  },
  async (uri) => ({
    contents: [{ uri: uri.href, text: policies }],
  }),
);

// Dynamic resource: URI template with a {sku} parameter
server.registerResource(
  'product-details',
  new ResourceTemplate('product://{sku}', {
    list: async () => ({
      resources: products.map((p) => ({ uri: `product://${p.sku}`, name: p.name })),
    }),
  }),
  {
    title: 'Product Details',
    description: 'Full details for one product',
    mimeType: 'application/json',
  },
  async (uri, { sku }) => {
    const p = products.find((x) => x.sku === sku);
    return {
      contents: [{ uri: uri.href, text: JSON.stringify(p ?? { error: 'Not found' }) }],
    };
  },
);

// ---------- PROMPTS ----------
server.registerPrompt(
  'gift-finder',
  {
    title: 'Gift Finder',
    description: 'Find a gift from the catalog for an occasion and budget',
    argsSchema: z.object({
      occasion: z.string().describe('e.g. birthday, anniversary'),
      budget: z.string().describe('Max budget in INR'),
    }),
  },
  ({ occasion, budget }) => ({
    messages: [
      {
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Find 2 gift options for a ${occasion} under ₹${budget}. Use search_products, check_stock before recommending, and mention the store's return policy.`,
        },
      },
    ],
  }),
);

async function main() {
  await server.connect(new StdioServerTransport());
  console.error('ecom-mcp running on stdio'); // stderr only
}
main();