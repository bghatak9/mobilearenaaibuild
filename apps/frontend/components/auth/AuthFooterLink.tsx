import { Link } from "@/i18n/navigation";

type AuthFooterLinkProps = {
  prompt: string;
  href: string;
  label: string;
};

export function AuthFooterLink({ prompt, href, label }: AuthFooterLinkProps) {
  return (
    <p className="arena-auth-footer-text">
      {prompt}{" "}
      <Link href={href} className="arena-auth-link">
        {label}
      </Link>
    </p>
  );
}
