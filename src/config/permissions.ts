import {
  BarChartOutlined,
  CalendarOutlined,
  DashboardOutlined,
  HeartOutlined,
  MessageOutlined,
  SettingOutlined,
  TeamOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { ReactNode, createElement } from "react";

export const PERMISSIONS = {
  DASHBOARD_VIEW: "dashboard.view",
  PACIENTES_REGISTRAR: "pacientes.registrar",
  HISTORIA_CLINICA_EDIT: "historia.edit",
  HISTORIA_CLINICA_VIEW: "historia.view",
  CITAS_MANAGE: "citas.manage",
  CITAS_VIEW: "citas.view",
  MENSAJES_MANAGE: "mensajes.manage",
  MENSAJES_VIEW: "mensajes.view",
  REPORTES_VIEW: "reportes.view",
  USUARIOS_MANAGE: "usuarios.manage",
  CONFIG_ACCESS: "config.access",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export type Role = "admin" | "medico" | "enfermera" | "paciente";

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: Object.values(PERMISSIONS),
  medico: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.HISTORIA_CLINICA_EDIT,
    PERMISSIONS.HISTORIA_CLINICA_VIEW,
    PERMISSIONS.CITAS_VIEW,
    PERMISSIONS.CITAS_MANAGE,
    PERMISSIONS.MENSAJES_VIEW,
    PERMISSIONS.MENSAJES_MANAGE,
    PERMISSIONS.REPORTES_VIEW,
  ],
  enfermera: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PACIENTES_REGISTRAR,
    PERMISSIONS.HISTORIA_CLINICA_EDIT,
    PERMISSIONS.HISTORIA_CLINICA_VIEW,
    PERMISSIONS.CITAS_VIEW,
    PERMISSIONS.CITAS_MANAGE,
    PERMISSIONS.MENSAJES_VIEW,
    PERMISSIONS.MENSAJES_MANAGE,
  ],
  paciente: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.CITAS_VIEW,
    PERMISSIONS.MENSAJES_VIEW,
    PERMISSIONS.HISTORIA_CLINICA_VIEW,
  ],
};

export type NavigationItem = {
  key: string;
  label: string;
  to: string;
  icon: ReactNode;
  permission?: Permission;
};

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    to: "/",
    icon: createElement(DashboardOutlined),
    permission: PERMISSIONS.DASHBOARD_VIEW,
  },
  {
    key: "paciente",
    label: "Historia clinica",
    to: "/paciente",
    icon: createElement(HeartOutlined),
    permission: PERMISSIONS.HISTORIA_CLINICA_VIEW,
  },
  {
    key: "pacientes-registrar",
    label: "Agregar paciente",
    to: "/pacientes/registrar",
    icon: createElement(UserAddOutlined),
    permission: PERMISSIONS.PACIENTES_REGISTRAR,
  },
  {
    key: "citas",
    label: "Citas",
    to: "/citas",
    icon: createElement(CalendarOutlined),
    permission: PERMISSIONS.CITAS_VIEW,
  },
  {
    key: "mensajes",
    label: "Mensajes",
    to: "/mensajes",
    icon: createElement(MessageOutlined),
    permission: PERMISSIONS.MENSAJES_VIEW,
  },
  {
    key: "reportes",
    label: "Reportes",
    to: "/reportes",
    icon: createElement(BarChartOutlined),
    permission: PERMISSIONS.REPORTES_VIEW,
  },
  {
    key: "usuarios",
    label: "Usuarios",
    to: "/usuarios",
    icon: createElement(TeamOutlined),
    permission: PERMISSIONS.USUARIOS_MANAGE,
  },
  {
    key: "configuracion",
    label: "Configuracion",
    to: "/configuracion",
    icon: createElement(SettingOutlined),
    permission: PERMISSIONS.CONFIG_ACCESS,
  },
];
