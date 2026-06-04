"use client";
import { useParams } from "next/navigation";
import SingleplayerGame from "@/components/mrm/SingleplayerGame";

export default function SingleplayerGamePage() {
  const params = useParams();
  return <SingleplayerGame mapId={params.mapId} />;
}
