import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";
import {
  useCreateUsuario,
} from "../hooks/queries/usuarios/useCreateUsuario";
import {
  useDeleteUsuario,
} from "../hooks/queries/usuarios/useDeleteUsuario";
import {
  useUpdateUsuario,
} from "../hooks/queries/usuarios/useUpdateUsuario";
import {
  useUsuarios,
} from "../hooks/queries/usuarios/useUsuarios";
import { useUsuario } from "../hooks/queries/usuarios/useUsuario";
import type {
  CreateUsuarioPayload,
  UpdateUsuarioPayload,
  Usuario,
} from "../services/usuario.service";

const ROLE_OPTIONS = [
  { value: "admin", label: "Administrador" },
  { value: "medico", label: "Medico" },
  { value: "enfermera", label: "Enfermera" },
  { value: "paciente", label: "Paciente" },
];

const ROLE_COLORS: Record<string, string> = {
  admin: "magenta",
  medico: "blue",
  enfermera: "green",
  paciente: "gold",
};

const UsuariosPage = () => {
  const { data, isLoading, isFetching, refetch } = useUsuarios();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [form] = Form.useForm<CreateUsuarioPayload>();

  const createMutation = useCreateUsuario({
    onSuccess: (response) => {
      message.success(response?.mensaje ?? "Usuario creado correctamente");
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: (error) => {
      message.error(error.message ?? "No se pudo crear el usuario");
    },
  });

  const updateMutation = useUpdateUsuario({
    onSuccess: (response) => {
      message.success(response?.mensaje ?? "Usuario actualizado correctamente");
      setIsModalOpen(false);
      setEditingUser(null);
      form.resetFields();
    },
    onError: (error) => {
      message.error(error.message ?? "No se pudo actualizar el usuario");
    },
  });

  const deleteMutation = useDeleteUsuario({
    onSuccess: (response) => {
      message.success(response?.mensaje ?? "Usuario eliminado correctamente");
    },
    onError: (error) => {
      message.error(error.message ?? "No se pudo eliminar el usuario");
    },
  });

  const filteredUsers = useMemo(() => {
    if (!data) return [];
    const term = searchTerm.trim().toLowerCase();
    if (!term) return data;
    return data.filter((usuario) =>
      [
        usuario.nombre,
        usuario.apellido,
        usuario.username,
        usuario.correo,
        usuario.telefono,
        usuario.rol,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term))
    );
  }, [data, searchTerm]);

  const handleOpenCreate = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (usuario: Usuario) => {
    // Abrir modal y luego cargar datos actualizados desde el backend
    setEditingUser(usuario);
    setIsModalOpen(true);
  };

  // Al abrir edición, obtener datos actuales del usuario desde la API
  const { data: fetchedUser, isFetching: isFetchingUser } = useUsuario(
    editingUser?._id ?? "",
    { enabled: !!editingUser?._id, staleTime: 0 }
  );

  useEffect(() => {
    if (fetchedUser) {
      // Sincronizar formulario con los datos más recientes del backend
      setEditingUser(fetchedUser);
      form.setFieldsValue({
        nombre: fetchedUser.nombre,
        apellido: fetchedUser.apellido,
        correo: fetchedUser.correo,
        telefono: fetchedUser.telefono,
        username: fetchedUser.username,
        password: "",
        rol: fetchedUser.rol,
      });
    }
  }, [fetchedUser, form]);

  const handleDelete = async (usuario: Usuario) => {
    try {
      await deleteMutation.mutateAsync(usuario._id);
    } catch (error) {
      console.error(error);
    }
  };

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingUser) {
        // Construir payload parcial solo con cambios y no vacíos
        const payload: UpdateUsuarioPayload = {};
        const fields: (keyof UpdateUsuarioPayload)[] = [
          "nombre",
          "apellido",
          "correo",
          "telefono",
          "username",
          "rol",
        ];

        for (const key of fields) {
          const newVal = (values as any)[key];
          const oldVal = (editingUser as any)[key];
          const isEmpty = newVal === undefined || newVal === null || newVal === "";
          if (!isEmpty && newVal !== oldVal) {
            (payload as any)[key] = newVal;
          }
        }

        // Solo enviar password si se ingresó
        if (values.password && values.password.trim().length > 0) {
          payload.password = values.password.trim();
        }

        if (Object.keys(payload).length === 0) {
          message.info("No hay cambios para actualizar");
          return;
        }

        await updateMutation.mutateAsync({ id: editingUser._id, payload });
      } else {
        await createMutation.mutateAsync(values);
      }
    } catch (error) {
      // Ant Design ya muestra los errores de validación del formulario
      console.error(error);
    }
  };

  const columns: ColumnsType<Usuario> = [
    {
      title: "Nombre",
      dataIndex: "nombre",
      key: "nombre",
      render: (_, record) => `${record.nombre} ${record.apellido}`.trim(),
    },
    {
      title: "Correo",
      dataIndex: "correo",
      key: "correo",
    },
    {
      title: "Telefono",
      dataIndex: "telefono",
      key: "telefono",
      render: (value: string | undefined) => value ?? "-",
    },
    {
      title: "Usuario",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Rol",
      dataIndex: "rol",
      key: "rol",
      render: (rol: string) => (
        <Tag color={ROLE_COLORS[rol] ?? "blue"} key={rol}>
          {ROLE_OPTIONS.find((option) => option.value === rol)?.label ?? rol}
        </Tag>
      ),
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Editar
          </Button>
          <Popconfirm
            title="¿Eliminar usuario?"
            description="Esta accion no se puede deshacer"
            onConfirm={() => handleDelete(record)}
            okText="Eliminar"
            okButtonProps={{ danger: true, loading: deleteMutation.isPending && deleteMutation.variables === record._id }}
            cancelText="Cancelar"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Eliminar
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      <Card>
        <Space direction="vertical" size={20} style={{ width: "100%" }}>
          <Space align="center" style={{ justifyContent: "space-between", width: "100%" }}>
            <div>
              <Typography.Title level={3} style={{ margin: 0 }}>
                Gestion de usuarios
              </Typography.Title>
              <Typography.Text type="secondary">
                Administra las cuentas del sistema y asigna roles de acceso.
              </Typography.Text>
            </div>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isFetching}>
                Refrescar
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
                Nuevo usuario
              </Button>
            </Space>
          </Space>

          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Buscar por nombre, correo o usuario"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />

          <Table<Usuario>
            rowKey="_id"
            columns={columns}
            dataSource={filteredUsers}
            loading={isLoading || isFetching}
            pagination={{ pageSize: 8, showSizeChanger: false }}
            locale={{ emptyText: "No se encontraron usuarios" }}
            scroll={{ x: true }}
          />
        </Space>
      </Card>

      <Modal
        title={editingUser ? "Editar usuario" : "Nuevo usuario"}
        open={isModalOpen}
        onCancel={() => {
          if (!createMutation.isPending && !updateMutation.isPending) {
            setIsModalOpen(false);
            setEditingUser(null);
            form.resetFields();
          }
        }}
        onOk={handleModalSubmit}
        okText={editingUser ? "Actualizar" : "Crear"}
        confirmLoading={createMutation.isPending || updateMutation.isPending || isFetchingUser}
        destroyOnClose
      >
        <Form<CreateUsuarioPayload> layout="vertical" form={form} preserve={false}>
          <Form.Item
            label="Nombre"
            name="nombre"
            rules={
              editingUser
                ? []
                : [{ required: true, message: "Ingresa el nombre" }]
            }
          >
            <Input placeholder="Nombre" />
          </Form.Item>
          <Form.Item
            label="Apellido"
            name="apellido"
            rules={
              editingUser
                ? []
                : [{ required: true, message: "Ingresa el apellido" }]
            }
          >
            <Input placeholder="Apellido" />
          </Form.Item>
          <Form.Item
            label="Correo"
            name="correo"
            rules={
              editingUser
                ? [{ type: "email", message: "Ingresa un correo valido" }]
                : [
                    { required: true, message: "Ingresa el correo" },
                    { type: "email", message: "Ingresa un correo valido" },
                  ]
            }
          >
            <Input placeholder="correo@ejemplo.com" />
          </Form.Item>
          <Form.Item label="Telefono" name="telefono">
            <Input placeholder="Numero de telefono" />
          </Form.Item>
          <Form.Item
            label="Nombre de usuario"
            name="username"
            rules={
              editingUser
                ? []
                : [{ required: true, message: "Ingresa el nombre de usuario" }]
            }
          >
            <Input placeholder="usuario" />
          </Form.Item>
          <Form.Item
            label="Contraseña"
            name="password"
            rules={
              editingUser
                ? [{ min: 6, message: "Debe tener al menos 6 caracteres" }]
                : [
                    { required: true, message: "Ingresa una contraseña" },
                    { min: 6, message: "Debe tener al menos 6 caracteres" },
                  ]
            }
          >
            <Input.Password placeholder={editingUser ? "Deja en blanco para mantener" : "Contraseña"} />
          </Form.Item>
          <Form.Item
            label="Rol"
            name="rol"
            rules={
              editingUser
                ? []
                : [{ required: true, message: "Selecciona un rol" }]
            }
          >
            <Select options={ROLE_OPTIONS} placeholder="Selecciona el rol" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
};

export default UsuariosPage;
