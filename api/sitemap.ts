import { bloggerService } from '../src/services/bloggerService';

export default async function handler(req: any, res: any) {
  const domain = 'https://habitxpress.fun';
  
  try {
    // Fetch posts from Blogger
    // We fetch a large number to include as many as possible in the sitemap
    const response = await bloggerService.getPosts(500);
    const posts = response.items || [];
    
    // Fetch pages
    const pagesResponse = await bloggerService.getPages();
    const pages = pagesResponse.items || [];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <!-- Static Pages -->
      <url>
        <loc>${domain}/</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
      </url>
      
      <!-- Blogger Posts -->
      ${posts.map(post => `
      <url>
        <loc>${domain}/post/${bloggerService.slugify(post.title)}</loc>
        <lastmod>${new Date(post.updated || post.published).toISOString().split('T')[0]}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
      </url>`).join('')}
      
      <!-- Blogger Pages -->
      ${pages.map(page => `
      <url>
        <loc>${domain}/page/${bloggerService.slugify(page.title)}</loc>
        <lastmod>${new Date(page.published).toISOString().split('T')[0]}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.6</priority>
      </url>`).join('')}
    </urlset>`;

    res.setHeader('Content-Type', 'text/xml');
    res.write(sitemap);
    res.end();
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).send('Error generating sitemap');
  }
}
