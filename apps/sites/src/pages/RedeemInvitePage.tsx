import { useQuery, useMutation } from "convex/react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { api } from "@orthfx/backend/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RedeemInvitePage() {
  const { token } = useParams<{ token: string }>();
  const invite = useQuery(api.invites.getByToken, { token: token ?? "" });
  const redeem = useMutation(api.invites.redeem);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [redeeming, setRedeeming] = useState(false);

  if (invite === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (invite === null || invite.revoked) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="py-8 text-center flex flex-col gap-3">
            <p className="text-red-500">Invalid or expired invite link.</p>
            <Link to="/" className="text-sm text-muted-foreground underline">
              Go home
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (invite.used) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="py-8 text-center flex flex-col gap-3">
            <p className="text-muted-foreground">This invite has already been used.</p>
            <Link to="/admin" className="text-sm text-muted-foreground underline">
              Go to dashboard
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  async function handleRedeem() {
    setRedeeming(true);
    setError("");
    try {
      const result = await redeem({ token: token! });
      if (result.needsOnboarding) {
        void navigate("/onboarding");
      } else {
        void navigate("/admin");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setRedeeming(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>You've been invited</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {invite.communities && invite.communities.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Communities you'll manage:</p>
              <ul className="flex flex-col gap-1">
                {invite.communities.map((c, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between rounded border px-3 py-2 text-sm"
                  >
                    <span>{c?.name}</span>
                    <span className="text-xs text-muted-foreground capitalize">{c?.role}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {invite.maxNewCommunities > 0 && (
            <p className="text-sm text-muted-foreground">
              You can also add{" "}
              {invite.maxNewCommunities === 1
                ? "1 community"
                : `up to ${invite.maxNewCommunities} communities`}{" "}
              to the directory.
            </p>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button onClick={handleRedeem} disabled={redeeming}>
            {redeeming ? "Accepting..." : "Accept Invite"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
