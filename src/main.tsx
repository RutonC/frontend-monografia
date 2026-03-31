import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "../src/app";
import Provider from "./context/main.context";
import "./index.css";
import "./styles/global.scss";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // evita múltiplos logs de retry
    },
    mutations: {
      onError: () => {}, // silencia o log padrão
    },
  },
});
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Provider>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </Provider>
    </BrowserRouter>
  </StrictMode>,
);
