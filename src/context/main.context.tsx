import { message as msg } from "antd";
import { createContext, useContext } from "react";

type ContextProviderProps = {
  message: {
    success: (content: React.ReactNode) => void;
    error: (content: React.ReactNode) => void;
    info: (content: React.ReactNode) => void;
    warning: (content: React.ReactNode) => void;
    loading: (content: React.ReactNode) => void;
  };
};

const contextInitialState = {
  message: {
    success: () => {},
    error: () => {},
    info: () => {},
    warning: () => {},
    loading: () => {},
  },
};

const ContextProvider =
  createContext<ContextProviderProps>(contextInitialState);

export default function Provider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [messageApi, contextHolder] = msg.useMessage();

  const message = {
    success: (content: React.ReactNode) =>
      messageApi.open({ type: "success", content }),
    error: (content: React.ReactNode) =>
      messageApi.open({ type: "error", content }),
    info: (content: React.ReactNode) =>
      messageApi.open({ type: "info", content }),
    warning: (content: React.ReactNode) =>
      messageApi.open({ type: "warning", content }),
    loading: (content: React.ReactNode) =>
      messageApi.open({ type: "loading", content }),
  };

  return (
    <ContextProvider.Provider value={{ message }}>
      <>
        {contextHolder}
        {children}
      </>
    </ContextProvider.Provider>
  );
}

export const useMainContext = () => useContext(ContextProvider);
