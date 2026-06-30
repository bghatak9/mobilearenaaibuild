import { PASSWORD_REQUIREMENT_TEXT } from "@/lib/password-policy";

type PasswordRequirementHintProps = {
  className?: string;
};

export function PasswordRequirementHint({
  className = "mt-1 text-xs text-gray-500",
}: PasswordRequirementHintProps) {
  return <p className={className}>{PASSWORD_REQUIREMENT_TEXT}</p>;
}
