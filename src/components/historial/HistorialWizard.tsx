import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Steps,
  Typography,
  message,
} from "antd";
import { useEffect, useMemo, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  crearHistorial,
  CrearHistorialPayload,
  actualizarHistorial,
  obtenerHistorialPorPaciente,
  obtenerHistorialPorId,
} from "../../services/historial.service";
import type { CrearPacienteDatosGenerales } from "../../services/paciente.service";
import { pacienteQueryKey } from "../../hooks/queries/usePaciente";

import AntecedentesStep from "./steps/AntecedentesStep";
import GestacionActualStep from "./steps/GestacionActualStep";
import PartoAbortoStep from "./steps/PartoAbortoStep";
import PatologiasStep from "./steps/PatologiasStep";
import RecienNacidoStep from "./steps/RecienNacidoStep";
import PuerperioStep from "./steps/PuerperioStep";
import EgresoNeonatalStep from "./steps/EgresoNeonatalStep";
import EgresoMaternoStep from "./steps/EgresoMaternoStep";
import AnticoncepcionStep from "./steps/AnticoncepcionStep";
import IdentificacionStep from "./steps/IdentificacionStep";
import type { IdentificacionFormValues, IdentificacionEtnia, NivelEstudios, EstadoCivil } from "./steps/types";
import type { AntecedentesFormValues } from "./steps/types";
// Tipos movidos a ./steps/types

interface HistorialWizardProps {
  open: boolean;
  onClose: () => void;
  pacienteId: string;
  pacienteDatos: CrearPacienteDatosGenerales;
  historialId?: string;
}

const etniaOptions: { value: IdentificacionEtnia; label: string }[] = [
  { value: "blanca", label: "Blanca" },
  { value: "indigena", label: "Indígena" },
  { value: "mestiza", label: "Mestiza" },
  { value: "negra", label: "Negra" },
  { value: "otros", label: "Otros" },
];

const nivelEstudiosOptions: { value: NivelEstudios; label: string }[] = [
  { value: "ninguno", label: "Ninguno" },
  { value: "primaria", label: "Primaria" },
  { value: "secundaria", label: "Secundaria" },
  { value: "universitaria", label: "Universitaria" },
];

const estadoCivilOptions: { value: EstadoCivil; label: string }[] = [
  { value: "soltera", label: "Soltera" },
  { value: "casada", label: "Casada" },
  { value: "union_estable", label: "Unión estable" },
  { value: "divorciada", label: "Divorciada" },
  { value: "viuda", label: "Viuda" },
  { value: "otro", label: "Otro" },
];

const calculateAge = (date?: Dayjs) => {
  if (!date || !date.isValid()) return 0;
  const today = dayjs();
  const diff = today.diff(date, "year");
  return diff >= 0 ? diff : 0;
};

const toInt = (v: unknown) => {
  const n = Number(v ?? 0);
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

const validateAntecedentes = (vals?: Partial<AntecedentesFormValues>): string | null => {
  if (!vals) return null;
  const gesta = toInt(vals.gesta_previa);
  const partos = toInt(vals.partos);
  const cesareas = toInt(vals.cesareas);
  const vaginales = toInt(vals.vaginales);
  const abortos = toInt(vals.abortos);
  const ectopico = toInt(vals.embarazo_ectopico);
  const relacionados = [
    toInt(vals.nacidos_vivos),
    toInt(vals.nacidos_muertos),
    toInt(vals.hijos_vivos),
    toInt(vals.muertos_primera_semana),
    toInt(vals.muertos_despues_semana),
  ];

  // Regla 1: si gesta_previa == 0, todo lo demás debe ser 0
  if (gesta === 0) {
    const all = [partos, cesareas, vaginales, abortos, ectopico, ...relacionados];
    if (all.some((n) => n !== 0)) {
      return "Si 'Gesta previa' es 0, todos los resultados previos deben ser 0.";
    }
  }

  // Identidad y límites
  if (partos !== cesareas + vaginales) {
    return "Inconsistencia: 'Partos' debe ser igual a 'Vaginales + Cesáreas'.";
  }
  if (cesareas > partos) return "Inconsistencia: 'Cesáreas' no puede superar 'Partos'.";
  if (vaginales > partos) return "Inconsistencia: 'Vaginales' no puede superar 'Partos'.";

  // Regla 2: coherencia con gesta_previa
  if (gesta > 0) {
    const totalEventos = partos + abortos + ectopico;
    if (totalEventos > gesta) {
      return "Inconsistencia: Partos + Abortos + Embarazo ectópico no puede superar 'Gesta previa'.";
    }
  }

  return null;
};

const HistorialWizard = ({ open, onClose, pacienteId, pacienteDatos, historialId }: HistorialWizardProps) => {
  const [form] = Form.useForm<IdentificacionFormValues>();
  const [currentStep, setCurrentStep] = useState(0);
  const [antForm] = Form.useForm<any>();
  const [gaForm] = Form.useForm<any>();
  const [paForm] = Form.useForm<any>();
  const [patForm] = Form.useForm<any>();
  const [rnForm] = Form.useForm<any>();
  const [pueForm] = Form.useForm<any>();
  const [enForm] = Form.useForm<any>();
  const [emForm] = Form.useForm<any>();
  const [acForm] = Form.useForm<any>();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(historialId);

  const crearHistorialMutation = useMutation({
    mutationFn: (payload: CrearHistorialPayload) => crearHistorial(payload),
    onSuccess: () => {
      message.success("Historial creado correctamente");
      void queryClient.invalidateQueries({ queryKey: pacienteQueryKey(pacienteId) });
      onClose();
    },
    onError: (error: unknown) => {
      const msg = error instanceof Error ? error.message : "No se pudo guardar el historial";
      message.error(msg);
    },
  });

  const actualizarHistorialMutation = useMutation({
    mutationFn: (payload: any) => actualizarHistorial(payload),
    onSuccess: () => {
      message.success("Historial actualizado correctamente");
      void queryClient.invalidateQueries({ queryKey: pacienteQueryKey(pacienteId) });
      onClose();
    },
    onError: (error: unknown) => {
      const msg = error instanceof Error ? error.message : "No se pudo actualizar el historial";
      message.error(msg);
    },
  });

  useEffect(() => {
    if (!open) return;

    form.resetFields();

    const fechaNacimiento = pacienteDatos.fecha_nac ? dayjs(pacienteDatos.fecha_nac) : undefined;
    const initialValues: Partial<IdentificacionFormValues> = {
      nombres: pacienteDatos.nombre ?? "",
      apellidos: pacienteDatos.apellido ?? "",
      cedula: pacienteDatos.numero_identificacion ?? "",
      fecha_nacimiento: fechaNacimiento?.isValid() ? fechaNacimiento : undefined,
      edad: calculateAge(fechaNacimiento),
      domicilio: pacienteDatos.direccion ?? "",
      telefono: pacienteDatos.telefono ?? "",
      localidad: pacienteDatos.bairro ?? "",
      establecimiento_salud: "",
      lugar_parto: "",
      etnia: "mestiza",
      alfabeta: true,
      nivel_estudios: "primaria",
      anio_estudios: 0,
      estado_civil: "soltera",
      vive_sola: false,
    };
    form.setFieldsValue(initialValues as IdentificacionFormValues);
    setCurrentStep(0);
  }, [open, pacienteDatos, form]);

  // Prefill desde agregado
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const agregado = historialId
          ? await obtenerHistorialPorId(historialId)
          : await obtenerHistorialPorPaciente(pacienteId);

        const ident: any = (agregado as any)?.identificacion ?? null;
        if (ident) {
          const fechaStr = (ident?.fecha_nacimiento as string | undefined) ?? undefined;
          const fecha = fechaStr ? dayjs(fechaStr) : undefined;
          form.setFieldsValue({
            nombres: ident.nombres ?? form.getFieldValue("nombres"),
            apellidos: ident.apellidos ?? form.getFieldValue("apellidos"),
            cedula: ident.cedula ?? form.getFieldValue("cedula"),
            fecha_nacimiento: fecha?.isValid() ? fecha : form.getFieldValue("fecha_nacimiento"),
            edad: typeof ident.edad === "number" ? ident.edad : form.getFieldValue("edad"),
            etnia: ident.etnia ?? form.getFieldValue("etnia"),
            alfabeta: typeof ident.alfabeta === "boolean" ? ident.alfabeta : form.getFieldValue("alfabeta"),
            nivel_estudios: ident.nivel_estudios ?? form.getFieldValue("nivel_estudios"),
            anio_estudios: typeof ident.anio_estudios === "number" ? ident.anio_estudios : form.getFieldValue("anio_estudios"),
            estado_civil: ident.estado_civil ?? form.getFieldValue("estado_civil"),
            vive_sola: typeof ident.vive_sola === "boolean" ? ident.vive_sola : form.getFieldValue("vive_sola"),
            domicilio: ident.domicilio ?? form.getFieldValue("domicilio"),
            telefono: ident.telefono ?? form.getFieldValue("telefono"),
            localidad: ident.localidad ?? form.getFieldValue("localidad"),
            establecimiento_salud: ident.establecimiento_salud ?? form.getFieldValue("establecimiento_salud"),
            lugar_parto: ident.lugar_parto ?? form.getFieldValue("lugar_parto"),
          } as Partial<IdentificacionFormValues>);
        }

        const ant: any = (agregado as any)?.antecedentes ?? null;
        if (ant) antForm.setFieldsValue(ant);

        const ga: any = (agregado as any)?.gestacion_actual ?? null;
        if (ga) {
          gaForm.setFieldsValue({ ...ga, fum: ga.fum ? dayjs(ga.fum) : undefined, fpp: ga.fpp ? dayjs(ga.fpp) : undefined });
        }

        const pa: any = (agregado as any)?.parto_aborto ?? null;
        if (pa) {
          paForm.setFieldsValue({
            ...pa,
            fecha_ingreso: pa.fecha_ingreso ? dayjs(pa.fecha_ingreso) : undefined,
            fecha_hora_nacimiento: pa.fecha_hora_nacimiento ? dayjs(pa.fecha_hora_nacimiento) : undefined,
          });
        }

        const pat: any = (agregado as any)?.patologias ?? null;
        if (pat) patForm.setFieldsValue(pat);

        const rn: any = (agregado as any)?.recien_nacido ?? null;
        if (rn) rnForm.setFieldsValue(rn);

        const pue: any = (agregado as any)?.puerperio ?? null;
        if (pue) pueForm.setFieldsValue(pue);

        const en: any = (agregado as any)?.egreso_neonatal ?? null;
        if (en) {
          enForm.setFieldsValue({
            ...en,
            fecha_hora_evento: en.fecha_hora_evento ? dayjs(en.fecha_hora_evento) : undefined,
          });
        }

        const em: any = (agregado as any)?.egreso_materno ?? null;
        if (em) {
          // em viene completo en agregado (y top-level pares también)
          emForm.setFieldsValue({
            antirrubeola_post_parto: (agregado as any)?.antirrubeola_post_parto,
            gamma_globulina_antiD: (agregado as any)?.gamma_globulina_antiD,
            egreso_materno: em,
            dias_completos_desde_parto: (agregado as any)?.dias_completos_desde_parto,
            responsable: (agregado as any)?.responsable,
          });
        }
        const ac: any = (agregado as any)?.anticoncepcion ?? null;
        if (ac) acForm.setFieldsValue(ac);
      } catch {
        // no-op
      }
    })();
  }, [open, historialId, pacienteId, form, antForm, gaForm, paForm, patForm, rnForm, pueForm, enForm, emForm, acForm]);

  const steps = useMemo(
    () => [
      { key: "identificacion", title: "Identificación" },
      { key: "antecedentes", title: "Antecedentes" },
      { key: "gestacion", title: "Gestación actual" },
      { key: "parto", title: "Parto/aborto" },
      { key: "patologias", title: "Patologías" },
      { key: "recien_nacido", title: "Recién nacido" },
      { key: "puerperio", title: "Puerperio" },
      { key: "egreso_neonatal", title: "Egreso neonatal" },
      { key: "egreso_materno", title: "Egreso materno" },
      { key: "anticoncepcion", title: "Anticoncepci��n" },
    ],
    []
  );

  const handlePrev = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const buildIdentificacionPayload = (values: IdentificacionFormValues) => ({
    nombres: values.nombres.trim(),
    apellidos: values.apellidos.trim(),
    cedula: values.cedula.trim(),
    fecha_nacimiento: values.fecha_nacimiento?.format("YYYY-MM-DD") ?? "",
    edad: Number(values.edad ?? 0),
    etnia: values.etnia,
    alfabeta: Boolean(values.alfabeta),
    nivel_estudios: values.nivel_estudios,
    anio_estudios: Number(values.anio_estudios ?? 0),
    estado_civil: values.estado_civil,
    vive_sola: Boolean(values.vive_sola),
    domicilio: values.domicilio.trim(),
    telefono: values.telefono.trim(),
    localidad: values.localidad.trim(),
    establecimiento_salud: values.establecimiento_salud.trim(),
    lugar_parto: values.lugar_parto.trim(),
    paciente_id: pacienteId,
  });

  const handleFinish = async () => {
    try {
      if (currentStep < steps.length - 1) {
        setCurrentStep((s) => s + 1);
        return;
      }

      const idValues = await form.validateFields();
      if (!idValues.fecha_nacimiento) {
        message.error("Selecciona la fecha de nacimiento");
        return;
      }
      const identificacion = buildIdentificacionPayload(idValues);

        let antecedentes: any;
        try { antecedentes = await antForm.validateFields(); antecedentes = {
          ...antecedentes,
          fecha_fin_ultimo_embarazo: antecedentes.fecha_fin_ultimo_embarazo
            ? antecedentes.fecha_fin_ultimo_embarazo.format("YYYY-MM-DD")
            : "",
        };
        if (!isEditMode && antecedentes.tiempo_desde_ultimo_embarazo === "__auto__") {
          delete antecedentes.tiempo_desde_ultimo_embarazo;
        }
        const antErr = validateAntecedentes(antecedentes as Partial<AntecedentesFormValues>); if (antErr) { message.error(antErr); setCurrentStep(1); return; } } catch {}

      let gestacion_actual: any;
      try { const v = await gaForm.validateFields(); gestacion_actual = { ...v,
        fum: v.fum ? v.fum.format("YYYY-MM-DD") : "",
        fpp: v.fpp ? v.fpp.format("YYYY-MM-DD") : "",
      }; } catch {}

      let parto_aborto: any;
      try { const v = await paForm.validateFields(); parto_aborto = { ...v,
        fecha_ingreso: v.fecha_ingreso ? v.fecha_ingreso.format("YYYY-MM-DD") : "",
        fecha_hora_nacimiento: v.fecha_hora_nacimiento ? v.fecha_hora_nacimiento.format("YYYY-MM-DDTHH:mm") : "",
      }; } catch {}

      let patologias: any;
      try { patologias = await patForm.validateFields(); } catch {}

      let recien_nacido: any;
      try { recien_nacido = await rnForm.validateFields(); } catch {}

      let puerperio: any;
      try { const v = await pueForm.validateFields(); puerperio = { ...v, puerperio_inmediato: v.puerperio_inmediato ?? [] }; } catch {}

      let egreso_neonatal: any;
      try { const v = await enForm.validateFields(); egreso_neonatal = { ...v, fecha_hora_evento: v.fecha_hora_evento ? v.fecha_hora_evento.format("YYYY-MM-DD HH:mm") : "" }; } catch {}

      let egreso_materno: any;
      try { const v = await emForm.validateFields(); egreso_materno = { ...v, egreso_materno: { ...v.egreso_materno, fecha: v.egreso_materno?.fecha ? v.egreso_materno.fecha.format("YYYY-MM-DD HH:mm") : "" } }; } catch {}
      let anticoncepcion: any;
      try { anticoncepcion = await acForm.validateFields(); } catch {}

      if (isEditMode && historialId) {
          await actualizarHistorialMutation.mutateAsync({
            historial_id: historialId,
            identificacion,
            ...(antecedentes ? { antecedentes } : {}),
            ...(gestacion_actual ? { gestacion_actual } : {}),
            ...(parto_aborto ? { parto_aborto } : {}),
            ...(patologias ? { patologias } : {}),
            ...(recien_nacido ? { recien_nacido } : {}),
            ...(puerperio ? { puerperio } : {}),
            ...(egreso_neonatal ? { egreso_neonatal } : {}),
            ...(egreso_materno ? { egreso_materno } : {}),
            ...(anticoncepcion ? { anticoncepcion } : {}),
          });
        } else {
          const payload: CrearHistorialPayload = {
            datos: { paciente_id: pacienteId },
            identificacion,
            ...(antecedentes ? { antecedentes } : {}),
            ...(gestacion_actual ? { gestacion_actual } : {}),
            ...(parto_aborto ? { parto_aborto } : {}),
            ...(patologias ? { patologias } : {}),
            ...(recien_nacido ? { recien_nacido } : {}),
            ...(puerperio ? { puerperio } : {}),
            ...(egreso_neonatal ? { egreso_neonatal } : {}),
            ...(egreso_materno ? { egreso_materno } : {}),
            ...(anticoncepcion ? { anticoncepcion } : {}),
          };
        await crearHistorialMutation.mutateAsync(payload);
      }
    } catch (error) {
      if (error instanceof Error && error.message) {
        message.error(error.message);
      }
    }
  };

  return (
    <Modal open={open} onCancel={onClose} destroyOnHidden width={1000} footer={null} title={null}>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        Historial clínico perinatal
      </Typography.Title>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 24 }}>
        Completa los segmentos. Iniciamos por Identificación.
      </Typography.Paragraph>

      <Steps
        size="small"
        current={currentStep}
        items={steps.map((step, index) => ({
          key: step.key,
          title: step.title,
          status: index < currentStep ? "finish" : index === currentStep ? "process" : "wait",
        }))}
        style={{ marginBottom: 32 }}
        onChange={(i) => setCurrentStep(i)}
      />

      {currentStep === 0 ? (
        <Form<IdentificacionFormValues>
          form={form}
          layout="vertical"
          onValuesChange={(changed) => {
            if (changed.fecha_nacimiento) {
              const fecha = changed.fecha_nacimiento as Dayjs;
              form.setFieldValue("edad", calculateAge(fecha));
            }
          }}
        >
          <IdentificacionStep
            form={form}
            etniaOptions={etniaOptions}
            nivelEstudiosOptions={nivelEstudiosOptions}
          estadoCivilOptions={estadoCivilOptions}
          />
          {/*
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Nombres" name="nombres" rules={[{ required: true, message: "Ingresa los nombres" }]}>
                <Input placeholder="Según documento" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Apellidos" name="apellidos" rules={[{ required: true, message: "Ingresa los apellidos" }]}>
                <Input placeholder="Según documento" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={10}>
              <Form.Item label="Número de identidad" name="cedula" rules={[{ required: true, message: "Ingresa la cédula" }]}>
                <Input placeholder="Ej: 001-010101-0000A" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Fecha de nacimiento" name="fecha_nacimiento" rules={[{ required: true, message: "Selecciona la fecha" }]}>
                <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item label="Edad" name="edad" rules={[{ required: true, message: "Indica la edad" }]}>
                <InputNumber min={0} max={120} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item label="Etnia" name="etnia" rules={[{ required: true, message: "Selecciona la etnia" }]}>
                <Select options={etniaOptions} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Alfabeta" name="alfabeta">
                <Select options={[{ value: true, label: "Sí" }, { value: false, label: "No" }]} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Nivel de estudios" name="nivel_estudios" rules={[{ required: true, message: "Selecciona el nivel" }]}>
                <Select options={nivelEstudiosOptions} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item label="Años en el mayor nivel" name="anio_estudios" rules={[{ required: true, message: "Indica los años" }]}>
                <InputNumber min={0} max={30} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Estado civil" name="estado_civil" rules={[{ required: true, message: "Selecciona el estado civil" }]}>
                <Select options={estadoCivilOptions} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Vive sola" name="vive_sola">
                <Select options={[{ value: true, label: "Sí" }, { value: false, label: "No" }]} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Domicilio" name="domicilio" rules={[{ required: true, message: "Ingresa el domicilio" }]}>
                <Input.TextArea rows={2} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Localidad" name="localidad" rules={[{ required: true, message: "Ingresa la localidad" }]}>
                <Input placeholder="Ciudad / municipio" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Teléfono" name="telefono" rules={[{ required: true, message: "Ingresa el teléfono" }]}>
                <Input placeholder="Número de contacto" />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item label="Establecimiento salud" name="establecimiento_salud" rules={[{ required: true, message: "Ingresa el establecimiento" }]}>
                <Input placeholder="Nombre o código" />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item label="Lugar parto/aborto" name="lugar_parto" rules={[{ required: true, message: "Ingresa el lugar" }]}>
                <Input placeholder="Nombre o código" />
              </Form.Item>
            </Col>
          </Row>
          */}
        </Form>
      ) : currentStep === 1 ? (
        <Form form={antForm} layout="vertical">
          <AntecedentesStep form={antForm} />
        </Form>
      ) : currentStep === 2 ? (
        <Form form={gaForm} layout="vertical">
          <GestacionActualStep form={gaForm} />
        </Form>
      ) : currentStep === 3 ? (
        <Form form={paForm} layout="vertical">
          <PartoAbortoStep form={paForm} />
        </Form>
      ) : currentStep === 4 ? (
        <Form form={patForm} layout="vertical">
          <PatologiasStep form={patForm} />
        </Form>
      ) : currentStep === 5 ? (
        <Form form={rnForm} layout="vertical">
          <RecienNacidoStep form={rnForm} />
        </Form>
      ) : currentStep === 6 ? (
        <Form form={pueForm} layout="vertical">
          <PuerperioStep form={pueForm} />
        </Form>
      ) : currentStep === 7 ? (
        <Form form={enForm} layout="vertical">
          <EgresoNeonatalStep form={enForm} />
        </Form>
      ) : currentStep === 8 ? (
        <Form form={emForm} layout="vertical">
          <EgresoMaternoStep form={emForm} />
        </Form>
      ) : currentStep === 9 ? (
        <Form form={acForm} layout="vertical">
          <AnticoncepcionStep form={acForm} />
        </Form>
      ) : null}

      <Space style={{ width: "100%", marginTop: 32, justifyContent: "space-between" }}>
        <Button onClick={handlePrev} disabled={currentStep === 0}>
          Anterior
        </Button>
        <Space>
          <Button onClick={onClose} disabled={crearHistorialMutation.isPending || actualizarHistorialMutation.isPending}>
            Cancelar
          </Button>
          <Button
            type="primary"
            onClick={currentStep >= steps.length - 1 ? handleFinish : () => setCurrentStep(currentStep + 1)}
            loading={crearHistorialMutation.isPending || actualizarHistorialMutation.isPending}
          >
            {currentStep >= steps.length - 1 ? (isEditMode ? "Actualizar historial" : "Guardar historial") : "Siguiente"}
          </Button>
        </Space>
      </Space>
    </Modal>
  );
};

export default HistorialWizard;
