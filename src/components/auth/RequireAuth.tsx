import { Result, Spin } from "antd";
import { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Permission } from "../../config/permissions";
import useAuth from "../../hooks/useAuth";

interface RequireAuthProps {
  permissions?: Permission[];
  fallback?: ReactNode;
}

const RequireAuth = ({ permissions, fallback }: RequireAuthProps) => {
  const location = useLocation();
  const { token, isLoading, hasPermission } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: "grid", placeItems: "center", minHeight: "100vh" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (permissions && permissions.some((permission) => !hasPermission(permission))) {
    if (fallback) return <>{fallback}</>;

    return (
      <Result
        status="403"
        title="Acceso restringido"
        subTitle="No tienes permisos suficientes para acceder a este contenido."
      />
    );
  }

  return <Outlet />;
};

export default RequireAuth;
