import React, { useState, useEffect, useCallback } from "react";

import { useValidationErrors } from "@/hooks/validation-errors";
import { getFunctionById, createFunction, updateFunction } from "@/api/configurator/functions";
import { Tag, Divider, Button, Row, Col, Form, Modal, Spin, Input, message } from "antd";
const { TextArea } = Input;
const { confirm } = Modal;
import { IconAlertCircle, IconFileExport, IconPlug, IconPlus, IconTrash } from "@tabler/icons-react";
import SelectFunction from "@/shared/form-fields/other/select-function-category";

import PageActions from "@/shared/components/page-actions";
import Editor from "@/shared/blockly/editor";

const Index = ({ opened, toggle, data, reload }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [blocklyJson, setBlocklyJson] = useState({});
  const [jsonValidate, setJsonValidate] = useState(true);
  const [formChanged, setFormChanged] = useState(false);
  const validationErrorsBag = useValidationErrors();

  const handleNameChange = () => {
    const nameValue = form.getFieldValue("label");
    const slugValue = generateSlug(nameValue);
    form.setFieldsValue({ id: slugValue });
  };

  // Fill form
  useEffect(() => {

    setLoading(true);

    // Assuming getFunctionById returns a promise
    getFunctionById()
      .then(({ data }) => {

        // set form values
        form.setFieldsValue({
          label: data.label,
          id: data.id,
          description: data.description,
          arguments: data.arguments,
          //body: JSON.parse(data.body, null, 2),
          custom_function_category_id: data.custom_function_category_id ?? undefined,
        });
        // set blockly state
        setBlocklyJson(data.body);
      })
      .catch((error) => {
        // Handle errors if needed
        message.error("Error fetching function data:");
      })
      .finally(() => {
        setLoading(false);
      });

  }, [form]);

  // Generate slug for ID field
  const generateSlug = (name) => {
    // Generate slug logic goes here
    // Example: Convert name to lowercase and replace spaces with dashes
    return name.toLowerCase().replace(/\s+/g, "_");
  };


  // Form Submit
  const handleSubmit = async (values) => {
    setLoading(true);
    if (!jsonValidate) {
      setLoading(false);
      message.error('Some of the Blocks insert has empty value! Please check that all inputs are filled and retry.')
      return;
    }
    const body = { ...values, body: blocklyJson };
    try {
      let response;
      if (data) {
        // Update existing function
        response = await updateFunction(data.id, body);
      } else {
        // Create new function
        response = await createFunction(body);
      }

      if (response.error) {
        const { validationErrors } = response;
        if (validationErrors) {
          validationErrorsBag.setValidationErrors(validationErrors);
        }
        message.error(response.error?.response?.data?.message || "Error during data fetching");
      } else {
        const successMessage = data ? "Function updated successfully" : "Function created successfully";
        message.success(successMessage);
        toggle();
        reload();
        setFormChanged(false); // Reset formChanged state on successful submit
      }
    } catch (error) {
      message.error("Error during saving operation");
    } finally {
      setLoading(false);
    }
  };

  //Close modal confirmation if form state is TRUE
  const handleExit = () => {
    if (formChanged === true) {
      confirm({
        title: "Confirm exit without saving?",
        icon: <IconAlertCircle color={"#faad14"} size="24" className="anticon" />,
        transitionName: "ant-modal-slide-up",
        content: "Seems like you forgot to save your edits",
        okText: "Exit",
        okType: "danger",
        cancelText: "Cancel",
        onOk() {
          toggle();
          setFormChanged(false);
        },
      });
    } else {
      toggle();
    }
  };

  return (
    <div className="page-content">
      <PageActions

        extra={[
          <Button key={0} onClick={handleExit}>
            Close
          </Button>,
          <Button loading={loading} key={1} type="primary" htmlType="submit" form="function-form" disabled={!formChanged}>
            Save
          </Button>,
        ]}
      />

      <Spin spinning={loading}>
        <Form
          layout="vertical"
          form={form}
          name="function-form"
          onFinish={handleSubmit}
          onValuesChange={() => setFormChanged(true)}
        >
          <Row gutter={16}>
            {/* Blockly Editor */}
            <Col span={16}>
              <Form.Item
                label="Body"
                name="body"
              >
                <Editor
                  state={blocklyJson}
                  onSave={handleEditorChange}
                  params={[]}
                  onValidate={(value) => setJsonValidate(value)}
                />
              </Form.Item>
            </Col>
            {/* Form here */}
            <Col span={8}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Name function"
                    name="label"
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                    {...validationErrorsBag.getInputErrors("label")}
                  >
                    <Input onChange={handleNameChange} />
                  </Form.Item>
                </Col>
                {!data && (
                  <Col span={12}>
                    <Form.Item
                      label="ID function"
                      name="id"
                      rules={[
                        {
                          required: true,
                        },
                      ]}
                      {...validationErrorsBag.getInputErrors("id")}
                    >
                      <Input allowClear />
                    </Form.Item>
                  </Col>
                )}
              </Row>
              <Form.Item name="description" label="Notes" {...validationErrorsBag.getInputErrors("description")}>
                <TextArea rows="6" allowClear />
              </Form.Item>
              <Form.Item
                label="Function function"
                name="custom_function_category_id"
                rules={[
                  {
                    required: true,
                  },
                ]}
                {...validationErrorsBag.getInputErrors("custom_function_category_id")}
              >
                <SelectFunction />
              </Form.Item>
              <Divider className="my-2">Arguments</Divider>

              <Form.List name="arguments" label="">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Row gutter={16} key={key}>
                        <Col span={22}>
                          <Form.Item
                            {...restField}
                            name={[name, "name"]}
                            rules={[
                              {
                                required: true,
                              },
                            ]}
                          >
                            <Input placeholder="name" />
                          </Form.Item>
                        </Col>
                        <Col span={2} className="text-right">
                          <Button danger icon={<IconTrash />} onClick={() => remove(name)} />
                        </Col>
                      </Row>
                    ))}
                    <Form.Item>
                      <Button type="dashed" onClick={() => add()} block icon={<IconPlus />}>
                        Add argument
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </Col>
          </Row>
        </Form>
      </Spin>
    </div>

  );
};

export default Index;
