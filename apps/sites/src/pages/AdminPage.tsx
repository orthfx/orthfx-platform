import { useQuery, useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "@orthfx/backend/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/ImageUpload";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import type { Id } from "@orthfx/backend/dataModel";

type InviteView = "list" | "create";

type Tab = "mine" | "all" | "invites" | "moderators" | "pending";

export function AdminPage() {
  const myCommunities = useQuery(api.communities.getMyDirect);
  const myRole = useQuery(api.communities.getMyRole);
  const myProfile = useQuery(api.userProfiles.getMyProfile);
  const { signOut } = useAuthActions();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<Id<"communities"> | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("mine");

  const isSysAdmin = myRole === "system_admin";
  const isModerator = myRole === "moderator" || isSysAdmin;
  const canCreate =
    isModerator ||
    isSysAdmin ||
    (myProfile !== undefined &&
      myProfile !== null &&
      myProfile.communitiesCreated < myProfile.maxNewCommunities);

  async function handleSignOut() {
    await signOut();
    void navigate("/");
  }

  if (myCommunities === undefined || myRole === undefined) {
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
          <Link to="/" className="text-lg font-semibold hover:underline">
            orthdx.site
          </Link>
          <div className="flex gap-2">
            <Link to="/account">
              <Button variant="ghost" size="sm">
                Account
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8">
        {selectedId && !showCreate ? (
          <>
            <button
              onClick={() => setSelectedId(null)}
              className="mb-4 text-sm text-muted-foreground hover:underline"
            >
              &larr; Back
            </button>
            <EditCommunityWrapper communityId={selectedId} />
          </>
        ) : showCreate ? (
          <>
            <button
              onClick={() => setShowCreate(false)}
              className="mb-4 text-sm text-muted-foreground hover:underline"
            >
              &larr; Back
            </button>
            <CreateCommunity
              onCreated={(id) => {
                setShowCreate(false);
                setSelectedId(id);
              }}
            />
          </>
        ) : (
          <>
            <div className="mb-6 flex items-center gap-1 border-b">
              <TabButton active={activeTab === "mine"} onClick={() => setActiveTab("mine")}>
                My Communities
              </TabButton>
              {isModerator && (
                <TabButton active={activeTab === "invites"} onClick={() => setActiveTab("invites")}>
                  Invites
                </TabButton>
              )}
              {isSysAdmin && (
                <>
                  <TabButton active={activeTab === "all"} onClick={() => setActiveTab("all")}>
                    All Communities
                  </TabButton>
                  <TabButton
                    active={activeTab === "pending"}
                    onClick={() => setActiveTab("pending")}
                  >
                    Pending Claims
                  </TabButton>
                  <TabButton
                    active={activeTab === "moderators"}
                    onClick={() => setActiveTab("moderators")}
                  >
                    Moderators
                  </TabButton>
                </>
              )}
            </div>

            {activeTab === "mine" && (
              <MyCommunities
                communities={myCommunities}
                onSelect={(id) => setSelectedId(id)}
                onCreate={() => setShowCreate(true)}
                canCreate={canCreate}
              />
            )}
            {activeTab === "invites" && isModerator && <InvitesTab />}
            {activeTab === "all" && isSysAdmin && (
              <AllCommunities onSelect={(id) => setSelectedId(id)} />
            )}
            {activeTab === "pending" && isSysAdmin && (
              <PendingClaims onSelect={(id) => setSelectedId(id)} />
            )}
            {activeTab === "moderators" && isSysAdmin && <ModeratorsTab />}
          </>
        )}
      </main>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "border-b-2 border-foreground text-foreground"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

// ── My Communities ──────────────────────────────────────────────

function MyCommunities({
  communities,
  onSelect,
  onCreate,
  canCreate,
}: {
  communities: Community[];
  onSelect: (id: Id<"communities">) => void;
  onCreate: () => void;
  canCreate: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">My Communities</h2>
        {canCreate && (
          <Button size="sm" onClick={onCreate}>
            New community
          </Button>
        )}
      </div>
      {communities.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <p>You haven't created or claimed any communities yet.</p>
            {canCreate && (
              <Button className="mt-4" onClick={onCreate}>
                Create your first community
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        communities.map((community) => (
          <CommunityRow key={community._id} community={community} onSelect={onSelect} />
        ))
      )}
    </div>
  );
}

// ── Invites Tab (moderator + system_admin) ─────────────────────

function InvitesTab() {
  const [view, setView] = useState<InviteView>("list");
  const [createdToken, setCreatedToken] = useState<string | null>(null);

  if (createdToken) {
    const url = `${window.location.origin}/signup?token=${createdToken}`;
    return (
      <div className="flex flex-col gap-6">
        <button
          onClick={() => {
            setCreatedToken(null);
            setView("list");
          }}
          className="self-start text-sm text-muted-foreground hover:underline"
        >
          &larr; Back to invites
        </button>
        <Card>
          <CardHeader>
            <CardTitle>Invite created</CardTitle>
            <CardDescription>Share this link with the person you're inviting.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Input value={url} readOnly className="font-mono text-xs" />
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigator.clipboard.writeText(url)}
              >
                Copy
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">This link can only be used once.</p>
            <Button
              variant="outline"
              onClick={() => {
                setCreatedToken(null);
                setView("list");
              }}
            >
              Done
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (view === "create") {
    return (
      <CreateInviteForm
        onCreated={(token) => setCreatedToken(token)}
        onCancel={() => setView("list")}
      />
    );
  }

  return <InviteList onNew={() => setView("create")} />;
}

function InviteList({ onNew }: { onNew: () => void }) {
  const invites = useQuery(api.invites.list);
  const revoke = useMutation(api.invites.revoke);
  const [expandedUserId, setExpandedUserId] = useState<Id<"users"> | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Invites</h2>
        <Button size="sm" onClick={onNew}>
          Create invite
        </Button>
      </div>

      {invites === undefined && <p className="text-sm text-muted-foreground">Loading...</p>}
      {invites?.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground text-sm">
            No invites yet. Create one to get started.
          </CardContent>
        </Card>
      )}
      {invites?.map((inv) => {
        const url = `${window.location.origin}/signup?token=${inv.token}`;
        const status = inv.revoked ? "revoked" : inv.used ? "redeemed" : "pending";
        const isExpanded = inv.usedBy ? expandedUserId === inv.usedBy : false;

        return (
          <Card key={inv._id}>
            <CardContent className="py-4 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-0.5">
                  {inv.label && <div className="font-medium">{inv.label}</div>}
                  {inv.communities.length > 0 ? (
                    <div className="text-sm text-muted-foreground">
                      {inv.communities.map((c) => c?.name).join(", ")}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground italic">
                      No pre-assigned communities
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    Quota: {inv.maxNewCommunities === 0 ? "none" : `${inv.maxNewCommunities} new`}
                    {inv.emailLocked && <span className="ml-2">· locked to {inv.emailLocked}</span>}
                  </div>
                </div>
                <span
                  className={`shrink-0 text-xs font-medium ${
                    status === "redeemed"
                      ? "text-green-600"
                      : status === "revoked"
                        ? "text-muted-foreground line-through"
                        : "text-yellow-600"
                  }`}
                >
                  {status === "redeemed"
                    ? "Redeemed"
                    : status === "revoked"
                      ? "Revoked"
                      : "Pending"}
                </span>
              </div>

              {status === "redeemed" && inv.redeemedUser && inv.usedBy && (
                <>
                  <button
                    onClick={() => setExpandedUserId(isExpanded ? null : inv.usedBy!)}
                    className="flex items-center justify-between rounded border bg-muted/30 px-3 py-2 text-xs text-muted-foreground hover:bg-muted/50 transition-colors"
                  >
                    <span>
                      {inv.redeemedUser.email ?? inv.redeemedUser.name ?? "Unknown user"}
                      {inv.usedAt && (
                        <span className="ml-2 opacity-60">
                          · {new Date(inv.usedAt).toLocaleDateString()}
                        </span>
                      )}
                    </span>
                    <span>{isExpanded ? "▲" : "▼"} Manage</span>
                  </button>
                  {isExpanded && <UserManager userId={inv.usedBy} />}
                </>
              )}

              {status === "pending" && (
                <div className="flex items-center gap-2">
                  <Input value={url} readOnly className="font-mono text-xs h-8" />
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 shrink-0"
                    onClick={() => navigator.clipboard.writeText(url)}
                  >
                    Copy
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 shrink-0 text-muted-foreground"
                    onClick={async () => {
                      if (confirm("Revoke this invite?")) {
                        await revoke({ inviteId: inv._id });
                      }
                    }}
                  >
                    Revoke
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function UserManager({ userId }: { userId: Id<"users"> }) {
  const profile = useQuery(api.userProfiles.getUserProfile, { userId });
  const assignCommunity = useMutation(api.userProfiles.assignCommunity);
  const updateQuota = useMutation(api.userProfiles.updateQuota);

  const [search, setSearch] = useState("");
  const communities = useQuery(api.communities.listAll, {
    search: search || undefined,
  });
  const [newQuota, setNewQuota] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (profile === undefined) {
    return <p className="text-xs text-muted-foreground px-1">Loading...</p>;
  }
  if (profile === null) {
    return <p className="text-xs text-muted-foreground px-1">No profile found.</p>;
  }

  const quota = newQuota ?? profile.maxNewCommunities;

  async function handleAssign(communityId: Id<"communities">, role: "admin" | "editor") {
    setError("");
    setSaving(true);
    try {
      await assignCommunity({ userId, communityId, role });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveQuota() {
    if (newQuota === null) return;
    setError("");
    setSaving(true);
    try {
      await updateQuota({ userId, maxNewCommunities: newQuota });
      setNewQuota(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded border p-3">
      {/* Current communities */}
      <div>
        <p className="text-xs font-medium mb-2">Communities</p>
        {profile.communities.length === 0 ? (
          <p className="text-xs text-muted-foreground">No communities assigned.</p>
        ) : (
          <div className="flex flex-col gap-1">
            {profile.communities.map(
              (c) =>
                c && (
                  <div
                    key={c.communityId}
                    className="flex items-center justify-between text-xs rounded border px-2 py-1.5"
                  >
                    <span>{c.name}</span>
                    <span className="text-muted-foreground capitalize">{c.role}</span>
                  </div>
                ),
            )}
          </div>
        )}
      </div>

      {/* Add community */}
      <div>
        <p className="text-xs font-medium mb-2">Add community</p>
        <Input
          placeholder="Search communities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 text-xs"
        />
        {search &&
          communities?.slice(0, 5).map((c) => {
            const alreadyAssigned = profile.communities.some((pc) => pc?.communityId === c._id);
            if (alreadyAssigned) return null;
            return (
              <div
                key={c._id}
                className="mt-1 flex items-center justify-between rounded border px-2 py-1.5 text-xs"
              >
                <span>{c.name}</span>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-xs"
                    disabled={saving}
                    onClick={() => handleAssign(c._id, "editor")}
                  >
                    Editor
                  </Button>
                  <Button
                    size="sm"
                    className="h-6 px-2 text-xs"
                    disabled={saving}
                    onClick={() => handleAssign(c._id, "admin")}
                  >
                    Admin
                  </Button>
                </div>
              </div>
            );
          })}
      </div>

      {/* Quota */}
      <div>
        <p className="text-xs font-medium mb-2">
          Creation quota
          <span className="ml-2 font-normal text-muted-foreground">
            ({profile.communitiesCreated} used of {profile.maxNewCommunities})
          </span>
        </p>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            value={quota}
            onChange={(e) => setNewQuota(parseInt(e.target.value) || 0)}
            className="h-8 w-20 text-xs"
          />
          {newQuota !== null && newQuota !== profile.maxNewCommunities && (
            <Button size="sm" className="h-8 text-xs" disabled={saving} onClick={handleSaveQuota}>
              Save
            </Button>
          )}
        </div>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function CreateInviteForm({
  onCreated,
  onCancel,
}: {
  onCreated: (token: string) => void;
  onCancel: () => void;
}) {
  const createInvite = useMutation(api.invites.create);
  const [search, setSearch] = useState("");
  const communities = useQuery(api.communities.listAll, {
    search: search || undefined,
  });

  const [label, setLabel] = useState("");
  const [email, setEmail] = useState("");
  const [maxNew, setMaxNew] = useState(0);
  const [selected, setSelected] = useState<
    { communityId: Id<"communities">; name: string; role: "admin" | "editor" }[]
  >([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function toggleCommunity(id: Id<"communities">, name: string) {
    setSelected((prev) => {
      const exists = prev.find((s) => s.communityId === id);
      if (exists) return prev.filter((s) => s.communityId !== id);
      return [...prev, { communityId: id, name, role: "admin" }];
    });
  }

  function setRole(id: Id<"communities">, role: "admin" | "editor") {
    setSelected((prev) => prev.map((s) => (s.communityId === id ? { ...s, role } : s)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token } = await createInvite({
        label: label || undefined,
        preAssignedCommunities: selected.map(({ communityId, role }) => ({
          communityId,
          role,
        })),
        maxNewCommunities: maxNew,
        email: email || undefined,
      });
      onCreated(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <button
        onClick={onCancel}
        className="self-start text-sm text-muted-foreground hover:underline"
      >
        &larr; Back
      </button>
      <div>
        <h2 className="text-xl font-semibold">Create invite</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure what the invited user will be able to manage.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="label">Label (optional)</Label>
          <Input
            id="label"
            placeholder='e.g. "Fr. John — St. Nicholas"'
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Pre-assigned communities</Label>
          <Input
            placeholder="Search communities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {selected.length > 0 && (
            <div className="flex flex-col gap-1">
              {selected.map((s) => (
                <div
                  key={s.communityId}
                  className="flex items-center gap-2 rounded border px-3 py-2 text-sm"
                >
                  <span className="flex-1 font-medium">{s.name}</span>
                  <select
                    value={s.role}
                    onChange={(e) => setRole(s.communityId, e.target.value as "admin" | "editor")}
                    className="h-7 rounded border bg-background px-2 text-xs"
                  >
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => toggleCommunity(s.communityId, s.name)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          {search && communities === undefined && (
            <p className="text-xs text-muted-foreground">Loading...</p>
          )}
          {search && communities && communities.length === 0 && (
            <p className="text-xs text-muted-foreground">No communities found.</p>
          )}
          {search &&
            communities &&
            communities.slice(0, 10).map((c) => {
              const isSelected = selected.some((s) => s.communityId === c._id);
              if (isSelected) return null;
              return (
                <button
                  key={c._id}
                  type="button"
                  onClick={() => toggleCommunity(c._id, c.name)}
                  className="flex items-center justify-between rounded border px-3 py-2 text-sm text-left hover:bg-muted/50"
                >
                  <span>{c.name}</span>
                  <span className="text-xs text-muted-foreground">+ add</span>
                </button>
              );
            })}
          <p className="text-xs text-muted-foreground">
            Leave empty to invite without pre-assigning.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="maxNew">New community quota</Label>
          <div className="flex items-center gap-2">
            <Input
              id="maxNew"
              type="number"
              min={0}
              value={maxNew}
              onChange={(e) => setMaxNew(parseInt(e.target.value) || 0)}
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">
              {maxNew === 0
                ? "Cannot create new communities"
                : maxNew === 1
                  ? "Can create 1 new community"
                  : `Can create up to ${maxNew} new communities`}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Lock to email (optional)</Label>
          <Input
            id="email"
            type="email"
            placeholder="person@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            If set, only this email address can use the invite.
          </p>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create invite link"}
        </Button>
      </form>
    </div>
  );
}

// ── All Communities (system_admin) ──────────────────────────────

function AllCommunities({ onSelect }: { onSelect: (id: Id<"communities">) => void }) {
  const [search, setSearch] = useState("");
  const communities = useQuery(api.communities.listAll, {
    search: search || undefined,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">All Communities</h2>
        <span className="text-sm text-muted-foreground">{communities?.length ?? "..."} total</span>
      </div>
      <Input
        placeholder="Search by name, slug, city, state, jurisdiction..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {communities === undefined ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : communities.length === 0 ? (
        <p className="text-muted-foreground text-sm">No communities found.</p>
      ) : (
        communities
          .slice(0, 50)
          .map((community) => (
            <CommunityRow key={community._id} community={community} onSelect={onSelect} />
          ))
      )}
      {communities && communities.length > 50 && (
        <p className="text-sm text-muted-foreground text-center">
          Showing 50 of {communities.length}. Use search to narrow results.
        </p>
      )}
    </div>
  );
}

// ── Pending Claims (system_admin) ──────────────────────────────

function PendingClaims({ onSelect }: { onSelect: (id: Id<"communities">) => void }) {
  const pending = useQuery(api.communities.listPendingClaims);
  const approveClaim = useMutation(api.communities.approveClaim);
  const rejectClaim = useMutation(api.communities.rejectClaim);

  if (pending === undefined) {
    return <p className="text-muted-foreground text-sm">Loading...</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Pending Claims</h2>
      {pending.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No pending claims.
          </CardContent>
        </Card>
      ) : (
        pending.map((community) => (
          <Card key={community._id}>
            <CardContent className="py-4 flex flex-col gap-3">
              {/* Community info */}
              <button
                onClick={() => onSelect(community._id)}
                className="flex items-center gap-4 text-left hover:opacity-80"
              >
                {community.avatarUrl ? (
                  <img
                    src={community.avatarUrl}
                    alt=""
                    className="h-12 w-12 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 shrink-0 rounded-full bg-muted" />
                )}
                <div>
                  <div className="font-medium">{community.name}</div>
                  <div className="text-sm text-muted-foreground">{community.slug}.orthdx.site</div>
                </div>
              </button>

              {/* Claimant details */}
              <div className="rounded border bg-muted/30 p-3 text-sm">
                <div className="font-medium mb-1">Claimant</div>
                <div className="flex flex-col gap-0.5 text-muted-foreground">
                  {community.claimant.name && <div>Name: {community.claimant.name}</div>}
                  {community.claimant.email && <div>Email: {community.claimant.email}</div>}
                  {community.claimant.signedUp && (
                    <div>
                      Signed up: {new Date(community.claimant.signedUp).toLocaleDateString()}
                    </div>
                  )}
                  {community.claimant.otherCommunities.length > 0 && (
                    <div>Also manages: {community.claimant.otherCommunities.join(", ")}</div>
                  )}
                  {!community.claimant.name && !community.claimant.email && (
                    <div>No user info available</div>
                  )}
                </div>
              </div>

              {/* Actions */}
              {community.pendingRoleId && (
                <div className="flex items-center gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      await rejectClaim({
                        communityId: community._id,
                        roleId: community.pendingRoleId!,
                      });
                    }}
                  >
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    onClick={async () => {
                      await approveClaim({
                        communityId: community._id,
                        roleId: community.pendingRoleId!,
                      });
                    }}
                  >
                    Approve
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

// ── Moderators Tab (system_admin) ──────────────────────────────

function ModeratorsTab() {
  const moderators = useQuery(api.moderators.list);
  const addModerator = useMutation(api.moderators.add);
  const removeModerator = useMutation(api.moderators.remove);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await addModerator({ email });
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold">Moderators</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Moderators can generate invite links for any community. Add trusted people from your
          community.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add a moderator</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="flex items-end gap-2">
            <div className="flex flex-1 flex-col gap-1">
              <Label className="text-xs">Email</Label>
              <Input
                type="email"
                placeholder="moderator@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" size="sm">
              Add
            </Button>
          </form>
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          <p className="text-xs text-muted-foreground mt-2">
            The user must have an account on orthdx.site first.
          </p>
        </CardContent>
      </Card>

      {moderators && moderators.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Current moderators</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {moderators.map((mod) => (
              <div
                key={mod.roleId}
                className="flex items-center justify-between rounded border p-3"
              >
                <span className="text-sm">{mod.email}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeModerator({ roleId: mod.roleId })}
                >
                  Remove
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── Shared Components ──────────────────────────────────────────

function CommunityRow({
  community,
  onSelect,
}: {
  community: Community;
  onSelect: (id: Id<"communities">) => void;
}) {
  return (
    <button
      onClick={() => onSelect(community._id)}
      className="flex items-center gap-4 rounded-lg border p-4 text-left transition-colors hover:bg-muted/50"
    >
      {community.avatarUrl ? (
        <img
          src={community.avatarUrl}
          alt=""
          className="h-12 w-12 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="h-12 w-12 shrink-0 rounded-full bg-muted" />
      )}
      <div className="flex-1">
        <div className="font-medium">{community.name}</div>
        <div className="text-sm text-muted-foreground">{community.slug}.orthdx.site</div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span
          className={`text-xs ${community.published ? "text-green-600" : "text-muted-foreground"}`}
        >
          {community.published ? "Published" : "Draft"}
        </span>
        {community.status === "unclaimed" && (
          <span className="text-xs text-yellow-600">Unclaimed</span>
        )}
        {community.status === "pending" && <span className="text-xs text-orange-600">Pending</span>}
        <span className="text-xs text-muted-foreground capitalize">{community.role}</span>
      </div>
    </button>
  );
}

// ── Find or Create Community ───────────────────────────────────

function CreateCommunity({ onCreated }: { onCreated: (id: Id<"communities">) => void }) {
  const [step, setStep] = useState<"search" | "create">("search");
  const [search, setSearch] = useState("");
  const searchResults = useQuery(
    api.communities.searchUnclaimed,
    search.length >= 2 ? { search } : "skip",
  );
  const claim = useMutation(api.communities.claim);
  const create = useMutation(api.communities.create);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [type, setType] = useState<"parish" | "mission" | "monastery" | "chapel" | "cathedral">(
    "parish",
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleClaim(id: Id<"communities">) {
    setError("");
    setLoading(true);
    try {
      await claim({ id });
      onCreated(id);
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
      const id = await create({ name, slug: slug.toLowerCase(), type });
      onCreated(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
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
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Search for your community in our directory first. If it's listed as unclaimed you can
            take ownership of it.
          </p>
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
              No unclaimed communities found.{" "}
              <button onClick={() => setStep("create")} className="underline hover:text-foreground">
                Create a new listing
              </button>
            </div>
          )}
          {searchResults &&
            searchResults.length > 0 &&
            searchResults.map((c) => (
              <div key={c._id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {[c.city, c.state].filter(Boolean).join(", ")}
                    {c.jurisdiction && <span className="ml-2 opacity-60">{c.jurisdiction}</span>}
                  </div>
                </div>
                <Button size="sm" disabled={loading} onClick={() => handleClaim(c._id)}>
                  Claim
                </Button>
              </div>
            ))}
          {error && <p className="text-sm text-red-500">{error}</p>}
          <p className="text-xs text-muted-foreground">
            Not in the directory?{" "}
            <button onClick={() => setStep("create")} className="underline hover:text-foreground">
              Create a new listing
            </button>
          </p>
        </div>
      )}

      {step === "create" && (
        <Card>
          <CardHeader>
            <CardTitle>Create a community page</CardTitle>
            <CardDescription>
              Choose a name, type, and subdomain for your community's page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Community name</Label>
                <Input
                  id="name"
                  placeholder="St. Michael Orthodox Church"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="type">Type</Label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value as typeof type)}
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
                    value={slug}
                    onChange={(e) =>
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
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
                {loading ? "Creating..." : "Create"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function EditCommunityWrapper({ communityId }: { communityId: Id<"communities"> }) {
  const community = useQuery(api.communities.getById, { id: communityId });

  if (community === undefined) {
    return <p className="text-muted-foreground">Loading...</p>;
  }
  if (community === null) {
    return <p className="text-red-500">Community not found or no access.</p>;
  }

  return <EditCommunity community={community} />;
}

interface Community {
  _id: Id<"communities">;
  name: string;
  slug: string;
  type: "parish" | "mission" | "monastery" | "chapel" | "cathedral";
  status: "verified" | "unclaimed" | "pending";
  jurisdiction?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  email?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  avatarUrl: string | null;
  bannerUrl: string | null;
  services?: { name: string; day: string; time: string }[];
  published: boolean;
  role: string;
}

function EditCommunity({ community }: { community: Community }) {
  const update = useMutation(api.communities.update);
  const personnel = useQuery(api.personnel.listByCommunity, {
    communityId: community._id,
  });
  const addPerson = useMutation(api.personnel.add);
  const removePerson = useMutation(api.personnel.remove);
  const updatePerson = useMutation(api.personnel.update);

  const [form, setForm] = useState({
    name: community.name,
    jurisdiction: community.jurisdiction ?? "",
    address: community.address ?? "",
    city: community.city ?? "",
    state: community.state ?? "",
    zip: community.zip ?? "",
    phone: community.phone ?? "",
    email: community.email ?? "",
    website: community.website ?? "",
  });

  const [services, setServices] = useState(community.services ?? []);
  const [newPersonName, setNewPersonName] = useState("");
  const [newPersonTitle, setNewPersonTitle] = useState("");
  const [saving, setSaving] = useState(false);

  function setField(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await update({
        id: community._id,
        ...form,
        services,
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleTogglePublish() {
    await update({ id: community._id, published: !community.published });
  }

  async function handleAddService() {
    setServices([...services, { name: "", day: "", time: "" }]);
  }

  function updateService(index: number, field: string, value: string) {
    setServices(services.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  }

  function removeService(index: number) {
    setServices(services.filter((_, i) => i !== index));
  }

  async function handleAddPerson(e: React.FormEvent) {
    e.preventDefault();
    if (!newPersonName || !newPersonTitle) return;
    await addPerson({
      communityId: community._id,
      name: newPersonName,
      title: newPersonTitle,
    });
    setNewPersonName("");
    setNewPersonTitle("");
  }

  const previewUrl = `https://${community.slug}.orthdx.site`;

  return (
    <div className="flex flex-col gap-6">
      {/* Status bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Switch checked={community.published} onCheckedChange={handleTogglePublish} />
          <span className="text-sm">{community.published ? "Published" : "Draft"}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground underline"
          >
            {community.slug}.orthdx.site
          </a>
          <Link to={`/parish/${community.slug}`} className="text-muted-foreground underline">
            preview
          </Link>
        </div>
      </div>

      {/* Community info */}
      <Card>
        <CardHeader>
          <CardTitle>Community information</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-4">
            <Label>Images</Label>
            <div className="flex items-start gap-4">
              <ImageUpload
                currentUrl={community.avatarUrl}
                onUploaded={(id) => update({ id: community._id, avatarId: id })}
                label="Avatar"
                aspect="square"
              />
              <ImageUpload
                currentUrl={community.bannerUrl}
                onUploaded={(id) => update({ id: community._id, bannerId: id })}
                label="Banner"
                aspect="banner"
                className="flex-1"
              />
            </div>
          </div>

          <Separator />

          <div className="flex flex-col gap-2">
            <Label>Community name</Label>
            <Input value={form.name} onChange={(e) => setField("name", e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Jurisdiction</Label>
            <Input
              placeholder="e.g. OCA, Greek, Antiochian, ROCOR"
              value={form.jurisdiction}
              onChange={(e) => setField("jurisdiction", e.target.value)}
            />
          </div>

          <Separator />

          <div className="flex flex-col gap-2">
            <Label>Address</Label>
            <AddressAutocomplete
              defaultValue={[form.address, form.city, form.state, form.zip]
                .filter(Boolean)
                .join(", ")}
              onSelect={(result) => {
                setForm((f) => ({
                  ...f,
                  address: result.address,
                  city: result.city,
                  state: result.state,
                  zip: result.zip,
                }));
                void update({
                  id: community._id,
                  address: result.address,
                  city: result.city,
                  state: result.state,
                  zip: result.zip,
                  latitude: result.latitude,
                  longitude: result.longitude,
                });
              }}
            />
            {form.address && (
              <p className="text-xs text-muted-foreground">
                {[form.address, form.city, form.state, form.zip].filter(Boolean).join(", ")}
              </p>
            )}
          </div>

          <Separator />

          <div className="flex flex-col gap-2">
            <Label>Phone</Label>
            <Input
              type="tel"
              value={form.phone}
              onChange={(e) => setField("phone", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Website</Label>
            <Input
              type="url"
              placeholder="https://"
              value={form.website}
              onChange={(e) => setField("website", e.target.value)}
            />
          </div>

          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </CardContent>
      </Card>

      {/* Services */}
      <Card>
        <CardHeader>
          <CardTitle>Service schedule</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {services.map((service, i) => (
            <div key={i} className="flex items-end gap-2">
              <div className="flex flex-1 flex-col gap-1">
                <Label className="text-xs">Service</Label>
                <Input
                  placeholder="Divine Liturgy"
                  value={service.name}
                  onChange={(e) => updateService(i, "name", e.target.value)}
                />
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <Label className="text-xs">Day</Label>
                <Input
                  placeholder="Sunday"
                  value={service.day}
                  onChange={(e) => updateService(i, "day", e.target.value)}
                />
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <Label className="text-xs">Time</Label>
                <Input
                  placeholder="10:00 AM"
                  value={service.time}
                  onChange={(e) => updateService(i, "time", e.target.value)}
                />
              </div>
              <Button variant="ghost" size="sm" onClick={() => removeService(i)}>
                Remove
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={handleAddService}>
            Add service
          </Button>
          <Button onClick={handleSave} disabled={saving} className="mt-2">
            {saving ? "Saving..." : "Save schedule"}
          </Button>
        </CardContent>
      </Card>

      {/* Personnel */}
      <Card>
        <CardHeader>
          <CardTitle>Clergy & personnel</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {personnel?.map((person) => (
            <div key={person._id} className="flex items-center gap-3">
              <ImageUpload
                currentUrl={person.avatarUrl}
                onUploaded={(id) => updatePerson({ id: person._id, avatarId: id })}
                label="Photo"
                aspect="square"
                className="shrink-0 [&_button]:h-12 [&_button]:w-12"
              />
              <div className="flex-1">
                <span className="font-medium">{person.name}</span>
                <span className="ml-2 text-sm text-muted-foreground">{person.title}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => removePerson({ id: person._id })}>
                Remove
              </Button>
            </div>
          ))}
          <Separator />
          <form onSubmit={handleAddPerson} className="flex items-end gap-2">
            <div className="flex flex-1 flex-col gap-1">
              <Label className="text-xs">Name</Label>
              <Input
                placeholder="Fr. John Smith"
                value={newPersonName}
                onChange={(e) => setNewPersonName(e.target.value)}
              />
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <Label className="text-xs">Title</Label>
              <Input
                placeholder="Rector"
                value={newPersonTitle}
                onChange={(e) => setNewPersonTitle(e.target.value)}
              />
            </div>
            <Button type="submit" size="sm">
              Add
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
