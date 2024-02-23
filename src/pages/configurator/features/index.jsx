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
import { IconEdit, IconTrash, IconPlus, IconPencilMinus } from "@tabler/icons-react";
import DrawerFeature from "@/shared/configurator/features/drawer-feature";

const Index = () => {
  //Set page permissions
  if (!UserPermissions.authorizePage("configurator.manage")) {
    return false;
  }
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(0);
  const [popup, setPopup] = useState(false);
  const [selected, setSelected] = useState(null);

  const handleTableChange = async (params) => {
    const result = await getAllFeatures(params);
    return result.data;
  };

  const togglePopup = (record) => {
    if (record) {
      setSelected(record);
    } else {
      setSelected(null);
    }
    setPopup(!popup);
  };

  const handleDelete = async (id) => {
    confirm({
      title: "Confirm Deletion",
      transitionName: "ant-modal-slide-up",
      content: "Are you sure you want to delete this feature?",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      async onOk() {
        try {
          const { data, error } = await deleteFeature(id);
          if (error) {
            message.error("Error deleting the feature");
          } else {
            message.success("Feature deleted successfully");
            setReload(reload + 1);
          }
        } catch (error) {
          message.error("An error occurred while deleting the feature");
        }
      },
    });
  };

  //Table columns
  const tableColumns = [
    {
      title: "ID",
      key: "id",
      sorter: false,
    },
    {
      title: "Label",
      key: "label",
      sorter: false,
      render: ({ label }) => <Tag>{label}</Tag>,
    },
    {
      title: "Feature type",
      key: "feature_type",
      dataIndex: ["feature_type"],
      filterable: false,
      sorter: false,
      render: (feature_type) => (
        <Tag color="blue">{`${feature_type.id} - ${feature_type.label}`}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      className: "table-actions",
      render: (record) => (
        <Space.Compact>
          <Button icon={<IconPencilMinus />} onClick={() => togglePopup(record)}>
            Edit
          </Button>
          <Button
            danger
            icon={<IconTrash />}
            onClick={() => handleDelete(record.id)}
          ></Button>
        </Space.Compact>
      ),
    }
  ];

  return (
    <>
      {popup && (
        <DrawerFeature
          opened={popup}
          toggle={togglePopup}
          data={selected}
          reload={() => setReload(reload + 1)}
        />
      )}
      <div className="page">
        <PageActions
          title="Features"
          extra={[
            <Button
              icon={<IconPlus />}
              onClick={() => togglePopup()}
              type="primary"
              key="1"
            >
              Add new
            </Button>,
          ]}
        ></PageActions>

        <div className="page-content">
          <Row>
            <Col span={24}>
              <Datatable
                fetchData={handleTableChange}
                columns={tableColumns}
                rowKey={(record) => record.id}
                watchStates={[reload]}
              />
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
};

export default Index;

