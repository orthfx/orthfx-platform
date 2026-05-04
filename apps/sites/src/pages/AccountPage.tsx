import { useQuery, useMutation } from "convex/react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@orthfx/backend/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AccountPage() {
  const me = useQuery(api.account.getMe);
  const updateEmail = useMutation(api.account.updateEmail);

  const [newEmail, setNewEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEmailError("");
    setEmailSuccess(false);
    setSaving(true);
    try {
      await updateEmail({ newEmail });
      setEmailSuccess(true);
      setNewEmail("");
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  if (me === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link to="/admin" className="text-sm text-muted-foreground hover:underline">
            &larr; Dashboard
          </Link>
          <span className="text-sm text-muted-foreground">Account settings</span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8 flex flex-col gap-6">
        <h1 className="text-2xl font-semibold">Account settings</h1>

        <Card>
          <CardHeader>
            <CardTitle>Email address</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Current: <span className="font-mono text-foreground">{me?.email ?? "unknown"}</span>
            </p>
            <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="newEmail">New email address</Label>
                <Input
                  id="newEmail"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="new@example.com"
                  required
                />
              </div>
              {emailError && <p className="text-sm text-red-500">{emailError}</p>}
              {emailSuccess && (
                <p className="text-sm text-green-600">
                  Email updated. Use your new email to log in next time.
                </p>
              )}
              <Button type="submit" disabled={saving} className="self-start">
                {saving ? "Saving..." : "Update email"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              Use the password reset flow to change your password.
            </p>
            <Link to="/forgot-password">
              <Button variant="outline" size="sm">
                Reset password
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
