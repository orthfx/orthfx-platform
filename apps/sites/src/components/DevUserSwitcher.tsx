import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Edit these to match your test accounts
const DEV_ACCOUNTS = [
  { label: "sys_admin", email: "", password: "" },
  { label: "mod", email: "", password: "" },
  { label: "admin", email: "", password: "" },
  { label: "editor", email: "", password: "" },
  { label: "new", email: "", password: "" },
];

export function DevUserSwitcher() {
  const { signIn, signOut } = useAuthActions();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  async function switchTo(email: string, password: string, label: string) {
    if (!email || !password) return;
    setLoading(label);
    try {
      await signOut();
      await signIn("password", { email, password, flow: "signIn" });
      void navigate("/admin");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col items-start gap-1">
      {open && (
        <div className="flex flex-col gap-1 rounded-lg border bg-background p-2 shadow-lg">
          {DEV_ACCOUNTS.map((a) => (
            <button
              key={a.label}
              disabled={!a.email || loading !== null}
              onClick={() => switchTo(a.email, a.password, a.label)}
              className="rounded px-3 py-1.5 text-left text-xs font-mono transition-colors hover:bg-muted disabled:opacity-40"
            >
              {loading === a.label ? "switching..." : `→ ${a.label}`}
            </button>
          ))}
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded-full border bg-background px-3 py-1 text-xs font-mono text-muted-foreground shadow hover:bg-muted"
      >
        dev {open ? "▲" : "▼"}
      </button>
    </div>
  );
}
