import { Suspense } from "react";

import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { SignUpForm } from "@/components/signup/SignUpForm";
import { Skeleton } from "@/design-system/feedback/Skeleton";

function SignUpLoading() {
  return <Skeleton className="h-80 w-full rounded-2xl" />;
}

export default function SignUpPage() {
  return (
    <AuthPageLayout>
      <Suspense fallback={<SignUpLoading />}>
        <SignUpForm />
      </Suspense>
    </AuthPageLayout>
  );
}
