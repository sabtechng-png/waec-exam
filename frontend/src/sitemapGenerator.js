export const blogArticles = [
  "how-to-pass-jamb",
  "waec-physics-tips",
  "study-techniques",
  "waec-english-guide",
  "waec-maths-guide",
  "study-motivation",
  "career-guide",
];

export const generateSitemapXML = () => {
  const baseUrl = "https://www.cbt-master.com.ng";

  const staticPages = [
    "",
    "about",
    "contact",
    "faq",
    "privacy-policy",
    "terms",
    "blog",
    "waec",
    "jamb",
    "neco",
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  staticPages.forEach((page) => {
    xml += `
  <url>
    <loc>${baseUrl}/${page}</loc>
  </url>`;
  });

  blogArticles.forEach((slug) => {
    xml += `
  <url>
    <loc>${baseUrl}/blog/${slug}</loc>
  </url>`;
  });

  xml += `\n</urlset>`;
  return xml;
};
