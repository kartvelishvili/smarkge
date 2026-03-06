-- SEO Audit Proposals — Initial Population
-- Generated from comprehensive audit of smarketer.ge

-- ═══════════════════════════════════════════════════════════
-- PHASE 30 — URGENT (Critical infrastructure fixes)
-- ═══════════════════════════════════════════════════════════

INSERT INTO seo_proposals (proposal_id, category, page, issue, severity, impact, technical_change, visual_change_required, visual_options, expected_seo_impact, eta_days, risk, rollback_plan, status, phase) VALUES

-- SEO-001: robots.txt
('SEO-001', 'technical', 'Global (all pages)', 
'robots.txt ფაილი არ არსებობს. საძიებო სისტემებს არ აქვთ crawl-ის დირექტივები.',
'critical', 'high',
'public/robots.txt ფაილის შექმნა:
User-agent: *
Allow: /
Disallow: /paneli
Disallow: /paneli/dashboard
Sitemap: https://smarketer.ge/sitemap.xml',
false, '[]'::jsonb,
'საძიებო სისტემები ნახავენ sitemap-ის მისამართს, /paneli არ დაინდექსდება, crawl ეფექტურობა გაიზრდება.',
1, 'low', 'robots.txt ფაილის წაშლა public/ დირექტორიიდან.', 'draft', '30'),

-- SEO-002: XML Sitemap
('SEO-002', 'technical', 'Global (all pages)',
'XML sitemap არ არსებობს. SiteMapPage.jsx მხოლოდ ვიზუალური HTML sitemap-ია.',
'critical', 'high',
'public/sitemap.xml სტატიკური ფაილის შექმნა ყველა 22+ გვერდის URL-ით. ფორმატი:
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://smarketer.ge/</loc><priority>1.0</priority></url>
  <url><loc>https://smarketer.ge/web-design</loc><priority>0.9</priority></url>
  ...ყველა გვერდი
</urlset>',
false, '[]'::jsonb,
'Google-ის ინდექსაცია 2-3x უფრო სწრაფი იქნება. ყველა გვერდი სწრაფად აღმოჩენილი იქნება.',
1, 'low', 'sitemap.xml ფაილის წაშლა.', 'draft', '30'),

-- SEO-003: JSON-LD Organization
('SEO-003', 'structured-data', 'Global (all pages)',
'სტრუქტურირებული მონაცემები (JSON-LD) სრულიად არ არსებობს. Google Knowledge Panel და Rich Results შეუძლებელია.',
'critical', 'high',
'index.html-ში Organization schema-ს დამატება:
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Smarketer",
  "url": "https://smarketer.ge",
  "logo": "https://smarketer.ge/logo.png",
  "sameAs": ["https://facebook.com/smarketeri", "https://instagram.com/smarketer.georgia"],
  "address": {"@type": "PostalAddress", "streetAddress": "ილია ჭავჭავაძის 33ე", "addressLocality": "თბილისი"}
}
</script>',
false, '[]'::jsonb,
'Google Knowledge Panel-ის გენერაცია შესაძლებელი გახდება. Brand credibility-ის ზრდა SERP-ში.',
2, 'low', 'JSON-LD script tag-ის წაშლა index.html-დან.', 'draft', '30'),

-- SEO-004: WebSite Schema
('SEO-004', 'structured-data', 'მთავარი /',
'WebSite schema არ არსებობს. Sitelinks Searchbox Google-ში შეუძლებელია.',
'critical', 'high',
'HomePage.jsx-ში Helmet-ით WebSite schema-ს დამატება:
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Smarketer",
  "url": "https://smarketer.ge",
  "potentialAction": {"@type": "SearchAction", "target": "https://smarketer.ge/search?q={search_term_string}"}
}
</script>',
false, '[]'::jsonb,
'Google SERP-ში "Sitelinks Searchbox" გამოჩენა. ბრენდის საძიებო visibility-ის ზრდა.',
1, 'low', 'schema script-ის წაშლა.', 'draft', '30'),

-- SEO-005: HTML lang attribute
('SEO-005', 'technical', 'Global (all pages)',
'<html lang="en"> მყარად არის index.html-ში, SEO.jsx ცვლის "ka"-ზე, მაგრამ Helmet-ის შეცვლა SSR-ის გარეშე unreliable-ია.',
'critical', 'high',
'index.html-ში lang="en" → lang="ka" შეცვლა. ეს ქართულენოვანი საიტია, Google-ს სწორი სიგნალი სჭირდება.
<html lang="ka">',
false, '[]'::jsonb,
'Google სწორად გაიგებს საიტის პირველად ენას. ქართულენოვან ძიებებში რანჟირება გაუმჯობესდება.',
1, 'low', 'lang="ka" → lang="en" დაბრუნება.', 'draft', '30'),

-- SEO-006: H1 missing on ServicesPage
('SEO-006', 'content', '/services - ServicesPage',
'ServicesPage-ს H1 tag არ აქვს. Heading hierarchy დარღვეულია.',
'critical', 'high',
'ServicesPage.jsx-ში Hero სექციის სათაურს <h1> tag-ის დამატება. ამჟამად h2 ან h3 გამოიყენება.',
true, '[{"description": "Option A: ამჟამინდელი სათაური <h2>-დან <h1>-ზე გადატანა"}, {"description": "Option B: ახალი H1 ტექსტი: ჩვენი სერვისები — ვებ, მარკეტინგი, ბრენდინგი"}, {"description": "Option C: SEO-ოპტიმიზებული H1: პროფესიონალური ციფრული სერვისები საქართველოში"}]'::jsonb,
'Google-ის heading hierarchy სწორად წაკითხვა. შესაძლო Featured Snippet-ები.',
1, 'low', 'H1 → H2 უკან დაბრუნება.', 'draft', '30'),

-- SEO-007: H1 missing on SocialMediaPage
('SEO-007', 'content', '/social-media - SocialMediaPage',
'SocialMediaPage-ს H1 tag არ აქვს. Heading hierarchy დარღვეულია.',
'critical', 'high',
'SocialMediaPage.jsx-ში Hero სექციის სათაურს <h1> tag-ის დამატება.',
true, '[{"description": "Option A: ამჟამინდელი სათაური <h2>-დან <h1>-ზე გადატანა"}, {"description": "Option B: ახალი H1: სოციალური მედია კამპანიები და მართვა"}, {"description": "Option C: SEO-ოპტიმიზებული H1: სოციალური მედია მარკეტინგი საქართველოში — Facebook, Instagram, TikTok"}]'::jsonb,
'Heading hierarchy-ის სწორი წაკითხვა. კონკრეტულ keyword-ებზე რანჟირების ზრდა.',
1, 'low', 'H1 → H2 უკან დაბრუნება.', 'draft', '30');

-- ═══════════════════════════════════════════════════════════
-- PHASE 30 — Performance (Image optimization)
-- ═══════════════════════════════════════════════════════════

INSERT INTO seo_proposals (proposal_id, category, page, issue, severity, impact, technical_change, visual_change_required, visual_options, expected_seo_impact, eta_days, risk, rollback_plan, status, phase) VALUES

-- SEO-008: lazy loading
('SEO-008', 'performance', 'Global (all pages)',
'62+ სურათიდან მხოლოდ 1-ზეა loading="lazy". LCP/FCP Core Web Vitals-ის პრობლემა.',
'critical', 'high',
'ყველა <img> tag-ს (გარდა above-the-fold Hero სურათებისა) loading="lazy" ატრიბუტის დამატება.
ფაილები: Hero.jsx (secondary only), Brands.jsx, Industries.jsx, Portfolio.jsx, Blog.jsx, Testimonials.jsx, PortfolioDetailPage.jsx, SeoContent.jsx, და სხვა.',
false, '[]'::jsonb,
'LCP (Largest Contentful Paint) 30-50% გაუმჯობესება. Google PageSpeed score-ის ზრდა 15-25 ქულით.',
2, 'low', 'loading="lazy" ატრიბუტების წაშლა.', 'draft', '30'),

-- SEO-009: width/height on images
('SEO-009', 'performance', 'Global (all pages)',
'არცერთ <img>-ს არ აქვს width და height ატრიბუტები. CLS (Cumulative Layout Shift) პრობლემა.',
'warning', 'high',
'ძირითად სურათებს width და height ატრიბუტების დამატება. განსაკუთრებით: Hero სურათები, Industry thumbnails, Portfolio cards, Testimonial avatars.
მაგალითი: <img src="..." width="600" height="400" className="w-full h-auto" />',
false, '[]'::jsonb,
'CLS score-ის მნიშვნელოვანი გაუმჯობესება. Google "Good" CLS threshold-ის მიღწევა (<0.1).',
3, 'low', 'width/height ატრიბუტების წაშლა.', 'draft', '30');

-- ═══════════════════════════════════════════════════════════
-- PHASE 60 — Important Improvements
-- ═══════════════════════════════════════════════════════════

INSERT INTO seo_proposals (proposal_id, category, page, issue, severity, impact, technical_change, visual_change_required, visual_options, expected_seo_impact, eta_days, risk, rollback_plan, status, phase) VALUES

-- SEO-010: BreadcrumbList schema
('SEO-010', 'structured-data', 'Industry Pages, Services, Portfolio',
'BreadcrumbList schema არ არსებობს. Google-ში breadcrumb-ები SERP-ში არ ჩანს.',
'warning', 'medium',
'SEO.jsx-ში ან ცალკე BreadcrumbSchema კომპონენტში BreadcrumbList JSON-LD-ის დამატება.
მაგალითი Industry page-ისთვის:
{"@type": "BreadcrumbList", "itemListElement": [
  {"@type": "ListItem", "position": 1, "name": "მთავარი", "item": "https://smarketer.ge/"},
  {"@type": "ListItem", "position": 2, "name": "ჯანდაცვა", "item": "https://smarketer.ge/industry/healthcare"}
]}',
false, '[]'::jsonb,
'SERP-ში breadcrumb navigation-ის გამოჩენა. CTR-ის 10-20% ზრდა.',
3, 'low', 'BreadcrumbList script-ების წაშლა.', 'draft', '60'),

-- SEO-011: Article schema for news
('SEO-011', 'structured-data', '/news/:slug - NewsDetailPage',
'ბლოგ/სიახლეების გვერდებს Article schema არ აქვთ.',
'warning', 'medium',
'NewsDetailPage.jsx-ში Article JSON-LD-ის დამატება:
{"@type": "Article", "headline": "...", "datePublished": "...", "author": {...}, "image": "...", "publisher": {...}}',
false, '[]'::jsonb,
'Google News და Discover-ში გამოჩენის შესაძლებლობა. Article rich results SERP-ში.',
2, 'low', 'Article schema script-ის წაშლა.', 'draft', '60'),

-- SEO-012: FAQ schema
('SEO-012', 'structured-data', '/ - მთავარი (FAQ section)',
'FAQ სექციას FAQPage schema არ აქვს.',
'warning', 'medium',
'FAQ.jsx კომპონენტში FAQPage JSON-LD-ის დინამიური გენერაცია:
{"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "...", "acceptedAnswer": {"@type": "Answer", "text": "..."}}]}',
false, '[]'::jsonb,
'SERP-ში FAQ rich results-ის გამოჩენა. ორგანული visibility-ის მნიშვნელოვანი ზრდა.',
2, 'low', 'FAQPage schema-ს წაშლა.', 'draft', '60'),

-- SEO-013: hreflang tags
('SEO-013', 'technical', 'Global (all pages)',
'hreflang tags არ არსებობს. საიტი ბილინგვალურია (KA/EN) მაგრამ ენის სიგნალი Google-ს არ ეგზავნება.',
'warning', 'medium',
'SEO.jsx-ში hreflang <link> tag-ების დამატება:
<link rel="alternate" hreflang="ka" href="https://smarketer.ge/..." />
<link rel="alternate" hreflang="en" href="https://smarketer.ge/..." />
<link rel="alternate" hreflang="x-default" href="https://smarketer.ge/..." />',
false, '[]'::jsonb,
'Google სწორად გაიგებს ბილინგვალურ კონტენტს. duplicate content-ის რისკის შემცირება.',
3, 'medium', 'hreflang link tag-ების წაშლა SEO.jsx-დან.', 'draft', '60'),

-- SEO-014: alt text improvements
('SEO-014', 'content', 'PortfolioDetailPage, Brands',
'ზოგიერთ სურათს აქვს ზოგადი alt ტექსტი ("Logo", "Cover", "Gallery 1") ან ცარიელი alt="".',
'warning', 'medium',
'გაუმჯობესებები:
1. PortfolioDetailPage.jsx - gallery images: alt="" → alt="{project_name} - Gallery Image {idx+1}"
2. Logo images: alt="Logo" → alt="{company_name} Logo"
3. Client images: alt="Client" → alt="{client_name} - {company}"',
false, '[]'::jsonb,
'Image search visibility-ის გაუმჯობესება. Google Images-ში რანჟირების ზრდა.',
2, 'low', 'ძველი alt ტექსტების დაბრუნება.', 'draft', '60'),

-- SEO-015: noindex toggle in admin
('SEO-015', 'technical', 'Admin Panel - SEO Tab',
'ადმინ პანელში noindex/nofollow toggle არ არსებობს. წვრილ ან დუბლირებულ გვერდებს ვერ მალავენ.',
'warning', 'medium',
'SeoTab.jsx-ში Per-Page SEO სექციაში noindex/nofollow checkbox-ების დამატება.
SEO.jsx-ში: {pageSeo?.noindex && <meta name="robots" content="noindex,nofollow" />}',
false, '[]'::jsonb,
'არასასურველი გვერდების deindexing-ის შესაძლებლობა. crawl budget-ის ოპტიმიზაცია.',
2, 'low', 'noindex meta tag-ის წაშლა SEO.jsx-დან.', 'draft', '60');

-- ═══════════════════════════════════════════════════════════
-- PHASE 60 — Accessibility
-- ═══════════════════════════════════════════════════════════

INSERT INTO seo_proposals (proposal_id, category, page, issue, severity, impact, technical_change, visual_change_required, visual_options, expected_seo_impact, eta_days, risk, rollback_plan, status, phase) VALUES

-- SEO-016: aria-labels
('SEO-016', 'accessibility', 'Global (all pages)',
'მხოლოდ 3 aria-label არსებობს მთელ აპლიკაციაში. Accessibility სრულიად არასაკმარისია.',
'warning', 'medium',
'aria-label-ების დამატება:
- Header.jsx: hamburger menu, nav links, language toggle, theme toggle
- Hero.jsx: carousel prev/next buttons  
- FooterTab: social links (უკვე აქვს), contact links
- FAQ.jsx: accordion triggers
- ContactForm.jsx: form inputs
- Portfolio cards: interactive elements',
false, '[]'::jsonb,
'Accessibility score-ის ზრდა (Lighthouse 90+). Google-ის რანჟირების ირიბი გაუმჯობესება.',
3, 'low', 'aria-label ატრიბუტების წაშლა.', 'draft', '60'),

-- SEO-017: semantic HTML
('SEO-017', 'accessibility', 'Global (all pages)',
'<nav>, <main>, <article>, <aside> semantic tags-ის შეზღუდული გამოყენება.',
'info', 'medium',
'Header.jsx-ში navigation-ის <nav> tag-ით გარშემოწვია.
HomePage.jsx-ში <main> tag უკვე არსებობს.
Blog/News გვერდებზე <article> tag-ის დამატება.
Sidebar-ებისთვის <aside> tag.',
false, '[]'::jsonb,
'Google-ის უკეთესი content understanding. Accessibility compliance improvement.',
2, 'low', 'semantic tag-ების div-ით ჩანაცვლება.', 'draft', '60');

-- ═══════════════════════════════════════════════════════════
-- PHASE 90 — Strategic Enhancements
-- ═══════════════════════════════════════════════════════════

INSERT INTO seo_proposals (proposal_id, category, page, issue, severity, impact, technical_change, visual_change_required, visual_options, expected_seo_impact, eta_days, risk, rollback_plan, status, phase) VALUES

-- SEO-018: responsive images
('SEO-018', 'performance', 'Global (all pages)',
'არცერთი <picture> ან srcset არ გამოიყენება. მობილურზე desktop-ის ზომის სურათები იტვირთება.',
'info', 'medium',
'ძირითადი სურათებისთვის srcset-ის დამატება:
<img src="image-600.webp" srcset="image-300.webp 300w, image-600.webp 600w, image-1200.webp 1200w" sizes="(max-width: 768px) 100vw, 50vw" />
ან Supabase Image Transform API-ის გამოყენება.',
false, '[]'::jsonb,
'Mobile PageSpeed score-ის 10-20 ქულით ზრდა. Data usage-ის 40-60% შემცირება მობილურზე.',
5, 'medium', 'srcset ატრიბუტების წაშლა, ძველი img src-ის დაბრუნება.', 'draft', '90'),

-- SEO-019: LocalBusiness schema
('SEO-019', 'structured-data', '/contact - ContactPage',
'LocalBusiness schema არ არსებობს. Google Maps-ის Knowledge Panel-ის გამოჩენა შეუძლებელია.',
'info', 'medium',
'ContactPage.jsx-ში LocalBusiness JSON-LD:
{"@type": "LocalBusiness", "name": "Smarketer", "address": {...}, "telephone": "+995500702080", "openingHours": "Mo-Fr 10:00-19:00", "geo": {"@type": "GeoCoordinates", "latitude": "41.7151", "longitude": "44.8271"}}',
false, '[]'::jsonb,
'Google Maps location panel-ის გამოჩენა. Local SEO visibility-ის ზრდა.',
2, 'low', 'LocalBusiness schema-ს წაშლა.', 'draft', '90'),

-- SEO-020: Service schema
('SEO-020', 'structured-data', '/web-design, /social-media, /services',
'Service schema არ არსებობს სერვისების გვერდებზე.',
'info', 'medium',
'სერვისების გვერდებზე Service JSON-LD:
{"@type": "Service", "serviceType": "Web Design", "provider": {"@type": "Organization", "name": "Smarketer"}, "areaServed": "Georgia", "description": "..."}',
false, '[]'::jsonb,
'სერვისების SERP-ში rich presentation. კონკრეტულ service keyword-ებზე visibility.',
3, 'low', 'Service schema-ს წაშლა.', 'draft', '90'),

-- SEO-021: Open Graph improvements
('SEO-021', 'content', 'Industry Pages, Portfolio Detail',
'Industry და Portfolio Detail გვერდებს ინდივიდუალური OG image-ები არ აქვთ ადმინ SEO settings-ში.',
'info', 'low',
'SeoTab.jsx-ში per-page SEO-ს ყველა industry და portfolio გვერდის წინასწარ შევსება. 
თითოეულ industry გვერდს უნიკალური og:image, og:title, og:description ესაჭიროება.',
true, '[{"description": "Option A: Supabase-დან ავტომატური OG image generation"}, {"description": "Option B: ხელით თითოეული გვერდისთვის OG image-ის ატვირთვა ადმინ პანელიდან"}, {"description": "Option C: Default industry-specific placeholder images"}]'::jsonb,
'სოციალურ ქსელებში share-ის დროს ლამაზი preview. Social traffic-ის 15-30% ზრდა.',
3, 'low', 'per-page SEO entries-ის წაშლა.', 'draft', '90'),

-- SEO-022: Canonical URL improvements
('SEO-022', 'technical', '/services, /services-en',
'/services და /services-en ერთი კომპონენტია. Canonical URL-ის სწორი მითითება საჭიროა.',
'info', 'medium',
'SEO.jsx-ში canonical URL logic-ის გაუმჯობესება:
/services-en გვერდზე canonical URL → /services
<link rel="canonical" href="https://smarketer.ge/services" />',
false, '[]'::jsonb,
'Duplicate content-ის თავიდან აცილება. PageRank-ის კონსოლიდაცია.',
1, 'low', 'canonical override-ის წაშლა.', 'draft', '90');

SELECT 'All 22 SEO proposals inserted successfully' AS result;
