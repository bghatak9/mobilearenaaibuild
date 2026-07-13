import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";
import { COMMUNITY_RULES, MEMBER_BENEFITS } from "@/lib/signup-community-content";

export default function CommunityGuidelinesPage() {
  return (
    <LegalDocumentPage
      title="Community Guidelines"
      subtitle="Help keep MobileArena welcoming for everyone"
    >
      <p>
        MobileArena is built for people who love mobile technology. These
        guidelines set expectations for respectful participation in comments,
        reviews, and community discussions.
      </p>

      <h2>Member benefits</h2>
      <ul>
        {MEMBER_BENEFITS.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <h2>Community rules</h2>
      <p>To keep MobileArena welcoming for everyone, you agree to:</p>
      <ul>
        {COMMUNITY_RULES.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <h2>Enforcement</h2>
      <p>
        Violations may result in content removal, temporary restrictions, or
        permanent account suspension. Moderators and administrators may take
        action to protect the community at their discretion.
      </p>

      <h2>Reporting concerns</h2>
      <p>
        If you see content or behavior that violates these guidelines, please
        report it to our moderation team so we can review it promptly.
      </p>
    </LegalDocumentPage>
  );
}
