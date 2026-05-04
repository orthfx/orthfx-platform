import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { api } from "@orthfx/backend/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function SignupPage() {
  const { signIn } = useAuthActions();
  const { isAuthenticated } = useConvexAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const invite = useQuery(api.invites.getByToken, token ? { token } : "skip");
  const redeem = useMutation(api.invites.redeem);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const [awaitingAuth, setAwaitingAuth] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !awaitingAuth || !redirectTo) return;
    void navigate(redirectTo);
  }, [isAuthenticated, awaitingAuth, redirectTo]);

  // No token — blocked
  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-sm">
          <CardContent className="py-8 text-center flex flex-col gap-3">
            <p className="font-medium">Invite required</p>
            <p className="text-sm text-muted-foreground">
              Account creation is by invitation only. Contact an admin to get an invite link.
            </p>
            <Link to="/login" className="text-sm text-muted-foreground underline">
              Already have an account? Log in
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading invite
  if (invite === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Invalid or used invite
  if (invite === null || invite.revoked) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-sm">
          <CardContent className="py-8 text-center flex flex-col gap-3">
            <p className="text-red-500 font-medium">Invalid invite link</p>
            <p className="text-sm text-muted-foreground">
              This invite link is invalid or has been revoked.
            </p>
            <Link to="/login" className="text-sm text-muted-foreground underline">
              Already have an account? Log in
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (invite.used) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-sm">
          <CardContent className="py-8 text-center flex flex-col gap-3">
            <p className="text-muted-foreground">This invite has already been used.</p>
            <Link to="/login" className="text-sm text-muted-foreground underline">
              Log in instead
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn("password", { email, password, flow: "signUp" });
      const result = await redeem({ token });
      setRedirectTo(result.needsOnboarding ? "/onboarding" : "/admin");
      setAwaitingAuth(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          {invite.label && <CardDescription>{invite.label}</CardDescription>}
          {invite.communities && invite.communities.length > 0 && (
            <div className="mt-2 rounded-md bg-muted px-3 py-2 text-sm">
              <p className="font-medium mb-1">You'll be set up to manage:</p>
              <ul className="flex flex-col gap-0.5 text-muted-foreground">
                {invite.communities.map((c, i) => (
                  <li key={i}>
                    {c?.name} <span className="text-xs">({c?.role})</span>
                  </li>
                ))}
              </ul>
              {invite.maxNewCommunities > 0 && (
                <p className="mt-1 text-muted-foreground">
                  + ability to add {invite.maxNewCommunities} more{" "}
                  {invite.maxNewCommunities === 1 ? "community" : "communities"}
                </p>
              )}
            </div>
          )}
          {invite.communities?.length === 0 && invite.maxNewCommunities > 0 && (
            <div className="mt-2 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
              You'll be able to add{" "}
              {invite.maxNewCommunities === 1
                ? "1 community"
                : `up to ${invite.maxNewCommunities} communities`}{" "}
              to the directory.
            </div>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {invite.emailLocked && (
                <p className="text-xs text-muted-foreground">
                  This invite is locked to a specific email address.
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to={`/login?token=${token}`} className="underline">
                Log in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
