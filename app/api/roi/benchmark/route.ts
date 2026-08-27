import { type NextRequest, NextResponse } from "next/server"
import { getIndustryBenchmark } from "@/lib/api/roi-api"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const industry = searchParams.get("industry")

    if (!industry) {
      return NextResponse.json({ error: "Industry parameter required" }, { status: 400 })
    }

    const result = await getIndustryBenchmark(industry)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      benchmark: result.data,
    })
  } catch (error) {
    console.error("Industry benchmark API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
