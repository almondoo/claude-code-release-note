export const HeaderTags = ({
  tags,
  tagColors,
}: {
  sectionName?: string;
  accentColor?: string;
  tags?: string[];
  tagColors: Record<string, { color: string; bg: string }>;
}): React.JSX.Element => {
  return (
    <div className="flex gap-1.5 mt-2 flex-wrap">
      {tags?.map((tag) => (
        <span
          key={tag}
          className="text-[11px] font-semibold rounded"
          style={{
            padding: "2px 8px",
            background: tagColors[tag]?.bg ?? "rgba(100,116,139,0.15)",
            color: tagColors[tag]?.color ?? "#94A3B8",
          }}
        >
          {tag}
        </span>
      ))}
    </div>
  );
};
