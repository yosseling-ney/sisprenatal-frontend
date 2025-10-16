import React from "react";
import { Result, Button, Typography } from "antd";
import { useNavigate, useLocation } from "react-router-dom";

const { Paragraph, Text } = Typography;

const Forbidden403 = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const goHome = () => navigate("/", { replace: true });
  const goBack = () => navigate(-1);
  const goLogin = () =>
    navigate("/login", { state: { from: location.pathname }, replace: true });

  return (
    <div style={{ minHeight: "70vh", display: "grid", placeItems: "center", padding: 24 }}>
      <Result
        status="403"
        title="403"
        subTitle="No tienes permisos para acceder a esta página."
        extra={
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <Button onClick={goBack}>Volver</Button>
            <Button type="default" onClick={goHome}>Ir al inicio</Button>
            <Button type="primary" onClick={goLogin}>Iniciar sesión</Button>
          </div>
        }
      >
        <Paragraph style={{ marginTop: 16 }}>
          <Text type="secondary">
            Si crees que esto es un error, contacta al administrador o revisa tu rol en el sistema.
          </Text>
        </Paragraph>
      </Result>
    </div>
  );
};

export default Forbidden403;
