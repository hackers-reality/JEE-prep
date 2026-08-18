import { NextResponse } from "next/server";
import { createTask, listTasks, updateTask } from "@/lib/tasks";

export async function GET() {
  const tasks = await listTasks();
  if (!tasks) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!String(body.title ?? "").trim()) return NextResponse.json({ error: "Task title is required" }, { status: 400 });
    const id = await createTask({ title: String(body.title), description: body.description ? String(body.description) : undefined, dueDate: body.dueDate ? String(body.dueDate) : null, priority: body.priority ? String(body.priority) : undefined, category: body.category ? String(body.category) : undefined });
    if (!id) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create task" }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: "Task id is required" }, { status: 400 });
  const ok = await updateTask(String(body.id), Boolean(body.completed));
  if (!ok) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  return NextResponse.json({ ok: true });
}
