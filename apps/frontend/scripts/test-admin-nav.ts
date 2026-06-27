/**
 * Verifies role-based admin sidebar labels (no browser required).
 * Run: npx tsx scripts/test-admin-nav.ts
 */
import {
  EXPECTED_NAV_LABELS,
  getNavForRole,
} from "../lib/admin-nav";

let failed = 0;

function assertRole(role: "SUPER_ADMIN" | "EDITOR") {
  const expected = EXPECTED_NAV_LABELS[role]!;
  const actual = getNavForRole(role).map((item) => item.label);

  const match =
    actual.length === expected.length &&
    actual.every((label, i) => label === expected[i]);

  if (match) {
    console.log(`✓ ${role} nav: ${actual.join(" | ")}`);
  } else {
    failed += 1;
    console.error(`✗ ${role} nav mismatch`);
    console.error(`  expected: ${expected.join(" | ")}`);
    console.error(`  actual:   ${actual.join(" | ")}`);
  }
}

assertRole("SUPER_ADMIN");
assertRole("EDITOR");

if (failed > 0) {
  process.exit(1);
}

console.log("\nAll admin nav role checks passed.");
