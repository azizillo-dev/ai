import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { queryOne } from "@/lib/db";
import AssessmentFlow from "./AssessmentFlow";

export const metadata: Metadata = { title: "AI diagnostika" };

export default async function TestPage() {
  const user = await requireUser("/test");
  const done = await queryOne("SELECT 1 FROM assessments WHERE user_id = $1 AND result IS NOT NULL LIMIT 1", [user.id]);
  return <AssessmentFlow name={user.name} retake={!!done} />;
}
