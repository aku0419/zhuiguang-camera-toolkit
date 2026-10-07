import { searchItems } from "../lib/search-index.js";
export const GET = () => new Response(JSON.stringify(searchItems), { headers: { "Content-Type": "application/json" } });
