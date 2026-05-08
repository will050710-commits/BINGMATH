import { NextResponse } from "next/server";
import { computeScoreAndMastery } from "../../../utils/scoring";

// POST /api/score
// Body shape: { answersBySection: { section1: {...}, section2: {...}, section3: {...} } }
export async function POST(request) {
  try {
    const body = await request.json();
    const answersBySection = body?.answersBySection || {};

    const result = computeScoreAndMastery(answersBySection);

    return NextResponse.json({ result });
  } catch (err) {
    console.error("Error in /api/score:", err);
    return NextResponse.json(
      { error: "Failed to compute score" },
      { status: 500 }
    );
  }
}
