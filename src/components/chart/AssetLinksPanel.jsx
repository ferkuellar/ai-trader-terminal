"use client";

import { ExternalLink } from "lucide-react";

function LinkButton({ label, url }) {
  if (!url) {
    return (
      <span className="border border-zinc-800 px-3 py-2 text-xs text-zinc-600">
        {label}: N/A
      </span>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-between gap-2 border border-zinc-800 px-3 py-2 text-xs text-zinc-300 hover:border-cyan-500/50 hover:text-cyan-300"
    >
      {label}
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}

export default function AssetLinksPanel({ profile }) {
  const socials = profile?.socials || {};
  const explorers = profile?.explorers || [];
  const wallets = profile?.wallets || [];

  return (
    <section className="border border-zinc-800 bg-zinc-950/60">
      <div className="border-b border-zinc-800 px-4 py-3">
        <h3 className="text-[11px] tracking-[0.2em] text-zinc-300">PROJECT LINKS</h3>
        <p className="mt-1 text-[10px] text-zinc-500">Sample profile links · verify externally</p>
      </div>
      <div className="grid gap-2 p-4 sm:grid-cols-2">
        <LinkButton label="Website" url={profile?.website} />
        <LinkButton label="Whitepaper" url={profile?.whitepaper} />
        <LinkButton label="CertiK" url={profile?.certikRating?.url} />
        <span className="border border-zinc-800 px-3 py-2 text-xs text-zinc-400">
          UCID: <span className="tabular text-zinc-200">{profile?.ucid ?? "N/A"}</span>
        </span>
        {Object.entries(socials).map(([label, url]) => (
          <LinkButton key={label} label={label.toUpperCase()} url={url} />
        ))}
        {explorers.map(item => <LinkButton key={item.label} label={`Explorer · ${item.label}`} url={item.url} />)}
        {wallets.map(item => <LinkButton key={item.label} label={`Wallet · ${item.label}`} url={item.url} />)}
      </div>
    </section>
  );
}
