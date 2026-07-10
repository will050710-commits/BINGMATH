"use client";
import CoinShop from "@/components/mrm/CoinShop";
import { CoinStoreProvider } from "@/context/CoinStore";

export default function ShopPage() {
  return (
    <CoinStoreProvider>
      <CoinShop />
    </CoinStoreProvider>
  );
}
