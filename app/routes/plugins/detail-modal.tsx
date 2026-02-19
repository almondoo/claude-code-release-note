import {
  DownloadIcon,
  ExternalLinkIcon,
  GitHubIcon,
  InfoIcon,
  PluginIcon,
  SettingsIcon,
  TimingIcon,
} from "~/components/icons.js";
import { CopyButton } from "~/components/copy-button";
import { DetailModalShell } from "~/components/detail-modal";
import type { Plugin } from "./constants";

interface DetailModalProps {
  plugin: Plugin;
  accentColor: string;
  onClose: () => void;
  reducedMotion: boolean | null;
}

export function DetailModal({
  plugin,
  accentColor,
  onClose,
  reducedMotion,
}: DetailModalProps): React.JSX.Element {
  return (
    <DetailModalShell
      accentColor={accentColor}
      onClose={onClose}
      reducedMotion={reducedMotion}
      icon={<PluginIcon />}
      headerContent={
        <>
          <code className="font-mono text-base font-bold break-all" style={{ color: accentColor }}>
            {plugin.displayName}
          </code>
          <div className="text-[14px] text-slate-400 mt-1.5 font-sans leading-relaxed">
            {plugin.description}
          </div>
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {plugin.binary && (
              <span className="text-[11px] font-semibold rounded px-2 py-[2px] bg-cyan-500/15 text-cyan-300">
                LSP: {plugin.binary}
              </span>
            )}
            {plugin.homepage && (
              <a
                href={plugin.homepage}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="homepage-link inline-flex items-center gap-1 text-[11px] font-semibold rounded bg-slate-900 text-slate-500 no-underline transition-colors px-2 py-[2px]"
              >
                <GitHubIcon />
                GitHub
                <ExternalLinkIcon />
              </a>
            )}
          </div>
        </>
      }
    >
      {/* Install */}
      <div
        className="bg-slate-900 rounded-lg flex items-center justify-between gap-3 px-3.5 py-2.5"
        style={{ border: `1px solid ${accentColor}20` }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <DownloadIcon />
          <code
            className="font-mono text-xs whitespace-nowrap overflow-hidden text-ellipsis"
            style={{ color: accentColor }}
          >
            {plugin.install}
          </code>
        </div>
        <CopyButton text={plugin.install} />
      </div>

      {/* Detail */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-1.5 text-[12px] font-bold tracking-wide uppercase font-mono text-cyan-300">
          <InfoIcon />
          詳細説明
        </div>
        <p className="m-0 text-[14px] leading-[1.8] text-slate-400 font-sans">{plugin.detail}</p>
      </div>

      {/* When to use */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-1.5 text-[12px] font-bold tracking-wide uppercase font-mono text-orange-300">
          <TimingIcon />
          使うタイミング
        </div>
        <p className="m-0 text-[14px] leading-[1.8] text-slate-400 font-sans">{plugin.whenToUse}</p>
      </div>

      {/* Setup */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-1.5 text-[12px] font-bold tracking-wide uppercase font-mono text-teal-300">
          <SettingsIcon />
          セットアップ
        </div>
        <p className="m-0 text-[14px] leading-[1.8] text-slate-400 font-sans">{plugin.setup}</p>
        {plugin.binary && (
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] text-slate-500 font-sans">必要なバイナリ:</span>
            <code className="font-mono text-[12px] rounded px-2 py-[2px] bg-cyan-500/15 text-cyan-300">
              {plugin.binary}
            </code>
          </div>
        )}
      </div>
    </DetailModalShell>
  );
}
