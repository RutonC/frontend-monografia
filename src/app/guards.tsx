import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export function homeForUser(type?: string): string {
  switch (type) {
    case "TEACHER":
      return "/teacher";
    case "GUARDIAN":
      return "/guardian";
    case "STUDENT":
      return "/student";
    case "SECRETARY":
      return "/secretary";
    case "FINANCE":
      return "/finance";
    default:
      return "/";
  }
}

/** Rota de mensagens do perfil, ou undefined se o perfil ainda não tem uma. */
export function messagesPathForUser(type?: string): string | undefined {
  switch (type) {
    case "TEACHER":
      return "/teacher/mensagens";
    case "GUARDIAN":
      return "/guardian/mensagens";
    case "ADMIN":
    case "SUPERADMIN":
      return "/mensagens";
    default:
      return undefined;
  }
}

/** Rota de definições pessoais do perfil — existe para todos os 6 perfis. */
export function personalSettingsPathForUser(type?: string): string {
  switch (type) {
    case "TEACHER":
      return "/teacher/definicoes-pessoais";
    case "GUARDIAN":
      return "/guardian/perfil";
    case "SECRETARY":
      return "/secretary/definicoes-pessoais";
    case "FINANCE":
      return "/finance/definicoes-pessoais";
    case "STUDENT":
      return "/student/definicoes-pessoais";
    default:
      return "/definicoes-pessoais";
  }
}

export function RedirectAuthenticatedUser({
  children,
}: {
  children: ReactNode;
}) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <>{children}</>;
  if (user?.mustChangePassword) return <Navigate to="/mudar-password" replace />;
  return <Navigate to={homeForUser(user?.type)} replace />;
}

/** Guarda de rota única, parametrizada pelos tipos de utilizador permitidos. */
export function RoleRoute({
  allowed,
  children,
}: {
  allowed: string[];
  children: ReactNode;
}) {
  const { isAuthenticated, user } = useAuthStore();
  const { pathname } = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!allowed.includes(user?.type ?? "")) {
    return <Navigate to={homeForUser(user?.type)} replace />;
  }
  // Conta nova (ou password atribuída por um admin) — bloqueia o resto
  // da aplicação até a password ser trocada.
  if (user?.mustChangePassword && pathname !== "/mudar-password") {
    return <Navigate to="/mudar-password" replace />;
  }
  return <>{children}</>;
}

/** Exige apenas autenticação, sem restrição de tipo — usado por
 * /mudar-password, que qualquer um dos 6 perfis pode ter de visitar. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
