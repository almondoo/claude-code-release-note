import { useState } from "react";
import { SearchIcon } from "~/components/icons";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  accentColor?: string;
}

export function SearchInput({ value, onChange, placeholder, accentColor = "#3B82F6" }: SearchInputProps): React.JSX.Element {
  const [focused, setFocused] = useState(false);
  return (
    <div
      className="bg-surface rounded-[10px] flex items-center gap-2.5 transition-all px-3.5 py-[2px]"
      style={{
        border: `1px solid ${focused ? accentColor : "#334155"}`,
        boxShadow: focused ? `0 0 0 3px ${accentColor}25` : "none",
      }}
    >
      <SearchIcon />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full border-none bg-transparent text-sm text-slate-100 outline-none font-sans py-[11px]"
      />
    </div>
  );
}
