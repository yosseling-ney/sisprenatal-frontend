import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Typography,
  message,
} from "antd";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import dayjs from "dayjs";
import type { AxiosError } from "axios";
import HistorialWizard from "../components/historial/HistorialWizard";
import {
  buscarPacientePorIdentificacion,
  crearPaciente,
  actualizarPaciente,
  type CrearPacienteDatosGenerales,
  type CrearPacienteResult,
  type Paciente,
  type TipoIdentificacion,
} from "../services/paciente.service";

interface PacienteFormValues {
  nombre: string;
  apellido: string;
  tipo_identificacion: TipoIdentificacion;
  numero_identificacion: string;
  fecha_nac?: unknown;
  telefono: string;
  direccion: string;
  bairro: string;
  gesta_actual: number;
  municipio_codigo?: string;
  sexo?: "M" | "F";
  contacto_emergencia?: {
    nombre?: string;
    telefono?: string;
  };
  codigo_expediente?: string;
}

interface PacienteCreadoState {
  response: CrearPacienteResult;
  datos: CrearPacienteDatosGenerales;
}

const tipoIdentificacionOptions: { value: TipoIdentificacion; label: string }[] = [
  { value: "CI", label: "Cédula (CI)" },
  { value: "PSP", label: "Pasaporte (PSP)" },
  { value: "NSS", label: "NSS" },
  { value: "LC", label: "Libreta cívica (LC)" },
];

const sexoOptions = [
  { value: "F", label: "Femenino" },
  { value: "M", label: "Masculino" },
];

const formLayout = { labelCol: { span: 24 }, wrapperCol: { span: 24 } } as const;

const formatDateValue = (value: unknown) => {
  if (
    value &&
    typeof value === "object" &&
    "format" in (value as Record<string, unknown>) &&
    typeof (value as { format?: unknown }).format === "function"
  ) {
    return (value as { format: (fmt: string) => string }).format("YYYY-MM-DD");
  }
  if (typeof value === "string") return value;
  return undefined;
};

const RegisterPacientePage = () => {
  const [form] = Form.useForm<PacienteFormValues>();
  const [pacienteEncontrado, setPacienteEncontrado] = useState<Paciente | null>(null);
  const [pacienteCreado, setPacienteCreado] = useState<PacienteCreadoState | null>(null);
  const [noEncontrado, setNoEncontrado] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const buscarMutation = useMutation({
    mutationFn: async (params: { tipo: TipoIdentificacion; numero: string }) =>
      buscarPacientePorIdentificacion(params.tipo, params.numero),
    onSuccess: (paciente) => {
      setPacienteEncontrado(paciente);
      setPacienteCreado(null);
      setNoEncontrado(false);
      try {
        form.setFieldsValue({
          nombre: paciente.nombre,
          apellido: paciente.apellido,
          tipo_identificacion: paciente.tipo_identificacion,
          numero_identificacion: paciente.numero_identificacion,
          fecha_nac: paciente.fecha_nac ? dayjs(paciente.fecha_nac) : undefined,
          telefono: paciente.telefono,
          direccion: paciente.direccion,
          bairro: paciente.bairro,
          gesta_actual: paciente.gesta_actual,
          codigo_expediente: paciente.codigo_expediente,
          contacto_emergencia: paciente.contacto_emergencia
            ? { nombre: paciente.contacto_emergencia.nombre, telefono: paciente.contacto_emergencia.telefono }
            : undefined,
        });
      } catch {}
      message.success("Paciente encontrado por identificación");
    },
    onError: (error: AxiosError<{ ok: boolean; error?: string }>) => {
      setPacienteEncontrado(null);
      if (error.response?.status === 404) {
        setNoEncontrado(true);
        message.info("No se encontró un paciente con esa identificación");
        return;
      }
      setNoEncontrado(false);
      const msg = error.response?.data?.error ?? error.message;
      message.error(msg || "No se pudo buscar al paciente");
    },
  });

  const crearMutation = useMutation({
    mutationFn: crearPaciente,
    onSuccess: (response, variables) => {
      setPacienteCreado({ response, datos: variables.datos_generales });
      setPacienteEncontrado(null);
      setNoEncontrado(false);
      message.success("Paciente registrado correctamente");
      setIsWizardOpen(true);
    },
    onError: (error: AxiosError<any>) => {
      const status = error.response?.status;
      if (status === 409) {
        const existente = error.response?.data?.data;
        if (existente) {
          setPacienteEncontrado(existente as Paciente);
          setPacienteCreado(null);
          message.info("Paciente ya existe. Cargado para actualizar historial.");
        } else {
          message.error(error.response?.data?.error ?? "Ya existe un paciente con esa identificación");
        }
        return;
      }
      const msg = error.response?.data?.error ?? error.message;
      message.error(msg || "No se pudo registrar al paciente");
    },
  });

  const actualizarMutation = useMutation({
    mutationFn: actualizarPaciente,
    onSuccess: (pacienteActualizado) => {
      setPacienteEncontrado(pacienteActualizado);
      try { form.setFieldValue("gesta_actual", pacienteActualizado.gesta_actual); } catch {}
      message.success("Paciente actualizado");
    },
    onError: (error: AxiosError<{ ok: boolean; error?: string }>) => {
      const msg = error.response?.data?.error ?? error.message;
      message.error(msg || "No se pudo actualizar el paciente");
    },
  });

  const handleActualizarPaciente = async () => {
    if (!pacienteEncontrado) {
      message.warning("Primero busca o selecciona un paciente");
      return;
    }
    const values = form.getFieldsValue();
    const gestaActual = Number((values.gesta_actual as number | undefined) ?? pacienteEncontrado.gesta_actual);
    const tel = typeof values.telefono === "string" ? values.telefono.trim() : undefined;
    if (tel && !/^[0-9+\-\s]{8,15}$/.test(tel)) {
      message.error("Telefono invalido (8-15 digitos, +, -, espacio)");
      return;
    }
    try {
      await actualizarMutation.mutateAsync({
        paciente_id: pacienteEncontrado.id,
        gesta_actual: gestaActual,
        telefono: tel,
        direccion: (values.direccion as string | undefined) ?? undefined,
        bairro: (values.bairro as string | undefined) ?? undefined,
      });
    } catch {}
  };

  const handleBuscar = async () => {
    try {
      const values = await form.validateFields(["tipo_identificacion", "numero_identificacion"]);
      let tipo = values.tipo_identificacion;
      let numero = (values.numero_identificacion || "").trim().toUpperCase();
      numero = numero.replace(/[\u2012\u2013\u2014\u2212]/g, "-");
      if (tipo === "CI") {
        const solo = numero.replace(/[^0-9A-Z]/g, "");
        const m = solo.match(/^(\d{3})(\d{6})(\d{4})([A-Z])$/);
        if (!m) {
          message.error("Formato CI inválido. Use ###-######-####A");
          return;
        }
        numero = `${m[1]}-${m[2]}-${m[3]}${m[4]}`;
      }
      await buscarMutation.mutateAsync({ tipo, numero });
    } catch {}
  };

  const handleSubmit = async (values: PacienteFormValues) => {
    const tipo = values.tipo_identificacion;
    let numero = (values.numero_identificacion || "").trim().toUpperCase().replace(/[\u2013\u2014\u2212]/g, "-");
    if (tipo === "CI") {
      const solo = numero.replace(/[^0-9A-Z]/g, "");
      const m = solo.match(/^(\d{3})(\d{6})(\d{4})([A-Z])$/);
      if (m) numero = `${m[1]}-${m[2]}-${m[3]}${m[4]}`;
    }
    const datosGenerales: CrearPacienteDatosGenerales = {
      nombre: (values.nombre || "").trim(),
      apellido: (values.apellido || "").trim(),
      tipo_identificacion: tipo,
      numero_identificacion: numero,
      fecha_nac: formatDateValue(values.fecha_nac) ?? "",
      telefono: (values.telefono || "").trim(),
      direccion: (values.direccion || "").trim(),
      bairro: (values.bairro || "").trim(),
      gesta_actual: Number(values.gesta_actual ?? 1),
    };
    if (!datosGenerales.fecha_nac) {
      message.error("Selecciona una fecha de nacimiento válida");
      return;
    }
    if (!/^[0-9+\-\s]{8,15}$/.test(datosGenerales.telefono)) {
      message.error("Telefono invalido (8-15 digitos, +, -, espacio)");
      return;
    }
    // Normalizar municipio_codigo (solo dígitos) y omitir si queda vacío
    if (values.municipio_codigo !== undefined && values.municipio_codigo !== null) {
      const mcRaw = `${values.municipio_codigo}`.trim();
      if (mcRaw) {
        const mcDigits = mcRaw.replace(/\D+/g, "");
        if (mcDigits) datosGenerales.municipio_codigo = mcDigits;
      }
    }
    if (values.sexo) datosGenerales.sexo = values.sexo;
    const contacto = values.contacto_emergencia;
    if (contacto?.nombre && contacto.telefono) {
      datosGenerales.contacto_emergencia = {
        nombre: (contacto.nombre || "").trim(),
        telefono: (contacto.telefono || "").trim(),
      };
    }
    // Omitir claves opcionales vacías del payload
    const cleanedDatosGenerales = Object.fromEntries(
      Object.entries(datosGenerales).filter(([k, v]) => v !== undefined && v !== null && v !== "")
    ) as CrearPacienteDatosGenerales;
    try {
      await crearMutation.mutateAsync({ datos_generales: cleanedDatosGenerales });
    } catch {}
  };

  const pacienteParaWizard = pacienteCreado
    ? { id: pacienteCreado.response.paciente_id, datos: pacienteCreado.datos }
    : pacienteEncontrado
    ? {
        id: pacienteEncontrado.id,
        datos: {
          nombre: pacienteEncontrado.nombre,
          apellido: pacienteEncontrado.apellido,
          tipo_identificacion: pacienteEncontrado.tipo_identificacion,
          numero_identificacion: pacienteEncontrado.numero_identificacion,
          fecha_nac: pacienteEncontrado.fecha_nac ?? "",
          telefono: pacienteEncontrado.telefono,
          direccion: pacienteEncontrado.direccion,
          bairro: pacienteEncontrado.bairro,
          gesta_actual: pacienteEncontrado.gesta_actual,
        } as CrearPacienteDatosGenerales,
      }
    : null;

  const estado = pacienteEncontrado ? "found" : noEncontrado ? "not_found" : "initial";
  const showGeneralFieldsNotFound = estado === "not_found";

  const handleOpenWizard = () => {
    if (!pacienteParaWizard) {
      message.warning("Primero registra o selecciona un paciente");
      return;
    }
    setIsWizardOpen(true);
  };

  return (
    <>
      <Space direction="vertical" size={24} style={{ width: "100%" }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          Registro de paciente embarazada
        </Typography.Title>
        <Typography.Paragraph type="secondary">
          Completa los datos generales y valida si la identificación ya existe antes de guardar.
        </Typography.Paragraph>

        <Card>
          <Form<PacienteFormValues>
            {...formLayout}
            form={form}
            layout="vertical"
            initialValues={{ sexo: "F", gesta_actual: 1 }}
            onFinish={handleSubmit}
          >
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item label="Tipo de identificación" name="tipo_identificacion" rules={[{ required: true, message: "Selecciona un tipo" }]}>
                  <Select options={tipoIdentificacionOptions} placeholder="Selecciona" />
                </Form.Item>
              </Col>
              <Col xs={24} md={10}>
                <Form.Item
                  label="Número de identificación"
                  name="numero_identificacion"
                  rules={[
                    { required: true, message: "Ingresa el número" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        const tipo = getFieldValue("tipo_identificacion");
                        const v = (value ?? "").toString().trim().toUpperCase().replace(/[\u2013\u2014\u2212]/g, "-");
                        if (!v) return Promise.resolve();
                        if (tipo === "CI") {
                          const solo = v.replace(/[^0-9A-Z]/g, "");
                          const ok = /^\d{3}\d{6}\d{4}[A-Z]$/.test(solo);
                          if (!ok) return Promise.reject(new Error("Formato de cédula inválido. Use ###-######-####A"));
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <Input placeholder="Formato según tipo" />
                </Form.Item>
              </Col>
              <Col xs={24} md={6} style={{ display: "flex", alignItems: "flex-end" }}>
                <Button block onClick={handleBuscar} loading={buscarMutation.isPending} type="default">
                  Buscar por identificación
                </Button>
              </Col>
            </Row>

            {estado === "found" && (
              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Form.Item label="Código de expediente" name="codigo_expediente">
                    <Input disabled />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label="Teléfono" name="telefono" rules={[{ required: true, message: "Ingresa el teléfono" }]}>
                    <Input placeholder="Ej: +505 8888 8888" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label="Gesta actual" name="gesta_actual" hidden={estado === "initial"} rules={[{ required: true, message: "Indica la gesta actual" }]}>
                    <InputNumber min={1} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
              </Row>
            )}

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item label="Nombres" name="nombre" hidden={!showGeneralFieldsNotFound} rules={[{ required: true, message: "Ingresa los nombres" }]}>
                  <Input placeholder="Ej: María Fernanda" autoCapitalize="words" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Apellidos" name="apellido" hidden={!showGeneralFieldsNotFound} rules={[{ required: true, message: "Ingresa los apellidos" }]}>
                  <Input placeholder="Ej: Ramírez López" autoCapitalize="words" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item label="Fecha de nacimiento" name="fecha_nac" hidden={!showGeneralFieldsNotFound} rules={[{ required: true, message: "Selecciona la fecha" }]}>
                  <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Sexo" name="sexo" hidden={!showGeneralFieldsNotFound}>
                  <Select allowClear options={sexoOptions} placeholder="Selecciona" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  label="Teléfono"
                  name="telefono"
                  hidden={!showGeneralFieldsNotFound}
                  rules={[
                    { required: true, message: "Ingresa el teléfono" },
                    {
                      pattern: /^[0-9+\-\s]{8,15}$/,
                      message: "Formato inválido (8–15 dígitos, +, -, espacio)",
                    },
                  ]}
                >
                  <Input placeholder="Ej: +505 8888 8888" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item label="Dirección" name="direccion" rules={[{ required: true, message: "Ingresa la dirección" }]}>
                  <Input.TextArea rows={2} placeholder="Dirección exacta" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Localidad / Barrio" name="bairro" rules={[{ required: true, message: "Ingresa la localidad" }]}>
                  <Input placeholder="Ej: Barrio San Juan" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={6}>
                <Form.Item label="Código de municipio" name="municipio_codigo" hidden={!showGeneralFieldsNotFound}>
                  <Input placeholder="Ej: 161" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Contacto de emergencia" style={{ marginBottom: 0 }} hidden={!showGeneralFieldsNotFound}>
                  <Row gutter={8}>
                    <Col span={14}>
                      <Form.Item name={["contacto_emergencia", "nombre"]} noStyle>
                        <Input placeholder="Nombre" />
                      </Form.Item>
                    </Col>
                    <Col span={10}>
                      <Form.Item name={["contacto_emergencia", "telefono"]} noStyle>
                        <Input placeholder="Teléfono" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form.Item>
              </Col>
            </Row>

            <Space style={{ width: "100%", justifyContent: "space-between" }}>
              <Button onClick={() => form.resetFields()} type="default">
                Limpiar formulario
              </Button>
              <Space>
                <Button type={pacienteParaWizard ? "primary" : "default"} disabled={!pacienteParaWizard} onClick={handleOpenWizard}>
                  Historial médico
                </Button>
                {pacienteEncontrado && (
                  <Button type="primary" onClick={handleActualizarPaciente} loading={actualizarMutation.isPending}>
                    Actualizar paciente
                  </Button>
                )}
                <Button type="primary" htmlType="submit" loading={crearMutation.isPending} disabled={!!pacienteEncontrado}>
                  Guardar paciente
                </Button>
              </Space>
            </Space>
          </Form>
        </Card>

        {pacienteEncontrado && (
          <Alert
            type="info"
            showIcon
            message="Paciente existente"
            description={
              <div>
                Este documento ya está asociado al paciente <strong>{`${pacienteEncontrado.nombre} ${pacienteEncontrado.apellido}`}</strong> (gesta actual: {pacienteEncontrado.gesta_actual}).
              </div>
            }
          />
        )}

        {!pacienteEncontrado && !pacienteCreado && noEncontrado && (
          <Alert
            type="warning"
            showIcon
            message="Sin resultados"
            description="No se encontró un paciente con esa identificación. Puedes registrarlo ahora."
          />
        )}

        {pacienteCreado && (
          <Alert type="success" showIcon message="Paciente registrado" description={`ID generado: ${pacienteCreado.response.paciente_id}`} />
        )}
      </Space>

      {pacienteParaWizard && (
        <HistorialWizard
          open={isWizardOpen}
          onClose={() => setIsWizardOpen(false)}
          pacienteId={pacienteParaWizard.id}
          pacienteDatos={pacienteParaWizard.datos}
          historialId={pacienteEncontrado?.historial_id ?? undefined}
        />
      )}
    </>
  );
};

export default RegisterPacientePage;
