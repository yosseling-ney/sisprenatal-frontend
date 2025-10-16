import { Col, DatePicker, Form, InputNumber, Radio, Row, Select, Typography } from "antd";
import dayjs from "dayjs";

type VacRubeola = "previa" | "embarazo" | "no" | "no_sabe";
type GrupoSang = "A" | "B" | "AB" | "O";
type Rh = "+" | "-";
type VIHRes = "+" | "-" | "s/d" | "n/c";
type SifilisRes = "+" | "-" | "s/d";

const rubeolaOptions = [
  { label: "Previa", value: "previa" as VacRubeola },
  { label: "En embarazo", value: "embarazo" as VacRubeola },
  { label: "No", value: "no" as VacRubeola },
  { label: "No sabe", value: "no_sabe" as VacRubeola },
];

const grupoOptions = ["A", "B", "AB", "O"].map((v) => ({ label: v, value: v as GrupoSang }));
const rhOptions = ["+", "-"].map((v) => ({ label: v, value: v as Rh }));
const vihResOptions = ["+", "-", "s/d", "n/c"].map((v) => ({ label: v, value: v as VIHRes }));
const sifilisOptions = ["+", "-", "s/d"].map((v) => ({ label: v, value: v as SifilisRes }));

type Props = {
  form: ReturnType<typeof Form.useForm>[0];
};

const GestacionActualStep = ({ form }: Props) => {
  return (
    <>
      <Typography.Title level={5} style={{ marginTop: 0 }}>Datos básicos</Typography.Title>
      <Row gutter={16}>
        <Col xs={24} md={6}>
          <Form.Item name="peso_anterior" label="Peso anterior (kg)" rules={[{ required: true, message: "Requerido" }]}>
            <InputNumber min={0} max={300} style={{ width: "100%" }} step={0.1} />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="talla" label="Talla (m)" rules={[{ required: true, message: "Requerido" }]}>
            <InputNumber min={0.5} max={2.5} style={{ width: "100%" }} step={0.01} />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="fum" label="FUM" rules={[{ required: true, message: "Selecciona la fecha" }]}>
            <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="fpp" label="FPP" rules={[{ required: true, message: "Selecciona la fecha" }]}>
            <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={6}>
          <Form.Item name="eg_confiable" label="EG confiable" rules={[{ required: true, message: "Requerido" }]}>
            <Radio.Group>
              <Radio value>Si</Radio>
              <Radio value={false}>No</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="fumadora_activa" label="Fumadora activa" rules={[{ required: true, message: "Requerido" }]}>
            <Radio.Group>
              <Radio value>Si</Radio>
              <Radio value={false}>No</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="fumadora_pasiva" label="Fumadora pasiva" rules={[{ required: true, message: "Requerido" }]}>
            <Radio.Group>
              <Radio value>Si</Radio>
              <Radio value={false}>No</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="alcohol" label="Alcohol" rules={[{ required: true, message: "Requerido" }]}>
            <Radio.Group>
              <Radio value>Si</Radio>
              <Radio value={false}>No</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
      </Row>

      <Typography.Title level={5}>Exámenes y vacunas</Typography.Title>
      <Row gutter={16}>
        <Col xs={24} md={6}>
          <Form.Item name="vacuna_rubeola" label="Vacuna rubéola" rules={[{ required: true, message: "Requerido" }]}>
            <Select options={rubeolaOptions} />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="vacuna_antitetanica" label="Antitetánica" rules={[{ required: true, message: "Requerido" }]}>
            <Radio.Group>
              <Radio value>Si</Radio>
              <Radio value={false}>No</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="examen_mamas" label="Examen mamas" rules={[{ required: true, message: "Requerido" }]}>
            <Radio.Group>
              <Radio value>Si</Radio>
              <Radio value={false}>No</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="examen_odonto" label="Examen odonto" rules={[{ required: true, message: "Requerido" }]}>
            <Radio.Group>
              <Radio value>Si</Radio>
              <Radio value={false}>No</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={6}>
          <Form.Item name="cervix_normal" label="Cérvix normal" rules={[{ required: true, message: "Requerido" }]}>
            <Radio.Group>
              <Radio value>Si</Radio>
              <Radio value={false}>No</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="grupo_sanguineo" label="Grupo" rules={[{ required: true, message: "Requerido" }]}>
            <Select options={grupoOptions} />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="rh" label="Rh" rules={[{ required: true, message: "Requerido" }]}>
            <Select options={rhOptions} />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="inmunizada" label="Inmunizada" rules={[{ required: true, message: "Requerido" }]}>
            <Radio.Group>
              <Radio value>Si</Radio>
              <Radio value={false}>No</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={6}>
          <Form.Item name="hemoglobina" label="Hemoglobina (g/dL)" rules={[{ required: true, message: "Requerido" }]}>
            <InputNumber min={0} max={30} style={{ width: "100%" }} step={0.1} />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="vih_solicitado" label="VIH solicitado" rules={[{ required: true, message: "Requerido" }]}>
            <Radio.Group>
              <Radio value>Si</Radio>
              <Radio value={false}>No</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="vih_resultado" label="VIH resultado" rules={[{ required: true, message: "Requerido" }]}>
            <Select options={vihResOptions} />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="tratamiento_vih" label="Tratamiento VIH" rules={[{ required: true, message: "Requerido" }]}>
            <Radio.Group>
              <Radio value>Si</Radio>
              <Radio value={false}>No</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
      </Row>
    </>
  );
};

export default GestacionActualStep;

