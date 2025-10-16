import { Col, DatePicker, Form, Input, InputNumber, Row, Select } from "antd";
import type { FormInstance } from "antd";
import type { IdentificacionFormValues } from "./types";

type Props = {
  form: FormInstance<IdentificacionFormValues>;
  etniaOptions: { value: string; label: string }[];
  nivelEstudiosOptions: { value: string; label: string }[];
  estadoCivilOptions: { value: string; label: string }[];
};

const IdentificacionStep = ({ form, etniaOptions, nivelEstudiosOptions, estadoCivilOptions }: Props) => {
  return (
    <>
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
    </>
  );
};

export default IdentificacionStep;
