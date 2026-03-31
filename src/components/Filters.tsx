import { ClearOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Input, Select, Space } from "antd";
import { useState } from "react";
import styles from "./filters.module.scss";

interface FiltersProps {
  onFiltersChange: (r: FiltersState) => void;
}

export interface FiltersState {
  searchQuery?: string;
  status?: boolean;
  tableId?: string;
}

export default function Filters({ onFiltersChange }: FiltersProps) {
  const [filters, setFilters] = useState<FiltersState>({});

  const activeFilterCount = Object.values(filters).filter(
    (v) => v !== undefined && v !== "",
  ).length;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = { ...filters, searchQuery: e.target.value || undefined };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleStatusChange = (value: boolean | undefined) => {
    const newFilters = { ...filters, status: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
    onFiltersChange({});
  };

  return (
    <Space className={styles.filterContainer}>
      <Input
        prefix={<SearchOutlined />}
        placeholder="Buscar..."
        className={styles.searchInput}
        value={filters.searchQuery}
        onChange={handleSearchChange}
      />
      {
        <Select
          placeholder="Estado"
          allowClear
          value={filters.status}
          onChange={handleStatusChange}
          options={[
            { label: "Activo", value: true },
            { label: "Inactivo", value: false },
          ]}
          style={{ width: 130 }}
        />
      }
      {activeFilterCount > 0 && (
        <Button
          icon={<ClearOutlined />}
          danger
          type="text"
          onClick={handleClearFilters}
        >
          Limpar
        </Button>
      )}
    </Space>
  );
}
