import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import UserPermissions from "@/policy/ability";
import { useValidationErrors } from "@/hooks/validation-errors";
import {
  concludeInventory,
  getAllInventory,
  createInventory,
} from "@/api/inventory";
import PageActions from "@/shared/components/page-actions";
import {
  Modal,
  Form,
  Space,
  Row,
  Col,
  Drawer,
  Input,
  Table,
  Typography,
  Avatar,
  message,
  Tag,
  Button,
  Alert,
} from "antd";
const { Text } = Typography;
const { confirm } = Modal;
const { TextArea } = Input;
import {
  IconChartBar,
  IconAlertCircle,
  IconEye,
  IconLock,
  IconPlus,
} from "@tabler/icons-react";
import Datatable from "@/shared/datatable/datatable";

const Index = () => {
  //Set page permissions
  if (!UserPermissions.authorizePage("inventory.management")) {
    return false;
  }
  const [form] = Form.useForm();
  const validationErrorsBag = useValidationErrors();
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [store, setStore] = useState({
    idInventory: null,
    stocksToVerify: 0,
  });
  const [reload, setReload] = useState(0);
  const [popup, setPopup] = useState(false);

  const togglePopup = () => {
    setPopup(!popup);
  };

  const handleTableChange = async (params) => {
    try {
      const result = await getAllInventory(params);
      const { idInventory, stocksToVerify } = result.data; // Access the nested properties

      // Update the state with the new values
      setStore({ idInventory, stocksToVerify });
      
      setLoading(false);
      return result.data;
    } catch (error) {
      // Handle any errors
      console.error(error);
      return [];
    }
  };



  //Conclude Inventory Confirm
  const handleConclude = () => {
    confirm({
      title: `Conclude Inventory?`,
      icon: <IconAlertCircle color={"#faad14"} size="24" className="anticon" />,
      transitionName: "ant-modal-slide-up",
      content: "Continue with conclusion oif the inventory",
      okText: "Continue",
      cancelText: "Cancel",
      onOk: async () => {
        setLoadingAction(true);
        const { status, error, validationErrors } = await concludeInventory(store.idInventory);
        if (error) {
          if (validationErrors) {
            validationErrorsBag.setValidationErrors(validationErrors);
          }
          message.error('Error concluding Inventory');
          setLoadingAction(false);
        } else {
          message.success("Inventory successfully concluded");
          setLoadingAction(false);
          setReload(reload + 1);
        }
      },
    });
  };

  const tableColumns = [
    {
      title: "Description",
      key: "desc",
      dataIndex: "desc",
      sorter: false
    },
    {
      title: "Start date",
      key: "startDate",
      dataIndex: "startDate",
      sorter: false
    },
    {
      title: "End date",
      key: "endDate",
      dataIndex: "endDate",
      sorter: false
    },
    {
      title: "Status",
      key: "state",
      sorter: false,
      filterable: false,
      render: ({ state }) => (
        <Tag color={state == 1 ? "green" : null}>
          {state == 1 ? "Completed" : "Not completed"}
        </Tag>
      ),
    },
    {
      title: "Username",
      key: "username",
      sorter: false,
      render: ({ username }) => <Tag>{username}</Tag>,
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      className: "table-actions",
      render: ({ idInventory }) => (
        <Space.Compact align="right">
          <Link href={`/inventory/${idInventory}`}>
            <Button icon={<IconEye />}>View</Button>
          </Link>
          <Link href={`/inventory/${idInventory}/adjustments`}>
            <Button icon={<IconChartBar />}>Report adjustments</Button>
          </Link>
        </Space.Compact>
      ),
    },
  ];
  return (
    <>
      {popup && <PopupCreate opened={popup} toggle={togglePopup} reload={() => setReload(reload + 1)} />}
      <div className="page">
        <PageActions
          title="Inventory master data"
          footer={
            <Text type="secondary">
              Inventory task is currently running (to complete the inventory you
              still have to verify <mark>{store.stocksToVerify}</mark> stock records.)
            </Text>
          }
          extra={!loading && [
            store.idInventory !== null && (
              <Button
                key={1}
                danger
                disabled={store.stocksToVerify > 0}
                icon={<IconLock />}
                loading={loadingAction}
                onClick={handleConclude}
              >
                Conclude current inventory
              </Button>),
            store.idInventory === null && (
              <Button
                key={2}
                type="primary"
                onClick={togglePopup}
                loading={loadingAction}
                icon={<IconPlus />}
              >
                Create new
              </Button>
            )
          ]}

        />

        <div className="page-content">
          <Row>
            <Col span={24}>
              <Datatable
                columns={tableColumns}
                fetchData={handleTableChange}
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

//=============================================================================
// Component Popup
//=============================================================================

const PopupCreate = ({ opened, toggle, reload }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const validationErrorsBag = useValidationErrors();

  // Action Issue Materials
  const handleCreate = async (values) => {
    setLoading(true);
    const { status, error, errorMsg, validationErrors } = await createInventory(values);
    if (error) {
      if (validationErrors) {
        validationErrorsBag.setValidationErrors(validationErrors);

      }
      message.error(errorMsg);
      setLoading(false);
    } else {
      message.success("Success created");
      setLoading(false);
      //reload table
      reload();
      toggle();
    }
  };

  return (
    <Drawer
      open={opened}
      width={600}
      onClose={toggle}
      title="Create new inventory"
      extra={[
        <Space>
        <Button key="back" onClick={toggle}>
          Close
        </Button>
        <Button
          key="ok"
          type="primary"
          htmlType="submit"
          loading={loading}
          form="remove-lot"
        >
          Save
        </Button>
      </Space>
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleCreate}
        name="remove-lot"
      >
        <Form.Item
          name="desc"
          label="Description"
          {...validationErrorsBag.getInputErrors('desc')}
          rules={[{ required: true }]}
        >
          <TextArea rows="6" allowClear />
        </Form.Item>
      </Form>
    </Drawer>
  );
};
