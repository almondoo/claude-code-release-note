import type { GlossaryTerm } from "./constants";

/**
 * Parse `{{term-id}}` patterns in text and replace them with clickable glossary links.
 *
 * - Matched terms render as styled spans showing the Japanese name (`term.term`).
 * - Unrecognised IDs are rendered as plain text (the raw ID string).
 */
export const parseGlossaryLinks = (
  text: string,
  terms: GlossaryTerm[],
  onTermClick: (termId: string) => void,
  renderText?: (text: string) => React.ReactNode[],
): React.ReactNode => {
  const pattern = /\{\{([^}]+)\}\}/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyIndex = 0;

  while ((match = pattern.exec(text)) !== null) {
    // Push plain text before this match
    if (match.index > lastIndex) {
      const plain = text.slice(lastIndex, match.index);
      if (renderText) {
        parts.push(...renderText(plain));
      } else {
        parts.push(plain);
      }
    }

    const termId = match[1];
    const term = terms.find((t) => t.id === termId);

    if (term) {
      parts.push(
        <span
          key={`gl-${keyIndex++}`}
          role="button"
          tabIndex={0}
          onClick={() => onTermClick(termId)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onTermClick(termId);
            }
          }}
          style={{
            color: "#60A5FA",
            borderBottom: "1px dashed rgba(96,165,250,0.5)",
            cursor: "pointer",
          }}
        >
          {term.term}
        </span>,
      );
    } else {
      parts.push(termId);
    }

    lastIndex = match.index + match[0].length;
  }

  // Push remaining plain text
  if (lastIndex < text.length) {
    const plain = text.slice(lastIndex);
    if (renderText) {
      parts.push(...renderText(plain));
    } else {
      parts.push(plain);
    }
  }

  // If no patterns were found, return the original string (or rendered text) as-is
  if (parts.length === 0) {
    return renderText ? <>{renderText(text)}</> : text;
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
};
