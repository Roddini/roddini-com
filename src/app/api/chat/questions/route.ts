import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

function parseQuestions(md: string): string[] {
  const sampleSection = md.match(/## Sample Q&A[\s\S]*?(?=\n## |$)/)?.[0] ?? ''
  const questions: string[] = []
  const qMatches = sampleSection.matchAll(/^Q: (.+)$/gm)
  for (const match of qMatches) {
    questions.push(match[1].trim())
  }
  return questions
}

function parseDisclosure(md: string): string {
  const section = md.match(/## AI Disclosure\s*([\s\S]*?)(?=\n## |$)/)?.[1] ?? ''
  return section.trim()
}

export async function GET() {
  const mdPath = path.join(process.cwd(), 'content', 'chatbot-context.md')
  const md = fs.readFileSync(mdPath, 'utf-8')
  const questions = parseQuestions(md)
  const disclosure = parseDisclosure(md)
  return NextResponse.json({ questions, disclosure })
}
