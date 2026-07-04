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
import { AuthProvider } from "@/lib/auth-context";
import { AppShellNav } from "@/components/AppShellNav";

const theme = createTheme({
  primaryColor: "teal",
  defaultRadius: "md",
});

export const metadata: Metadata = {
  title: "DARTS TRACKER",
  description:
    "01Game・クリケット・COUNTUPの記録とレーティング推移を管理するアプリ",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icon-192.png",
  },
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
