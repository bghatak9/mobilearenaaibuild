import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";
import { PRIVACY_POINTS } from "@/lib/signup-community-content";

export default function PrivacyPage() {
  return (
    <LegalDocumentPage
      title="Privacy Policy"
      subtitle="Last updated: June 2026"
    >
      <p>
        MobileArena respects your privacy. This policy explains what we collect,
        why we collect it, and the choices you have over your personal
        information.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>Account details such as email, display name, and profile settings.</li>
        <li>Content you submit, including comments, reviews, and bookmarks.</li>
        <li>Technical data needed to operate the service securely.</li>
        <li>Usage analytics to improve site performance and relevance.</li>
      </ul>

      <h2>How we use your information</h2>
      <p>
        We use your data to provide account features, personalize your
        experience, deliver notifications, prevent abuse, and improve
        MobileArena.
      </p>

      <h2>Your privacy matters</h2>
      <ul>
        {PRIVACY_POINTS.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <h2>Your choices</h2>
      <p>
        You can update profile details, manage notification preferences, and
        request account deletion by contacting our support team. Password reset
        uses email verification codes — passwords are never stored in plain
        text.
      </p>

      <h2>Contact</h2>
      <p>
        For privacy questions or data requests, contact us through the MobileArena
        support channels listed on the site.
      </p>
    </LegalDocumentPage>
  );
}
