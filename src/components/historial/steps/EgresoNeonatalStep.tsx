import { Col, DatePicker, Form, Input, InputNumber, Row, Select, Typography } from "antd";

const ESTADO = ["vivo", "traslado", "fallece"] as const;
const SI_NO = ["si", "no"] as const;
const ALIMENTO = ["lact_exclusiva", "lact_no_exclusiva", "leche_artificial"] as const;

type Props = {
  form: ReturnType<typeof Form.useForm>[0];
};

const EgresoNeonatalStep = ({ form }: Props) => {
  const toOptions = (arr: readonly string[]) => arr.map((v) => ({ label: v, value: v }));
  const estadoActual: string | undefined = Form.useWatch("estado", form);

  return (
    <>
      <Typography.Title level={5} style={{ marginTop: 0 }}>
        Egreso neonatal
      </Typography.Title>

      <Row gutter={16}>
        <Col xs={24} md={6}>
          <Form.Item name="estado" label="Estado" rules={[{ required: true }]}>
            <Select options={toOptions(ESTADO)} placeholder="Selecciona" />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="fecha_hora_evento" label="Fecha/hora evento" rules={[{ required: true }]}>
            <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: "100%" }} />
          </Form.Item>
        </Col>
        <Col xs={24} md={4}>
          <Form.Item name="edad_egreso_dias" label="Edad egreso (días)" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="peso_egreso" label="Peso egreso (kg)" rules={[{ required: true }]}>
            <InputNumber min={0} step={0.01} style={{ width: "100%" }} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={6}>
          <Form.Item name="alimento_alta" label="Alimento al alta" rules={[{ required: true }]}>
            <Select options={toOptions(ALIMENTO)} />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="boca_arriba" label="Duerme boca arriba" rules={[{ required: true }]}>
            <Select options={toOptions(SI_NO)} />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="bcg_aplicada" label="BCG aplicada" rules={[{ required: true }]}>
            <Select options={toOptions(SI_NO)} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={6}>
          <Form.Item name="id_rn" label="ID RN" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="nombre_rn" label="Nombre RN" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} md={10}>
          <Form.Item name="responsable" label="Responsable" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Col>
      </Row>

      {estadoActual === "traslado" && (
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item name="codigo_traslado" label="Código traslado" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="fallece_durante_traslado" label="Fallece en traslado" rules={[{ required: true }]}>
              <Select options={toOptions(SI_NO)} />
            </Form.Item>
          </Col>
        </Row>
      )}
    </>
  );
};

export default EgresoNeonatalStep;

