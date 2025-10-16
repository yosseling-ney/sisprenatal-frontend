import { Col, DatePicker, Form, Input, InputNumber, Row, Select, Switch, Typography } from "antd";

const SI_NO_NC = ["si", "no", "n/c"] as const;
const ESTADO = ["viva", "fallece"] as const;

type Props = {
  form: ReturnType<typeof Form.useForm>[0];
};

const EgresoMaternoStep = ({ form }: Props) => {
  const toOptions = (arr: readonly string[]) => arr.map((v) => ({ label: v, value: v }));

  const estado = Form.useWatch(["egreso_materno", "estado"], form) as string | undefined;
  const traslado = Form.useWatch(["egreso_materno", "traslado"], form) as boolean | undefined;
  const falleceTraslado = Form.useWatch(["egreso_materno", "fallece_durante_o_en_traslado"], form) as boolean | undefined;

  const requiereEdadFallecimiento = estado === "fallece" || (traslado === true && falleceTraslado === true);

  return (
    <>
      <Typography.Title level={5} style={{ marginTop: 0 }}>Egreso materno</Typography.Title>

      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Form.Item name="antirrubeola_post_parto" label="Antirrubeola postparto" rules={[{ required: true }]}>
            <Select options={toOptions(SI_NO_NC)} placeholder="Selecciona" />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="gamma_globulina_antiD" label="Gammaglobulina anti‑D" rules={[{ required: true }]}>
            <Select options={toOptions(SI_NO_NC)} placeholder="Selecciona" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={6}>
          <Form.Item name={["egreso_materno", "estado"]} label="Estado" rules={[{ required: true }]}>
            <Select options={toOptions(ESTADO)} placeholder="Selecciona" />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name={["egreso_materno", "fecha"]} label="Fecha y hora" rules={[{ required: true }]}>
            <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: "100%" }} />
          </Form.Item>
        </Col>
        <Col xs={24} md={10}>
          <Form.Item label="Traslado" tooltip="Marcar si hubo traslado">
            <Form.Item name={["egreso_materno", "traslado"]} valuePropName="checked" noStyle>
              <Switch />
            </Form.Item>
          </Form.Item>
          {traslado ? (
            <Form.Item name={["egreso_materno", "lugar_traslado"]} label="Lugar de traslado" rules={[{ required: true, message: "Indica el lugar" }]}>
              <Input placeholder="Centro / hospital" />
            </Form.Item>
          ) : null}
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={6}>
          <Form.Item label="Fallece durante/en traslado">
            <Form.Item name={["egreso_materno", "fallece_durante_o_en_traslado"]} valuePropName="checked" noStyle>
              <Switch />
            </Form.Item>
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item
            name={["egreso_materno", "edad_en_dias_fallecimiento"]}
            label="Edad días fallecimiento"
            rules={requiereEdadFallecimiento ? [{ required: true, message: "Requerido" }] : []}
          >
            <InputNumber min={0} style={{ width: "100%" }} disabled={!requiereEdadFallecimiento} />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="dias_completos_desde_parto" label="Días completos desde parto" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item name="responsable" label="Responsable" rules={[{ required: true }]}>
            <Input placeholder="Nombre del responsable" />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
};

export default EgresoMaternoStep;

