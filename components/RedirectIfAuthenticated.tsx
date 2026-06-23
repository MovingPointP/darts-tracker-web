"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Center, Loader } from "@mantine/core";
import { useAuth } from "@/lib/auth-context";
import { useHasMounted } from "@/lib/use-has-mounted";

/** ログイン済みユーザーが /login や /signup に来た場合、記録一覧へ逃がす。 */
export function RedirectIfAuthenticated({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const mounted = useHasMounted();

  useEffect(() => {
    if (mounted && isAuthenticated) {
      router.replace("/records");
    }
  }, [mounted, isAuthenticated, router]);

  if (!mounted || isAuthenticated) {
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    );
  }

  return <>{children}</>;
}
