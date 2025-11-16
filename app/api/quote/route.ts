import { NextResponse } from 'next/server'
import { computeQuote } from '@/server/quote-engine'

export async function POST(req: Request) {
  const body = await req.json()
  const quote = computeQuote(body)
  return NextResponse.json({ quote })
}