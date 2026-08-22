import type { RequestHandler } from './$types'
import { ORIGIN } from '$app/env/public'
import { ne } from 'drizzle-orm'

import { createDb } from '$lib/server/db'
import { story, category, fandom, tag } from '$lib/server/db/schema'
import { error } from '@sveltejs/kit'

const SITE_URL = ORIGIN

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function urlEntry(loc: string, lastmod?: Date, changefreq?: string, priority?: number): string {
  return `
	<url>
		<loc>${escapeXml(loc)}</loc>
		${lastmod ? `<lastmod>${lastmod.toISOString()}</lastmod>` : ''}
		${changefreq ? `<changefreq>${changefreq}</changefreq>` : ''}
		${priority !== undefined ? `<priority>${priority.toFixed(1)}</priority>` : ''}
	</url>`
}

export const GET: RequestHandler = async ({ platform }) => {
  if (!platform?.env) {
    error(500, 'Platform Not Found!')
  }

  const db = createDb(platform.env)

  const [stories, categories, fandoms, tags] = await Promise.all([
    db
      .select({ id: story.id, updatedAt: story.updatedAt })
      .from(story)
      .where(ne(story.contentRating, 'EXPLICIT')), // don't index explicit content
    db.select({ slug: category.slug, updatedAt: category.updatedAt }).from(category),
    db.select({ slug: fandom.slug, updatedAt: fandom.updatedAt }).from(fandom),
    db
      .select({ slug: tag.slug, updatedAt: tag.updatedAt })
      .from(tag)
      .where(ne(tag.type, 'WARNING')),
    // db
    // 	.select({ username: user.username, updatedAt: user.updatedAt })
    // 	.from(user)
    // 	.where(isNotNull(user.username)),
  ])

  const staticUrls = [
    urlEntry(SITE_URL, undefined, 'daily', 1.0),
    urlEntry(`${SITE_URL}/faqs`, undefined, 'weekly', 0.8),
    urlEntry(`${SITE_URL}/roadmap`, undefined, 'weekly', 0.8),
    urlEntry(`${SITE_URL}/terms-and-conditions`, undefined, 'weekly', 0.8),
    urlEntry(`${SITE_URL}/privacy-policy`, undefined, 'weekly', 0.8),
    urlEntry(`${SITE_URL}/content-policy`, undefined, 'weekly', 0.8),
    urlEntry(`${SITE_URL}/licenses`, undefined, 'weekly', 0.8),
  ]

  const categoryUrls = categories.map((c) =>
    urlEntry(`${SITE_URL}/categories/${c.slug}`, c.updatedAt, 'daily', 0.7),
  )
  const fandomUrls = fandoms.map((f) =>
    urlEntry(`${SITE_URL}/fandoms/${f.slug}`, f.updatedAt, 'daily', 0.7),
  )
  const tagUrls = tags.map((t) =>
    urlEntry(`${SITE_URL}/tags/${t.slug}`, t.updatedAt, 'weekly', 0.5),
  )
  // const userUrls = users.map((u) =>
  // 	urlEntry(`${SITE_URL}/user/${u.username}`, u.updatedAt, 'weekly', 0.4),
  // )
  const storyUrls = stories.map((s) =>
    urlEntry(`${SITE_URL}/stories/${s.id}`, s.updatedAt, 'weekly', 0.6),
  )
  // const chapterUrls = stories.flatMap((s) =>
  // 	s.chapters
  // 		.filter((c) => c.chapterIndex !== null)
  // 		.map((c) =>
  // 			urlEntry(
  // 				`${SITE_URL}/stories/${s.id}/chapters/${c.chapterIndex}`,
  // 				c.updatedAt,
  // 				'monthly',
  // 				0.5,
  // 			),
  // 		),
  // )

  const allUrls = [
    ...staticUrls,
    ...categoryUrls,
    ...fandomUrls,
    ...tagUrls,
    // ...userUrls,
    ...storyUrls,
    // ...chapterUrls,
  ].join('')

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${allUrls}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'max-age=3600, s-maxage=3600', // avoid regenerating on every crawl hit
    },
  })
}
