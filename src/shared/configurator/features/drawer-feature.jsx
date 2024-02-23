import React, { useState, useEffect, useCallback, useRef } from "react";
import UserPermissions from "@/policy/ability";
import {
  getAllFeatures,
  deleteFeature,
  getFeaturesTypes,
  updateFeature,
  createFeature,
} from "@/api/configurator/features";
import Datatable from "@/shared/datatable/datatable";
import PageActions from "@/shared/components/page-actions";
import { useValidationErrors } from "@/hooks/validation-errors";
import {
  Row,
  Col,
  Space,
  Button,
  Modal,
  Form,
  Drawer,
  Input,
  Select,
  message,
  Tag,
} from "antd";
const { confirm } = Modal;
import { IconEdit, IconTrash, IconPlus } from "@tabler/icons-react";


//=============================================================================
// Component Drawer
//=============================================================================

const DrawerFeature = ({ opened, toggle, data, reload }) => {
  const [form] = Form.useForm();
  const [featuresType, setFeaturesType] = useState([]);
  const [loading, setLoading] = useState(false);
  const validationErrorsBag = useValidationErrors();
  //   console.log('data', data)
  // Form Submit
  const handleSubmit = useCallback(
    async (values) => {
      setLoading(true);
      try {
        let status, error, validationErrors;

        if (data) {
          // Update existing feature
          ({ status, error, validationErrors } = await updateFeature(
            data.id,
            values
          ));
        } else {
          // Create new feature
          ({ status, error, validationErrors } = await createFeature(values));
        }

        if (error) {
          if (validationErrors) {
            validationErrorsBag.setValidationErrors(validationErrors);
          }
          message.error("Error during saving operation");
        } else {
          const successMessage = data
            ? "Feature updated successfully"
            : "Feature created successfully";
          message.success(successMessage);
          toggle();
          reload();
        }
      } catch (error) {
        message.error("Error during saving operation");
      } finally {
        setLoading(false);
      }
    },
    [data, toggle, validationErrorsBag, reload]
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data, error } = await getFeaturesTypes();
        if (!error) {
          setFeaturesType(
            data.map(({ id, label }) => ({
              value: id,
              label: `${label}`,
            }))
          );
        }
      } catch (error) {
        message.error("Error occurred while fetching feature types");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (data) {
      form.setFieldsValue({
        label: data.label,
        feature_type_id: data.feature_type ? data.feature_type.id : undefined,
      });
    } else {
      form.resetFields();
    }
  }, [data, form]);

  return (
    <Drawer
      open={opened}
      width={600}
      onClose={toggle}
      title={data ? (
        <>
          Update Feature <mark>{data.id}</mark>
        </>
      ) : (`Create new Feature`)
      }
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        {!data && (
          <Form.Item
            label="ID"
            name="id"
            rules={[{ required: true }]}
            {...validationErrorsBag.getInputErrors("id")}
          >
            <Input allowClear />
          </Form.Item>
        )}
        <Form.Item
          label="Label"
          name="label"
          rules={[{ required: true }]}
          {...validationErrorsBag.getInputErrors("label")}
        >
          <Input allowClear />
        </Form.Item>
        <Form.Item
          label="Feature type"
          name="feature_type_id"
          rules={[{ required: true }]}
          {...validationErrorsBag.getInputErrors("feature_type_id")}
        >
          <Select options={featuresType} />
        </Form.Item>
        <Row>
          <Col span={24}>
            <Space wrap className="footer-actions">
              <Button onClick={toggle}>Close</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Save
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>
    </Drawer>
  );
};


export default DrawerFeature;
