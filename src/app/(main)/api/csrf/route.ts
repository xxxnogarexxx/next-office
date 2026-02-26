import { handleCsrfToken } from "@/lib/leads/service";

export async function GET(request: Request) {
  return handleCsrfToken(request);
}
