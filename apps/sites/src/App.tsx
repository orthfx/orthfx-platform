import { Routes, Route, useParams } from "react-router-dom";
import { getSubdomain } from "@/lib/subdomain";
import { LandingPage } from "@/pages/LandingPage";
import { LoginPage } from "@/pages/LoginPage";
import { SignupPage } from "@/pages/SignupPage";
import { ForgotPasswordPage } from "@/pages/ForgotPasswordPage";
import { AdminPage } from "@/pages/AdminPage";
import { RedeemInvitePage } from "@/pages/RedeemInvitePage";
import { OnboardingPage } from "@/pages/OnboardingPage";
import { AccountPage } from "@/pages/AccountPage";
import { PublicParishPage } from "@/pages/PublicParishPage";
import { AuthGate } from "@/components/AuthGate";
import { DevUserSwitcher } from "@/components/DevUserSwitcher";

function ParishRoute() {
  const { slug } = useParams<{ slug: string }>();
  return <PublicParishPage slug={slug!} />;
}

function App() {
  const subdomain = getSubdomain(window.location.hostname);

  if (subdomain) {
    return <PublicParishPage slug={subdomain} />;
  }

  return (
    <>
      {import.meta.env.DEV && <DevUserSwitcher />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/account"
          element={
            <AuthGate>
              <AccountPage />
            </AuthGate>
          }
        />
        <Route
          path="/onboarding"
          element={
            <AuthGate>
              <OnboardingPage />
            </AuthGate>
          }
        />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/parish/:slug" element={<ParishRoute />} />
        <Route
          path="/invite/:token"
          element={
            <AuthGate>
              <RedeemInvitePage />
            </AuthGate>
          }
        />
        <Route
          path="/admin"
          element={
            <AuthGate>
              <AdminPage />
            </AuthGate>
          }
        />
      </Routes>
    </>
  );
}

export default App;
