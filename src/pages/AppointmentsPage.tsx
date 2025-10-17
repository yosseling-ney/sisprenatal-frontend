import React from "react";
import { CalendarOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Row,
  Space,
  Tag,
  Typography,
  Skeleton,
  message,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
} from "antd";
import dayjs from "dayjs";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useCitasHoy } from "../hooks/queries/citas/useCitasHoy";
import { useCitasProximas } from "../hooks/queries/citas/useCitasProximas";
import {
  disconnectGoogle,
  startGoogleOAuth,
  getDefaultCalendar,
  listCalendars,
  setDefaultCalendar,
  importFromGoogle,
} from "../services/google.service";
import { useGoogleStatus } from "../hooks/queries/google/useGoogleStatus";
import {
  buscarPacientePorIdentificacion,
  TipoIdentificacion,
} from "../services/paciente.service";
import { crearCita, CitaItem } from "../services/citas.service";
import { usePaciente } from "../hooks/queries/usePaciente";

const AppointmentsPage = () => {
  const queryClient = useQueryClient();

  // ---- Estado UI (modal, formularios, búsqueda paciente, import range)
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [form] = Form.useForm();
  const [pacienteEncontrado, setPacienteEncontrado] = React.useState<null | { id: string; nombre: string }>(null);
  const [buscandoPaciente, setBuscandoPaciente] = React.useState(false);
  const [tipoIdent, setTipoIdent] = React.useState<TipoIdentificacion>("CI");
  const [numeroIdent, setNumeroIdent] = React.useState<string>("");
  const [importRange, setImportRange] = React.useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  // ---- Primero: estado de Google (para usarlo en enabled de las demás queries)
  const { data: googleStatus, isLoading: loadingGoogle } = useGoogleStatus();
  const googleConnected = !!googleStatus?.connected;

  // ---- Queries dependientes del estado de Google
  const { data: calendars } = useQuery({
    queryKey: ["integrations", "google", "calendars"],
    queryFn: listCalendars,
    enabled: googleConnected,
  });

  const { data: defaultCalendar } = useQuery({
    queryKey: ["integrations", "google", "calendar", "default"],
    queryFn: getDefaultCalendar,
    enabled: googleConnected,
  });

  // ---- Citas (independientes)
  const { data: hoy, isLoading: loadingHoy, isError: errorHoy } = useCitasHoy(100);
  const { data: proximas, isLoading: loadingProximas, isError: errorProximas } = useCitasProximas(7, 200);

  // ---- Acciones Google
  const handleConnectGoogle = async () => {
    try {
      const { auth_url } = await startGoogleOAuth();
      window.location.href = auth_url;
    } catch (e: any) {
      message.error(e?.message || "No se pudo iniciar la conexión con Google");
    }
  };

  const handleDisconnectGoogle = async () => {
    try {
      await disconnectGoogle();
      void queryClient.invalidateQueries({ queryKey: ["integrations", "google", "status"] });
      message.success("Integración desactivada");
    } catch (e: any) {
      message.error(e?.message || "No se pudo desconectar Google");
    }
  };

  // ---- Utilidades de render
  const renderHora = (iso?: string | null) => {
    if (!iso) return "";
    try {
      return dayjs(iso).format("HH:mm");
    } catch {
      return "";
    }
  };

  const renderTitulo = (title?: string | null, provider?: string | null) => {
    const parts: string[] = [];
    if (title) parts.push(title);
    if (provider) parts.push(`con ${provider}`);
    return parts.join(" - ") || "Cita";
  };

  // ---- Item de cita (resuelve nombre de paciente en background)
  const AppointmentItemCard = ({ cita, showDate }: { cita: CitaItem; showDate?: boolean }) => {
    const pacId = cita.paciente_id || undefined;
    const { data } = usePaciente(pacId ?? "", { enabled: !!pacId }); // asegura string cuando falta
    const pacName = data ? `${data.paciente.nombre} ${data.paciente.apellido}`.trim() : null;

    const when = showDate
      ? (cita.start_at ? dayjs(cita.start_at).format("DD/MM HH:mm") : "")
      : renderHora(cita.start_at);

    const tail = renderTitulo(cita.title, cita.provider);
    const header = [when, pacName, tail].filter(Boolean).join(" - ");

    return (
      <Card type="inner" title={header}>
        {cita.location ? <Typography.Text type="secondary">{cita.location}</Typography.Text> : null}
      </Card>
    );
  };

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      <Row justify="space-between" align="middle">
        <Col>
          <Typography.Title level={3} style={{ margin: 0 }}>
            Agenda de citas
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            Visualiza y administra los controles prenatales y visitas programadas.
          </Typography.Paragraph>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
            Nueva cita
          </Button>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Card title="Citas de hoy" extra={<Tag color="blue">{hoy?.total ?? 0} citas</Tag>}>
            {loadingHoy ? (
              <Skeleton active paragraph={{ rows: 3 }} />
            ) : errorHoy ? (
              <Empty description="No se pudo cargar" />
            ) : hoy && hoy.items.length > 0 ? (
              <Space direction="vertical" style={{ width: "100%" }}>
                {hoy.items.map((cita) => (
                  <AppointmentItemCard key={cita.id} cita={cita} />
                ))}
              </Space>
            ) : (
              <Empty description="Sin citas registradas para hoy" />
            )}
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Próximas citas" extra={<Tag>{proximas?.total ?? 0}</Tag>}>
            {loadingProximas ? (
              <Skeleton active paragraph={{ rows: 3 }} />
            ) : errorProximas ? (
              <Empty description="No se pudo cargar" />
            ) : proximas && proximas.items.length > 0 ? (
              <Space direction="vertical" style={{ width: "100%" }}>
                {proximas.items.map((cita) => (
                  <AppointmentItemCard key={cita.id} cita={cita} showDate />
                ))}
              </Space>
            ) : (
              <Empty description="Sin citas registradas para la próxima semana" imageStyle={{ height: 120 }} />
            )}
          </Card>
        </Col>
      </Row>

      <Divider />

      <Card>
        <Space align="center" style={{ justifyContent: "space-between", width: "100%" }}>
          <Space align="center">
            <CalendarOutlined style={{ fontSize: 28, color: "#1677ff" }} />
            <div>
              <Typography.Title level={4} style={{ margin: 0 }}>
                Sincroniza tu calendario
              </Typography.Title>
              <Typography.Text type="secondary">
                {loadingGoogle
                  ? "Verificando estado..."
                  : googleConnected
                  ? `Conectado${googleStatus?.email ? ` como ${googleStatus.email}` : ""}`
                  : "Conecta Google Calendar para recordatorios automáticos."}
              </Typography.Text>
            </div>
          </Space>

          <Space>
            {googleConnected ? (
              <>
                <Select
                  style={{ minWidth: 240 }}
                  placeholder="Selecciona calendario"
                  loading={!calendars}
                  value={defaultCalendar?.calendar_id || undefined}
                  onChange={async (val) => {
                    try {
                      await setDefaultCalendar(val);
                      void queryClient.invalidateQueries({ queryKey: ["integrations", "google", "calendar", "default"] });
                      message.success("Calendario actualizado");
                    } catch (e: any) {
                      message.error(e?.message || "No se pudo guardar el calendario");
                    }
                  }}
                  options={(calendars?.items || []).map((c) => ({ value: c.id, label: c.summary }))}
                />

                <DatePicker.RangePicker
                  showTime
                  placeholder={["Inicio", "Fin"]}
                  value={importRange as any}
                  onChange={(vals) => {
                    if (vals && vals[0] && vals[1]) {
                      setImportRange([vals[0], vals[1]] as any);
                    } else {
                      setImportRange(null);
                    }
                  }}
                />

                <Button
                  onClick={async () => {
                    try {
                      let start: string | undefined;
                      let end: string | undefined;
                      if (importRange) {
                        start = importRange[0].toDate().toISOString();
                        end = importRange[1].toDate().toISOString();
                      } else {
                        const now = new Date();
                        const in30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                        start = now.toISOString();
                        end = in30.toISOString();
                      }
                      await importFromGoogle({
                        calendar_id: defaultCalendar?.calendar_id || undefined,
                        start,
                        end,
                        create_missing: true,
                      });
                      message.success("Importación iniciada");
                      void queryClient.invalidateQueries({ queryKey: ["citas"] });
                    } catch (e: any) {
                      message.error(e?.message || "No se pudo importar");
                    }
                  }}
                >
                  Importar eventos
                </Button>

                <Button onClick={handleDisconnectGoogle}>Desconectar</Button>
              </>
            ) : (
              <Button type="primary" onClick={handleConnectGoogle} loading={loadingGoogle}>
                Conectar Google
              </Button>
            )}
          </Space>
        </Space>
      </Card>

      {/* Modal Nueva Cita */}
      <Modal
        open={isModalOpen}
        title="Nueva cita"
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText="Crear"
        destroyOnClose
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={async (values) => {
            try {
              if (!pacienteEncontrado?.id) {
                message.warning("Busca y selecciona un paciente");
                return;
              }
              const start_at: string = values.start_at?.toDate?.().toISOString?.() ?? "";
              const end_at: string | undefined = values.end_at ? values.end_at.toDate().toISOString() : undefined;

              await crearCita({
                paciente_id: pacienteEncontrado.id,
                start_at,
                end_at,
                title: values.title || null,
                description: values.description || null,
                provider: values.provider || null,
                location: values.location || null,
              });

              message.success("Cita creada");
              setIsModalOpen(false);
              form.resetFields();
              setPacienteEncontrado(null);
              void queryClient.invalidateQueries({ queryKey: ["citas"] });
            } catch (e: any) {
              message.error(e?.message || "No se pudo crear la cita");
            }
          }}
        >
          <Typography.Text strong>Paciente</Typography.Text>
          <Space.Compact block style={{ marginTop: 8, marginBottom: 8 }}>
            <Select
              style={{ width: 140 }}
              placeholder="Tipo"
              value={tipoIdent}
              options={[
                { value: "CI", label: "CI" },
                { value: "PSP", label: "PSP" },
                { value: "NSS", label: "NSS" },
                { value: "LC", label: "LC" },
              ]}
              onChange={(v) => setTipoIdent(v)}
            />
            <Input
              placeholder="N° identificación"
              value={numeroIdent}
              onChange={(e) => setNumeroIdent(e.target.value)}
            />
            <Button
              loading={buscandoPaciente}
              onClick={async () => {
                const numero = (numeroIdent || "").trim();
                if (!numero) {
                  message.warning("Ingresa el número de identificación");
                  return;
                }
                try {
                  setBuscandoPaciente(true);
                  const pac = await buscarPacientePorIdentificacion(tipoIdent || "CI", numero);
                  setPacienteEncontrado({ id: pac.id, nombre: `${pac.nombre} ${pac.apellido}`.trim() });
                  message.success("Paciente encontrado");
                } catch (e: any) {
                  setPacienteEncontrado(null);
                  message.error(e?.message || "Paciente no encontrado");
                } finally {
                  setBuscandoPaciente(false);
                }
              }}
            >
              Buscar
            </Button>
          </Space.Compact>

          {pacienteEncontrado ? (
            <Typography.Paragraph type="secondary">
              Seleccionado: {pacienteEncontrado.nombre}
            </Typography.Paragraph>
          ) : (
            <Typography.Paragraph type="secondary">Sin paciente seleccionado</Typography.Paragraph>
          )}

          <Form.Item name="title" label="Título">
            <Input placeholder="Motivo o título de la cita" />
          </Form.Item>
          <Form.Item name="provider" label="Profesional">
            <Input placeholder="Ej. Dra. Salazar" />
          </Form.Item>
          <Form.Item name="location" label="Lugar">
            <Input placeholder="Consultorio 2" />
          </Form.Item>
          <Form.Item name="description" label="Descripción">
            <Input.TextArea rows={3} placeholder="Notas u observaciones" />
          </Form.Item>
          <Form.Item
            name="start_at"
            label="Inicio"
            rules={[{ required: true, message: "Selecciona fecha y hora de inicio" }]}
          >
            <DatePicker showTime style={{ width: "100%" }} />
          </Form.Item>
            <Form.Item name="end_at" label="Fin (opcional)">
            <DatePicker showTime style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
};

export default AppointmentsPage;
