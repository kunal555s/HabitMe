import { bloggerService } from '../src/services/bloggerService';
import admin from 'firebase-admin';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase Admin for Serverless
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)' 
  ? (admin.app() as any).firestore(firebaseConfig.firestoreDatabaseId)
  : admin.firestore();

export default async function handler(req: any, res: any) {
  try {
    console.log('Starting sync from Blogger to Firestore...');
    
    // Validate environment variables
    const apiKey = bloggerService.getApiKey();
    const blogId = bloggerService.getBlogId();
    
    if (!apiKey || !blogId) {
      console.error('Missing Blogger API configuration:', { apiKey: !!apiKey, blogId: !!blogId });
      return res.status(500).json({ 
        error: 'Missing Blogger API configuration. Please set VITE_BLOGGER_API_KEY and VITE_BLOGGER_BLOG_ID in environment variables.',
        details: { apiKey: !!apiKey, blogId: !!blogId }
      });
    }
    
    // 1. Fetch all posts from Blogger (up to 500)
    console.log('Fetching posts from Blogger API...');
    const bloggerResponse = await bloggerService.getPosts(500);
    const bloggerPosts = bloggerResponse.items || [];
    const bloggerPostIds = bloggerPosts.map(p => p.id);
    console.log(`Fetched ${bloggerPosts.length} posts from Blogger.`);

    if (bloggerPosts.length === 0) {
      console.warn('No posts found in Blogger. Check your Blog ID and API Key.');
      return res.status(200).json({ 
        success: true, 
        synced: 0, 
        message: 'No posts found in Blogger. Please ensure your blog has published posts.' 
      });
    }

    // 2. Fetch current posts from Firestore to check for deletions
    console.log('Fetching existing posts from Firestore...');
    const firestoreSnap = await db.collection('posts').get();
    const firestorePostIds = firestoreSnap.docs.map(doc => doc.id);
    console.log(`Found ${firestorePostIds.length} existing posts in Firestore.`);

    const batch = db.batch();

    // 3. Update or Create posts in Firestore
    for (const post of bloggerPosts) {
      const postRef = db.collection('posts').doc(post.id);
      const thumbnail = bloggerService.extractThumbnail(post.content);
      const slug = bloggerService.slugify(post.title);
      
      batch.set(postRef, {
        id: post.id,
        title: post.title,
        slug: slug,
        content: post.content,
        published: post.published,
        updated: post.updated,
        labels: post.labels || [],
        url: post.url,
        thumbnail: thumbnail,
        syncedAt: new Date().toISOString()
      }, { merge: true });
    }

    // 4. Sync Pages to Firestore
    console.log('Fetching pages from Blogger API...');
    const pagesResponse = await bloggerService.getPages();
    const bloggerPages = pagesResponse.items || [];
    console.log(`Fetched ${bloggerPages.length} pages from Blogger.`);

    for (const page of bloggerPages) {
      const pageRef = db.collection('pages').doc(page.id);
      const slug = bloggerService.slugify(page.title);
      
      batch.set(pageRef, {
        id: page.id,
        title: page.title,
        slug: slug,
        content: page.content,
        published: page.published,
        url: page.url,
        syncedAt: new Date().toISOString()
      }, { merge: true });
    }

    // 5. Delete posts from Firestore that are no longer in Blogger
    const postsToDelete = firestorePostIds.filter(id => !bloggerPostIds.includes(id));
    for (const id of postsToDelete) {
      const postRef = db.collection('posts').doc(id);
      batch.delete(postRef);
      console.log(`Deleting post ${id} from Firestore (not found in Blogger)`);
    }

    await batch.commit();

    res.status(200).json({ 
      success: true, 
      syncedPosts: bloggerPosts.length, 
      syncedPages: bloggerPages.length,
      deletedPosts: postsToDelete.length 
    });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: 'Failed to sync articles' });
  }
}
