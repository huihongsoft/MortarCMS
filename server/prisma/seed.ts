import db, { initDB, cuid } from '../src/utils/db';
import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';

initDB();

async function main() {
  console.log('Seeding database...');
  const adminPassword = await bcrypt.hash('admin123', 10);

  const dbIns = db as any;

  const stmts = {
    user: db.prepare('INSERT OR IGNORE INTO User (id, username, email, password, role, bio) VALUES (?, ?, ?, ?, ?, ?)'),
    setting: db.prepare('INSERT OR REPLACE INTO Setting (id, key, value) VALUES (?, ?, ?)'),
    category: db.prepare('INSERT OR IGNORE INTO Category (id, name, slug, description) VALUES (?, ?, ?, ?)'),
    tag: db.prepare('INSERT OR IGNORE INTO Tag (id, name, slug) VALUES (?, ?, ?)'),
    post: db.prepare('INSERT OR IGNORE INTO Post (id, title, slug, content, excerpt, status, type, authorId, publishedAt, menuOrder) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'),
    postCat: db.prepare('INSERT OR IGNORE INTO PostCategory (postId, categoryId) VALUES (?, ?)'),
    postTag: db.prepare('INSERT OR IGNORE INTO PostTag (postId, tagId) VALUES (?, ?)'),
  };

  stmts.user.run(cuid(), 'admin', 'admin@mortar.dev', adminPassword, 'admin', 'Site administrator');

  const settings: [string, string][] = [
    ['site_title', 'Mortar CMS'], ['site_description', 'A modern WordPress-like CMS built with TypeScript'],
    ['site_url', 'http://localhost:3001'], ['admin_email', 'admin@mortar.dev'],
    ['posts_per_page', '10'], ['default_role', 'author'], ['timezone', 'Asia/Shanghai'], ['date_format', 'Y-m-d'],
  ];
  for (const [k, v] of settings) stmts.setting.run(cuid(), k, v);

  const cat1 = cuid(), cat2 = cuid();
  stmts.category.run(cat1, 'Uncategorized', 'uncategorized', 'Default category');
  stmts.category.run(cat2, 'Technology', 'technology', 'Posts about technology');

  const tag1 = cuid(), tag2 = cuid();
  stmts.tag.run(tag1, 'TypeScript', 'typescript');
  stmts.tag.run(tag2, 'Web Development', 'web-development');

  const adminId = db.prepare("SELECT id FROM User WHERE email = 'admin@mortar.dev'").get() as any;
  const post1 = cuid(), post2 = cuid(), page1 = cuid();

  stmts.post.run(post1, 'Welcome to Mortar', 'welcome-to-mortar',
    '<h2>Your CMS is Ready!</h2><p>Mortar is a modern, WordPress-like content management system built entirely in TypeScript.</p><h3>Features</h3><ul><li>Post and page management with draft/publish workflow</li><li>Categories and tags</li><li>Media library</li><li>User roles: Admin, Editor, Author</li><li>Comment moderation</li><li>Customizable settings</li></ul><p>Start by creating your first post in the admin dashboard.</p>',
    'Mortar is a modern WordPress-like CMS built in TypeScript.',
    'published', 'post', adminId.id, new Date().toISOString(), 0);
  stmts.postCat.run(post1, cat2);
  stmts.postTag.run(post1, tag1); stmts.postTag.run(post1, tag2);

  stmts.post.run(post2, 'Getting Started with Mortar', 'getting-started-with-mortar',
    '<p>Mortar is designed to be intuitive.</p><h3>Quick Start</h3><ol><li>Log in to the admin dashboard with admin@mortar.dev / admin123</li><li>Create new posts or pages</li><li>Upload media</li><li>Manage comments</li></ol>',
    'Learn how to get started with Mortar.',
    'published', 'post', adminId.id, new Date(Date.now() - 86400000).toISOString(), 0);
  stmts.postCat.run(post2, cat1);

  stmts.post.run(page1, 'About', 'about',
    '<h2>About Mortar CMS</h2><p>An open-source CMS combining traditional CMS ideas with modern TypeScript.</p><h3>Tech Stack</h3><ul><li><strong>Backend:</strong> Node.js, Express, SQLite</li><li><strong>Frontend:</strong> React, TypeScript, Tailwind CSS</li></ul>',
    '', 'published', 'page', adminId.id, new Date().toISOString(), 1);

  const count = db.prepare('SELECT COUNT(*) as cnt FROM Post').get() as any;
  console.log('Seed complete! Posts/pages:', count.cnt);
  console.log('  Admin: admin@mortar.dev / admin123');
}

main().catch(e => { console.error(e); process.exit(1); });
