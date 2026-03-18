import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  renderInlineMarkdown,
  parseListLine,
  parseHeading,
  parseBlocks,
} from "../paragraph-list";

/* ================================================================
 *  parseHeading
 * ================================================================ */
describe("parseHeading", () => {
  it("# を h1 として解析する", () => {
    expect(parseHeading("# タイトル")).toEqual({ level: 1, text: "タイトル" });
  });

  it("## を h2 として解析する", () => {
    expect(parseHeading("## 見出し2")).toEqual({ level: 2, text: "見出し2" });
  });

  it("### を h3 として解析する", () => {
    expect(parseHeading("### 見出し3")).toEqual({ level: 3, text: "見出し3" });
  });

  it("#### (4段階以上) は null を返す", () => {
    expect(parseHeading("#### 見出し4")).toBeNull();
  });

  it("# の後にスペースがない場合は null を返す", () => {
    expect(parseHeading("#タイトル")).toBeNull();
  });

  it("通常のテキストは null を返す", () => {
    expect(parseHeading("これは段落です")).toBeNull();
  });

  it("空文字は null を返す", () => {
    expect(parseHeading("")).toBeNull();
  });
});

/* ================================================================
 *  parseListLine
 * ================================================================ */
describe("parseListLine", () => {
  it("- マーカーの箇条書きを解析する", () => {
    expect(parseListLine("- 項目1")).toEqual({ type: "ul", depth: 0, text: "項目1" });
  });

  it("・マーカーの箇条書きを解析する", () => {
    expect(parseListLine("・項目1")).toEqual({ type: "ul", depth: 0, text: "項目1" });
  });

  it("インデントで depth を判定する (2スペース = depth 1)", () => {
    expect(parseListLine("  - サブ項目")).toEqual({ type: "ul", depth: 1, text: "サブ項目" });
  });

  it("4スペースで depth 2", () => {
    expect(parseListLine("    - 深い項目")).toEqual({ type: "ul", depth: 2, text: "深い項目" });
  });

  it("番号付きリストを解析する", () => {
    expect(parseListLine("1. 最初")).toEqual({ type: "ol", depth: 0, text: "最初" });
  });

  it("番号付きリストのインデント", () => {
    expect(parseListLine("  2. 二番目")).toEqual({ type: "ol", depth: 1, text: "二番目" });
  });

  it("通常のテキストは null を返す", () => {
    expect(parseListLine("普通のテキスト")).toBeNull();
  });

  it("空文字は null を返す", () => {
    expect(parseListLine("")).toBeNull();
  });
});

/* ================================================================
 *  parseBlocks
 * ================================================================ */
describe("parseBlocks", () => {
  it("段落テキストを paragraph ブロックとして返す", () => {
    const blocks = parseBlocks("これは段落です");
    expect(blocks).toEqual([{ kind: "paragraph", text: "これは段落です" }]);
  });

  it("\\n\\n で段落を分割する", () => {
    const blocks = parseBlocks("段落1\n\n段落2");
    expect(blocks).toHaveLength(2);
    expect(blocks[0]).toEqual({ kind: "paragraph", text: "段落1" });
    expect(blocks[1]).toEqual({ kind: "paragraph", text: "段落2" });
  });

  it("見出しを heading ブロックとして返す", () => {
    const blocks = parseBlocks("## セクション");
    expect(blocks).toEqual([{ kind: "heading", level: 2, text: "セクション" }]);
  });

  it("連続するリスト項目をグルーピングする", () => {
    const blocks = parseBlocks("- 項目1\n\n- 項目2\n\n- 項目3");
    expect(blocks).toHaveLength(1);
    expect(blocks[0].kind).toBe("list");
    if (blocks[0].kind === "list") {
      expect(blocks[0].items).toHaveLength(3);
    }
  });

  it("見出し→リスト→段落の混合コンテンツを正しく解析する", () => {
    const content = "## タイトル\n\n- 項目A\n\n- 項目B\n\nこれは段落";
    const blocks = parseBlocks(content);
    expect(blocks).toHaveLength(3);
    expect(blocks[0]).toEqual({ kind: "heading", level: 2, text: "タイトル" });
    expect(blocks[1].kind).toBe("list");
    expect(blocks[2]).toEqual({ kind: "paragraph", text: "これは段落" });
  });

  it("リストの後に見出しが来るとリストが確定される", () => {
    const content = "- 項目1\n\n## 次の見出し";
    const blocks = parseBlocks(content);
    expect(blocks).toHaveLength(2);
    expect(blocks[0].kind).toBe("list");
    expect(blocks[1]).toEqual({ kind: "heading", level: 2, text: "次の見出し" });
  });

  it("ネストされたリスト項目を含むグルーピング", () => {
    const content = "- 親\n\n  - 子";
    const blocks = parseBlocks(content);
    expect(blocks).toHaveLength(1);
    if (blocks[0].kind === "list") {
      expect(blocks[0].items).toHaveLength(2);
      expect(blocks[0].items[0].depth).toBe(0);
      expect(blocks[0].items[1].depth).toBe(1);
    }
  });
});

/* ================================================================
 *  renderInlineMarkdown
 * ================================================================ */
describe("renderInlineMarkdown", () => {
  it("プレーンテキストをそのまま返す", () => {
    const result = renderInlineMarkdown("普通のテキスト");
    expect(result).toEqual(["普通のテキスト"]);
  });

  it("**太字** を <strong> で描画する", () => {
    const { container } = render(<p>{renderInlineMarkdown("これは**太字**です")}</p>);
    const strong = container.querySelector("strong");
    expect(strong).toBeInTheDocument();
    expect(strong).toHaveTextContent("太字");
  });

  it("`コード` を <code> で描画する", () => {
    const { container } = render(<p>{renderInlineMarkdown("コマンド `npm install` を実行")}</p>);
    const code = container.querySelector("code");
    expect(code).toBeInTheDocument();
    expect(code).toHaveTextContent("npm install");
  });

  it("[リンク](url) を <a> で描画する", () => {
    const { container } = render(
      <p>{renderInlineMarkdown("詳しくは[こちら](https://example.com)を参照")}</p>,
    );
    const link = container.querySelector("a");
    expect(link).toBeInTheDocument();
    expect(link).toHaveTextContent("こちら");
    expect(link).toHaveAttribute("href", "https://example.com");
  });

  it("外部リンクに target=_blank を付与する", () => {
    const { container } = render(
      <p>{renderInlineMarkdown("[外部](https://example.com)")}</p>,
    );
    const link = container.querySelector("a");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("内部リンクに target=_blank を付与しない", () => {
    const { container } = render(
      <p>{renderInlineMarkdown("[内部](/about)")}</p>,
    );
    const link = container.querySelector("a");
    expect(link).not.toHaveAttribute("target");
  });

  it("複数のインライン要素を混在して描画する", () => {
    const { container } = render(
      <p>{renderInlineMarkdown("**太字**と`コード`と[リンク](https://example.com)")}</p>,
    );
    expect(container.querySelector("strong")).toBeInTheDocument();
    expect(container.querySelector("code")).toBeInTheDocument();
    expect(container.querySelector("a")).toBeInTheDocument();
  });
});
