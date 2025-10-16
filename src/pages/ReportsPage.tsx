import { AreaChartOutlined, DownloadOutlined } from "@ant-design/icons";
import { Button, Card, Col, Progress, Row, Space, Statistic, Typography } from "antd";

const ReportsPage = () => {
  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      <Row justify="space-between" align="middle">
        <Col>
          <Typography.Title level={3} style={{ margin: 0 }}>
            Reportes del sistema
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            Analiza la evolucion de tus pacientes y descarga los indicadores clave.
          </Typography.Paragraph>
        </Col>
        <Col>
          <Button icon={<DownloadOutlined />}>Exportar todo</Button>
        </Col>
      </Row>
      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Pacientes activos" value={128} suffix="gestantes" />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Citas cumplidas" value={92} suffix="%" precision={0} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Alertas generadas" value={18} suffix="en seguimiento" />
          </Card>
        </Col>
      </Row>
      <Card title="Indicadores de riesgo">
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <Progress type="dashboard" percent={68} format={() => "Altas"} />
            <Typography.Paragraph align="center" style={{ marginTop: 12 }}>
              Pacientes con factores de riesgo controlados
            </Typography.Paragraph>
          </Col>
          <Col xs={24} md={8}>
            <Progress type="dashboard" percent={24} strokeColor="#faad14" format={() => "Medias"} />
            <Typography.Paragraph align="center" style={{ marginTop: 12 }}>
              Gestantes con seguimiento especial
            </Typography.Paragraph>
          </Col>
          <Col xs={24} md={8}>
            <Progress type="dashboard" percent={8} strokeColor="#ff4d4f" format={() => "Alertas"} />
            <Typography.Paragraph align="center" style={{ marginTop: 12 }}>
              Casos críticos a revisar
            </Typography.Paragraph>
          </Col>
        </Row>
      </Card>
      <Card>
        <Space align="center" size={16}>
          <AreaChartOutlined style={{ fontSize: 32, color: "#1677ff" }} />
          <div>
            <Typography.Title level={4} style={{ margin: 0 }}>
              Proximamente: panel avanzado
            </Typography.Title>
            <Typography.Text type="secondary">
              Integra Power BI o Looker Studio para compartir resultados en tiempo real.
            </Typography.Text>
          </div>
        </Space>
      </Card>
    </Space>
  );
};

export default ReportsPage;
