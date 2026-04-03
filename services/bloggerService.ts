// Helper to get environment variables in both browser (Vite) and server (Node) environments
const getEnv = (key: string) => {
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    // @ts-ignore
    return import.meta.env[key];
  }
  // Try with VITE_ prefix first, then without
  const viteKey = key.startsWith('VITE_') ? key : `VITE_${key}`;
  const plainKey = key.replace('VITE_', '');
  
  return process.env[viteKey] || process.env[plainKey] || process.env[key];
};

const API_KEY = getEnv('VITE_BLOGGER_API_KEY');
const BLOG_ID = getEnv('VITE_BLOGGER_BLOG_ID');
const BASE_URL = `https://www.googleapis.com/blogger/v3/blogs/${BLOG_ID}`;

export interface BloggerPost {
  id: string;
  title: string;
  content: string;
  url: string;
  published: string;
  updated: string;
  labels?: string[];
  author: {
    displayName: string;
    image: { url: string };
  };
  images?: { url: string }[];
}

export interface BloggerPage {
  id: string;
  title: string;
  content: string;
  url: string;
  published: string;
}

export interface BloggerResponse<T> {
  kind: string;
  items?: T[];
  nextPageToken?: string;
  prevPageToken?: string;
  totalItems?: number;
}

export const bloggerService = {
  async getBlogInfo() {
    const url = `${BASE_URL}?key=${API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch blog info');
    return await response.json();
  },

  async getPosts(maxResults = 30, pageToken?: string, label?: string) {
    let url = `${BASE_URL}/posts?key=${API_KEY}&maxResults=${maxResults}`;
    if (pageToken) url += `&pageToken=${pageToken}`;
    if (label) url += `&labels=${encodeURIComponent(label)}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch posts: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return (await response.json()) as BloggerResponse<BloggerPost>;
  },

  async getPages() {
    const url = `${BASE_URL}/pages?key=${API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch pages');
    return (await response.json()) as BloggerResponse<BloggerPage>;
  },

  async getPostById(postId: string) {
    const url = `${BASE_URL}/posts/${postId}?key=${API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch post');
    return (await response.json()) as BloggerPost;
  },

  extractThumbnail(content: string): string {
    const imgTag = content.match(/<img[^>]+src="([^">]+)"/);
    if (imgTag && imgTag[1]) {
      return imgTag[1];
    }
    // Consistent fallback based on content length
    const hash = content.length % 10;
    return `https://picsum.photos/seed/habit${hash}/1600/900`;
  },

  getOptimizedImageUrl(url: string, size: 's400' | 's800' | 's1600' | 'w400-h225-c' | 'w800-h450-c' = 's800'): string {
    if (!url || !url.includes('blogger.googleusercontent.com') && !url.includes('bp.blogspot.com')) {
      return url;
    }
    // Replace Blogger's auto-resize parameters with requested size
    // Common patterns: /s1600/, /w640-h480/, /s72-c/
    return url.replace(/\/(s\d+(-c)?|w\d+-h\d+(-c)?)\//, `/${size}/`);
  },

  stripHtml(html: string): string {
    if (typeof document === 'undefined') {
      // Simple regex fallback for server-side
      return html.replace(/<[^>]*>?/gm, '');
    }
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  },

  sanitizeContent(html: string): string {
    if (typeof document === 'undefined') return html;
    // Remove the first image from the content if it's likely the thumbnail
    // This prevents "double image" issue
    const div = document.createElement('div');
    div.innerHTML = html;
    const firstImg = div.querySelector('img');
    if (firstImg) {
      firstImg.remove();
    }
    return div.innerHTML;
  },

  getApiKey() {
    return API_KEY;
  },

  getBlogId() {
    return BLOG_ID;
  },

  slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')     // Replace spaces with -
      .replace(/[^\w\-]+/g, '') // Remove all non-word chars
      .replace(/\-\-+/g, '-')   // Replace multiple - with single -
      .replace(/^-+/, '')       // Trim - from start of text
      .replace(/-+$/, '');      // Trim - from end of text
  }
};
