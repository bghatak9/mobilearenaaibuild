import { Suspense } from "react";

import LoginForm from "@/components/auth/LoginForm";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { Skeleton } from "@/design-system/feedback/Skeleton";

function LoginLoading() {
  return <Skeleton className="h-72 w-full rounded-2xl" />;
}

export default function LoginPage() {
  return (
    <AuthPageLayout>
      <Suspense fallback={<LoginLoading />}>
        <LoginForm />
      </Suspense>
    </AuthPageLayout>
  );
}
