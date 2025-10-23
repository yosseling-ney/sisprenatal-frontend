import React, { useState, useCallback, useMemo } from "react";
import type { FormInstance } from "antd";
import {
  Card,
  Typography,
  Row,
  Col,
  Space,
  Divider,
  Alert,
  Button,
  Checkbox,
  Select,
  Input,
} from "antd";
import {
  ClipboardCheck,
  HeartHandshake,
  Syringe,
  Calendar,
  Wrench,
} from "lucide-react";

/* ===================== Tipos (lógica intacta) ===================== */

interface FieldProps {
  label: string;
  name: keyof AntecedentesData;
  value: any;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  type?: string;
  min?: number;
  disabled?: boolean;
  className?: string;
}

type DiabetesTipo = "ninguna" | "tipo I" | "tipo II" | "gestacional";
type UltimoPrevioPeso = "< 2500g" | "normal/n/c" | "> 4000g" | "no_aplica";
type UltimoPrevioFechaTiempo =
  | "< 1 año"
  | "1 a < 2 años"
  | "2 a < 5 años"
  | ">= 5 años";

type AntecedentesFamiliares = {
  tbc: boolean;
  diabetes: boolean;
  hipertension: boolean;
  preeclampsia: boolean;
  eclampsia: boolean;
  otra_condicion_medica_grave: boolean;
  observaciones: string;
};

type AntecedentesPersonales = {
  tbc: boolean;
  diabetes: boolean;
  diabetes_tipo: DiabetesTipo;
  hipertension: boolean;
  preeclampsia: boolean;
  eclampsia: boolean;
  otra_condicion_medica_grave: boolean;
  violencia: boolean;
  vih: boolean;
  cirugia_genito_urinaria: boolean;
  infertilidad: boolean;
  cardiopatia: boolean;
  nefropatia: boolean;
  antecedente_gemelares: boolean;
  observaciones: string;
  // opcional si decides enviarlo anidado desde el front
  // peso_ultimo_previo?: "menor a 2500g" | "entre 2500g y 4000g" | "mayor a 4000g" | "no aplica/sin dato";
};

type AntecedentesData = {
  antecedentes_familiares: AntecedentesFamiliares;
  antecedentes_personales: AntecedentesPersonales;

  gesta_previa: number;
  partos: number;
  cesareas: number;
  vaginales: number;
  abortos: number;
  nacidos_vivos: number;
  nacidos_muertos: number;
  embarazo_ectopico: number;
  hijos_vivos: number;
  muertos_primera_semana: number;
  muertos_despues_semana: number;

  ultimo_previo_peso: UltimoPrevioPeso;

  fecha_fin_ultimo_embarazo: string;
  ultimo_previo_fecha_tiempo: UltimoPrevioFechaTiempo;
  embarazo_planeado: "si" | "no";
  fracaso_metodo_anticonceptivo:
    | "no_usaba"
    | "barrera"
    | "diu"
    | "hormonal"
    | "emergencia"
    | "natural";
};

// Export para compatibilidad con HistorialWizard
export interface AntecedentesFormValues {
  gesta_previa: number;
  partos: number;
  cesareas: number;
  vaginales: number;
  abortos: number;
  nacidos_vivos: number;
  nacidos_muertos: number;
  embarazo_ectopico: number;
  hijos_vivos: number;
  muertos_primera_semana: number;
  muertos_despues_semana: number;
  fecha_fin_ultimo_embarazo?: any;
  embarazo_planeado?: "si" | "no";
  fracaso_metodo_anticonceptivo?:
    | "no_usaba"
    | "barrera"
    | "diu"
    | "hormonal"
    | "emergencia"
    | "natural";
  tiempo_desde_ultimo_embarazo?: string;
  antecedentes_familiares?: Record<string, unknown>;
  antecedentes_personales?: Record<string, unknown>;
}

/* === SOLO claves numéricas obstétricas (para resetear a 0) === */

type ObstetricKey =
  | "partos"
  | "cesareas"
  | "vaginales"
  | "abortos"
  | "nacidos_vivos"
  | "nacidos_muertos"
  | "embarazo_ectopico"
  | "hijos_vivos"
  | "muertos_primera_semana"
  | "muertos_despues_semana";

const OBSTETRIC_FIELDS: ObstetricKey[] = [
  "partos",
  "cesareas",
  "vaginales",
  "abortos",
  "nacidos_vivos",
  "nacidos_muertos",
  "embarazo_ectopico",
  "hijos_vivos",
  "muertos_primera_semana",
  "muertos_despues_semana",
];

/* ===================== Estado inicial ===================== */

const initialFormData: AntecedentesData = {
  antecedentes_familiares: {
    tbc: false,
    diabetes: false,
    hipertension: false,
    preeclampsia: false,
    eclampsia: false,
    otra_condicion_medica_grave: false,
    observaciones: "",
  },
  antecedentes_personales: {
    tbc: false,
    diabetes: false,
    diabetes_tipo: "ninguna",
    hipertension: false,
    preeclampsia: false,
    eclampsia: false,
    otra_condicion_medica_grave: false,
    violencia: false,
    vih: false,
    cirugia_genito_urinaria: false,
    infertilidad: false,
    cardiopatia: false,
    nefropatia: false,
    antecedente_gemelares: false,
    observaciones: "",
  },
  gesta_previa: 0,
  partos: 0,
  cesareas: 0,
  vaginales: 0,
  abortos: 0,
  nacidos_vivos: 0,
  nacidos_muertos: 0,
  embarazo_ectopico: 0,
  hijos_vivos: 0,
  muertos_primera_semana: 0,
  muertos_despues_semana: 0,
  ultimo_previo_peso: "no_aplica",
  fecha_fin_ultimo_embarazo: new Date().toISOString().split("T")[0],
  ultimo_previo_fecha_tiempo: ">= 5 años",
  embarazo_planeado: "si",
  fracaso_metodo_anticonceptivo: "no_usaba",
};

/* ===================== UI helpers ===================== */

const { Title, Text } = Typography;
const { Option } = Select;

const inputClass = "w-full"; // estilizado por Ant Design

interface FieldsetProps {
  title: string;
  icon: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
}

const Fieldset: React.FC<FieldsetProps> = ({ title, icon, subtitle, children }) => (
  <Card
    bordered
    className="mb-6"
    title={
      <Space align="center">
        <span style={{ display: "inline-flex", alignItems: "center" }}>{icon}</span>
        <Title level={4} style={{ margin: 0 }}>{title}</Title>
      </Space>
    }
    extra={subtitle ? <Text type="secondary">{subtitle}</Text> : null}
  >
    {children}
  </Card>
);

interface CheckboxGroupProps {
  title: string;
  data: Record<string, boolean | string>;
  onCheckChange: (key: string, value: boolean) => void;
  onTextChange: (key: string, value: string) => void;
  nestedKey: "antecedentes_familiares" | "antecedentes_personales";
}

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  title,
  data,
  onCheckChange,
  onTextChange,
}) => {
  const booleanKeys = Object.keys(data).filter((k) => typeof data[k] === "boolean");
  const textKey = Object.keys(data).find((k) => k === "observaciones");
  const diabetesTypeKey = Object.keys(data).find((k) => k === "diabetes_tipo");
  const hasDiabetes = (data as any).diabetes === true;

  const fieldLabels: Record<string, string> = {
    tbc: "Tuberculosis (TBC)",
    diabetes: "Diabetes Mellitus",
    hipertension: "Hipertensión Arterial",
    preeclampsia: "Preeclampsia",
    eclampsia: "Eclampsia",
    otra_condicion_medica_grave: "Otra Condición Médica Grave",
    violencia: "Violencia (Pareja o Sexual)",
    vih: "VIH",
    cirugia_genito_urinaria: "Cirugía Genito-Urinaria Previa",
    infertilidad: "Infertilidad",
    cardiopatia: "Cardiopatía",
    nefropatia: "Nefropatía",
    antecedente_gemelares: "Antecedente de Gestación Gemelar",
  };

  const toLabel = (key: string) =>
    fieldLabels[key] || key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <Card size="small" title={<Space><ClipboardCheck size={16}/> <Text strong>{title}</Text></Space>}>
      <Space direction="vertical" style={{ width: "100%" }}>
        <Row gutter={[12, 8]}>
          {booleanKeys.map((key) => (
            <Col xs={24} sm={12} key={key}>
              <Checkbox
                checked={!!data[key]}
                onChange={(e) => onCheckChange(key, e.target.checked)}
              >
                {toLabel(key)}
              </Checkbox>
            </Col>
          ))}
        </Row>

        {diabetesTypeKey && (
          <div>
            <Text strong>Tipo de Diabetes (si aplica): </Text>
            <Select
              style={{ width: "100%", marginTop: 8 }}
              value={(data[diabetesTypeKey] as string) ?? "ninguna"}
              onChange={(v) => onTextChange("diabetes_tipo", v)}
              disabled={!hasDiabetes}
            >
              {(["ninguna", "tipo I", "tipo II", "gestacional"] as const).map((tipo) => (
                <Option key={tipo} value={tipo}>{tipo}</Option>
              ))}
            </Select>
            {!hasDiabetes && (
              <Text type="secondary" style={{ fontSize: 12 }}>Marca "Diabetes Mellitus" para habilitar.</Text>
            )}
          </div>
        )}

        {textKey && (
          <div>
            <Text strong>Observaciones:</Text>
            <Input.TextArea
              rows={2}
              value={(data[textKey] as string) ?? ""}
              onChange={(e) => onTextChange(textKey, e.target.value)}
              placeholder={`Notas adicionales sobre ${title.toLowerCase()}...`}
              style={{ marginTop: 8 }}
            />
          </div>
        )}
      </Space>
    </Card>
  );
};

const LabeledInput: React.FC<FieldProps> = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  min = 0,
  disabled = false,
  className = "",
}) => (
  <div className={className}>
    <Text strong>{label}</Text>
    <Input
      type={type}
      name={String(name)}
      min={min}
      value={value}
      onChange={onChange}
      required
      disabled={disabled}
      className={inputClass}
      placeholder={type === "number" ? "0" : ""}
      style={{ marginTop: 6 }}
    />
  </div>
);

/* ===================== Utilidades puras + TESTS ===================== */

export const obstetricConsistencyOk = (partos: number, cesareas: number, vaginales: number) =>
  partos === cesareas + vaginales;
export const pesoRequeridoSiGesta = (gesta_previa: number, peso: UltimoPrevioPeso) =>
  gesta_previa === 0 ? true : peso !== "no_aplica";

// Mini-tests
if (typeof window !== "undefined" && (window as any).__RUN_ANTECEDENTES_TESTS__) {
  console.assert(obstetricConsistencyOk(3, 1, 2) === true, "Test 1: 3 == 1+2");
  console.assert(obstetricConsistencyOk(2, 1, 0) === false, "Test 2: 2 != 1+0");
  console.assert(pesoRequeridoSiGesta(0, "no_aplica") === true, "Test 3: G=0 permite no_aplica");
  console.assert(pesoRequeridoSiGesta(1, "no_aplica") === false, "Test 4: G>0 requiere peso válido");
}

/* ===================== Componente ===================== */

type Props = {
  form: FormInstance<any>;
};

const AntecedentesStep: React.FC<Props> = ({ form: _form }) => {
  const [formData, setFormData] = useState<AntecedentesData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const isObstetricDisabled = useMemo(() => formData.gesta_previa === 0, [formData.gesta_previa]);

  const handleChange = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
      const { name, value, type } = e.target as HTMLInputElement;
      let newValue: string | number | UltimoPrevioPeso | UltimoPrevioFechaTiempo = value;
      if (type === "number") {
        newValue = Math.max(0, parseInt(value, 10) || 0);
      }
      setFormData((prev) => {
        if (name === "gesta_previa") {
          const gp = parseInt(String(value), 10) || 0;
          if (gp === 0) {
            const resetFields = OBSTETRIC_FIELDS.reduce((acc, field) => {
              acc[field] = 0;
              return acc;
            }, {} as Record<ObstetricKey, number>);
            return { ...prev, ...resetFields, gesta_previa: 0, ultimo_previo_peso: "no_aplica" } as AntecedentesData;
          }
          return { ...prev, gesta_previa: gp };
        }
        return { ...prev, [name]: newValue } as AntecedentesData;
      });
    },
    []
  );

  const handleNestedCheckChange = useCallback(
    (
      parentKey: "antecedentes_familiares" | "antecedentes_personales",
      childKey: string,
      value: boolean
    ) => {
      setFormData((prev) => {
        if (parentKey === "antecedentes_personales") {
          const ap: AntecedentesPersonales = { ...prev.antecedentes_personales, [childKey]: value } as AntecedentesPersonales;
          if (childKey === "diabetes" && value === false) ap.diabetes_tipo = "ninguna";
          return { ...prev, antecedentes_personales: ap };
        } else {
          const af: AntecedentesFamiliares = { ...prev.antecedentes_familiares, [childKey]: value } as AntecedentesFamiliares;
          return { ...prev, antecedentes_familiares: af };
        }
      });
    },
    []
  );

  const handleNestedTextChange = useCallback(
    (
      parentKey: "antecedentes_familiares" | "antecedentes_personales",
      childKey: string,
      value: string
    ) => {
      setFormData((prev) => {
        if (parentKey === "antecedentes_personales") {
          const ap: AntecedentesPersonales = { ...prev.antecedentes_personales, [childKey]: value } as AntecedentesPersonales;
          return { ...prev, antecedentes_personales: ap };
        } else {
          const af: AntecedentesFamiliares = { ...prev.antecedentes_familiares, [childKey]: value } as AntecedentesFamiliares;
          return { ...prev, antecedentes_familiares: af };
        }
      });
    },
    []
  );

  const validateCoherence = useCallback((): boolean => {
    const { partos, cesareas, vaginales } = formData;
    const partosCV = cesareas + vaginales;
    if (!isObstetricDisabled && partos !== partosCV) {
      setMessage({ type: "error", text: `Inconsistencia Obstétrica: Partos (${partos}) debe ser igual a Cesáreas (${cesareas}) + Vaginales (${vaginales}).` });
      return false;
    }
    if (formData.gesta_previa > 0 && formData.ultimo_previo_peso === "no_aplica") {
      setMessage({ type: "error", text: 'Si Gesta Previa > 0, debe especificar el peso del Último Previo (no puede ser "No Aplica").' });
      return false;
    }
    return true;
  }, [formData, isObstetricDisabled]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!validateCoherence()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // --- Construir payload compatible con el backend ---
    const payload = {
      antecedentes_familiares: {
        ...formData.antecedentes_familiares,
      },
      antecedentes_personales: {
        ...formData.antecedentes_personales,
        // opcional: enviarlo anidado; si no, el backend igual mapea `ultimo_previo_peso`
        peso_ultimo_previo: formData.ultimo_previo_peso,
      },

      // Obstétricos
      gesta_previa: formData.gesta_previa,
      partos: formData.partos,
      cesareas: formData.cesareas,
      vaginales: formData.vaginales,
      abortos: formData.abortos,
      nacidos_vivos: formData.nacidos_vivos,
      nacidos_muertos: formData.nacidos_muertos,
      embarazo_ectopico: formData.embarazo_ectopico,
      hijos_vivos: formData.hijos_vivos,
      muertos_primera_semana: formData.muertos_primera_semana,
      muertos_despues_semana: formData.muertos_despues_semana,

      // Fechas / enums
      fecha_fin_ultimo_embarazo: formData.fecha_fin_ultimo_embarazo,       // 'YYYY-MM-DD'
      tiempo_desde_ultimo_embarazo: formData.ultimo_previo_fecha_tiempo,   // enum esperado
      embarazo_planeado: formData.embarazo_planeado,
      fracaso_metodo_anticonceptivo: formData.fracaso_metodo_anticonceptivo,
    };

    try {
      setIsSubmitting(true);

      // TODO: sustituye por tu endpoint real y el historial id correcto
      const historialId = "HISTORIAL_ID_REAL";
      const res = await fetch(`/api/antecedentes/${encodeURIComponent(historialId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json?.error || "No se pudo guardar");
      }

      setMessage({ type: "success", text: "Antecedentes clínicos guardados correctamente." });
      setFormData(initialFormData);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Error inesperado al guardar." });
    } finally {
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        {message && (
          <Alert
            type={message.type === "success" ? "success" : "error"}
            message={message.text}
            showIcon
          />
        )}

        <form onSubmit={handleSubmit}>
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Fieldset
              title="Antecedentes Médicos"
              icon={<HeartHandshake size={18} />}
              subtitle="Marca los antecedentes que aplican e incluye observaciones."
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <CheckboxGroup
                    title="Antecedentes Familiares"
                    nestedKey="antecedentes_familiares"
                    data={formData.antecedentes_familiares as Record<string, boolean | string>}
                    onCheckChange={(k, v) => handleNestedCheckChange("antecedentes_familiares", k, v)}
                    onTextChange={(k, v) => handleNestedTextChange("antecedentes_familiares", k, v)}
                  />
                </Col>
                <Col xs={24} md={12}>
                  <CheckboxGroup
                    title="Antecedentes Personales y Patológicos"
                    nestedKey="antecedentes_personales"
                    data={formData.antecedentes_personales as Record<string, boolean | string>}
                    onCheckChange={(k, v) => handleNestedCheckChange("antecedentes_personales", k, v)}
                    onTextChange={(k, v) => handleNestedTextChange("antecedentes_personales", k, v)}
                  />
                </Col>
              </Row>
            </Fieldset>

            <Fieldset
              title="Historial Obstétrico (Paridad)"
              icon={<Syringe size={18} />}
              subtitle="Registra los resultados obstétricos previos y la situación actual."
            >
              <Card size="small" style={{ marginBottom: 12 }}>
                <Text strong>Gesta Previa (G) *</Text>
                <Input
                  type="number"
                  name="gesta_previa"
                  min={0}
                  value={formData.gesta_previa}
                  onChange={handleChange}
                  required
                  style={{ marginTop: 6, textAlign: "center", fontVariantNumeric: "tabular-nums" }}
                />
                <Alert
                  style={{ marginTop: 12 }}
                  type={isObstetricDisabled ? "warning" : "success"}
                  message={
                    isObstetricDisabled
                      ? "Como la Gesta Previa es 0, los valores de Paridad se establecieron automáticamente en 0 y no requieren modificación"
                      : "Gesta Previa > 0. Complete los campos del historial obstétrico."
                  }
                  showIcon
                />
              </Card>

              <Divider orientation="left">Resultados de Partos Previos</Divider>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Text strong>Peso de Último Embarazo Previo *</Text>
                  <Select
                    value={formData.ultimo_previo_peso}
                    onChange={(v) =>
                      handleChange({
                        target: { name: "ultimo_previo_peso", value: v, type: "select-one" },
                      } as unknown as React.ChangeEvent<HTMLSelectElement>)
                    }
                    style={{ width: "100%", marginTop: 6 }}
                  >
                    <Option value="no_aplica">No Aplica / Sin Dato (G=0)</Option>
                    <Option value="< 2500g">Bajo Peso (&lt; 2500g)</Option>
                    <Option value="normal/n/c">Normal (2500g a 4000g)</Option>
                    <Option value="> 4000g">Macrosomía (&gt; 4000g)</Option>
                  </Select>
                  {formData.gesta_previa > 0 && formData.ultimo_previo_peso === "no_aplica" && (
                    <Text type="danger" style={{ display: "block", marginTop: 6, fontSize: 12 }}>
                      Debe seleccionar un peso si Gesta Previa es &gt; 0.
                    </Text>
                  )}
                </Col>

                <Col xs={24} sm={12}>
                  <Text strong>Antecedente de Gemelares (en historial)</Text>
                  <Select
                    value={formData.antecedentes_personales.antecedente_gemelares ? "si" : "no"}
                    onChange={(v) =>
                      handleNestedCheckChange("antecedentes_personales", "antecedente_gemelares", v === "si")
                    }
                    style={{ width: "100%", marginTop: 6 }}
                  >
                    <Option value="no">No</Option>
                    <Option value="si">Sí</Option>
                  </Select>
                </Col>
              </Row>

              <Row gutter={[16, 16]} style={{ marginTop: 12 }}>
                {([
                  { name: "partos", label: "Partos (P)" },
                  { name: "abortos", label: "Abortos (A)" },
                  { name: "embarazo_ectopico", label: "Embarazo Ectópico" },
                  { name: "cesareas", label: "Cesáreas (C)" },
                  { name: "vaginales", label: "Vaginales (V)" },
                ] as const).map(({ name, label }) => (
                  <Col xs={12} sm={8} key={name}>
                    <LabeledInput
                      label={label}
                      name={name}
                      value={formData[name]}
                      onChange={handleChange}
                      type="number"
                      disabled={isObstetricDisabled}
                    />
                  </Col>
                ))}
              </Row>

              <Divider orientation="left">Hijos y Mortalidad</Divider>
              <Row gutter={[16, 16]}>
                {([
                  { name: "hijos_vivos", label: "Hijos Vivos Actuales" },
                  { name: "nacidos_vivos", label: "Nacidos Vivos" },
                  { name: "nacidos_muertos", label: "Nacidos Muertos" },
                  { name: "muertos_primera_semana", label: "Mortalidad < 1ra Semana" },
                  { name: "muertos_despues_semana", label: "Mortalidad > 1ra Semana" },
                ] as const).map(({ name, label }) => (
                  <Col xs={12} sm={8} key={name}>
                    <LabeledInput
                      label={label}
                      name={name}
                      value={formData[name]}
                      onChange={handleChange}
                      type="number"
                      disabled={isObstetricDisabled}
                    />
                  </Col>
                ))}
              </Row>
            </Fieldset>

            <Fieldset
              title="Detalles Adicionales de la Gestación"
              icon={<Calendar size={18} />}
              subtitle="Información complementaria del embarazo actual."
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <LabeledInput
                    label="Fecha de Fin de Último Embarazo (FFUE)"
                    name="fecha_fin_ultimo_embarazo"
                    value={formData.fecha_fin_ultimo_embarazo}
                    onChange={handleChange}
                    type="date"
                  />
                </Col>
                <Col xs={24} sm={12}>
                  <Text strong>Tiempo Transcurrido desde FFUE *</Text>
                  <Select
                    value={formData.ultimo_previo_fecha_tiempo}
                    onChange={(v) =>
                      handleChange({
                        target: { name: "ultimo_previo_fecha_tiempo", value: v, type: "select-one" },
                      } as unknown as React.ChangeEvent<HTMLSelectElement>)
                    }
                    style={{ width: "100%", marginTop: 6 }}
                  >
                    <Option value="< 1 año">Menos de 1 año</Option>
                    <Option value="1 a < 2 años">1 a menos de 2 años</Option>
                    <Option value="2 a < 5 años">2 a menos de 5 años</Option>
                    <Option value=">= 5 años">5 años o más</Option>
                  </Select>
                </Col>

                <Col xs={24} sm={12}>
                  <Text strong>Embarazo Actual Planeado *</Text>
                  <Select
                    value={formData.embarazo_planeado}
                    onChange={(v) =>
                      handleChange({
                        target: { name: "embarazo_planeado", value: v, type: "select-one" },
                      } as unknown as React.ChangeEvent<HTMLSelectElement>)
                    }
                    style={{ width: "100%", marginTop: 6 }}
                  >
                    <Option value="si">Sí</Option>
                    <Option value="no">No</Option>
                  </Select>
                </Col>

                <Col xs={24} sm={12}>
                  <Text strong>Fracaso de Método Anticonceptivo *</Text>
                  <Select
                    value={formData.fracaso_metodo_anticonceptivo}
                    onChange={(v) =>
                      handleChange({
                        target: { name: "fracaso_metodo_anticonceptivo", value: v, type: "select-one" },
                      } as unknown as React.ChangeEvent<HTMLSelectElement>)
                    }
                    style={{ width: "100%", marginTop: 6 }}
                  >
                    <Option value="no_usaba">No Usaba</Option>
                    <Option value="barrera">Barrera (Condón)</Option>
                    <Option value="diu">DIU</Option>
                    <Option value="hormonal">Hormonal</Option>
                    <Option value="emergencia">Emergencia</Option>
                    <Option value="natural">Natural</Option>
                  </Select>
                </Col>
              </Row>
            </Fieldset>

            {/* Barra inferior */}
          </Space>
        </form>
      </Space>
    </div>
  );
};

export default AntecedentesStep;
