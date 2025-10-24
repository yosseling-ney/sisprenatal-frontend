import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Popconfirm,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import dayjs, { Dayjs } from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ESPECIALIDADES_VALIDAS,
  Medico,
  MedicoEstado,
  MedicoSexo,
  createMedico,
  listMedicos,
  updateMedico,
  deleteMedico,
} from "../services/medicos.service";

const SEXO_OPTIONS: { label: string; value: MedicoSexo }[] = [
  { label: "Femenino", value: "femenino" },
  { label: "Masculino", value: "masculino" },
  { label: "Otro", value: "otro" },
  { label: "No especificado", value: "no_especificado" },
];

const ESTADO_OPTIONS: { label: string; value: MedicoEstado }[] = [
  { label: "Activo", value: "activo" },
  { label: "Inactivo", value: "inactivo" },
];

type CreateFormValues = {
  folio?: string;
  nombre_completo: string;
  cedula: string;
  especialidad: string;
  subespecialidad?: string;
  sexo: MedicoSexo;
  fecha_nacimiento?: Dayjs;
  telefono?: string;
  correo?: string;
  observaciones?: string;
};

const MedicosPage = () => {
  const [data, setData] = useState<Medico[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // server params
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState<MedicoEstado | undefined>(undefined);
  const [sexo, setSexo] = useState<MedicoSexo | undefined>(undefined);
  const [especialidad, setEspecialidad] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sort, setSort] = useState<
    | "updated_at"
    | "-updated_at"
    | "nombre_completo"
    | "-nombre_completo"
    | "fecha_nacimiento"
    | "-fecha_nacimiento"
    | "folio"
    | "-folio"
  >("-updated_at");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm<CreateFormValues>();
  const [editing, setEditing] = useState<Medico | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listMedicos({ q, estado, sexo, especialidad, page, limit, sort });
      setData(res.data);
      setTotal(res.total);
    } catch (error: any) {
      message.error(error?.message ?? "No se pudo cargar la lista de médicos");
    } finally {
      setLoading(false);
    }
  }, [q, estado, sexo, especialidad, page, limit, sort]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // debounce search
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const handle = setTimeout(() => {
      setPage(1);
      setQ(searchInput.trim());
    }, 400);
    return () => clearTimeout(handle);
  }, [searchInput]);

  const columns: ColumnsType<Medico> = useMemo(
    () => [
      { title: "Folio", dataIndex: "folio", key: "folio" },
      {
        title: "Nombre",
        dataIndex: "nombre_completo",
        key: "nombre_completo",
        sorter: true,
      },
      { title: "Cédula", dataIndex: "cedula", key: "cedula" },
      {
        title: "Especialidad",
        dataIndex: "especialidad",
        key: "especialidad",
        render: (v: string) => <Tag color="blue">{v}</Tag>,
      },
      {
        title: "Subespecialidad",
        dataIndex: "subespecialidad",
        key: "subespecialidad",
        render: (v?: string) => v || "-",
      },
      {
        title: "Sexo",
        dataIndex: "sexo",
        key: "sexo",
        render: (v: MedicoSexo) => {
          const label = SEXO_OPTIONS.find((o) => o.value === v)?.label ?? v;
          return <Tag>{label}</Tag>;
        },
      },
      {
        title: "Nacimiento",
        dataIndex: "fecha_nacimiento",
        key: "fecha_nacimiento",
        sorter: true,
        render: (v?: string | null) => (v ? dayjs(v).format("YYYY-MM-DD") : "-"),
      },
      {
        title: "Teléfono",
        dataIndex: "telefono",
        key: "telefono",
        render: (v?: string | null) => v || "-",
      },
      { title: "Correo", dataIndex: "correo", key: "correo", render: (v?: string | null) => v || "-" },
      {
        title: "Estado",
        dataIndex: "estado",
        key: "estado",
        render: (v: MedicoEstado) => (
          <Tag color={v === "activo" ? "green" : "red"}>{v === "activo" ? "Activo" : "Inactivo"}</Tag>
        ),
      },
      {
        title: "Acciones",
        key: "acciones",
        fixed: "right",
        render: (_, record) => (
          <Space>
            <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
              Editar
            </Button>
            {record.estado === "inactivo" ? (
              <ActivateButton medico={record} onActivated={fetchData} />
            ) : (
              <ModalDelete medico={record} onDeleted={fetchData} />
            )}
          </Space>
        ),
      },
    ],
    []
  );

  const handleTableChange = (
    pagination: TablePaginationConfig,
    _filters: any,
    sorter: any
  ) => {
    setPage(pagination.current || 1);
    setLimit(pagination.pageSize || 10);
    if (sorter && sorter.field) {
      const field = sorter.field as string;
      const order = sorter.order; // 'ascend' | 'descend' | undefined
      const map: Record<string, string> = {
        nombre_completo: "nombre_completo",
        fecha_nacimiento: "fecha_nacimiento",
        folio: "folio",
        updated_at: "updated_at",
      };
      const base = map[field] || "updated_at";
      const s = order === "ascend" ? (base as any) : ("-" + base) as any;
      setSort(s);
    }
  };

  const resetFilters = () => {
    setSearchInput("");
    setQ("");
    setEstado(undefined);
    setSexo(undefined);
    setEspecialidad(undefined);
    setPage(1);
    setLimit(10);
    setSort("-updated_at");
  };

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      const basePayload = {
        nombre_completo: values.nombre_completo,
        cedula: values.cedula,
        especialidad: values.especialidad,
        subespecialidad: values.subespecialidad || undefined,
        sexo: values.sexo,
        fecha_nacimiento: values.fecha_nacimiento
          ? values.fecha_nacimiento.format("YYYY-MM-DD")
          : undefined,
        telefono: values.telefono || undefined,
        correo: values.correo || undefined,
        observaciones: values.observaciones || undefined,
      } as const;
      // remove folio from base if not provided
      const payloadWithOptionalFolio: any = { ...basePayload };
      if (values.folio) payloadWithOptionalFolio.folio = values.folio;

      if (editing) {
        // construir payload solo con cambios
        const payload: any = {};
        const compare = (key: keyof typeof basePayload, map?: (v: any) => any) => {
          const newVal = (basePayload as any)[key];
          const current = map ? map((editing as any)[key]) : (editing as any)[key];
          if (newVal !== undefined && newVal !== current) payload[key] = newVal;
        };
        // Folio (opcional, si está en el form)
        if (values.folio !== undefined) {
          const newFolio = values.folio || undefined;
          if (newFolio !== editing.folio) payload.folio = newFolio;
        }
        compare("nombre_completo");
        compare("cedula");
        compare("especialidad");
        compare("subespecialidad");
        compare("sexo");
        compare("fecha_nacimiento");
        compare("telefono");
        compare("correo");
        compare("observaciones");
        if (Object.keys(payload).length === 0) {
          message.info("No hay cambios para actualizar");
          return;
        }
        await updateMedico(editing._id, payload);
        message.success("Médico actualizado");
      } else {
        await createMedico(payloadWithOptionalFolio);
        message.success("Médico creado");
      }
      setIsModalOpen(false);
      setEditing(null);
      form.resetFields();
      fetchData();
    } catch (err: any) {
      if (err?.errorFields) return; // validation error from antd
      message.error(err?.message ?? "No se pudo crear el médico");
    }
  };

  const handleEdit = (medico: Medico) => {
    setEditing(medico);
    setIsModalOpen(true);
    form.setFieldsValue({
      folio: medico.folio ?? undefined,
      nombre_completo: medico.nombre_completo,
      cedula: medico.cedula,
      especialidad: medico.especialidad,
      subespecialidad: medico.subespecialidad ?? undefined,
      sexo: medico.sexo,
      fecha_nacimiento: medico.fecha_nacimiento ? dayjs(medico.fecha_nacimiento) : undefined,
      telefono: medico.telefono ?? undefined,
      correo: medico.correo ?? undefined,
      observaciones: medico.observaciones ?? undefined,
    });
  };

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      <Card>
        <Space direction="vertical" size={20} style={{ width: "100%" }}>
          <Space align="center" style={{ justifyContent: "space-between", width: "100%" }}>
            <div>
              <Typography.Title level={3} style={{ margin: 0 }}>
                Médicos
              </Typography.Title>
              <Typography.Text type="secondary">
                Lista, búsqueda, filtros y paginación de médicos.
              </Typography.Text>
            </div>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>
                Refrescar
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
                Agregar Médico
              </Button>
            </Space>
          </Space>

          <Space wrap style={{ width: "100%" }} size={12}>
            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder="Buscar por folio, nombre, cédula, correo..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setPage(1);
              }}
              style={{ minWidth: 240 }}
            />
            <Select
              allowClear
              placeholder="Estado"
              options={ESTADO_OPTIONS}
              value={estado}
              onChange={(v) => {
                setEstado(v);
                setPage(1);
              }}
              style={{ minWidth: 160 }}
            />
            <Select
              allowClear
              placeholder="Sexo"
              options={SEXO_OPTIONS}
              value={sexo}
              onChange={(v) => {
                setSexo(v);
                setPage(1);
              }}
              style={{ minWidth: 180 }}
            />
            <Select
              allowClear
              showSearch
              placeholder="Especialidad"
              options={ESPECIALIDADES_VALIDAS.map((e) => ({ label: e, value: e }))}
              filterOption={(input, option) => (option?.label as string).toLowerCase().includes(input.toLowerCase())}
              value={especialidad}
              onChange={(v) => {
                setEspecialidad(v);
                setPage(1);
              }}
              style={{ minWidth: 260 }}
            />
            <Button onClick={resetFilters}>Limpiar</Button>
          </Space>

          <Table<Medico>
            rowKey="_id"
            columns={columns}
            dataSource={data}
            loading={loading}
            pagination={{ current: page, total, pageSize: limit, showSizeChanger: true }}
            onChange={handleTableChange}
            locale={{ emptyText: "No se encontraron médicos" }}
            scroll={{ x: true }}
          />
        </Space>
      </Card>

      <Modal
        title={editing ? "Editar Médico" : "Agregar Médico"}
        open={isModalOpen}
        onCancel={() => {
          if (!loading) {
            setIsModalOpen(false);
            setEditing(null);
            form.resetFields();
          }
        }}
        onOk={handleCreate}
        okText={editing ? "Actualizar" : "Crear"}
        confirmLoading={false}
        destroyOnClose
      >
        <Form<CreateFormValues>
          form={form as any}
          layout="vertical"
          autoComplete="off"
        >
          {editing ? (
            <Form.Item
              label="Folio"
              name="folio"
              rules={[{ pattern: /^MED-\d{4,}$/, message: "Formato MED-0001" }]}
            >
              <Input placeholder="MED-0001 (opcional)" />
            </Form.Item>
          ) : null}
          <Form.Item
            label="Nombre completo"
            name="nombre_completo"
            rules={[{ required: true, message: "Ingresa el nombre completo" }]}
          >
            <Input placeholder="Nombre y apellidos" />
          </Form.Item>
          <Form.Item label="Cédula" name="cedula" rules={[{ required: true, message: "Ingresa la cédula" }]}>
            <Input placeholder="Cédula profesional" />
          </Form.Item>
          <Form.Item label="Especialidad" name="especialidad" rules={[{ required: true, message: "Selecciona la especialidad" }]}>
            <Select options={ESPECIALIDADES_VALIDAS.map((e) => ({ label: e, value: e }))} showSearch />
          </Form.Item>
          <Form.Item label="Subespecialidad" name="subespecialidad">
            <Input placeholder="Opcional" />
          </Form.Item>
          <Form.Item label="Sexo" name="sexo" rules={[{ required: true, message: "Selecciona el sexo" }]}>
            <Select options={SEXO_OPTIONS} />
          </Form.Item>
          <Form.Item label="Fecha de nacimiento" name="fecha_nacimiento">
            <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item label="Teléfono" name="telefono">
            <Input placeholder="Teléfono" />
          </Form.Item>
          <Form.Item label="Correo" name="correo" rules={[{ type: "email", message: "Correo inválido" }]}>
            <Input placeholder="correo@ejemplo.com" />
          </Form.Item>
          <Form.Item label="Observaciones" name="observaciones">
            <Input.TextArea rows={3} placeholder="Notas u observaciones" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
};

export default MedicosPage;

// Inline component for delete confirmation to keep main component tidy
function ModalDelete({ medico, onDeleted }: { medico: Medico; onDeleted: () => void }) {
  const [loading, setLoading] = useState(false);
  const onConfirm = async () => {
    setLoading(true);
    try {
      await deleteMedico(medico._id);
      message.success("Médico inactivado");
      onDeleted();
    } catch (e: any) {
      message.error(e?.message ?? "No se pudo inactivar");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Popconfirm
      title="Inactivar médico"
      description={`¿Seguro que deseas inactivar a ${medico.nombre_completo}?`}
      onConfirm={onConfirm}
      okText="Inactivar"
      okButtonProps={{ danger: true, loading }}
      cancelText="Cancelar"
    >
      <Button type="link" danger icon={<DeleteOutlined />}>Inactivar</Button>
    </Popconfirm>
  );
}

function ActivateButton({ medico, onActivated }: { medico: Medico; onActivated: () => void }) {
  const [loading, setLoading] = useState(false);
  const onClick = async () => {
    setLoading(true);
    try {
      await updateMedico(medico._id, { estado: "activo" });
      message.success("Médico activado");
      onActivated();
    } catch (e: any) {
      message.error(e?.message ?? "No se pudo activar");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Button type="link" icon={<ReloadOutlined />} loading={loading} onClick={onClick}>
      Activar
    </Button>
  );
}
