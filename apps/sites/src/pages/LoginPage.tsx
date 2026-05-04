import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useMutation } from "convex/react";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { api } from "@orthfx/backend/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LoginPage() {
  const { signIn } = useAuthActions();
  const { isAuthenticated } = useConvexAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const redeem = useMutation(api.invites.redeem);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [awaitingAuth, setAwaitingAuth] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !awaitingAuth) return;
    setAwaitingAuth(false);
    if (pendingToken) {
      const tok = pendingToken;
      setPendingToken(null);
      redeem({ token: tok })
        .then((result) => void navigate(result.needsOnboarding ? "/onboarding" : "/admin"))
        .catch(() => void navigate("/admin"));
    } else {
      void navigate("/admin");
    }
  }, [isAuthenticated, awaitingAuth]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn("password", { email, password, flow: "signIn" });
      if (token) setPendingToken(token);
      setAwaitingAuth(true);
    } catch {
      setError("Invalid email or password");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <Link to="/" className="text-sm text-muted-foreground hover:underline">
            &larr; Back
          </Link>
          <CardTitle>Log in</CardTitle>
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
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Log in"}
            </Button>
            <div className="flex flex-col items-center gap-1 text-sm text-muted-foreground">
              <Link to="/forgot-password" className="underline">
                Forgot password?
              </Link>
              <p>
                No account?{" "}
                <Link to="/signup" className="underline">
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
