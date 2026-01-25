import { MainNav } from "@/components/nav/main-nav";
import { CheckCircle } from "lucide-react";

export default function VerifyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6 text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-semantic-success" />
          <h1 className="text-fluid-3xl font-bold text-text-primary">
            Check your email
          </h1>
          <p className="text-text-secondary">
            A sign-in link has been sent to your email address. Click the link
            in the email to sign in.
          </p>
        </div>
      </main>
    </div>
  );
}
