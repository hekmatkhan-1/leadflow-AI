// TODO: Embed script route — serves the chatbot widget JS snippet
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Return the embeddable JavaScript widget
  return new NextResponse("// LeadFlow AI Widget", {
    headers: { "Content-Type": "application/javascript" },
  });
}
