import 'dotenv/config'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { parseBriefingHtml } from '../src/lib/parse-briefing'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const BRIEFINGS_DIR = join(process.env.HOME || '/Users/solal', 'Desktop/Fah/Daily')

async function main() {
  const files = readdirSync(BRIEFINGS_DIR).filter((f) => f.startsWith('briefing-') && f.endsWith('.html'))

  console.log(`Found ${files.length} briefing files in ${BRIEFINGS_DIR}`)

  for (const file of files) {
    const filePath = join(BRIEFINGS_DIR, file)
    const html = readFileSync(filePath, 'utf-8')
    const parsed = parseBriefingHtml(html)

    const dateOnly = new Date(parsed.date)
    dateOnly.setUTCHours(0, 0, 0, 0)

    await prisma.briefing.upsert({
      where: { date: dateOnly },
      update: {
        score: parsed.score,
        rawHtml: html,
        sections: JSON.parse(JSON.stringify(parsed.sections)),
        sources: JSON.parse(JSON.stringify(parsed.sources)),
        evalText: parsed.evalText,
      },
      create: {
        date: dateOnly,
        score: parsed.score,
        rawHtml: html,
        sections: JSON.parse(JSON.stringify(parsed.sections)),
        sources: JSON.parse(JSON.stringify(parsed.sources)),
        evalText: parsed.evalText,
      },
    })

    console.log(`✓ Imported: ${file} (${dateOnly.toISOString().split('T')[0]}, score: ${parsed.score})`)
  }

  console.log(`\nDone! ${files.length} briefings imported.`)
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
