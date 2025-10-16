import { Card, Divider, Form, Input, Switch, Typography } from "antd";

const SettingsPage = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <Typography.Title level={3} style={{ margin: 0 }}>
          Configuracion del sistema
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
          Personaliza la experiencia de los usuarios y las alertas de seguimiento.
        </Typography.Paragraph>
      </div>
      <Card title="Notificaciones">
        <Form layout="vertical">
          <Form.Item label="Correo principal">
            <Input placeholder="contacto@sisprenatal.pe" />
          </Form.Item>
          <Form.Item label="Alertas automaticas">
            <Switch defaultChecked />
          </Form.Item>
        </Form>
      </Card>
      <Card title="Integraciones">
        <Typography.Text type="secondary">
          Conecta sistemas externos para sincronizar agendas y compartir datos.
        </Typography.Text>
        <Divider />
        <Form layout="vertical">
          <Form.Item label="Token de integración">
            <Input.Password placeholder="••••••" />
          </Form.Item>
          <Form.Item label="Webhook de eventos">
            <Input placeholder="https://" />
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default SettingsPage;
