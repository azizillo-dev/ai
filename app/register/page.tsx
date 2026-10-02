import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import RegisterForm from "./RegisterForm";

export const metadata: Metadata = { title: "Ro‘yxatdan o‘tish" };

export default async function RegisterPage() {
  if (await getSession()) redirect("/dashboard");
  return (
    <div className="auth-wrap">
      <RegisterForm />
    </div>
  );
}
