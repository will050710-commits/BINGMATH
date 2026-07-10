"use client";
import { use } from "react";
import UserProfile from "@/components/mrm/UserProfile";
import { CoinStoreProvider } from "@/context/CoinStore";

export default function ProfilePage({ params }) {
  const { userId } = use(params);
  return (
    <CoinStoreProvider>
      <UserProfile userId={userId} />
    </CoinStoreProvider>
  );
}
