import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/charts/styles.css";
import "./globals.css";

import type { Metadata } from "next";
import {
  ColorSchemeScript,
  MantineProvider,
  createTheme,
  mantineHtmlProps,
} from "@mantine/core";

const theme = createTheme({
  primaryColor: "teal",
  defaultRadius: "md",
});
import { AuthProvider } from "@/lib/auth-context";
import { AppShellNav } from "@/components/AppShellNav";

export const metadata: Metadata = {
  title: "ダーツ得点記録",
  description:
    "01Game・クリケット・COUNTUPの記録とレーティング推移を管理する個人用アプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="dark" />
      </head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="dark">
          <AuthProvider>
            <AppShellNav>{children}</AppShellNav>
          </AuthProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
