import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Firebase config
const firebaseConfigPath = path.join(__dirname, "firebase-applet-config.json");
const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, "utf-8"));

// Initialize Firebase Admin
let app;
if (!getApps().length) {
  app = initializeApp({
    projectId: firebaseConfig.projectId,
  });
} else {
  app = getApps()[0];
}

const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Resend Subscribe Endpoint
  app.post("/api/subscribe", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const RESEND_API_KEY = process.env.RESEND_API_KEY;
      if (!RESEND_API_KEY) {
        console.warn("RESEND_API_KEY is not set. Skipping welcome email.");
        return res.status(200).json({ success: true, message: "Saved to database only." });
      }

      const { Resend } = await import("resend");
      const resend = new Resend(RESEND_API_KEY);

      const { data, error } = await resend.emails.send({
        from: "HabitXpress <onboarding@resend.dev>",
        to: [email],
        subject: "Welcome to HabitXpress! 🎉",
        html: `
          <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
            <h1 style="color: #dc2626;">Welcome to HabitXpress!</h1>
            <p>Hi there,</p>
            <p>Thank you for subscribing to our weekly habit tips. You're joining a community of readers dedicated to science-backed strategies for a better life.</p>
            <p>Stay tuned for our next update!</p>
            <br/>
            <p>Best regards,</p>
            <p><strong>The HabitXpress Team</strong></p>
          </div>
        `,
      });

      if (error) {
        console.error("Resend error:", error);
        return res.status(500).json({ error: error.message });
      }

      res.status(200).json({ success: true, data });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Send Newsletter Endpoint
  app.post("/api/send-newsletter", async (req, res) => {
    try {
      const { postIds, customSubject, customBody, idToken } = req.body;
      if (!idToken) {
        return res.status(400).json({ error: "idToken is required" });
      }

      const { getAuth } = await import("firebase-admin/auth");
      
      // Verify admin
      let decodedToken;
      try {
        decodedToken = await getAuth().verifyIdToken(idToken);
      } catch (authError) {
        console.error("Auth verification failed:", authError);
        return res.status(401).json({ error: "Invalid token" });
      }

      const userRecord = await getAuth().getUser(decodedToken.uid);
      
      let isAdmin = false;
      if (userRecord.email === "kunalsonpitre55555@gmail.com" && userRecord.emailVerified) {
        isAdmin = true;
      } else {
        const userDoc = await db.collection("users").doc(decodedToken.uid).get();
        if (userDoc.exists && userDoc.data()?.role === "admin") {
          isAdmin = true;
        }
      }

      if (!isAdmin) {
        return res.status(403).json({ error: "Unauthorized. Admin access required." });
      }

      const RESEND_API_KEY = process.env.RESEND_API_KEY;
      if (!RESEND_API_KEY) {
        return res.status(500).json({ error: "RESEND_API_KEY is not set." });
      }

      // Detect domain dynamically
      const protocol = req.headers["x-forwarded-proto"] || "https";
      const host = req.headers.host;
      const domain = `${protocol}://${host}`;

      // Fetch subscribers
      const subscribersSnapshot = await db.collection("subscribers").get();
      const emails = subscribersSnapshot.docs.map(doc => doc.data().email).filter(Boolean);

      if (emails.length === 0) {
        return res.status(200).json({ success: true, message: "No subscribers found." });
      }

      let subject = customSubject || "New Update from HabitXpress";
      let htmlContent = "";

      if (customBody) {
        htmlContent = customBody;
      } else if (postIds && Array.isArray(postIds) && postIds.length > 0) {
        const posts = [];
        for (const id of postIds) {
          const postDoc = await db.collection("posts").doc(id).get();
          if (postDoc.exists) {
            posts.push({ id, ...postDoc.data() });
          }
        }

        if (posts.length === 0) {
          return res.status(404).json({ error: "No posts found for the provided IDs" });
        }

        subject = posts.length === 1 ? `New Article: ${posts[0].title}` : `Weekly Roundup: ${posts.length} New Articles for You`;
        
        htmlContent = `
          <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #dc2626; margin-bottom: 20px; text-align: center;">${posts.length === 1 ? 'New Article' : 'Your Weekly Roundup'}</h1>
            <p style="font-size: 16px; line-height: 1.5; color: #333;">Hi there,</p>
            <p style="font-size: 16px; line-height: 1.5; color: #333;">We have some exciting updates from HabitXpress that we think you'll love!</p>
            
            ${posts.map(post => `
              <div style="margin: 30px 0; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
                <h2 style="margin-top: 0; color: #111;">${post.title}</h2>
                ${post.thumbnail ? `
                  <img src="${post.thumbnail}" alt="${post.title}" style="width: 100%; border-radius: 8px; margin-bottom: 15px;" />
                ` : ''}
                <p style="color: #666; font-size: 14px;">${post.snippet || 'Click below to read the full article.'}</p>
                <div style="text-align: center; margin-top: 20px;">
                  <a href="${domain}/post/${post.id}" style="display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 999px; font-weight: bold; font-size: 14px;">Read Article</a>
                </div>
              </div>
            `).join('')}
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 40px 0;" />
            <p style="font-size: 14px; color: #666;">Best regards,<br/><strong>The HabitXpress Team</strong></p>
            <p style="font-size: 12px; color: #999; margin-top: 20px;">You are receiving this because you subscribed to HabitXpress.</p>
          </div>
        `;
      } else {
        return res.status(400).json({ error: "Either postIds or customBody must be provided" });
      }

      const { Resend } = await import("resend");
      const resend = new Resend(RESEND_API_KEY);

      // Send emails using Resend Batch API (max 100 per batch)
      const BATCH_SIZE = 100;
      let sentCount = 0;

      for (let i = 0; i < emails.length; i += BATCH_SIZE) {
        const batchEmails = emails.slice(i, i + BATCH_SIZE);
        
        const emailsToSend = batchEmails.map(email => ({
          from: "HabitXpress <onboarding@resend.dev>",
          to: [email],
          subject: subject,
          html: htmlContent,
        }));

        const { error } = await resend.batch.send(emailsToSend);
        if (error) {
          console.error("Resend batch error:", error);
        } else {
          sentCount += batchEmails.length;
        }
      }

      res.status(200).json({ success: true, message: `Newsletter sent to ${sentCount} subscribers.` });
    } catch (error) {
      console.error("Error sending newsletter:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Internal server error" });
    }
  });

  // Auto-Newsletter Endpoint (Can be triggered by a cron job or manually)
  app.post("/api/auto-newsletter", async (req, res) => {
    try {
      const { secret } = req.body;
      // Simple secret check for basic security
      if (secret !== process.env.RESEND_API_KEY?.slice(0, 10)) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const RESEND_API_KEY = process.env.RESEND_API_KEY;
      if (!RESEND_API_KEY) return res.status(500).json({ error: "RESEND_API_KEY not set" });

      // Fetch 3 random or latest posts
      const postsSnapshot = await db.collection("posts").orderBy("published", "desc").limit(10).get();
      const allPosts = postsSnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      
      // Select 3 random posts from the latest 10
      const selectedPosts = allPosts.sort(() => 0.5 - Math.random()).slice(0, 3);

      if (selectedPosts.length === 0) return res.status(200).json({ message: "No posts to send" });

      // Fetch subscribers
      const subscribersSnapshot = await db.collection("subscribers").get();
      const emails = subscribersSnapshot.docs.map(doc => doc.data().email).filter(Boolean);

      if (emails.length === 0) return res.status(200).json({ message: "No subscribers" });

      const protocol = req.headers["x-forwarded-proto"] || "https";
      const host = req.headers.host;
      const domain = `${protocol}://${host}`;

      const { Resend } = await import("resend");
      const resend = new Resend(RESEND_API_KEY);

      const htmlContent = `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #dc2626; text-align: center;">Daily HabitXpress Digest</h1>
          <p>Here are some articles to help you master your habits today:</p>
          ${selectedPosts.map(post => `
            <div style="margin: 20px 0; padding: 15px; border-bottom: 1px solid #eee;">
              <h3>${post.title}</h3>
              <a href="${domain}/post/${post.id}" style="color: #dc2626; font-weight: bold;">Read More →</a>
            </div>
          `).join('')}
          <p style="font-size: 12px; color: #999; margin-top: 30px;">You're receiving this as a valued subscriber of HabitXpress.</p>
        </div>
      `;

      const BATCH_SIZE = 100;
      for (let i = 0; i < emails.length; i += BATCH_SIZE) {
        const batch = emails.slice(i, i + BATCH_SIZE).map(email => ({
          from: "HabitXpress <onboarding@resend.dev>",
          to: [email],
          subject: "Your Daily HabitXpress Digest",
          html: htmlContent
        }));
        await resend.batch.send(batch);
      }

      res.status(200).json({ success: true, message: "Auto-newsletter sent" });
    } catch (error) {
      console.error("Auto-newsletter error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Sitemap Endpoint
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const DOMAIN = "https://habitxpress.fun";
      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${DOMAIN}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

      // Fetch all posts from Firestore
      const postsSnapshot = await db.collection("posts").orderBy("published", "desc").get();
      
      const slugify = (text: string) => {
        return text
          .toString()
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')
          .replace(/[^\w\-]+/g, '')
          .replace(/\-\-+/g, '-')
          .replace(/^-+/, '')
          .replace(/-+$/, '');
      };

      postsSnapshot.forEach((doc) => {
        const post = doc.data();
        const slug = slugify(post.title);
        xml += `
  <url>
    <loc>${DOMAIN}/post/${slug}</loc>
    <lastmod>${new Date(post.updated || post.published).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
      });

      // Fetch pages
      const pagesSnapshot = await db.collection("pages").get();
      pagesSnapshot.forEach((doc) => {
        const page = doc.data();
        const slug = slugify(page.title);
        xml += `
  <url>
    <loc>${DOMAIN}/page/${slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`;
      });

      xml += "\n</urlset>";
      res.header("Content-Type", "application/xml");
      res.send(xml);
    } catch (error) {
      console.error("Error generating sitemap:", error);
      res.status(500).send("Error generating sitemap");
    }
  });

  // Robots.txt
  app.get("/robots.txt", (req, res) => {
    res.type("text/plain");
    res.send("User-agent: *\nAllow: /\nSitemap: https://habitxpress.fun/sitemap.xml");
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
