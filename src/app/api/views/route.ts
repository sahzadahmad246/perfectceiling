import { userAgent } from "next/server";
import { z } from "zod";

import { createPublicClient } from "@/lib/supabase/public";
import { isContentViewKind } from "@/lib/views";

const bodySchema = z.object({
  kind: z.string(),
  id: z.string().uuid(),
});

export async function POST(request: Request) {
  const { isBot } = userAgent(request);

  if (isBot) {
    return Response.json({ ok: true, ignored: true });
  }

  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);

  if (!parsed.success || !isContentViewKind(parsed.data.kind)) {
    return Response.json({ error: "Invalid view payload." }, { status: 400 });
  }

  const supabase = createPublicClient();

  if (!supabase) {
    return Response.json({ error: "Views are unavailable." }, { status: 503 });
  }

  const { data, error } = await supabase.rpc("increment_content_view", {
    p_kind: parsed.data.kind,
    p_id: parsed.data.id,
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({
    ok: true,
    viewCount: typeof data === "number" ? data : 0,
  });
}
