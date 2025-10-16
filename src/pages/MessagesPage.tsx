import { CheckOutlined, MessageOutlined, SendOutlined } from "@ant-design/icons";
import { App as AntdApp, Badge, Button, Card, Col, DatePicker, Form, Input, List, Modal, Popconfirm, Row, Segmented, Select, Space, Tag, Typography, message } from "antd";
import { useMemo, useState } from "react";
import { keepPreviousData } from "@tanstack/react-query";
import Can from "../components/auth/Can";
import { PERMISSIONS } from "../config/permissions";
import { useMensajes } from "../hooks/queries/mensajes/useMensajes";
import { mensajesQueryKey } from "../hooks/queries/mensajes/useMensajes";
import { useCreateMensaje } from "../hooks/queries/mensajes/useCreateMensaje";
import { useMarcarLeido } from "../hooks/queries/mensajes/useMarcarLeido";
import { useUpdateMensaje } from "../hooks/queries/mensajes/useUpdateMensaje";
import { useDeleteMensaje } from "../hooks/queries/mensajes/useDeleteMensaje";
import type { MensajeItem } from "../services/mensajes.service";
import dayjs from "dayjs";

const MessagesPage = () => {
  const [pacienteId, setPacienteId] = useState<string>("");
  const [filterMode, setFilterMode] = useState<
    "id" | "identificacion" | "expediente" | "nombre_apellido" | "texto"
  >("id");
  const [tipoIdent, setTipoIdent] = useState<"CI" | "PSP" | "NSS" | "LC" | undefined>(undefined);
  const [numeroIdent, setNumeroIdent] = useState<string>("");
  const [codigoExp, setCodigoExp] = useState<string>("");
  const [nombre, setNombre] = useState<string>("");
  const [apellido, setApellido] = useState<string>("");
  const [q, setQ] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const { message: messageApi, notification } = AntdApp.useApp();

  const params = useMemo(() => ({
    tipo_identificacion: filterMode === "identificacion" ? tipoIdent : undefined,
    numero_identificacion: filterMode === "identificacion" && numeroIdent ? numeroIdent : undefined,
    codigo_expediente: filterMode === "expediente" && codigoExp ? codigoExp : undefined,
    nombre: filterMode === "nombre_apellido" && nombre ? nombre : undefined,
    apellido: filterMode === "nombre_apellido" && apellido ? apellido : undefined,
    q: filterMode === "texto" && q ? q : undefined,
    page,
    per_page: perPage,
  }), [filterMode, pacienteId, tipoIdent, numeroIdent, codigoExp, nombre, apellido, q, page, perPage]);

  const { data, error, isFetching, refetch } = useMensajes(params, {
    placeholderData: keepPreviousData,
    enabled: false,
  });

  const SEND_MSG_KEY = "send-message";
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [editing, setEditing] = useState<{ open: boolean; item: MensajeItem | null }>({ open: false, item: null });

  const crearMensajeMutation = useCreateMensaje(params, {
    onSuccess: () => {
      messageApi.success({ content: "Mensaje enviado", key: SEND_MSG_KEY, duration: 2 });
      notification.success({ message: "Mensaje enviado", placement: "bottomRight" });
      // Limpia los campos del contenido del mensaje
      form.resetFields(["title", "description", "scheduled_at"]);
    },
    onError: (err) => {
      messageApi.error({ content: err.message || "No se pudo enviar el mensaje", key: SEND_MSG_KEY });
    },
  });

  const marcarLeidoMutation = useMarcarLeido(mensajesQueryKey(params) as unknown as unknown[], {
    onSuccess: () => {
      messageApi.success("Marcado como leído");
    },
    onError: (err) => messageApi.error(err.message || "No se pudo marcar como leído"),
  });

  const updateMutation = useUpdateMensaje(mensajesQueryKey(params) as unknown as unknown[], {
    onSuccess: () => {
      messageApi.success("Mensaje actualizado");
      setEditing({ open: false, item: null });
      editForm.resetFields();
    },
    onError: (err) => messageApi.error(err.message || "No se pudo actualizar el mensaje"),
  });

  const deleteMutation = useDeleteMensaje(mensajesQueryKey(params) as unknown as unknown[], {
    onSuccess: () => messageApi.success("Mensaje eliminado"),
    onError: (err) => messageApi.error(err.message || "No se pudo eliminar el mensaje"),
  });

  const [hasSearched, setHasSearched] = useState(false);
  const handleBuscar = () => {
    setPage(1);
    setHasSearched(true);
    void refetch();
  };

  const total = data?.total ?? 0;
  const items = data?.items ?? [];

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      <Typography.Title level={3} style={{ margin: 0 }}>
        Mensajes y recordatorios
      </Typography.Title>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
        Lista y envía mensajes a tus pacientes. Filtra por paciente si lo deseas.
      </Typography.Paragraph>

      <Card title="Buscar / filtrar" style={{ marginTop: 8 }}>
        <Space direction="vertical" style={{ width: "100%" }} size={12}>
          <Segmented
            value={filterMode}
            onChange={(v) => setFilterMode(v as any)}
            options={[
              { label: "Identificación", value: "identificacion" },
              { label: "Expediente", value: "expediente" },
              { label: "Nombre+Apellido", value: "nombre_apellido" },
              { label: "Texto (q)", value: "texto" },
            ]}
          />
          {filterMode === "id" && (
            <Space.Compact style={{ width: "100%" }}>
              <Input
                placeholder="ID de paciente (ObjectId)"
                value={pacienteId}
                onChange={(e) => setPacienteId(e.target.value)}
              />
              <Button type="primary" onClick={handleBuscar} loading={isFetching}>Buscar</Button>
            </Space.Compact>
          )}
          {filterMode === "identificacion" && (
            <Space.Compact style={{ width: "100%" }}>
              <Select
                placeholder="Tipo"
                style={{ width: 140 }}
                value={tipoIdent}
                onChange={setTipoIdent}
                options={[
                  { label: "CI", value: "CI" },
                  { label: "PSP", value: "PSP" },
                  { label: "NSS", value: "NSS" },
                  { label: "LC", value: "LC" },
                ]}
              />
              <Input
                placeholder="Número"
                value={numeroIdent}
                onChange={(e) => setNumeroIdent(e.target.value)}
              />
              <Button type="primary" onClick={handleBuscar} loading={isFetching}>Buscar</Button>
            </Space.Compact>
          )}
          {filterMode === "expediente" && (
            <Space.Compact style={{ width: "100%" }}>
              <Input placeholder="Código de expediente" value={codigoExp} onChange={(e) => setCodigoExp(e.target.value)} />
              <Button type="primary" onClick={handleBuscar} loading={isFetching}>Buscar</Button>
            </Space.Compact>
          )}
          {filterMode === "nombre_apellido" && (
            <Space.Compact style={{ width: "100%" }}>
              <Input placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
              <Input placeholder="Apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} />
              <Button type="primary" onClick={handleBuscar} loading={isFetching}>Buscar</Button>
            </Space.Compact>
          )}
          {filterMode === "texto" && (
            <Space.Compact style={{ width: "100%" }}>
              <Input placeholder="Texto de búsqueda (q)" value={q} onChange={(e) => setQ(e.target.value)} />
              <Button type="primary" onClick={handleBuscar} loading={isFetching}>Buscar</Button>
            </Space.Compact>
          )}
        </Space>
        {error && (
          <Typography.Text type="danger" style={{ display: "block", marginTop: 8 }}>
            {error.message}
          </Typography.Text>
        )}
      </Card>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={14}>
          <Card title="Bandeja de entrada" bordered={false}>
            {(!hasSearched || error) ? (
              <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
                Busca un paciente para mostrar su bandeja de entrada.
              </Typography.Paragraph>
            ) : (
            <List
              itemLayout="vertical"
              loading={isFetching}
              dataSource={items}
              pagination={{
                current: page,
                pageSize: perPage,
                total,
                onChange: (p, size) => {
                  setPage(p);
                  setPerPage(size ?? 10);
                },
                showTotal: (t) => `${t} mensajes`,
              }}
              renderItem={(item) => (
                <List.Item
                  key={item.id}
                  actions={[
                    <Typography.Text type="secondary" key="time">{item.time ?? dayjs(item.created_at).format("YYYY-MM-DD HH:mm")}</Typography.Text>,
                    <Can permission={PERMISSIONS.MENSAJES_MANAGE}>
                      <Space key="actions">
                        {!item.read && (
                          <Button
                            size="small"
                            type="link"
                            onClick={() => marcarLeidoMutation.mutate((item as any).id)}
                            loading={marcarLeidoMutation.isPending}
                          >
                            Marcar leído
                          </Button>
                        )}
                        <Button
                          size="small"
                          type="link"
                          onClick={() => {
                            setEditing({ open: true, item: item as any });
                            editForm.setFieldsValue({
                              title: (item as any).title ?? undefined,
                              description: (item as any).description,
                              type: (item as any).type,
                              scheduled_at: (item as any).scheduled_at ? dayjs((item as any).scheduled_at) : undefined,
                            });
                          }}
                        >
                          Editar
                        </Button>
                        <Popconfirm
                          title="Eliminar mensaje"
                          description="¿Seguro que deseas eliminar este mensaje?"
                          okText="Eliminar"
                          cancelText="Cancelar"
                          onConfirm={() => deleteMutation.mutate({ id: (item as any).id })}
                        >
                          <Button size="small" type="link" danger>Eliminar</Button>
                        </Popconfirm>
                      </Space>
                    </Can>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<MessageOutlined style={{ fontSize: 20, color: item.read ? "#8c8c8c" : "#1677ff" }} />}
                    title={
                      <Space>
                        <Typography.Text strong>{item.title || (item.description?.slice(0, 30) + (item.description?.length > 30 ? "…" : ""))}</Typography.Text>
                        <Tag color={item.type === "reminder" ? "gold" : "blue"}>{item.type}</Tag>
                        {!item.read && <Badge status="processing" text="No leído" />}
                      </Space>
                    }
                    description={item.description}
                  />
                  
                </List.Item>
              )}
            />
            )}
          </Card>
        </Col>
        <Col xs={24} md={10}>
          <Can permission={PERMISSIONS.MENSAJES_MANAGE}>
            <Card title="Mensaje rápido">
              <Form
                form={form}
                layout="vertical"
                onFinish={(values: any) => {
                  const scheduled = values.type === "reminder" && values.scheduled_at
                    ? (values.scheduled_at as dayjs.Dayjs).toISOString()
                    : undefined;
                  const payload = {
                    tipo_identificacion: values.tipo_identificacion || undefined,
                    numero_identificacion: (values.numero_identificacion || "").trim() || undefined,
                    codigo_expediente: (values.codigo_expediente || "").trim() || undefined,
                    nombre: (values.nombre || "").trim() || undefined,
                    apellido: (values.apellido || "").trim() || undefined,
                    q: (values.q || "").trim() || undefined,
                    title: (values.title || "").trim() || undefined,
                    description: (values.description || "").trim(),
                    type: values.type,
                    scheduled_at: scheduled,
                  } as const;
                  if (!payload.numero_identificacion && !payload.codigo_expediente && !(payload.nombre && payload.apellido) && !payload.q) {
                    message.error("Debes especificar un paciente , identificación, expediente, nombre+apellido o texto (q)");
                    return;
                  }
                  crearMensajeMutation.mutate(payload as any);
                }}
              >
                <Form.Item label="Identificación">
                  <Space.Compact style={{ width: "100%" }}>
                    <Form.Item name="tipo_identificacion" noStyle>
                      <Select placeholder="Tipo" style={{ width: 160 }} allowClear options={[
                        { label: "CI", value: "CI" },
                        { label: "PSP", value: "PSP" },
                        { label: "NSS", value: "NSS" },
                        { label: "LC", value: "LC" },
                      ]} />
                    </Form.Item>
                    <Form.Item name="numero_identificacion" noStyle>
                      <Input placeholder="Número" />
                    </Form.Item>
                  </Space.Compact>
                </Form.Item>
                <Form.Item label="Código de expediente" name="codigo_expediente">
                  <Input placeholder="Ej: EXP-0001" />
                </Form.Item>
                <Form.Item label="Nombre y apellido">
                  <Space.Compact style={{ width: "100%" }}>
                    <Form.Item name="nombre" noStyle>
                      <Input placeholder="Nombre" />
                    </Form.Item>
                    <Form.Item name="apellido" noStyle>
                      <Input placeholder="Apellido" />
                    </Form.Item>
                  </Space.Compact>
                </Form.Item>
                <Form.Item label="Texto (q)" name="q">
                  <Input placeholder="Texto de búsqueda para coincidencia única" />
                </Form.Item>
                <Form.Item label="Tipo" name="type" initialValue="message">
                  <Segmented
                    options={[
                      { label: "Mensaje", value: "message" },
                      { label: "Recordatorio", value: "reminder" },
                    ]}
                  />
                </Form.Item>
                <Form.Item label="Título" name="title">
                  <Input placeholder="Opcional" />
                </Form.Item>
                <Form.Item label="Contenido" name="description" rules={[{ required: true, message: "Escribe el mensaje" }]}>
                  <Input.TextArea rows={6} placeholder="Escribe tu mensaje" />
                </Form.Item>
                <Form.Item noStyle shouldUpdate>
                  {({ getFieldValue }) =>
                    getFieldValue("type") === "reminder" ? (
                      <Form.Item label="Programar para" name="scheduled_at" rules={[{ required: true, message: "Selecciona fecha y hora" }]}>
                        <DatePicker showTime style={{ width: "100%" }} />
                      </Form.Item>
                    ) : null
                  }
                </Form.Item>
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  htmlType="submit"
                  loading={crearMensajeMutation.isPending}
                  onClick={() => messageApi.loading({ content: "Enviando...", key: SEND_MSG_KEY })}
                >
                  Enviar
                </Button>
              </Form>
            </Card>
          </Can>
        </Col>
      </Row>
      <Modal
        title="Editar mensaje"
        open={editing.open}
        onCancel={() => {
          setEditing({ open: false, item: null });
          editForm.resetFields();
        }}
        onOk={() => editForm.submit()}
        okButtonProps={{ loading: updateMutation.isPending }}
        destroyOnClose
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={(values: any) => {
            if (!editing.item) return;
            const payload = {
              title: (values.title || "").trim() || null,
              description: (values.description || "").trim() || null,
              type: values.type,
              scheduled_at: values.type === "reminder" && values.scheduled_at
                ? (values.scheduled_at as dayjs.Dayjs).toISOString()
                : null,
            };
            updateMutation.mutate({ id: (editing.item as any).id, data: payload });
          }}
        >
          <Form.Item label="Título" name="title">
            <Input placeholder="Opcional" />
          </Form.Item>
          <Form.Item label="Contenido" name="description" rules={[{ required: true, message: "Escribe el mensaje" }]}>
            <Input.TextArea rows={5} placeholder="Escribe tu mensaje" />
          </Form.Item>
          <Form.Item label="Tipo" name="type" rules={[{ required: true }]}>
            <Segmented
              options={[
                { label: "Mensaje", value: "message" },
                { label: "Recordatorio", value: "reminder" },
              ]}
            />
          </Form.Item>
          <Form.Item noStyle shouldUpdate>
            {({ getFieldValue }) =>
              getFieldValue("type") === "reminder" ? (
                <Form.Item label="Programar para" name="scheduled_at">
                  <DatePicker showTime style={{ width: "100%" }} />
                </Form.Item>
              ) : null
            }
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
};

export default MessagesPage;
