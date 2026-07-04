"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ActionIcon,
  AppShell,
  Box,
  Burger,
  Group,
  NavLink,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import {
  IconList,
  IconPlus,
  IconChartLine,
  IconLogout,
} from "@tabler/icons-react";
import { useAuth } from "@/lib/auth-context";

const NAV_ITEMS = [
  { href: "/records", label: "記録一覧", icon: IconList },
  { href: "/records/new", label: "記録入力", icon: IconPlus },
  { href: "/stats", label: "レーティング推移", icon: IconChartLine },
];

export function AppShellNav({ children }: { children: ReactNode }) {
  const [opened, { toggle, close }] = useDisclosure();
  const { isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width: 48em)");

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <AppShell
      header={{ height: { base: 56, sm: 70 } }}
      navbar={{ width: 230, breakpoint: "sm", collapsed: { mobile: !opened } }}
      padding="md"
      styles={{
        header: {
          backgroundColor: "var(--mantine-color-dark-9)",
          borderBottom: "1px solid var(--mantine-color-dark-5)",
        },
        navbar: {
          backgroundColor: "var(--mantine-color-dark-8)",
          borderRight: "1px solid var(--mantine-color-dark-6)",
        },
        main: {
          backgroundColor: "var(--mantine-color-dark-7)",
        },
      }}
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group gap="sm">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Box
              w={{ base: 3, sm: 4 }}
              h={{ base: 22, sm: 32 }}
              style={{
                backgroundColor: "var(--mantine-color-teal-5)",
                borderRadius: 2,
              }}
            />
            <Title order={3} size={isMobile ? "h5" : undefined} style={{ letterSpacing: "0.06em" }}>
              <Text span c="teal.4" fw={900} inherit>DARTS</Text>
              <Text span c="dark.1" fw={300} inherit> TRACKER</Text>
            </Title>
          </Group>
          <Tooltip label="ログアウト" position="bottom">
            <ActionIcon
              variant="subtle"
              color="gray"
              size="lg"
              aria-label="ログアウト"
              onClick={logout}
            >
              <IconLogout size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="sm" pt="lg">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.href}
            component={Link}
            href={item.href}
            label={item.label}
            leftSection={<item.icon size={17} stroke={1.5} />}
            active={pathname === item.href}
            color="teal"
            onClick={close}
            styles={{
              root: {
                borderRadius: "var(--mantine-radius-md)",
                marginBottom: 4,
              },
            }}
          />
        ))}
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
