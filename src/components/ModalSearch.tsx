import { Divider, Input, Modal, Spin, Tag, Typography } from "antd";
import axios from "axios";
import { useEffect, useState, type JSX } from "react";
import { BiSearch } from "react-icons/bi";
import {
  HiOutlineAcademicCap,
  HiOutlineBookOpen,
  HiOutlineOfficeBuilding,
  HiOutlineUser,
} from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { baseURL } from "../utils/constants";

const { Text } = Typography;

interface SearchProps {
  open: boolean;
  setOpen?: (r: boolean) => void;
}

type SearchResult = {
  type: string;
  id: string;
  label: string;
  sublabel?: string;
  meta?: Record<string, any>;
};

const typeConfig: Record<
  string,
  { color: string; icon: JSX.Element; label: string; path: string }
> = {
  user: {
    color: "blue",
    icon: <HiOutlineUser />,
    label: "Utilizador",
    path: "/funcionarios",
  },
  student: {
    color: "green",
    icon: <HiOutlineAcademicCap />,
    label: "Aluno",
    path: "/estudantes",
  },
  teacher: {
    color: "purple",
    icon: <HiOutlineAcademicCap />,
    label: "Professor",
    path: "/funcionarios",
  },
  employee: {
    color: "orange",
    icon: <HiOutlineUser />,
    label: "Funcionário",
    path: "/funcionarios",
  },
  department: {
    color: "cyan",
    icon: <HiOutlineOfficeBuilding />,
    label: "Departamento",
    path: "/departamentos",
  },
  subject: {
    color: "gold",
    icon: <HiOutlineBookOpen />,
    label: "Disciplina",
    path: "/classes",
  },
  level: {
    color: "red",
    icon: <HiOutlineBookOpen />,
    label: "Classe",
    path: "/classes",
  },
};

export default function Search({ open, setOpen }: SearchProps) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      setElapsed(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${baseURL.API_URL}/search`, {
          params: { q: search, limit: 5 },
          withCredentials: true,
        });
        setResults(res.data.results);
        setElapsed(res.data.elapsed);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const handleClose = () => {
    setSearch("");
    setResults([]);
    setElapsed(null);
    setOpen?.(false);
  };

  const handleClick = (result: SearchResult) => {
    const config = typeConfig[result.type];
    if (config?.path) {
      // passa o id via state para a página destino abrir o registo directamente
      navigate(config.path, {
        state: { selectedId: result.id, highlight: result.label },
      });
    }
    handleClose();
  };

  return (
    <Modal
      styles={{ container: { padding: 0, margin: 0 } }}
      title={
        <Input
          prefix={<BiSearch />}
          placeholder="Pesquisar utilizadores, alunos, departamentos..."
          allowClear
          autoFocus
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      }
      closeIcon={null}
      open={open}
      onCancel={handleClose}
      footer={null}
    >
      {search && (
        <>
          <Divider styles={{ root: { padding: 0, margin: "4px 0" } }} />

          {loading ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <Spin size="small" />
            </div>
          ) : results.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <Text type="secondary">Nenhum resultado para "{search}"</Text>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {elapsed && (
                <Text
                  type="secondary"
                  style={{ fontSize: 11, textAlign: "right" }}
                >
                  {results.length} resultado(s) em {elapsed}
                </Text>
              )}

              {results.map((r) => {
                const config = typeConfig[r.type] ?? {
                  color: "default",
                  icon: <HiOutlineUser />,
                  label: r.type,
                  path: "/",
                };
                return (
                  <div
                    key={`${r.type}-${r.id}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 12px",
                      borderRadius: 6,
                      cursor: "pointer",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#f5f5f5")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                    onClick={() => handleClick(r)}
                  >
                    <span style={{ fontSize: 18, color: "#666" }}>
                      {config.icon}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 500,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {r.label}
                      </div>
                      {r.sublabel && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {r.sublabel}
                        </Text>
                      )}
                    </div>
                    <Tag
                      color={config.color}
                      style={{ margin: 0, flexShrink: 0 }}
                    >
                      {config.label}
                    </Tag>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </Modal>
  );
}
