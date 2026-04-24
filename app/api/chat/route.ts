import { runAgent } from "@/lib/agent";

export async function POST(req: Request) {
  const body = await req.json();

  const reply = await runAgent(body.message);

  return Response.json({ reply });
}