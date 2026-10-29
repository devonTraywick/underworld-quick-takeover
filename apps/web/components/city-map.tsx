"use client";

import { useEffect, useState } from "react";
import type { DistrictId, PlayerId } from "@underworld/shared";
import type { PublicGame } from "../lib/types";

const LABELS: Record<DistrictId, string> = {
  downtown: "Downtown", docks: "The Docks", "old-quarter": "Old Quarter", "financial-row": "Financial Row",
  heights: "The Heights", "industrial-yard": "Industrial Yard", "neon-strip": "Neon Strip",
};

const SHAPES: Record<DistrictId, string> = {
  downtown: "220,145 385,120 430,225 350,305 215,270 170,205",
  docks: "35,280 190,245 250,330 205,455 55,430 20,355",
  "old-quarter": "30,75 175,55 220,145 170,205 35,180",
  "financial-row": "385,120 545,80 610,180 570,285 430,225",
  heights: "175,55 300,20 385,120 220,145",
  "industrial-yard": "250,330 350,305 475,360 455,465 205,455",
  "neon-strip": "430,225 570,285 610,390 475,360 350,305",
};

const CENTERS: Record<DistrictId, [number, number]> = {
  downtown: [300, 205], docks: [130, 350], "old-quarter": [120, 130], "financial-row": [500, 185],
  heights: [285, 85], "industrial-yard": [350, 400], "neon-strip": [495, 315],
};

const FACTIONS = ["#C5A46A", "#9B4055", "#4E9299", "#725CA8", "#C56E45", "#6C8B58", "#D0C7B5", "#5174A4"];

export function CityMap({ game, selected, effect, currentPlayerId, operationName, eligibleDistricts, onSelect }: { game: PublicGame; selected?: DistrictId | undefined; effect?: PublicGame["cinematicEvents"][number] | null; currentPlayerId?: PlayerId | undefined; operationName?: string | undefined; eligibleDistricts?: DistrictId[] | undefined; onSelect?: ((id: DistrictId) => void) | undefined }) {
  const playerById = new Map(game.players.map((player) => [player.id, player]));
  const [focused, setFocused] = useState<DistrictId>(selected ?? game.activeDistricts[0]!);
  useEffect(() => { if (selected) setFocused(selected); else if (!game.activeDistricts.includes(focused)) setFocused(game.activeDistricts[0]!); }, [focused, game.activeDistricts, selected]);
  const inspected = game.districts[focused]!;
  const inspectedOwner = inspected.ownerId ? playerById.get(inspected.ownerId) : null;
  const totalStake = Object.values(inspected.stakes).reduce((total, value) => total + value, 0);
  return (
    <div className={`map-shell ${effect?`map-effect effect-${effect.type}`:""}`} aria-label="City district map">
      <div className="city-art" aria-hidden="true" />
      <div className="map-grid" aria-hidden="true" />
      <svg className="city-map" viewBox="0 0 640 490" role="group">
        {game.activeDistricts.map((id) => {
          const district = game.districts[id]!;
          const owner = district.ownerId ? playerById.get(district.ownerId) : null;
          const [x, y] = CENTERS[id];
          const stakes = Object.entries(district.stakes).filter(([, value]) => value > 0)
            .sort((a, b) => b[1] - a[1]);
          return (
            <g key={id} className={`district ${focused === id ? "is-focused" : ""} ${selected === id ? "is-selected" : ""} ${eligibleDistricts ? (eligibleDistricts.includes(id) ? "is-eligible" : "is-ineligible") : ""} ${effect?.districtId === id ? `district-effect effect-${effect.type}` : ""}`} role="button" tabIndex={0}
              aria-label={`${LABELS[id]}, ${owner ? `controlled by ${owner.nickname}` : "neutral"}${eligibleDistricts ? (eligibleDistricts.includes(id) ? ", valid target" : ", fallback target") : ""}`}
              onClick={() => { setFocused(id); onSelect?.(id); }} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { setFocused(id); onSelect?.(id); } }}>
              <polygon points={SHAPES[id]} style={{ "--owner": owner ? FACTIONS[owner.seat % FACTIONS.length] : "#34363d" } as React.CSSProperties} />
              <text x={x} y={y - 8} textAnchor="middle" className="district-name">{LABELS[id]}</text>
              <text x={x} y={y + 16} textAnchor="middle" className="district-owner">{owner?.nickname ?? "Neutral"}</text>
              <g transform={`translate(${x - ((stakes.length - 1) * 15)}, ${y + 34})`}>
                {stakes.map(([playerId, value], index) => {
                  const player = playerById.get(playerId as PlayerId)!;
                  return <g key={playerId} transform={`translate(${index * 30},0)`}>
                    <circle r="10" fill={FACTIONS[player.seat % FACTIONS.length]} />
                    <text y="4" textAnchor="middle" className="stake-count">{value}</text>
                  </g>;
                })}
              </g>
            </g>
          );
        })}
      </svg>
      {effect?.districtId && ["stakes-added","stakes-removed"].includes(effect.type) && <div className={`stake-change-callout effect-${effect.type}`} role="status"><span>{effect.type==="stakes-added"?"+":"−"}{effect.amount} stake{effect.amount===1?"":"s"}</span><b>{LABELS[effect.districtId]}</b></div>}
      {effect?.districtId && ["district-captured", "district-contested"].includes(effect.type) && <div className={`capture-headline effect-${effect.type}`} role="status">{effect.ownerId&&<span className={`boss-avatar boss-${game.players.find((player)=>player.id===effect.ownerId)?.seat??0}`} />}<div><b>{LABELS[effect.districtId]}</b><span>{effect.type === "district-captured" ? `Captured by ${game.players.find((player) => player.id === effect.ownerId)?.nickname ?? "a rival"}` : "Now contested"}</span></div></div>}
      <aside className="district-inspector" aria-live="polite"><div><span>District intelligence</span><strong>{LABELS[focused]}</strong></div><dl><div><dt>Control</dt><dd>{inspectedOwner?.nickname ?? "Contested / neutral"}</dd></div><div><dt>Total stakes</dt><dd>{totalStake}</dd></div><div><dt>Your stake</dt><dd>{currentPlayerId ? inspected.stakes[currentPlayerId] ?? 0 : 0}</dd></div></dl><div className="district-rivals">{Object.entries(inspected.stakes).filter(([, stake]) => stake > 0).sort((a, b) => b[1] - a[1]).map(([id, stake]) => <span key={id}><i style={{ background: FACTIONS[(playerById.get(id)?.seat ?? 0) % FACTIONS.length] }} />{playerById.get(id)?.nickname}<b>{stake}</b></span>)}</div>{operationName && <p><b>{operationName}</b> · {eligibleDistricts?.includes(focused) === false ? "No qualifying rival stake here; fallback rules apply." : "Valid target. Select it, then deploy."}</p>}</aside>
      <div className="map-legend">
        {game.players.map((player) => <span key={player.id}><i style={{ background: FACTIONS[player.seat % FACTIONS.length] }} />{player.nickname}</span>)}
      </div>
    </div>
  );
}

export { LABELS as DISTRICT_LABELS, FACTIONS };
