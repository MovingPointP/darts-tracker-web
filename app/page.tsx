"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Center, Loader } from "@mantine/core";
import { useAuth } from "@/lib/auth-context";
import { useHasMounted } from "@/lib/use-has-mounted";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const mounted = useHasMounted();

  useEffect(() => {
    if (mounted) {
      router.replace(isAuthenticated ? "/records" : "/login");
    }
  }, [mounted, isAuthenticated, router]);

  return (
    <Center h="100vh">
      <Loader />
    </Center>
  );
}
