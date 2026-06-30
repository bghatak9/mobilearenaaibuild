import Link from "next/link";

export function SignupAgreementField({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-w-0 cursor-pointer items-start gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-elevated)]/40 px-2.5 py-2 text-[0.6875rem] leading-relaxed text-[var(--text-secondary)] transition hover:border-[var(--border-accent)]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-[var(--border-subtle)] text-[var(--arena-blue)] focus:ring-[var(--electric-cyan)]/40"
        required
      />
      <span className="min-w-0 break-words">
        I agree to the{" "}
        <Link
          href="/terms"
          className="font-medium text-[var(--electric-cyan)] hover:underline"
        >
          Terms of Service
        </Link>
        ,{" "}
        <Link
          href="/privacy"
          className="font-medium text-[var(--electric-cyan)] hover:underline"
        >
          Privacy Policy
        </Link>
        , and{" "}
        <Link
          href="/community-guidelines"
          className="font-medium text-[var(--electric-cyan)] hover:underline"
        >
          Community Guidelines
        </Link>
        .
      </span>
    </label>
  );
}
