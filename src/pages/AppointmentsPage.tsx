import React from "react";
import { PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
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
  TimePicker,
  AutoComplete,
  ConfigProvider,
} from "antd";
import esES from "antd/locale/es_ES";
import dayjs from "dayjs";
import "dayjs/locale/es";
dayjs.locale("es");
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useCitasHoy } from "../hooks/queries/citas/useCitasHoy";
import { useCitasProximas } from "../hooks/queries/citas/useCitasProximas";
import { useCitasHistoricas } from "../hooks/queries/citas/useCitasHistoricas";
import { useCitasActivas } from "../hooks/queries/citas/useCitasActivas";
import { ESPECIALIDADES_VALIDAS, listMedicos } from "../services/medicos.service";
import {
  buscarPacientePorIdentificacion,
  TipoIdentificacion,
} from "../services/paciente.service";
import { crearCita, CitaItem, actualizarCita } from "../services/citas.service";
import type { CitasList } from "../services/citas.service";
import { usePaciente } from "../hooks/queries/usePaciente";

const AppointmentsPage = () => {
  const queryClient = useQueryClient();
  const STATUS_LABEL: Record<"scheduled" | "completed" | "cancelled", string> = {
    scheduled: "Programada",
    completed: "Completada",
    cancelled: "Cancelada",
  };
  const STATUS_COLOR: Record<"scheduled" | "completed" | "cancelled", string> = {
    scheduled: "blue",
    completed: "green",
    cancelled: "red",
  };
  const TITULOS_CITA = [
    "Consulta Prenatal",
    "Seguimiento Prenatal",
    "Control Prenatal",
    "Evaluación Prenatal",
    "Primera Cita Prenatal",
    "Cita Médica de Embarazo",
    "Citas del Primer Trimestre",
    "Seguimiento del Segundo Trimestre",
    "Revisiones del Tercer Trimestre",
    "Cita de la Semana 36",
    "Plan de Parto y Opciones de Parto",
    "Pruebas y Análisis Prenatales",
    "Asesoramiento sobre Nutrición y Ejercicio",
    "Salud y Bienestar en el Embarazo",
    "Riesgos y Complicaciones del Embarazo",
    "Citas para el Desarrollo del Bebé",
    "Control de Peso y Presión Arterial",
  ];

  // ---- Estado UI (modal, formularios, búsqueda paciente, import range)
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [form] = Form.useForm();
  const [pacienteEncontrado, setPacienteEncontrado] = React.useState<null | { id: string; nombre: string }>(null);
  const [buscandoPaciente, setBuscandoPaciente] = React.useState(false);
  const [tipoIdent, setTipoIdent] = React.useState<TipoIdentificacion>("CI");
  const [numeroIdent, setNumeroIdent] = React.useState<string>("");
  const [especialidad, setEspecialidad] = React.useState<string | undefined>(undefined);
  const [medicoId, setMedicoId] = React.useState<string | undefined>(undefined);
  const [fechaSeleccionada, setFechaSeleccionada] = React.useState<dayjs.Dayjs | null>(null);
  // búsqueda local de citas
  const [search, setSearch] = React.useState("");
  // detalle / edición
  const [citaSeleccionada, setCitaSeleccionada] = React.useState<CitaItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [editForm] = Form.useForm();
  const [editEspecialidad, setEditEspecialidad] = React.useState<string | undefined>(undefined);
  const [editMedicoId, setEditMedicoId] = React.useState<string | undefined>(undefined);
  const [editFechaSeleccionada, setEditFechaSeleccionada] = React.useState<dayjs.Dayjs | null>(null);

  // ---- Médicos por especialidad
  const { data: medicosResp } = useQuery({
    queryKey: ["medicos", { especialidad }],
    queryFn: () => listMedicos({ estado: "activo", especialidad, limit: 200, page: 1 }),
    enabled: !!especialidad,
  });
  const { data: editMedicosResp } = useQuery({
    queryKey: ["medicos", { especialidad: editEspecialidad, mode: "edit" }],
    queryFn: () => listMedicos({ estado: "activo", especialidad: editEspecialidad, limit: 200, page: 1 }),
    enabled: !!editEspecialidad,
  });

  // ---- Citas (independientes)
  const { data: hoy, isLoading: loadingHoy, isError: errorHoy } = useCitasHoy(100);
  const { data: proximas, isLoading: loadingProximas, isError: errorProximas } = useCitasProximas(7, 200);
  const { data: historicas, isLoading: loadingHistoricas, isError: errorHistoricas } = useCitasHistoricas(undefined, undefined, 200);
  // Citas activas del día escogido (para bloquear solapes); filtraremos por doctor en cliente
  const ymd = fechaSeleccionada ? fechaSeleccionada.format("YYYY-MM-DD") : undefined;
  const { data: activasDelDia } = useCitasActivas(ymd, ymd, 500, { enabled: !!ymd });

  const getSelectedProviderName = React.useCallback(() => {
    const medicos = medicosResp?.data || [];
    return medicos.find((m) => m._id === medicoId)?.nombre_completo || undefined;
  }, [medicosResp, medicoId]);

  const computeDisabledMinutes = React.useCallback(
    (hour: number): number[] => {
      const provider = getSelectedProviderName();
      if (!provider || !fechaSeleccionada) return [];
      const citas = activasDelDia?.items || [];
      // Considerar slots de 30 min
      const slots = [0, 30];
      const disabled: number[] = [];
      for (const m of slots) {
        const slotStart = fechaSeleccionada.hour(hour).minute(m).second(0).millisecond(0);
        const slotEnd = slotStart.add(30, "minute");
        const overlaps = citas.some((c) => {
          if (c.provider !== provider) return false;
          const cStart = dayjs(c.start_at);
          const cEnd = c.end_at ? dayjs(c.end_at) : dayjs(c.start_at).add(30, "minute");
          return cStart.isBefore(slotEnd) && cEnd.isAfter(slotStart);
        });
        if (overlaps) disabled.push(m);
      }
      return disabled;
    },
    [activasDelDia, fechaSeleccionada, getSelectedProviderName]
  );

  const disabledTimeCreate = React.useCallback(
    () => ({
      disabledHours: () => [],
      disabledMinutes: (hour: number) => computeDisabledMinutes(hour),
    }),
    [computeDisabledMinutes]
  );

  // ---- Paciente para modal de detalle
  const detallePacId = citaSeleccionada?.paciente_id || "";
  const { data: detallePaciente } = usePaciente(detallePacId, { enabled: !!detallePacId && isDetailOpen });

  // Activas del día para edición (excluyendo la propia cita luego al calcular)
  const editYmd = editFechaSeleccionada ? editFechaSeleccionada.format("YYYY-MM-DD") : undefined;
  const { data: activasEditDia } = useCitasActivas(editYmd, editYmd, 500, { enabled: !!editYmd });

  const getEditProviderName = React.useCallback(() => {
    const medicos = editMedicosResp?.data || [];
    return medicos.find((m) => m._id === editMedicoId)?.nombre_completo || citaSeleccionada?.provider || undefined;
  }, [editMedicosResp, editMedicoId, citaSeleccionada]);

  const computeDisabledMinutesEdit = React.useCallback(
    (hour: number): number[] => {
      const provider = getEditProviderName();
      if (!provider || !editFechaSeleccionada) return [];
      const citas = activasEditDia?.items || [];
      const slots = [0, 30];
      const disabled: number[] = [];
      for (const m of slots) {
        const slotStart = editFechaSeleccionada.hour(hour).minute(m).second(0).millisecond(0);
        const slotEnd = slotStart.add(30, "minute");
        const overlaps = citas.some((c) => {
          if (c.id === citaSeleccionada?.id) return false; // excluir la misma
          if (c.provider !== provider) return false;
          const cStart = dayjs(c.start_at);
          const cEnd = c.end_at ? dayjs(c.end_at) : dayjs(c.start_at).add(30, "minute");
          return cStart.isBefore(slotEnd) && cEnd.isAfter(slotStart);
        });
        if (overlaps) disabled.push(m);
      }
      return disabled;
    },
    [activasEditDia, editFechaSeleccionada, getEditProviderName, citaSeleccionada]
  );

  const disabledTimeEdit = React.useCallback(
    () => ({
      disabledHours: () => [],
      disabledMinutes: (hour: number) => computeDisabledMinutesEdit(hour),
    }),
    [computeDisabledMinutesEdit]
  );

  // (Google Calendar eliminado)

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
      <Card
        type="inner"
        title={header}
        extra={<Tag color={STATUS_COLOR[cita.status]}>{STATUS_LABEL[cita.status]}</Tag>}
        onClick={() => {
          setCitaSeleccionada(cita);
          setIsDetailOpen(true);
        }}
        style={{ cursor: "pointer" }}
      >
        {/* Oculto: ya no se muestra el lugar */}
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
        <Col>
          <Input.Search
            placeholder="Buscar cita (paciente, título, doctor)"
            allowClear
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 340 }}
          />
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
                {hoy.items
                  .filter((c) => {
                    const q = search.trim().toLowerCase();
                    if (!q) return true;
                    const pac = c.paciente_id || "";
                    const title = c.title || "";
                    const provider = c.provider || "";
                    // nombre de paciente se resuelve lazy; filtra por título/provider
                    return (
                      title.toLowerCase().includes(q) || provider.toLowerCase().includes(q) || pac.toLowerCase() === q
                    );
                  })
                  .map((cita) => (
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
                {proximas.items
                  .filter((c) => {
                    const q = search.trim().toLowerCase();
                    if (!q) return true;
                    const title = c.title || "";
                    const provider = c.provider || "";
                    return title.toLowerCase().includes(q) || provider.toLowerCase().includes(q);
                  })
                  .map((cita) => (
                  <AppointmentItemCard key={cita.id} cita={cita} showDate />
                ))}
              </Space>
            ) : (
              <Empty description="Sin citas registradas para la próxima semana" imageStyle={{ height: 120 }} />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24}>
          <Card title="Citas completadas / históricas" extra={<Tag color="default">{historicas?.total ?? 0}</Tag>}>
            {loadingHistoricas ? (
              <Skeleton active paragraph={{ rows: 3 }} />
            ) : errorHistoricas ? (
              <Empty description="No se pudo cargar" />
            ) : historicas && historicas.items.length > 0 ? (
              <Space direction="vertical" style={{ width: "100%" }}>
                {historicas.items
                  .filter((c) => {
                    const q = search.trim().toLowerCase();
                    if (!q) return true;
                    const title = c.title || "";
                    const provider = c.provider || "";
                    return title.toLowerCase().includes(q) || provider.toLowerCase().includes(q);
                  })
                  .map((cita) => (
                    <AppointmentItemCard key={cita.id} cita={cita} showDate />
                  ))}
              </Space>
            ) : (
              <Empty description="No hay citas históricas" />
            )}
          </Card>
        </Col>
      </Row>

      {/* (Sin sección de Google Calendar) */}

      {/* Modal Nueva Cita */}
      <Modal
        open={isModalOpen}
        title="Nueva cita"
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText="Crear"
        destroyOnClose
      >
        <ConfigProvider locale={esES}>
        <Form
          layout="vertical"
          form={form}
          onFinish={async (values) => {
            try {
              if (!pacienteEncontrado?.id) {
                message.warning("Busca y selecciona un paciente");
                return;
              }
              // combinar fecha y hora
              const fecha = values.fecha as dayjs.Dayjs | undefined;
              const hora = values.hora as dayjs.Dayjs | undefined;
              if (!fecha || !hora) {
                message.warning("Selecciona fecha y hora");
                return;
              }
              const start_at: string = fecha
                .hour(hora.hour())
                .minute(hora.minute())
                .second(0)
                .millisecond(0)
                .toDate()
                .toISOString();

              // mapear doctor seleccionado a provider (texto)
              const medicos = medicosResp?.data || [];
              const providerName = medicos.find((m) => m._id === medicoId)?.nombre_completo || null;
              if (!providerName) {
                message.warning("Selecciona el doctor");
                return;
              }

              const created = await crearCita({
                paciente_id: pacienteEncontrado.id,
                start_at,
                title: values.title || null,
                description: values.description || null,
                provider: providerName,
                status: (values.status as any) || undefined,
              });

              message.success("Cita creada");
              setIsModalOpen(false);
              form.resetFields();
              setPacienteEncontrado(null);
              void queryClient.invalidateQueries({ queryKey: ["citas"] });
            } catch (e: any) {
              const msg = e?.message || "No se pudo crear la cita";
              if (/conflicto/i.test(msg)) {
                message.warning(`${msg}. Se actualizaron los horarios.`);
                void queryClient.invalidateQueries({ queryKey: ["citas"] });
              } else {
                message.error(msg);
              }
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
            <AutoComplete
              placeholder="Escribe o selecciona el motivo de la cita"
              allowClear
              options={TITULOS_CITA.map((t) => ({ label: t, value: t }))}
              filterOption={(inputValue, option) =>
                (option?.value as string).toLowerCase().includes(inputValue.toLowerCase())
              }
            />
          </Form.Item>
          <Form.Item name="status" label="Estado" initialValue="scheduled">
            <Select
              options={[
                { label: "Programada", value: "scheduled" },
                { label: "Completada", value: "completed" },
                { label: "Cancelada", value: "cancelled" },
              ]}
            />
          </Form.Item>
          <Form.Item label="Especialidad">
            <Select
              placeholder="Selecciona especialidad"
              allowClear
              value={especialidad}
              options={ESPECIALIDADES_VALIDAS.map((e) => ({ label: e, value: e }))}
              onChange={(val) => {
                setEspecialidad(val);
                setMedicoId(undefined);
              }}
            />
          </Form.Item>
          <Form.Item label="Doctor">
            <Select
              placeholder={especialidad ? "Selecciona doctor" : "Primero elige especialidad"}
              disabled={!especialidad}
              value={medicoId}
              onChange={(val) => setMedicoId(val)}
              loading={!!especialidad && !medicosResp}
              options={(medicosResp?.data || []).map((m) => ({ value: m._id, label: m.nombre_completo }))}
            />
          </Form.Item>
          <Form.Item name="description" label="Observación">
            <Input.TextArea rows={3} placeholder="Notas u observaciones" />
          </Form.Item>
          <Form.Item name="fecha" label="Fecha" rules={[{ required: true, message: "Selecciona la fecha" }]}>
            <DatePicker style={{ width: "100%" }} onChange={(d) => setFechaSeleccionada(d)} />
          </Form.Item>
          <Form.Item name="hora" label="Hora" rules={[{ required: true, message: "Selecciona la hora" }]}>
            <TimePicker use12Hours format="hh:mm a" minuteStep={30} style={{ width: "100%" }} disabledTime={disabledTimeCreate} />
          </Form.Item>
        </Form>
        </ConfigProvider>
      </Modal>

      {/* Modal Detalle Cita */}
      <Modal
        open={isDetailOpen}
        title="Detalle de la cita"
        onCancel={() => setIsDetailOpen(false)}
        footer={null}
        destroyOnClose
      >
        {citaSeleccionada ? (
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <Typography.Title level={5} style={{ margin: 0 }}>
              {renderTitulo(citaSeleccionada.title, citaSeleccionada.provider)}
            </Typography.Title>
            <Space direction="vertical" size={0}>
              <Typography.Text>
                Paciente: {detallePaciente ? `${detallePaciente.paciente.nombre} ${detallePaciente.paciente.apellido}`.trim() : "-"}
              </Typography.Text>
              <Typography.Text>
                Identificación: {detallePaciente ? `${detallePaciente.paciente.tipo_identificacion} ${detallePaciente.paciente.numero_identificacion}` : "-"}
              </Typography.Text>
              <Typography.Text>
                Doctor: {citaSeleccionada.provider || "-"}
              </Typography.Text>
            </Space>
            <Typography.Text>
              Fecha: {dayjs(citaSeleccionada.start_at).format("DD/MM/YYYY")} — Hora: {dayjs(citaSeleccionada.start_at).format("hh:mm a")}
            </Typography.Text>
            <Space align="center">
              <Typography.Text>Estado:</Typography.Text>
              <Tag color={STATUS_COLOR[citaSeleccionada.status]}>
                {STATUS_LABEL[citaSeleccionada.status] || citaSeleccionada.status}
              </Tag>
            </Space>
            <Typography.Text>Descripción: {citaSeleccionada.description || "-"}</Typography.Text>
            <Space direction="vertical" size={0}>
              {citaSeleccionada.created_at ? (
                <Typography.Text type="secondary">
                  Creada: {dayjs(citaSeleccionada.created_at).format("DD/MM/YYYY HH:mm")}
                </Typography.Text>
              ) : null}
              {citaSeleccionada.updated_at ? (
                <Typography.Text type="secondary">
                  Actualizada: {dayjs(citaSeleccionada.updated_at).format("DD/MM/YYYY HH:mm")}
                </Typography.Text>
              ) : null}
            </Space>
            <Space>
              <Button
                onClick={() => {
                  setIsDetailOpen(false);
                  // preparar edición
                  setIsEditOpen(true);
                  editForm.setFieldsValue({
                    title: citaSeleccionada.title || undefined,
                    status: citaSeleccionada.status,
                    description: citaSeleccionada.description || undefined,
                    fecha: dayjs(citaSeleccionada.start_at),
                    hora: dayjs(citaSeleccionada.start_at),
                  });
                  setEditEspecialidad(undefined);
                  setEditMedicoId(undefined);
                  setEditFechaSeleccionada(dayjs(citaSeleccionada.start_at));
                }}
              >
                Editar
              </Button>
              {citaSeleccionada.status === "scheduled" && (
                <Button
                  danger
                  onClick={async () => {
                    Modal.confirm({
                      title: "Cancelar cita",
                      content: "La cita se marcará como cancelada y se moverá a históricas.",
                      okText: "Cancelar cita",
                      okButtonProps: { danger: true },
                      cancelText: "Volver",
                      onOk: async () => {
                        try {
                          await actualizarCita(citaSeleccionada.id, {
                            status: "cancelled",
                            if_unmodified_since: citaSeleccionada.updated_at,
                          } as any);
                          message.success("Cita cancelada");
                          const removedId = citaSeleccionada.id;
                          // Limpieza optimista de todas las caches 'citas'
                          const caches = queryClient.getQueriesData<CitasList>({
                            predicate: (q: any) => Array.isArray(q.queryKey) && q.queryKey[0] === "citas",
                          });
                          caches.forEach(([key, data]) => {
                            if (!data) return;
                            const before = data.items.length;
                            const items = data.items.filter((it) => it.id !== removedId);
                            if (items.length !== before) {
                              queryClient.setQueryData(key, { ...data, items, total: Math.max((data.total || 0) - (before - items.length), 0) });
                            }
                          });
                          setIsDetailOpen(false);
                          setCitaSeleccionada(null);
                          await queryClient.invalidateQueries({
                            predicate: (q: any) => Array.isArray(q.queryKey) && q.queryKey[0] === "citas",
                          });
                          await queryClient.refetchQueries({
                            predicate: (q: any) => Array.isArray(q.queryKey) && q.queryKey[0] === "citas",
                          });
                        } catch (e: any) {
                          const msg = e?.message || "No se pudo cancelar la cita";
                          message.error(msg);
                        }
                      },
                    });
                  }}
                >
                  Cancelar
                </Button>
              )}
            </Space>
          </Space>
        ) : null}
      </Modal>

      {/* Modal Editar Cita */}
      <Modal
        open={isEditOpen}
        title="Editar cita"
        onCancel={() => setIsEditOpen(false)}
        onOk={() => editForm.submit()}
        okText="Guardar"
        destroyOnClose
      >
        <ConfigProvider locale={esES}>
          <Form
            layout="vertical"
            form={editForm}
            onFinish={async (values) => {
              if (!citaSeleccionada) return;
              try {
                const fecha = values.fecha as dayjs.Dayjs | undefined;
                const hora = values.hora as dayjs.Dayjs | undefined;
                let payload: any = {};
                if (fecha && hora) {
                  const start_at: string = fecha
                    .hour(hora.hour())
                    .minute(hora.minute())
                    .second(0)
                    .millisecond(0)
                    .toDate()
                    .toISOString();
                  payload.start_at = start_at;
                }
                if (typeof values.title !== "undefined") payload.title = values.title || null;
                if (typeof values.description !== "undefined") payload.description = values.description || null;
                if (typeof values.status !== "undefined") payload.status = values.status;
                // doctor seleccionado → provider
                const medicos = editMedicosResp?.data || [];
                const providerName = medicos.find((m) => m._id === editMedicoId)?.nombre_completo;
                if (providerName) payload.provider = providerName;

                // bloqueo optimista: solo guarda si no cambió en servidor
                if (citaSeleccionada.updated_at) {
                  payload.if_unmodified_since = citaSeleccionada.updated_at;
                }

                await actualizarCita(citaSeleccionada.id, payload);
                message.success("Cita actualizada");
                setIsEditOpen(false);
                setCitaSeleccionada(null);
                void queryClient.invalidateQueries({ queryKey: ["citas"] });
              } catch (e: any) {
                const msg = e?.message || "No se pudo actualizar";
                if (/conflicto/i.test(msg)) {
                  message.warning(`${msg}. Se recargó la agenda; revisa cambios y vuelve a intentar.`);
                  void queryClient.invalidateQueries({ queryKey: ["citas"] });
                } else {
                  message.error(msg);
                }
              }
            }}
          >
            <Form.Item name="title" label="Título">
              <AutoComplete
                placeholder="Escribe o selecciona el motivo de la cita"
                allowClear
                options={TITULOS_CITA.map((t) => ({ label: t, value: t }))}
                filterOption={(inputValue, option) =>
                  (option?.value as string).toLowerCase().includes(inputValue.toLowerCase())
                }
              />
            </Form.Item>
            <Form.Item name="status" label="Estado">
              <Select
                options={[
                  { label: "Programada", value: "scheduled" },
                  { label: "Completada", value: "completed" },
                  { label: "Cancelada", value: "cancelled" },
                ]}
              />
            </Form.Item>
            <Typography.Text type="secondary">
              Doctor actual: {citaSeleccionada?.provider || "-"}
            </Typography.Text>
            <Form.Item label="Especialidad (opcional)">
              <Select
                placeholder="Selecciona especialidad"
                allowClear
                value={editEspecialidad}
                options={ESPECIALIDADES_VALIDAS.map((e) => ({ label: e, value: e }))}
                onChange={(val) => {
                  setEditEspecialidad(val);
                  setEditMedicoId(undefined);
                }}
              />
            </Form.Item>
            <Form.Item label="Doctor (opcional)">
              <Select
                placeholder={editEspecialidad ? "Selecciona doctor" : "Primero elige especialidad"}
                disabled={!editEspecialidad}
                value={editMedicoId}
                onChange={(val) => setEditMedicoId(val)}
                loading={!!editEspecialidad && !editMedicosResp}
                options={(editMedicosResp?.data || []).map((m) => ({ value: m._id, label: m.nombre_completo }))}
              />
            </Form.Item>
            <Form.Item name="description" label="Observación">
              <Input.TextArea rows={3} placeholder="Notas u observaciones" />
            </Form.Item>
            <Form.Item name="fecha" label="Fecha">
              <DatePicker style={{ width: "100%" }} onChange={(d) => setEditFechaSeleccionada(d)} />
            </Form.Item>
            <Form.Item name="hora" label="Hora">
              <TimePicker use12Hours format="hh:mm a" minuteStep={30} style={{ width: "100%" }} disabledTime={disabledTimeEdit} />
            </Form.Item>
          </Form>
        </ConfigProvider>
      </Modal>
    </Space>
  );
};

export default AppointmentsPage;
