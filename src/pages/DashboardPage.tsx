import { ArrowUpOutlined, CalendarOutlined, HeartOutlined } from "@ant-design/icons";
import {
  Badge,
  Card,
  Col,
  Divider,
  List,
  Progress,
  Row,
  Space,
  Statistic,
  Tag,
  Typography,
} from "antd";
import { useMemo } from "react";
import heroImage from "../Imagenes/embarazo1.png";
import useAuth from "../hooks/useAuth";
import type { Role } from "../config/permissions";

const HERO_CONTENT: Record<Role, { title: string; message: string; highlights: string[] }> = {
  admin: {
    title: "Vision global del sistema",
    message: "Controla usuarios, citas y reportes para asegurar la continuidad del cuidado de cada gestante.",
    highlights: [
      "128 gestantes activas en seguimiento",
      "92% de citas completadas esta semana",
      "18 alertas criticas requieren revision",
    ],
  },
  medico: {
    title: "Agenda medica al dia",
    message: "Revisa historias clinicas, registra diagnosticos y coordina con el equipo de enfermeria.",
    highlights: [
      "6 controles programados hoy",
      "3 reportes pendientes de aprobacion",
      "Actualiza observaciones despues de cada consulta",
    ],
  },
  enfermera: {
    title: "Gestion de cuidados prenatales",
    message: "Registra nuevas gestantes, completa historias y mantén informadas a las familias.",
    highlights: [
      "4 historias clinicas por completar",
      "Recordatorios automaticos activos",
      "Agenda talleres educativos para las pacientes",
    ],
  },
  paciente: {
    title: "Tu bienestar es prioridad",
    message: "Consulta tu agenda, recibe mensajes del equipo y revisa tu historia clinica cuando lo necesites.",
    highlights: [
      "Tu proximo control es el martes 10:00 am",
      "Recuerda hidratarte y descansar lo suficiente",
      "Mantente en contacto ante cualquier sintoma",
    ],
  },
};

const STATS_BY_ROLE: Record<
  Role,
  { title: string; value: number; suffix?: string; subTitle?: string; color?: string }[]
> = {
  admin: [
    { title: "Usuarios activos", value: 64, suffix: " / 80", subTitle: "Equipos colaborando" },
    { title: "Pacientes monitoreadas", value: 128, suffix: " gestantes", color: "#4096ff" },
    { title: "Reportes generados", value: 45, suffix: " este mes" },
  ],
  medico: [
    { title: "Consultas de hoy", value: 6, suffix: " pacientes" },
    { title: "Informes pendientes", value: 3, suffix: " reportes" },
    { title: "Diagnosticos registrados", value: 24, suffix: " en septiembre" },
  ],
  enfermera: [
    { title: "Historias por completar", value: 4, suffix: " pacientes" },
    { title: "Recordatorios enviados", value: 18, suffix: " esta semana" },
    { title: "Citas coordinadas", value: 12, suffix: " proximas" },
  ],
  paciente: [
    { title: "Semanas de gestacion", value: 28, suffix: " semanas", color: "#52c41a" },
    { title: "Controles completados", value: 7, suffix: " de 10" },
    { title: "Mensajes recibidos", value: 2, suffix: " nuevos" },
  ],
};

const NEXT_ACTIONS: Record<Role, { title: string; description: string; status: string }[]> = {
  admin: [
    { title: "Revisar reportes semanales", description: "Consolida indicadores para la direccion.", status: "Pendiente" },
    { title: "Actualizar roles", description: "Asigna permisos al nuevo personal", status: "En progreso" },
  ],
  medico: [
    { title: "Control prenatal - Maria R.", description: "Revisar presion arterial y labs.", status: "09:00 am" },
    { title: "Validar informe trimestral", description: "Enviar a administracion.", status: "Hoy" },
  ],
  enfermera: [
    { title: "Registrar nueva paciente", description: "Historia inicial de Ana P.", status: "Urgente" },
    { title: "Seguimiento post consulta", description: "Llamar a Rosa para confirmar tratamiento.", status: "Programado" },
  ],
  paciente: [
    { title: "Control medico", description: "Consulta con Dr. Salazar", status: "Martes 10:00 am" },
    { title: "Charla de lactancia", description: "Centro materno, salon 3", status: "Viernes 16:00 pm" },
  ],
};

const CARE_INDEX: Record<Role, { label: string; percent: number; color: string }> = {
  admin: { label: "Cobertura de cuidados", percent: 82, color: "#4096ff" },
  medico: { label: "Plan de atencion actualizado", percent: 76, color: "#52c41a" },
  enfermera: { label: "Seguimiento de pacientes", percent: 88, color: "#faad14" },
  paciente: { label: "Bienestar general", percent: 90, color: "#65c1ff" },
};

const DashboardPage = () => {
  const { user } = useAuth();
  const role = (user?.rol ?? "paciente") as Role;

  const hero = useMemo(() => HERO_CONTENT[role] ?? HERO_CONTENT.paciente, [role]);
  const stats = useMemo(() => STATS_BY_ROLE[role] ?? STATS_BY_ROLE.paciente, [role]);
  const actions = useMemo(() => NEXT_ACTIONS[role] ?? NEXT_ACTIONS.paciente, [role]);
  const careIndex = useMemo(() => CARE_INDEX[role] ?? CARE_INDEX.paciente, [role]);

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      <Card
        bodyStyle={{ padding: 0 }}
        style={{
          background: "linear-gradient(135deg, #5f9df7 0%, #264b8c 100%)",
          border: "none",
          color: "#fff",
          overflow: "hidden",
        }}
      >
        <Row gutter={0} align="middle">
          <Col xs={24} md={14} style={{ padding: "32px" }}>
            <Tag color="gold" style={{ marginBottom: 16 }}>
              Rol: {role.toUpperCase()}
            </Tag>
            <Typography.Title level={2} style={{ color: "#fff", margin: 0 }}>
              {hero.title}
            </Typography.Title>
            <Typography.Paragraph style={{ color: "#e6f7ff", fontSize: 16 }}>
              {hero.message}
            </Typography.Paragraph>
            <List
              dataSource={hero.highlights}
              renderItem={(item) => (
                <List.Item style={{ border: "none", padding: 0 }}>
                  <Space size={12}>
                    <HeartOutlined style={{ color: "#ffd666" }} />
                    <Typography.Text style={{ color: "#f0f5ff" }}>{item}</Typography.Text>
                  </Space>
                </List.Item>
              )}
            />
          </Col>
          <Col xs={24} md={10} style={{ position: "relative" }}>
            <img
              src={heroImage}
              alt="Madre embarazada"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                maxHeight: 320,
              }}
            />
          </Col>
        </Row>
      </Card>

      <Row gutter={[24, 24]}>
        {stats.map((stat) => (
          <Col xs={24} md={8} key={stat.title}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                suffix={stat.suffix}
                valueStyle={{ color: stat.color ?? "#264b8c" }}
              />
              {stat.subTitle && (
                <Typography.Text type="secondary">{stat.subTitle}</Typography.Text>
              )}
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={14}>
          <Card title="Proximas acciones" extra={<CalendarOutlined /> }>
            <List
              itemLayout="horizontal"
              dataSource={actions}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.title}
                    description={item.description}
                  />
                  <Badge color="#4096ff" text={item.status} />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} md={10}>
          <Card>
            <Typography.Title level={4} style={{ marginTop: 0 }}>
              {careIndex.label}
            </Typography.Title>
            <Typography.Paragraph type="secondary">
              Indicador general basado en citas cumplidas, seguimientos y alertas atendidas.
            </Typography.Paragraph>
            <Progress
              percent={careIndex.percent}
              strokeColor={careIndex.color}
              trailColor="#dbe4fb"
              strokeWidth={12}
              showInfo
            />
            <Divider />
            <Space>
              <ArrowUpOutlined style={{ color: "#52c41a" }} />
              <Typography.Text type="secondary">
                +4% respecto a la semana pasada
              </Typography.Text>
            </Space>
          </Card>
        </Col>
      </Row>
    </Space>
  );
};

export default DashboardPage;
