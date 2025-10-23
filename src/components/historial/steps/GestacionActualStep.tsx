// GestacionActualStep.tsx — COMPLETO (APN principal + agregar más)
import React, { useMemo, useEffect } from "react";
import {
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Radio,
  Row,
  Select,
  Typography,
  Divider,
  Alert,
  Button,
  Space,
  Popconfirm,
} from "antd";

type VacRubeola = "previa" | "embarazo" | "no" | "no_sabe";
type GrupoSang = "A" | "B" | "AB" | "O";
type Rh = "+" | "-";
type VIHRes = "+" | "-" | "s/d" | "n/c";
type SifilisRes = "+" | "-" | "s/d";
type SifilisTrepRes = "+" | "-" | "s/d" | "n/c";
type TriNSI = "normal" | "anormal" | "no_se_hizo";
type TriSIG = "+" | "-" | "no_se_hizo";
type SiNoNc = "si" | "no" | "nc";
type EgPor = "fum_<20s" | "eco_<20s" | "nc";

const sinoNc = [
  { label: "Sí", value: "si" as SiNoNc },
  { label: "No", value: "no" as SiNoNc },
  { label: "N/C", value: "nc" as SiNoNc },
];

// Sí/No/S-D/N-C (para algunos campos de diagnóstico/tratamiento)
const siNoSdNcOptions = ["si", "no", "s/d", "nc"].map((v) => ({
  label: v === "si" ? "Sí" : v === "no" ? "No" : v === "nc" ? "N/C" : "s/d",
  value: v as any,
}));

const rubeolaOptions = [
  { label: "Previa", value: "previa" as VacRubeola },
  { label: "En embarazo", value: "embarazo" as VacRubeola },
  { label: "No", value: "no" as VacRubeola },
  { label: "No sabe", value: "no_sabe" as VacRubeola },
];

const grupoOptions = ["A", "B", "AB", "O"].map((v) => ({ label: v, value: v as GrupoSang }));
const rhOptions = ["+", "-"].map((v) => ({ label: v, value: v as Rh }));
const vihResOptions = ["+", "-", "s/d", "n/c"].map((v) => ({ label: v, value: v as VIHRes }));
const triNSIOptions = ["normal", "anormal", "no_se_hizo"].map((v) => ({
  label: v === "no_se_hizo" ? "No se hizo" : v.replace("_", " "),
  value: v as TriNSI,
}));
const triSIGOptions = ["+", "-", "no_se_hizo"].map((v) => ({
  label: v === "no_se_hizo" ? "No se hizo" : v,
  value: v as TriSIG,
}));
const sifNoTrepOptions = ["+", "-", "s/d"].map((v) => ({ label: v, value: v as SifilisRes }));
const sifTrepOptions = ["+", "-", "s/d", "n/c"].map((v) => ({ label: v, value: v as SifilisTrepRes }));
const egPorOptions = [
  { label: "FUM < 20s", value: "fum_<20s" as EgPor },
  { label: "ECO < 20s", value: "eco_<20s" as EgPor },
  { label: "N/C", value: "nc" as EgPor },
];

type Props = { form: ReturnType<typeof Form.useForm>[0] };

const GestacionActualStep: React.FC<Props> = ({ form }) => {
  // IMC auto
  const peso = Form.useWatch("peso_anterior", form);
  const talla = Form.useWatch("talla", form);
  const imc = useMemo(() => {
    const p = Number(peso || 0);
    const t = Number(talla || 0);
    return p > 0 && t > 0 ? +(p / (t * t)).toFixed(2) : undefined;
  }, [peso, talla]);

  // Asegurar que exista al menos un APN (principal)
  useEffect(() => {
    const apn = form.getFieldValue("apn");
    if (!apn || !Array.isArray(apn) || apn.length === 0) {
      form.setFieldsValue({ apn: [{}] });
    }
  }, [form]);

  // Vigilar cambios en APN para nunca quedar en cero
  const apnList = Form.useWatch("apn", form);
  useEffect(() => {
    if (!Array.isArray(apnList) || apnList.length === 0) {
      form.setFieldsValue({ apn: [{}] });
    }
  }, [apnList, form]);

  // Auto-calcular anemia: Hb <= 11 g/dL -> Sí
  const hbActual = Form.useWatch("hemoglobina", form);
  useEffect(() => {
    const n = Number(hbActual);
    if (Number.isFinite(n)) {
      const anemiaAuto = n <= 11;
      const current = form.getFieldValue("anemia");
      if (current !== anemiaAuto) {
        form.setFieldsValue({ anemia: anemiaAuto });
      }
    }
  }, [hbActual, form]);

  // Glucemia en ayunas ≥ 92 mg/dL (separado por corte gestacional)
  const glucemia1Val = Form.useWatch("glucemia1", form);
  const glucemia2Val = Form.useWatch("glucemia2", form);
  useEffect(() => {
    const g1 = Number(glucemia1Val);
    if (Number.isFinite(g1)) {
      const flag = g1 >= 92;
      const current = form.getFieldValue("glucemia_ayunas_ge_92_lt24");
      if (current !== flag) {
        form.setFieldsValue({ glucemia_ayunas_ge_92_lt24: flag });
      }
    }
  }, [glucemia1Val, form]);
  useEffect(() => {
    const g2 = Number(glucemia2Val);
    if (Number.isFinite(g2)) {
      const flag = g2 >= 92;
      const current = form.getFieldValue("glucemia_ayunas_ge_92_ge24");
      if (current !== flag) {
        form.setFieldsValue({ glucemia_ayunas_ge_92_ge24: flag });
      }
    }
  }, [glucemia2Val, form]);

  return (
    <>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        Gestación Actual
      </Typography.Title>

      {/* DATOS BÁSICOS */}
      <Typography.Title level={5}>Datos básicos</Typography.Title>
      <Row gutter={16}>
        <Col xs={24} md={6}>
          <Form.Item name="peso_anterior" label="Peso anterior (kg)" rules={[{ required: true }]}>
            <InputNumber min={0} max={300} step={0.1} style={{ width: "100%" }} />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="talla" label="Talla (m)" rules={[{ required: true }]}>
            <InputNumber min={0.5} max={2.5} step={0.01} style={{ width: "100%" }} />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item label="IMC">
            <Input value={imc ?? ""} readOnly placeholder="auto" />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="eg_confiable" label="EG confiable" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value>Si</Radio>
              <Radio value={false}>No</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} md={6}>
          <Form.Item name="fum" label="FUM" rules={[{ required: true }]}>
            <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="fpp" label="FPP" rules={[{ required: true }]}>
            <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="eg_confiable_por" label="EG confiable por">
            <Select options={egPorOptions} allowClear />
          </Form.Item>
        </Col>
      </Row>

      {/* ESTILOS DE VIDA (global) */}
      <Typography.Title level={5}>Estilos de vida (global)</Typography.Title>
      <Row gutter={16}>
        {[
          { name: "fumadora_activa", label: "Fumadora activa" },
          { name: "fumadora_pasiva", label: "Fumadora pasiva" },
          { name: "drogas", label: "Drogas" },
          { name: "alcohol", label: "Alcohol" },
          { name: "violencia", label: "Violencia" },
        ].map(({ name, label }) => (
          <Col xs={24} md={6} key={name}>
            <Form.Item name={name} label={label} rules={[{ required: true }]}>
              <Radio.Group>
                <Radio value>Si</Radio>
                <Radio value={false}>No</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
        ))}
      </Row>

      {/* ESTILOS DE VIDA POR TRIMESTRE */}
      <Typography.Title level={5}>Estilos de vida por trimestre</Typography.Title>
      <Row gutter={16}>
        {[
          ["fuma_act_t1", "Activa 1º"],
          ["fuma_act_t2", "Activa 2º"],
          ["fuma_act_t3", "Activa 3º"],
          ["fuma_pas_t1", "Pasiva 1º"],
          ["fuma_pas_t2", "Pasiva 2º"],
          ["fuma_pas_t3", "Pasiva 3º"],
          ["drogas_t1", "Drogas 1º"],
          ["drogas_t2", "Drogas 2º"],
          ["drogas_t3", "Drogas 3º"],
          ["alcohol_t1", "Alcohol 1º"],
          ["alcohol_t2", "Alcohol 2º"],
          ["alcohol_t3", "Alcohol 3º"],
          ["violencia_t1", "Violencia 1º"],
          ["violencia_t2", "Violencia 2º"],
          ["violencia_t3", "Violencia 3º"],
        ].map(([name, label]) => (
          <Col xs={24} md={6} key={name as string}>
            <Form.Item name={name as string} label={label as string}>
              <Select options={sinoNc} allowClear />
            </Form.Item>
          </Col>
        ))}
      </Row>

      {/* EXÁMENES / VACUNAS */}
      <Divider />
      <Typography.Title level={5}>Exámenes y vacunas</Typography.Title>
      <Row gutter={16}>
        <Col xs={24} md={6}>
          <Form.Item name="vacuna_rubeola" label="Antirubéola" rules={[{ required: true }]}>
            <Select options={rubeolaOptions} />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="vacuna_antitetanica" label="Antitetánica" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value>Si</Radio>
              <Radio value={false}>No</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="antitetanica_dosis" label="Dosis previas (0-6)">
            <InputNumber min={0} max={6} style={{ width: "100%" }} />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="antitetanica_mes_gestacion" label="Mes de gestación">
            <InputNumber min={0} max={45} style={{ width: "100%" }} />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} md={6}>
          <Form.Item name="examen_mamas" label="Examen mamas" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value>Si</Radio>
              <Radio value={false}>No</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="examen_odonto" label="Examen odontológico" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value>Si</Radio>
              <Radio value={false}>No</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="cervix_normal" label="Cérvix (clínico)" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value>Normal</Radio>
              <Radio value={false}>Anormal</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} md={6}>
          <Form.Item name="cervix_inspeccion" label="Inspección visual (espéculo)">
            <Select options={triNSIOptions} allowClear />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="pap" label="PAP">
            <Select options={triNSIOptions} allowClear />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="colposcopia" label="Colposcopía">
            <Select options={triNSIOptions} allowClear />
          </Form.Item>
        </Col>
      </Row>

      {/* GRUPO/RH */}
      <Divider />
      <Typography.Title level={5}>Grupo/Rh e inmunización</Typography.Title>
      <Row gutter={16}>
        <Col xs={24} md={6}>
          <Form.Item name="grupo_sanguineo" label="Grupo" rules={[{ required: true }]}>
            <Select options={grupoOptions} />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="rh" label="Rh" rules={[{ required: true }]}>
            <Select options={rhOptions} />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="inmunizada" label="Inmunizada anti-D" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value>Si</Radio>
              <Radio value={false}>No</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="gammaglobulina_estado" label="γGlobulina Anti-D">
            <Select options={sinoNc} allowClear />
          </Form.Item>
        </Col>
      </Row>

      {/* LABORATORIOS / TAMIZAJES */}
      <Divider />
      <Typography.Title level={5}>Laboratorios y tamizajes</Typography.Title>

      {/* Toxoplasmosis como en la tarjeta */}
      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Form.Item name="toxoplasmosis_igg_lt20" label="Toxoplasmosis IgG &lt;20 sem">
            <Select options={triSIGOptions} allowClear />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="toxoplasmosis_igg_ge20" label="Toxoplasmosis IgG ≥20 sem">
            <Select options={triSIGOptions} allowClear />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="toxoplasmosis_igm_primera" label="1ª consulta IgM">
            <Select options={triSIGOptions} allowClear />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={6}>
          <Form.Item name="hb_lt20" label="Hb &lt; 20 sem (g/dL)">
            <InputNumber min={0} max={30} step={0.1} style={{ width: "100%" }} />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="hb_ge20" label="Hb ≥ 20 sem (g/dL)">
            <InputNumber min={0} max={30} step={0.1} style={{ width: "100%" }} />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="hierro_indicado" label="Fe indicado" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value>Si</Radio>
              <Radio value={false}>No</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="acido_folico_indicado" label="Folatos indicados" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value>Si</Radio>
              <Radio value={false}>No</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="hemoglobina" label="Hemoglobina (actual) g/dL" rules={[{ required: true }]}>
            <InputNumber min={0} max={30} step={0.1} style={{ width: "100%" }} />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="anemia" label="Anemia (Hb ≤ 11 g/dL)" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value>Si</Radio>
              <Radio value={false}>No</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={6}>
          <Form.Item name="glucemia1" label="Glucemia &lt; 24 sem (mg/dL)" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="glucemia_ayunas_ge_92_lt24" label="Glucemia ayunas ≥ 92 mg/dL" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value>Si</Radio>
              <Radio value={false}>No</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={6}>
          <Form.Item name="glucemia2" label="Glucemia ≥ 24 sem (mg/dL)" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="glucemia_ayunas_ge_92_ge24" label="Glucemia ayunas ≥ 92 mg/dL" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value>Si</Radio>
              <Radio value={false}>No</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={24}>
          <Alert
            style={{ marginTop: 8 }}
            type="info"
            message="Si Glucemia en ayunas ≥ 92 mg/dL, marcar y seguir protocolo de DMG."
          />
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={6}>
          <Form.Item name="bacteriuria" label="Bacteriuria (sí/no)" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value>Si</Radio>
              <Radio value={false}>No</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="estreptococo" label="Estreptococo B (solicitado)" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value>Si</Radio>
              <Radio value={false}>No</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={6}>
          <Form.Item name="chagas_res" label="Chagas" rules={[{ required: true }]}>
            <Select options={triSIGOptions} allowClear />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="malaria_res" label="Malaria" rules={[{ required: true }]}>
            <Select options={triSIGOptions} allowClear />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="bacteriuria_res" label="Bacteriuria resultado">
            <Select options={triNSIOptions} allowClear />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="estreptococo_res" label="Estreptococo B (35–37s)">
            <Select options={triSIGOptions} allowClear />
          </Form.Item>
        </Col>
      </Row>

      {/* VIH — Diagnóstico y Tratamiento */}
      <Divider />
      <Typography.Title level={5}>VIH — Diagnóstico y Tratamiento</Typography.Title>
      <Row gutter={16}>
        <Col xs={24} md={6}>
          <Form.Item name="vih_solicitada_lt20" label="&lt;20 sem solicitada" rules={[{ required: true }]}>
            <Select options={sinoNc} allowClear />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="vih_resultado_lt20" label="&lt;20 sem resultado" rules={[{ required: true }]}>
            <Select options={vihResOptions} allowClear />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="tarv_emb_lt20" label="TARV en emb. &lt;20s" rules={[{ required: true }]}>
            <Select options={sinoNc} allowClear />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} md={6}>
          <Form.Item name="vih_solicitada_ge20" label="≥20 sem solicitada" rules={[{ required: true }]}>
            <Select options={sinoNc} allowClear />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="vih_resultado_ge20" label="≥20 sem resultado" rules={[{ required: true }]}>
            <Select options={vihResOptions} allowClear />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="tarv_emb_ge20" label="TARV en emb. ≥20s" rules={[{ required: true }]}>
            <Select options={sinoNc} allowClear />
          </Form.Item>
        </Col>
      </Row>

      {/* Sífilis — Diagnóstico y Tratamiento */}
      <Divider />
      <Typography.Title level={5}>Sífilis — Diagnóstico y Tratamiento</Typography.Title>
      <Row gutter={16}>
        <Col xs={24} md={6}>
          <Form.Item name="sifilis_no_trep_lt20" label="No trep. &lt;20s" rules={[{ required: true }]}>
            <Select options={sifNoTrepOptions} allowClear />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="sifilis_trep_lt20" label="Trepon. &lt;20s" rules={[{ required: true }]}>
            <Select options={sifTrepOptions} allowClear />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="sifilis_tratamiento_lt20" label="Tratamiento &lt;20s" rules={[{ required: true }]}>
            <Select options={siNoSdNcOptions} allowClear />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="pareja_tratada_lt20" label="Tto. pareja &lt;20s" rules={[{ required: true }]}>
            <Select options={siNoSdNcOptions} allowClear />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} md={6}>
          <Form.Item name="sifilis_no_trep_ge20" label="No trep. ≥20s" rules={[{ required: true }]}>
            <Select options={sifNoTrepOptions} allowClear />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="sifilis_trep_ge20" label="Trepon. ≥20s" rules={[{ required: true }]}>
            <Select options={sifTrepOptions} allowClear />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="sifilis_tratamiento_ge20" label="Tratamiento ≥20s" rules={[{ required: true }]}>
            <Select options={siNoSdNcOptions} allowClear />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="pareja_tratada_ge20" label="Tto. pareja ≥20s" rules={[{ required: true }]}>
            <Select options={siNoSdNcOptions} allowClear />
          </Form.Item>
        </Col>
      </Row>

      {/* CONSEJERÍA */}
      <Divider />
      <Typography.Title level={5}>Consejería</Typography.Title>
      <Row gutter={16}>
        <Col xs={24} md={6}>
          <Form.Item name="preparacion_parto" label="Preparación para el parto" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value={false}>No</Radio>
              <Radio value>Si</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="consejeria_lactancia_materna" label="Consejería lactancia materna" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value={false}>No</Radio>
              <Radio value>Si</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
      </Row>

      {/* ATENCIONES PRENATALES */}
      <Divider />
      <Typography.Title level={5}>Atenciones prenatales</Typography.Title>
      <Form.List name="apn" initialValue={[{}]}>
        {(fields, { add, remove }) => (
          <>
            {fields.map((field, idx) => (
              <div
                key={field.key}
                style={{
                  border: "1px dashed #d9d9d9",
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 12,
                }}
              >
                <Space style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                  <Typography.Text strong>
                    {idx === 0 ? "APN principal" : "APN adicional"}
                  </Typography.Text>
                  {idx > 0 && (
                    <Popconfirm
                      title="Eliminar este APN"
                      okText="Eliminar"
                      cancelText="Cancelar"
                      onConfirm={() => remove(field.name)}
                    >
                      <Button danger size="small">Eliminar</Button>
                    </Popconfirm>
                  )}
                </Space>

                <Row gutter={12} style={{ marginTop: 8 }}>
                  <Col xs={24} md={6}>
                    <Form.Item name={[field.name, "fecha"]} label="Fecha" rules={[{ required: true }]}>
                      <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={4}>
                    <Form.Item
                      name={[field.name, "eg_semanas"]}
                      label="Edad gest. (sem)"
                      rules={[{ required: true }]}
                    >
                      <InputNumber min={0} max={45} style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={4}>
                    <Form.Item name={[field.name, "peso_kg"]} label="Peso (kg)" rules={[{ required: true }]}>
                      <InputNumber min={0} max={300} step={0.1} style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={6}>
                    <Row gutter={8}>
                      <Col span={12}>
                        <Form.Item name={[field.name, "pa_sis"]} label="PA sist." rules={[{ required: true }]}>
                          <InputNumber min={60} max={250} style={{ width: "100%" }} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name={[field.name, "pa_dia"]} label="PA diast." rules={[{ required: true }]}>
                          <InputNumber min={30} max={150} style={{ width: "100%" }} />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Col>
                  <Col xs={24} md={4}>
                    <Form.Item name={[field.name, "altura_uterina_cm"]} label="Altura uterina (cm)">
                      <InputNumber min={0} max={60} style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={12}>
                  <Col xs={24} md={4}>
                    <Form.Item name={[field.name, "presentacion"]} label="Presentación">
                      <Select
                        options={[
                          { label: "cef", value: "cef" },
                          { label: "pelv", value: "pelv" },
                          { label: "transv", value: "transv" },
                          { label: "N/C", value: "nc" },
                        ]}
                        allowClear
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={4}>
                    <Form.Item name={[field.name, "fcf_lpm"]} label="FCF (lpm)">
                      <InputNumber min={0} max={250} style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={4}>
                    <Form.Item name={[field.name, "mov_fetales"]} label="Mov. fetales">
                      <Select
                        options={[
                          { label: "Sí", value: "si" },
                          { label: "No", value: "no" },
                          { label: "N/C", value: "nc" },
                        ]}
                        allowClear
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={4}>
                    <Form.Item name={[field.name, "proteinuria"]} label="Proteinuria">
                      <Select
                        options={[
                          { label: "−", value: "-" },
                          { label: "+", value: "+" },
                          { label: "N/C", value: "nc" },
                        ]}
                        allowClear
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item
                      name={[field.name, "nota"]}
                      label="Signos de alarma / exámenes / tratamientos"
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={12}>
                  <Col xs={24} md={4}>
                    <Form.Item name={[field.name, "iniciales"]} label="Iniciales">
                      <Input maxLength={6} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={6}>
                    <Form.Item name={[field.name, "proxima_cita"]} label="Próxima cita">
                      <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            ))}

            <Button
              type="dashed"
              onClick={() => add({})}
              disabled={fields.length >= 6}
              block
            >
              Añadir otro control (APN)
            </Button>
          </>
        )}
      </Form.List>
    </>
  );
};

export default GestacionActualStep;
