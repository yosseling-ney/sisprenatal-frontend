import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, Typography, message } from "antd";
import { useState } from "react";
import useAuth from "../hooks/useAuth";

interface LoginFormValues {
  username: string;
  password: string;
}

const LoginPage = () => {
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFinish = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      await login(values);
      message.success("Sesion iniciada correctamente");
    } catch (error) {
      const fallback = error instanceof Error ? error.message : "Credenciales invalidas";
      message.error(fallback);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#f5f5f5",
        padding: 24,
      }}
    >
      <Card style={{ width: 360 }}>
        <Typography.Title level={3} style={{ textAlign: "center" }}>
          SIS Prenatal
        </Typography.Title>
        <Form<LoginFormValues> layout="vertical" onFinish={handleFinish} requiredMark={false}>
          <Form.Item
            name="username"
            label="Usuario"
            rules={[{ required: true, message: "Ingresa tu usuario" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="usuario" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Contrasena"
            rules={[{ required: true, message: "Ingresa tu Contrasena" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="********" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={isSubmitting}>
            Ingresar
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
