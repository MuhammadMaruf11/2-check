"use client";
import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useDebounce } from "@/hooks/useDebounce"; // আগে বানানো হুক
import { useEffect, useState } from "react";

interface GlobalSearchProps {
  onSearch: (value: string) => void;
  placeholder?: string;
}

export const GlobalSearch = ({
  onSearch,
  placeholder = "Search...",
}: GlobalSearchProps) => {
  const [value, setValue] = useState("");
  const debouncedValue = useDebounce(value, 500);

  useEffect(() => {
    onSearch(debouncedValue);
  }, [debouncedValue, onSearch]);

  return (
    <Input
      placeholder={placeholder}
      prefix={<SearchOutlined />}
      onChange={(e) => setValue(e.target.value)}
      allowClear
      className="w-full max-w-sm"
    />
  );
};
