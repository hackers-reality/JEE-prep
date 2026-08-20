import { NextResponse } from "next/server";

// Placeholder API for a future persistent datastore. The timetable page currently
// keeps edits client-side so this branch does not require new database migrations.
export async function GET() {
  return NextResponse.json({ ok: true, message: "Personal timetable API ready for persistence." });
}
