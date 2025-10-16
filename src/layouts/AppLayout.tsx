import {
  BellOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Layout,
  Menu,
  MenuProps,
  Space,
  Tooltip,
  Typography,
} from "antd";
import { useMemo, useState, type CSSProperties } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import logo from "../Imagenes/ic_app_logo.png";
import { NAVIGATION_ITEMS, PERMISSIONS } from "../config/permissions";
import useAuth from "../hooks/useAuth";

const { Header, Sider, Content } = Layout;

const siderStyle: CSSProperties = {
  background: "#0c1c46",
  position: "sticky",
  top: 0,
  height: "100vh",
  overflow: "auto",
};

const headerStyle: CSSProperties = {
  background: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  paddingInline: 24,
  gap: 16,
  borderBottom: "1px solid #f0f0f0",
  position: "sticky",
  top: 0,
  zIndex: 20,
};

const contentWrapperStyle: CSSProperties = {
  margin: 24,
};

const contentStyle: CSSProperties = {
  padding: 24,
  background: "#fff",
  borderRadius: 16,
  minHeight: "calc(100vh - 160px)",
  boxShadow: "0 12px 32px rgba(12, 28, 70, 0.1)",
  display: "flex",
  flexDirection: "column",
  gap: 24,
  position: "relative",
};

const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, hasPermission } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const selectedKeys = useMemo(() => {
    const match = NAVIGATION_ITEMS.find((item) =>
      location.pathname === "/" ? item.to === "/" : location.pathname.startsWith(item.to)
    );
    return match ? [match.key] : [];
  }, [location.pathname]);

  const menuItems = useMemo<MenuProps["items"]>(
    () =>
      NAVIGATION_ITEMS.filter((item) => !item.permission || hasPermission(item.permission)).map((item) => ({
        key: item.key,
        label: <Link to={item.to}>{item.label}</Link>,
        icon: item.icon,
      })),
    [hasPermission]
  );

  return (
    <Layout style={{ minHeight: "100vh", background: "#eef3fb" }}>
      <Sider
        width={268}
        theme="dark"
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={siderStyle}
      >
        <div
          style={{
            height: 72,
            display: "flex",
            alignItems: "center",
            paddingInline: collapsed ? 16 : 24,
            gap: 14,
            color: "white",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <Avatar src={logo} size={collapsed ? 36 : 48} shape="square" />
          {!collapsed && (
            <div style={{ lineHeight: 1.2 }}>
              <Typography.Text style={{ color: "#e6f7ff", fontWeight: 600, fontSize: 16 }}>
                SIS Prenatal
              </Typography.Text>
              <Typography.Text style={{ display: "block", color: "rgba(255,255,255,0.65)", fontSize: 12 }}>
                Bienestar materno
              </Typography.Text>
            </div>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          items={menuItems}
          style={{ borderInlineEnd: "none", paddingBlock: 20, fontSize: 15 }}
        />
      </Sider>
      <Layout>
        <Header style={headerStyle}>
          <Space size={18} align="center">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              aria-label="Alternar menu"
              onClick={() => setCollapsed((prev) => !prev)}
            />
            <img src={logo} alt="SIS Prenatal" style={{ width: 40, height: 40, borderRadius: 8 }} />
            <div>
              <Typography.Title level={4} style={{ margin: 0 }}>
                Sistema de Gestion Materna
              </Typography.Title>
              <Typography.Text type="secondary">
                Cuidando cada etapa del embarazo
              </Typography.Text>
            </div>
          </Space>
          <Space size={12} align="center">
            <Tooltip title="Mi perfil">
              <Button
                type="text"
                icon={<UserOutlined />}
                onClick={() => navigate("/perfil")}
                aria-label="Perfil"
              />
            </Tooltip>
            <Tooltip title="Notificaciones">
              <Button type="text" icon={<BellOutlined />} aria-label="Notificaciones" />
            </Tooltip>
            <Tooltip title="Configuracion">
              <Button
                type="text"
                icon={<SettingOutlined />}
                aria-label="Configuracion"
                onClick={() => navigate("/configuracion")}
                disabled={!hasPermission("config.access" as never)}
              />
            </Tooltip>
            <Tooltip title="Cerrar sesion">
              <Button type="primary" icon={<LogoutOutlined />} onClick={() => { void logout(); }}>
                Salir
              </Button>
            </Tooltip>
          </Space>
        </Header>
        <Content style={contentWrapperStyle}>
          <div style={contentStyle}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
