import { Avatar, Card, Col, Descriptions, Row, Space, Typography } from "antd";
import useAuth from "../hooks/useAuth";

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      <Typography.Title level={3} style={{ margin: 0 }}>
        Mi perfil
      </Typography.Title>
      <Row gutter={[24, 24]}>
        <Col xs={24} md={10}>
          <Card>
            <Space direction="vertical" align="center" style={{ width: "100%" }}>
              <Avatar size={96}>
                {user?.nombre?.charAt(0).toUpperCase() ?? "U"}
              </Avatar>
              <Typography.Title level={4} style={{ margin: 0 }}>
                {user?.nombre ?? "Usuario"}
              </Typography.Title>
              <Typography.Text type="secondary">Rol: {user?.rol ?? "N/A"}</Typography.Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={14}>
          <Card title="Datos basicos">
            <Descriptions column={1} labelStyle={{ fontWeight: 600 }}>
              <Descriptions.Item label="Nombre completo">
                {user?.nombre ?? "Sin registrar"}
              </Descriptions.Item>
              <Descriptions.Item label="Rol">
                {user?.rol ?? "Sin rol"}
              </Descriptions.Item>
              <Descriptions.Item label="Correo">
                usuario@sisprenatal.pe
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </Space>
  );
};

export default ProfilePage;
