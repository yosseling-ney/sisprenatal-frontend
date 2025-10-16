import { ReactNode } from "react";
import { Permission } from "../../config/permissions";
import useAuth from "../../hooks/useAuth";

type RenderProp = (allowed: boolean) => ReactNode;

interface CanProps {
  permission?: Permission;
  permissions?: Permission[];
  mode?: "any" | "all";
  fallback?: ReactNode;
  children: ReactNode | RenderProp;
}

const Can = ({
  permission,
  permissions,
  mode = "all",
  fallback = null,
  children,
}: CanProps) => {
  const { hasPermission } = useAuth();

  const requiredPermissions = permissions ?? (permission ? [permission] : []);

  if (!requiredPermissions.length) {
    return <>{typeof children === "function" ? (children as RenderProp)(true) : children}</>;
  }

  const allowed =
    mode === "any"
      ? requiredPermissions.some((item) => hasPermission(item))
      : requiredPermissions.every((item) => hasPermission(item));

  if (!allowed) {
    return <>{fallback}</>;
  }

  if (typeof children === "function") {
    return <>{(children as RenderProp)(allowed)}</>;
  }

  return <>{children}</>;
};

export default Can;
