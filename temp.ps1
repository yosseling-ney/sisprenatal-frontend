                Administra las cuentas del sistema y asigna roles de acceso.
              </Typography.Text>
            </div>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isFetching}>
                Refrescar
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
                Nuevo usuario
              </Button>
            </Space>
          </Space>

          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Buscar por nombre, correo o usuario"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />

          <Table<Usuario>
            rowKey="_id"
            columns={columns}
            dataSource={filteredUsers}
            loading={isLoading || isFetching}
            pagination={{ pageSize: 8, showSizeChanger: false }}
            locale={{ emptyText: "No se encontraron usuarios" }}
            scroll={{ x: true }}
          />
        </Space>
      </Card>

      <Modal
        title={editingUser ? "Editar usuario" : "Nuevo usuario"}
        open={isModalOpen}
        onCancel={() => {
          if (!createMutation.isPending && !updateMutation.isPending) {
            setIsModalOpen(false);
            setEditingUser(null);
            form.resetFields();
          }
        }}
        onOk={handleModalSubmit}
        okText={editingUser ? "Actualizar" : "Crear"}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        destroyOnClose
      >
        <Form<CreateUsuarioPayload>
          key={editingUser ? editingUser._id : "create"}
          layout="vertical"
          form={form}
          preserve={false}
          autoComplete="off"
          initialValues={
            editingUser
              ? {
                  nombre: editingUser.nombre,
                  apellido: editingUser.apellido,
                  correo: editingUser.correo,
                  telefono: editingUser.telefono,
                  username: editingUser.username,
                  password: "",
                  rol: editingUser.rol,
                }
              : {}
          }
        >
          <Form.Item
            label="Nombre"
            name="nombre"
            rules={editingUser ? [] : [{ required: true, message: "Ingresa el nombre" }]}
          >
            <Input placeholder="Nombre" />
          </Form.Item>
          <Form.Item
            label="Apellido"
            name="apellido"
            rules={editingUser ? [] : [{ required: true, message: "Ingresa el apellido" }]}
          >
            <Input placeholder="Apellido" />
          </Form.Item>
          <Form.Item
            label="Correo"
            name="correo"
            rules={[
              ...(editingUser ? [] : [{ required: true, message: "Ingresa el correo" }]),
              { type: "email", message: "Ingresa un correo válido" },
            ]}
          >
            <Input placeholder="correo@ejemplo.com" autoComplete="off" />
          </Form.Item>
          <Form.Item label="Teléfono" name="telefono">
            <Input placeholder="Número de teléfono" />
          </Form.Item>
          <Form.Item
            label="Nombre de usuario"
            name="username"
            rules={editingUser ? [] : [{ required: true, message: "Ingresa el nombre de usuario" }]}
          >
            <Input placeholder="usuario" autoComplete="off" />
          </Form.Item>
          <Form.Item
            label="Contraseña"
            name="password"
            rules={
              editingUser
                ? [{ min: 6, message: "Debe tener al menos 6 caracteres" }]
                : [
                    { required: true, message: "Ingresa una contraseña" },
                    { min: 6, message: "Debe tener al menos 6 caracteres" },
                  ]
            }
          >
            <Input.Password
              placeholder={editingUser ? "Deja en blanco para mantener" : "Contraseña"}
              autoComplete="new-password"
            />
          </Form.Item>
          <Form.Item
            label="Rol"
            name="rol"
            rules={editingUser ? [] : [{ required: true, message: "Selecciona un rol" }]}
          >
            <Select options={ROLE_OPTIONS} placeholder="Selecciona el rol" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
};

export default UsuariosPage;

