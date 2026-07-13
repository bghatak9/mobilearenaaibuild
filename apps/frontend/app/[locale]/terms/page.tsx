import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";
import { Link } from "@/i18n/navigation";
import { SIGNUP_CONFIRMATIONS } from "@/lib/signup-community-content";

export default function TermsPage() {
  return (
    <LegalDocumentPage
      title="Terms of Service"
      subtitle="Last updated: June 2026"
    >
      <p>
        Welcome to MobileArena. These Terms of Service govern your use of our
        website, mobile experiences, and community features. By creating an
        account or using our services, you agree to these terms.
      </p>

      <h2>Your account</h2>
      <ul>
        <li>You must provide accurate registration information.</li>
        <li>You are responsible for safeguarding your login credentials.</li>
        <li>You must notify us promptly of any unauthorized account access.</li>
        <li>One person may not maintain more than one personal account.</li>
      </ul>

      <h2>Acceptable use</h2>
      <p>
        You agree to use MobileArena lawfully and in accordance with our{" "}
        <Link href="/community-guidelines">Community Guidelines</Link>. We may
        suspend or restrict accounts that violate these terms or harm other
        members.
      </p>

      <h2>Content and intellectual property</h2>
      <p>
        MobileArena content, branding, and catalog data remain our property or
        that of our licensors. You retain ownership of content you submit, but
        grant us a license to display and distribute it on the platform.
      </p>

      <h2>Service changes</h2>
      <p>
        We may update features, policies, or availability of the service. We
        will provide notice of material changes where appropriate.
      </p>

      <h2>By signing up, you confirm that:</h2>
      <ul>
        {SIGNUP_CONFIRMATIONS.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </LegalDocumentPage>
  );
}
