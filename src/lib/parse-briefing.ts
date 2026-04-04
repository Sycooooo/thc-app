import * as cheerio from 'cheerio'

export type BriefingArticle = {
  title: string
  prose: string
  histBox?: string
  winners?: string
  losers?: string
  impact: string
}

export type BriefingSection = {
  type: 'fr' | 'world' | 'hist' | 'radar'
  title: string
  icon: string
  articles: BriefingArticle[]
}

export type BriefingSource = {
  title: string
  url: string
}

export type ParsedBriefing = {
  date: Date
  score: number
  sections: BriefingSection[]
  sources: BriefingSource[]
  evalText: string | null
}

const SECTION_MAP: Record<string, { type: BriefingSection['type']; icon: string }> = {
  'section-fr': { type: 'fr', icon: '🇫🇷' },
  'section-world': { type: 'world', icon: '🌍' },
  'section-hist': { type: 'hist', icon: '📜' },
  'section-radar': { type: 'radar', icon: '📡' },
}

const MONTHS_FR: Record<string, number> = {
  'janvier': 0, 'février': 1, 'mars': 2, 'avril': 3, 'mai': 4, 'juin': 5,
  'juillet': 6, 'août': 7, 'septembre': 8, 'octobre': 9, 'novembre': 10, 'décembre': 11,
}

function parseDate(html: string): Date {
  // Handle "1er avril", "4 avril", etc.
  const match = html.match(/(\d{1,2})(?:er)?\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+(\d{4})/i)
  if (match) {
    const day = parseInt(match[1])
    const month = MONTHS_FR[match[2].toLowerCase()]
    const year = parseInt(match[3])
    return new Date(Date.UTC(year, month, day))
  }
  // Handle "29 Mars 2026" (capitalized)
  const matchCap = html.match(/(\d{1,2})(?:er)?\s+(Janvier|Février|Mars|Avril|Mai|Juin|Juillet|Août|Septembre|Octobre|Novembre|Décembre)\s+(\d{4})/)
  if (matchCap) {
    const day = parseInt(matchCap[1])
    const month = MONTHS_FR[matchCap[2].toLowerCase()]
    const year = parseInt(matchCap[3])
    return new Date(Date.UTC(year, month, day))
  }
  // Fallback: try filename pattern from content
  const isoMatch = html.match(/(\d{4})-(\d{2})-(\d{2})/)
  if (isoMatch) {
    return new Date(Date.UTC(parseInt(isoMatch[1]), parseInt(isoMatch[2]) - 1, parseInt(isoMatch[3])))
  }
  return new Date()
}

function parseScore(html: string): number {
  // "SCORE SIA : 7.5/10" or "SIA 7.8/10" or "SIA : 8.2/10"
  const match = html.match(/(?:SCORE\s+)?SIA\s*:?\s*([\d.]+)\s*\/\s*10/i)
  return match ? parseFloat(match[1]) : 0
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function cleanText(el: cheerio.Cheerio<any>, $: cheerio.CheerioAPI): string {
  // Get inner HTML and convert <b> to keep bold markers, strip other tags
  let html = $.html(el)
  // Remove the outer tag itself
  html = el.html() || ''
  // Convert <b> tags to **bold** for rendering
  html = html.replace(/<b>/gi, '**').replace(/<\/b>/gi, '**')
  html = html.replace(/<i>/gi, '*').replace(/<\/i>/gi, '*')
  // Strip all remaining HTML tags
  html = html.replace(/<[^>]+>/g, '')
  // Normalize whitespace
  html = html.replace(/\s+/g, ' ').trim()
  return html
}

export function parseBriefingHtml(html: string): ParsedBriefing {
  const $ = cheerio.load(html)

  const date = parseDate(html)
  const score = parseScore(html)

  // Parse sections
  const sections: BriefingSection[] = []

  for (const [className, meta] of Object.entries(SECTION_MAP)) {
    const sectionEl = $(`.${className}`)
    if (!sectionEl.length) continue

    const title = sectionEl.find('.section-title').first().text().trim()
    const articles: BriefingArticle[] = []

    sectionEl.find('details').each((_, detailEl) => {
      const detail = $(detailEl)
      const articleTitle = detail.find('summary').first().text().trim()

      const proseEls = detail.find('.prose')
      const prose = proseEls.map((_, el) => cleanText($(el), $)).get().join('\n\n')

      const histBoxEl = detail.find('.hist-box')
      const histBox = histBoxEl.length ? cleanText(histBoxEl, $) : undefined

      const winnersEl = detail.find('.wl-winner')
      const winners = winnersEl.length ? cleanText(winnersEl, $) : undefined

      const losersEl = detail.find('.wl-loser')
      const losers = losersEl.length ? cleanText(losersEl, $) : undefined

      const impactEl = detail.find('.impact-box')
      const impact = impactEl.length ? cleanText(impactEl, $) : ''

      articles.push({ title: articleTitle, prose, histBox, winners, losers, impact })
    })

    sections.push({ type: meta.type, title, icon: meta.icon, articles })
  }

  // Parse sources
  const sources: BriefingSource[] = []
  $('.sources-section a').each((_, el) => {
    const a = $(el)
    sources.push({
      title: a.text().trim(),
      url: a.attr('href') || '',
    })
  })

  // Parse eval
  const evalEl = $('.section-eval')
  const evalText = evalEl.length ? cleanText(evalEl, $) : null

  return { date, score, sections, sources, evalText }
}
