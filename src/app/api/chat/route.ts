// TODO: Chat API endpoint — handles incoming chat messages from the widget
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  return NextResponse.json({ message: "Chat endpoint" });
}
