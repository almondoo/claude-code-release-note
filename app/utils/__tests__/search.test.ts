import { describe, expect, it } from "vitest";
import { matchesQuery } from "../search";

describe("matchesQuery", () => {
  it("空クエリは常に true を返す", () => {
    expect(matchesQuery(["foo", "bar"], "")).toBe(true);
  });

  it("いずれかのフィールドがクエリを含めば true", () => {
    expect(matchesQuery(["hello world", "foo"], "world")).toBe(true);
  });

  it("どのフィールドにもクエリが含まれなければ false", () => {
    expect(matchesQuery(["hello", "foo"], "xyz")).toBe(false);
  });

  it("大文字小文字を区別しない", () => {
    expect(matchesQuery(["Hello World"], "hello")).toBe(true);
  });

  it("null フィールドをスキップする", () => {
    expect(matchesQuery([null, "hello"], "hello")).toBe(true);
  });

  it("全て null の場合は false", () => {
    expect(matchesQuery([null, null], "hello")).toBe(false);
  });
});
