import type { APIRoute } from "astro";
import snapshot from "../data/github.json";
export const GET: APIRoute = () =>
  new Response(
    "date,contributions\n" +
      snapshot.days.map((day) => `${day.date},${day.count}`).join("\n") +
      "\n",
    { headers: { "Content-Type": "text/csv; charset=utf-8" } },
  );
