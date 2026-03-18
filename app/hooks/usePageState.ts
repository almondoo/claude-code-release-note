import { useCallback, useMemo, useState } from "react";

interface Section<T> {
  id: string;
  name: string;
  items: T[];
}

interface UsePageStateOptions<T> {
  sections: Section<T>[];
  searchFields: (item: T) => string[];
  tabSectionMap?: Record<string, string[]>;
}

interface UsePageStateReturn<T> {
  query: string;
  setQuery: (q: string) => void;
  activeTab: string;
  handleTabChange: (id: string) => void;
  filteredSections: Section<T>[];
  filteredItems: T[];
  modalItem: string | null;
  openModal: (id: string) => void;
  closeModal: () => void;
}

export function usePageState<T>(options: UsePageStateOptions<T>): UsePageStateReturn<T> {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [modalItem, setModalItem] = useState<string | null>(null);

  const handleTabChange = useCallback((id: string) => {
    setActiveTab(id);
    setQuery("");
  }, []);

  const openModal = useCallback((id: string) => setModalItem(id), []);
  const closeModal = useCallback(() => setModalItem(null), []);

  const filteredSections = useMemo(() => {
    const { sections, searchFields, tabSectionMap } = options;
    const isAllTab = activeTab === "all";
    const target = isAllTab
      ? sections
      : tabSectionMap && tabSectionMap[activeTab]
        ? sections.filter((s) => tabSectionMap[activeTab].includes(s.id))
        : sections.filter((s) => s.id === activeTab);
    if (!query) return target;
    const lq = query.toLowerCase();
    return target
      .map((section) => ({
        ...section,
        items: section.items.filter((item) =>
          searchFields(item).some((f) => f.toLowerCase().includes(lq)),
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [activeTab, query, options]);

  const filteredItems = useMemo(() => filteredSections.flatMap((s) => s.items), [filteredSections]);

  return {
    query,
    setQuery,
    activeTab,
    handleTabChange,
    filteredSections,
    filteredItems,
    modalItem,
    openModal,
    closeModal,
  };
}
