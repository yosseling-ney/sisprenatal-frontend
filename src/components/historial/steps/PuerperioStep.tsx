import { Button, Col, DatePicker, Form, Input, InputNumber, Row, Select, Space, Typography } from "antd";

type InvolucionUterina = "cont" | "flac" | "otra";
type SiNoNc = "si" | "no" | "n_c";

type Props = {
  form: ReturnType<typeof Form.useForm>[0];
};

const involucionOptions = [
  { label: "Contraído", value: "cont" },
  { label: "Flácido", value: "flac" },
  { label: "Otra", value: "otra" },
];

const siNoNcOptions = [
  { label: "Sí", value: "si" },
  { label: "No", value: "no" },
  { label: "N/C", value: "n_c" },
];

const PuerperioStep = ({ form }: Props) => {
  return (
    <>
      <Typography.Title level={5} style={{ marginTop: 0 }}>Puerperio inmediato</Typography.Title>
      <Form.List name="puerperio_inmediato">
        {(fields, { add, remove }) => (
          <Space direction="vertical" style={{ width: "100%" }} size={16}>
            {fields.map((field) => (
              <div key={field.key} style={{ border: "1px solid #f0f0f0", borderRadius: 8, padding: 12 }}>
                <Row gutter={16}>
                  <Col xs={24} md={8}>
                    <Form.Item
                      {...field}
                      name={[field.name, "dia_hora"]}
                      fieldKey={[field.fieldKey!, "dia_hora"]}
                      label="Día y hora"
                      rules={[{ required: true, message: "Requerido" }]}
                    >
                      <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={4}>
                    <Form.Item
                      {...field}
                      name={[field.name, "temperatura"]}
                      fieldKey={[field.fieldKey!, "temperatura"]}
                      label="Temp. (°C)"
                      rules={[{ required: true, message: "Requerido" }]}
                    >
                      <InputNumber min={30} max={45} step={0.1} style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={6}>
                    <Form.Item label="Presión arterial" required>
                      <Input.Group compact>
                        <Form.Item
                          name={[field.name, "presion_arterial", "sistolica"]}
                          rules={[{ required: true, message: "Sis." }]}
                          noStyle
                        >
                          <InputNumber placeholder="Sis." min={50} max={250} style={{ width: "45%" }} />
                        </Form.Item>
                        <Form.Item
                          name={[field.name, "presion_arterial", "diastolica"]}
                          rules={[{ required: true, message: "Dia." }]}
                          noStyle
                        >
                          <InputNumber placeholder="Dia." min={30} max={150} style={{ width: "55%" }} />
                        </Form.Item>
                      </Input.Group>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={4}>
                    <Form.Item
                      {...field}
                      name={[field.name, "pulso"]}
                      fieldKey={[field.fieldKey!, "pulso"]}
                      label="Pulso (lpm)"
                      rules={[{ required: true, message: "Requerido" }]}
                    >
                      <InputNumber min={30} max={220} style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={6}>
                    <Form.Item
                      {...field}
                      name={[field.name, "involucion_uterina"]}
                      fieldKey={[field.fieldKey!, "involucion_uterina"]}
                      label="Involución uterina"
                      rules={[{ required: true, message: "Requerido" }]}
                    >
                      <Select options={involucionOptions} />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      {...field}
                      name={[field.name, "loquios"]}
                      fieldKey={[field.fieldKey!, "loquios"]}
                      label="Loquios"
                      rules={[{ required: true, message: "Requerido" }]}
                    >
                      <Input.TextArea rows={2} />
                    </Form.Item>
                  </Col>
                </Row>
                <div style={{ textAlign: "right" }}>
                  <Button danger type="link" onClick={() => remove(field.name)}>Quitar registro</Button>
                </div>
              </div>
            ))}
            <Button onClick={() => add()} type="dashed">Añadir registro</Button>
          </Space>
        )}
      </Form.List>

      <Typography.Title level={5}>Postparto</Typography.Title>
      <Row gutter={16}>
        <Col xs={24} md={6}>
          <Form.Item name="antirrubeola_postparto" label="Antirrubeola postparto" rules={[{ required: true }]}>
            <Select options={siNoNcOptions} />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="gammaglobulina_anti_d" label="Gammaglobulina anti-D" rules={[{ required: true }]}>
            <Select options={siNoNcOptions} />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
};

export default PuerperioStep;

