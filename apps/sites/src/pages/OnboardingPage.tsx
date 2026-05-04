import { useQuery, useMutation } from "convex/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@orthfx/backend/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Id } from "@orthfx/backend/dataModel";

type Step = "search" | "create";

export function OnboardingPage() {
  const navigate = useNavigate();
  const profile = useQuery(api.userProfiles.getMyProfile);
  const [step, setStep] = useState<Step>("search");
  const [search, setSearch] = useState("");
  const searchResults = useQuery(
    api.communities.searchUnclaimed,
    search.length >= 2 ? { search } : "skip",
  );
  const claim = useMutation(api.communities.claim);
  const create = useMutation(api.communities.create);

  const [createName, setCreateName] = useState("");
  const [createSlug, setCreateSlug] = useState("");
  const [createType, setCreateType] = useState<
    "parish" | "mission" | "monastery" | "chapel" | "cathedral"
  >("parish");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleClaim(id: Id<"communities">) {
    setError("");
    setLoading(true);
    try {
      await claim({ id });
      void navigate("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await create({ name: createName, slug: createSlug.toLowerCase(), type: createType });
      void navigate("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  if (profile === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold">Set up your community</h1>
          <p className="text-muted-foreground mt-1">
            Search for your community in our directory, or create a new listing.
          </p>
        </div>

        <div className="flex gap-2 border-b">
          <button
            onClick={() => setStep("search")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              step === "search"
                ? "border-b-2 border-foreground text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Find existing
          </button>
          <button
            onClick={() => setStep("create")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              step === "create"
                ? "border-b-2 border-foreground text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Create new
          </button>
        </div>

        {step === "search" && (
          <div className="flex flex-col gap-4">
            <Input
              placeholder="Search by name, city, or state..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
            {search.length >= 2 && searchResults === undefined && (
              <p className="text-sm text-muted-foreground">Searching...</p>
            )}
            {search.length >= 2 && searchResults?.length === 0 && (
              <div className="rounded-lg border p-4 text-center text-sm text-muted-foreground">
                <p>No unclaimed communities found.</p>
                <button
                  onClick={() => setStep("create")}
                  className="mt-2 underline hover:text-foreground"
                >
                  Create a new listing instead
                </button>
              </div>
            )}
            {searchResults && searchResults.length > 0 && (
              <div className="flex flex-col gap-2">
                {searchResults.map((c) => (
                  <div
                    key={c._id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {[c.city, c.state].filter(Boolean).join(", ")}
                        {c.jurisdiction && <span className="ml-2">{c.jurisdiction}</span>}
                      </div>
                    </div>
                    <Button size="sm" disabled={loading} onClick={() => handleClaim(c._id)}>
                      This is mine
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
            <p className="text-xs text-muted-foreground">
              Don't see your community?{" "}
              <button onClick={() => setStep("create")} className="underline hover:text-foreground">
                Create a new listing
              </button>
            </p>
          </div>
        )}

        {step === "create" && (
          <Card>
            <CardHeader>
              <CardTitle>Create a new listing</CardTitle>
              <CardDescription>
                Your community isn't in our directory yet. Add it now.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">Community name</Label>
                  <Input
                    id="name"
                    placeholder="St. Michael Orthodox Church"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="type">Type</Label>
                  <select
                    id="type"
                    value={createType}
                    onChange={(e) => setCreateType(e.target.value as typeof createType)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="parish">Parish</option>
                    <option value="mission">Mission</option>
                    <option value="monastery">Monastery</option>
                    <option value="chapel">Chapel</option>
                    <option value="cathedral">Cathedral</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="slug">Subdomain</Label>
                  <div className="flex items-center gap-1">
                    <Input
                      id="slug"
                      placeholder="stmichael"
                      value={createSlug}
                      onChange={(e) =>
                        setCreateSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                      }
                      required
                    />
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      .orthdx.site
                    </span>
                  </div>
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create listing"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <button
          onClick={() => void navigate("/admin")}
          className="text-sm text-muted-foreground hover:underline text-center"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
