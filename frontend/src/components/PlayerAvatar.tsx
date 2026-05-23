import { useState } from "react";
import { getPlayerPhoto } from "../data/playerPhotos";
import { getOpponentPhoto } from "../data/opponentPlayerPhotos";

interface Props {
  playerId: number;
  playerName: string;
  size?: number;
  className?: string;
}

export default function PlayerAvatar({ playerId, playerName, size = 48, className = "" }: Props) {
  const photoUrl = getPlayerPhoto(playerId) ?? getOpponentPhoto(playerId);
  const [imgError, setImgError] = useState(false);

  const initials = playerName
    .replace(/[a-zA-Z]/g, "")
    .slice(0, 1) || playerName.slice(0, 1);

  if (!photoUrl || imgError) {
    return (
      <div
        className={`player-avatar player-avatar--fallback ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.38 }}
        title={playerName}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={photoUrl}
      alt={playerName}
      title={playerName}
      className={`player-avatar player-avatar--photo ${className}`}
      style={{ width: size, height: size }}
      onError={() => setImgError(true)}
      loading="lazy"
    />
  );
}
