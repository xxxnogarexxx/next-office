import { handleLeadSubmission } from "@/lib/leads/service";

export async function POST(request: Request) {
  return handleLeadSubmission(request, "main");
}
