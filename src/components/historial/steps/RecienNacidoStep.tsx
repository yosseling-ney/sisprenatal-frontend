import { Col, Form, Input, InputNumber, Radio, Row, Select, Typography } from "antd";

const TIPO_NAC = ["vivo", "muerto_anteparto", "muerto_parto"] as const;
const SEXO = ["Femenino", "Masculino", "No definido"] as const;
const EG_METODO = ["FUM", "Ecografía precoz", "Examen físico"] as const;
const PESO_EG = ["Adecuado", "Pequeño", "Grande"] as const;
const SI_NO = ["si", "no"] as const;
const REANIM = ["estimulación", "aspiración", "mascara", "oxigeno", "masaje", "tubo"] as const;
const FALLECE_SALA = ["si", "no"] as const;
const REFERIDO = ["aloj_conjunto", "neonatologia", "otro_hosp"] as const;
const ATENDIO = ["medico", "obstetrica", "enfermera", "auxiliar", "estudiante", "empirica", "otro"] as const;
const DEFECTO_TIPO = ["mayor", "menor", "ninguna"] as const;
const VIH_EXP = ["si", "no", "s/d"] as const;
const VIH_TTO = ["si", "no", "s/d", "n/c"] as const;
const TAMIZAJE_RES = ["positivo", "negativo", "no_se_hizo"] as const;

type Props = { form: ReturnType<typeof Form.useForm>[0] };

const yesNoRadio = (
  <Radio.Group>
    <Radio value>Si</Radio>
    <Radio value={false}>No</Radio>
  </Radio.Group>
);

const RecienNacidoStep = ({ form }: Props) => {
  const toOptions = (arr: readonly string[]) => arr.map((v) => ({ label: v, value: v }));

  return (
    <>
      <Typography.Title level={5} style={{ marginTop: 0 }}>Datos del recién nacido</Typography.Title>
      <Row gutter={16}>
        <Col xs={24} md={6}>
          <Form.Item name="tipo_nacimiento" label="Tipo de nacimiento" rules={[{ required: true }]}>
            <Select options={toOptions(TIPO_NAC)} />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="sexo" label="Sexo" rules={[{ required: true }]}>
            <Select options={toOptions(SEXO)} />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="peso_nacer" label="Peso al nacer (kg)" rules={[{ required: true }]}>
            <InputNumber min={0} step={0.01} style={{ width: "100%" }} />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="perimetro_cefalico" label="Perímetro cefálico (cm)" rules={[{ required: true }]}>
            <InputNumber min={0} step={0.1} style={{ width: "100%" }} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={6}>
          <Form.Item name="longitud" label="Longitud (cm)" rules={[{ required: true }]}>
            <InputNumber min={0} step={0.1} style={{ width: "100%" }} />
          </Form.Item>
        </Col>
        <Col xs={24} md={18}>
          <Form.Item label="Edad gestacional" required>
            <Input.Group compact>
              <Form.Item name={["edad_gestacional", "semanas"]} noStyle rules={[{ required: true }]}> <InputNumber placeholder="Semanas" min={0} style={{ width: 160 }} /> </Form.Item>
              <Form.Item name={["edad_gestacional", "dias"]} noStyle rules={[{ required: true }]}> <InputNumber placeholder="Días" min={0} style={{ width: 120 }} /> </Form.Item>
              <Form.Item name={["edad_gestacional", "metodo"]} noStyle rules={[{ required: true }]}> <Select style={{ width: 200 }} options={toOptions(EG_METODO)} /> </Form.Item>
              <Form.Item name={["edad_gestacional", "estimada"]} label="Estim." valuePropName="checked" style={{ display: "inline-block", marginLeft: 12 }}>
                <Radio.Group>
                  <Radio value>Si</Radio>
                  <Radio value={false}>No</Radio>
                </Radio.Group>
              </Form.Item>
            </Input.Group>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={6}>
          <Form.Item name="peso_edad_gestacional" label="Peso/EG" rules={[{ required: true }]}>
            <Select options={toOptions(PESO_EG)} />
          </Form.Item>
        </Col>
        <Col xs={24} md={9}>
          <Form.Item label="Cuidados inmediatos" required>
            <Row gutter={8}>
              <Col span={8}><Form.Item name={["cuidados_inmediatos", "vitamina_k"]} label="Vit K" rules={[{ required: true }]}><Select options={toOptions(SI_NO)} /></Form.Item></Col>
              <Col span={8}><Form.Item name={["cuidados_inmediatos", "profilaxis_ocular"]} label="Profilaxis" rules={[{ required: true }]}><Select options={toOptions(SI_NO)} /></Form.Item></Col>
              <Col span={8}><Form.Item name={["cuidados_inmediatos", "apego_precoz"]} label="Apego" rules={[{ required: true }]}><Select options={toOptions(SI_NO)} /></Form.Item></Col>
            </Row>
          </Form.Item>
        </Col>
        <Col xs={24} md={9}>
          <Form.Item label="APGAR" required>
            <Row gutter={8}>
              <Col span={12}><Form.Item name={["apgar", "min_1"]} label="1 min" rules={[{ required: true }]}><InputNumber min={0} max={10} style={{ width: "100%" }} /></Form.Item></Col>
              <Col span={12}><Form.Item name={["apgar", "min_5"]} label="5 min" rules={[{ required: true }]}><InputNumber min={0} max={10} style={{ width: "100%" }} /></Form.Item></Col>
            </Row>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item name="reanimacion" label="Reanimación" rules={[{ required: true }]}>
            <Select mode="multiple" options={toOptions(REANIM)} placeholder="Selecciona" />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="fallece_sala_parto" label="Fallece en sala" rules={[{ required: true }]}>
            <Select options={toOptions(FALLECE_SALA)} />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="referido" label="Referido" rules={[{ required: true }]}>
            <Select options={toOptions(REFERIDO)} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item label="Atendió" required>
            <Row gutter={8}>
              <Col span={12}><Form.Item name={["atendio", "parto"]} label="Parto" rules={[{ required: true }]}><Select options={toOptions(ATENDIO)} /></Form.Item></Col>
              <Col span={12}><Form.Item name={["atendio", "neonato"]} label="Neonato" rules={[{ required: true }]}><Select options={toOptions(ATENDIO)} /></Form.Item></Col>
            </Row>
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="Defectos congénitos" required>
            <Row gutter={8}>
              <Col span={6}><Form.Item name={["defectos_congenitos", "presenta"]} label="Presenta" rules={[{ required: true }]}><Select options={toOptions(SI_NO)} /></Form.Item></Col>
              <Col span={6}><Form.Item name={["defectos_congenitos", "tipo_malformacion"]} label="Tipo" rules={[{ required: true }]}><Select options={toOptions(DEFECTO_TIPO)} /></Form.Item></Col>
              <Col span={6}><Form.Item name={["defectos_congenitos", "codigo"]} label="Código" rules={[{ required: true }]}><Input /></Form.Item></Col>
              <Col span={6}><Form.Item name={["defectos_congenitos", "detalle"]} label="Detalle" rules={[{ required: true }]}><Input /></Form.Item></Col>
            </Row>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item label="Enfermedades" required>
            <Row gutter={8}>
              <Col span={24}><Form.Item name={["enfermedades", "codigos"]} label="Códigos" rules={[{ required: true }]}><Select mode="tags" tokenSeparators={[","]} placeholder="Hasta 3" /></Form.Item></Col>
              <Col span={12}><Form.Item name={["enfermedades", "ninguna"]} label="Ninguna" valuePropName="checked">{yesNoRadio}</Form.Item></Col>
              <Col span={12}><Form.Item name={["enfermedades", "uno_o_mas"]} label="Una o más" valuePropName="checked">{yesNoRadio}</Form.Item></Col>
            </Row>
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="VIH RN" required>
            <Row gutter={8}>
              <Col span={12}><Form.Item name={["vih_rn", "exposicion"]} label="Exposición" rules={[{ required: true }]}><Select options={toOptions(VIH_EXP)} /></Form.Item></Col>
              <Col span={12}><Form.Item name={["vih_rn", "tratamiento"]} label="Tratamiento" rules={[{ required: true }]}><Select options={toOptions(VIH_TTO)} /></Form.Item></Col>
            </Row>
          </Form.Item>
        </Col>
      </Row>

      <Typography.Title level={5}>Tamizaje neonatal</Typography.Title>
      <Row gutter={16}>
        {(["vdrl", "tsh", "hbpatia", "bilirrubina", "toxo_igm"] as const).map((k) => (
          <Col xs={24} md={8} key={k}>
            <Form.Item name={["tamizaje_neonatal", k]} label={k.toUpperCase()} rules={[{ required: true }]}>
              <Select options={toOptions(TAMIZAJE_RES)} />
            </Form.Item>
          </Col>
        ))}
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={6}>
          <Form.Item name="meconio" label="Meconio" rules={[{ required: true }]}>
            <Select options={toOptions(SI_NO)} />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
};

export default RecienNacidoStep;

