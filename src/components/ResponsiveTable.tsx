// components/ResponsiveTable.tsx
// Mesma tabela do antd em ecrãs largos; abaixo do breakpoint "compact"
// (<1024px) mostra os mesmos dados como uma lista de cartões — reaproveita
// as mesmas `columns` (título + render), sem duplicar a definição em
// cada página.
import { Empty, Pagination, Table, type TableProps } from "antd";
import { useState, type MouseEventHandler, type ReactNode } from "react";
import { useIsCompactLayout } from "../hooks/useMediaQuery";
import styles from "./ResponsiveTable.module.scss";

interface ResponsiveTableProps<T> extends TableProps<T> {
  /** Nº de cartões por página no modo compacto (por defeito: pageSize da paginação da tabela, ou 10). */
  cardPageSize?: number;
}

function getRowKeyValue<T>(
  record: T,
  index: number,
  rowKey: ResponsiveTableProps<T>["rowKey"],
): string | number {
  if (typeof rowKey === "function") return rowKey(record, index) as string;
  if (typeof rowKey === "string") {
    const value = (record as Record<string, unknown>)[rowKey];
    if (typeof value === "string" || typeof value === "number") return value;
  }
  return index;
}

export default function ResponsiveTable<T extends object>({
  columns,
  dataSource,
  rowKey = "id",
  loading,
  onRow,
  pagination,
  cardPageSize,
  ...rest
}: ResponsiveTableProps<T>) {
  const isCompact = useIsCompactLayout();
  const [page, setPage] = useState(1);

  if (!isCompact) {
    return (
      <Table<T>
        columns={columns}
        dataSource={dataSource}
        rowKey={rowKey}
        loading={loading}
        onRow={onRow}
        pagination={pagination}
        {...rest}
      />
    );
  }

  const rows = dataSource ?? [];
  const pageSize =
    cardPageSize ?? (typeof pagination === "object" ? (pagination.pageSize ?? 10) : 10);
  const start = (page - 1) * pageSize;
  const pageRows = rows.slice(start, start + pageSize);

  if (!loading && !rows.length) {
    return <Empty description="Sem dados" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  }

  return (
    <div className={styles.cardList}>
      {pageRows.map((record, i) => {
        const index = start + i;
        const key = getRowKeyValue(record, index, rowKey);
        const rowProps = (onRow?.(record, index) ?? {}) as {
          onClick?: MouseEventHandler<HTMLDivElement>;
        };

        return (
          <div
            key={key}
            className={`${styles.card} ant-card ant-card-bordered ${rowProps.onClick ? styles.clickable : ""}`}
            onClick={rowProps.onClick}
          >
            <div className="ant-card-body">
              {(columns ?? []).map((col, ci) => {
                const anyCol = col as Record<string, unknown>;
                const dataIndex = anyCol.dataIndex as string | undefined;
                const rawValue = dataIndex
                  ? (record as Record<string, unknown>)[dataIndex]
                  : undefined;
                const render = anyCol.render as
                  | ((value: unknown, record: T, index: number) => ReactNode)
                  | undefined;
                const content = render
                  ? render(rawValue, record, index)
                  : ((rawValue as ReactNode) ?? "—");

                if (content === null || content === undefined || content === "")
                  return null;

                const title = anyCol.title as ReactNode;
                const cellKey = (anyCol.key as string) ?? dataIndex ?? String(ci);

                if (!title) {
                  return (
                    <div key={cellKey} className={styles.valueOnly}>
                      {content}
                    </div>
                  );
                }

                return (
                  <div key={cellKey} className={styles.field}>
                    <span className={styles.label}>{title}</span>
                    <span className={styles.value}>{content}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {rows.length > pageSize && (
        <div className={styles.pagination}>
          <Pagination
            simple
            current={page}
            pageSize={pageSize}
            total={rows.length}
            onChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
