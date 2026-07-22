"use client";

import { SessionProvider } from "next-auth/react";

export default function AuthProvider({ children, basePath }) {
  return <SessionProvider basePath={basePath}>{children}</SessionProvider>;
}
