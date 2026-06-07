// ---------------------------------------------------------------------------
// 翻訳辞書の組み立て。
// 各 namespace ファイルは { ja, en } を export し、ja/en は同一の型（パリティ保証）。
// DICT[locale] で現在ロケールの辞書ツリーを取得する。
// ---------------------------------------------------------------------------

import type { Locale } from "../config";
import { bestPractices } from "./bestPractices";
import { common } from "./common";
import { handsOn } from "./handsOn";
import { harness } from "./harness";
import { nav } from "./nav";
import { releaseNote } from "./releaseNote";
import { tags } from "./tags";
import { versionDetail } from "./versionDetail";
import { workflows } from "./workflows";

export const DICT = {
  ja: {
    common: common.ja,
    nav: nav.ja,
    tags: tags.ja,
    releaseNote: releaseNote.ja,
    versionDetail: versionDetail.ja,
    bestPractices: bestPractices.ja,
    handsOn: handsOn.ja,
    workflows: workflows.ja,
    harness: harness.ja,
  },
  en: {
    common: common.en,
    nav: nav.en,
    tags: tags.en,
    releaseNote: releaseNote.en,
    versionDetail: versionDetail.en,
    bestPractices: bestPractices.en,
    handsOn: handsOn.en,
    workflows: workflows.en,
    harness: harness.en,
  },
} satisfies Record<Locale, unknown>;

export type Dictionary = (typeof DICT)["ja"];
