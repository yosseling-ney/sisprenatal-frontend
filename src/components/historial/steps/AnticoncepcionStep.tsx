import { Col, Form, Row, Select, Typography } from "antd";

const CONSEJERIA = ["si", "no"] as const;
const METODO = [
  "diu_post_evento",
  "diu",
  "barrera",
  "hormonal",
  "ligadura_tubaria",
  "natural",
  "otro",
  "ninguno",
] as const;

type Props = {
  form: ReturnType<typeof Form.useForm>[0];
};

const AnticoncepcionStep = ({ form }: Props) => {
  const toOptions = (arr: readonly string[]) => arr.map((v) => ({ label: v, value: v }));

  return (
    <>
      <Typography.Title level={5} style={{ marginTop: 0 }}>Anticoncepción</Typography.Title>
      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Form.Item name="consejeria" label="Consejería" rules={[{ required: true, message: "Selecciona" }]}>
            <Select options={toOptions(CONSEJERIA)} placeholder="si / no" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name="metodo_elegido" label="Método elegido" rules={[{ required: true, message: "Selecciona" }]}>
            <Select options={toOptions(METODO)} placeholder="Selecciona método" />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
};

export default AnticoncepcionStep;

