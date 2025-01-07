import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import UserPermissions from "@/policy/ability";
import {
  getBPById,
  updateBP,
  deleteBP,
  createBPDestination,
  updateBPDestination,
  deleteBPDestination,
} from "@/api/bp";
import { IconTrash, IconAlertCircle } from "@tabler/icons-react";
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Button,
  message,
  Switch,
  Modal,
  Space,
  Typography,
  Table,
} from "antd";
import PageActions from "@/shared/components/page-actions";
const { Text } = Typography;
const { confirm } = Modal;

const View = (props) => {
    //Set page permissions
    if (!UserPermissions.authorizePage("items_receipts.management")) {
      return false;
    }
  const router = useRouter();
  const { idItem, idBP } = router.query;

  const [form] = Form.useForm();
  const [isFormChanged, setIsFormChanged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({});
  const [dataDestinations, setDataDestinations] = useState([]);
  const [popup, setPopup] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [method, setMethod] = useState("create");
  const [isEditing, setIsEditing] = useState(false);

  const togglePopup = (record) => {
    if (record) {
      setSelectedRow(record);
      setIsEditing(true);
    } else {
      setSelectedRow(null);
      setIsEditing(false);
    }
    setPopup(!popup);
  };

  const getDataCallback = useCallback(() => {
    setLoading(true);
    getBPById(id)
      .then(({ data }) => {
        setData(data);
        setDataDestinations(data?.bp_destinations);
        form.setFieldsValue({
          desc: data?.desc,
          customer: data?.customer,
          supplier: data?.supplier,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
  

  // Query API here
  useEffect(() => {
    //const { query, order_by } = props;
    getDataCallback();
  }, [id]);

  /* Query API Create here */
  const handleUpdate = (values) => {
    updateBP(id, values)
      .then(({ data }) => {
        if (data !== null) {
          message.success("Success");
        }
      })
      .catch((err) => {
        message.error(err?.message);
      });
  };


/* Query API Create here */
const handleSubmitDestination = async (values) => {
  // check state editing true : false
  const apiCall = isEditing
    ? updateBPDestination({ id, selected: selectedRow?.IDdestination, body: values })
    : createBPDestination(id, values);

  apiCall
    .then(({ res }) => {
      setPopup(false);
      getDataCallback();
      if (res !== null) {
        message.success("Success");
      }
    })
    .catch((res) => {
      message.error(res?.data);
    });
};


  /* Delete Action */
  const showDeleteConfirm = (IDdestination) => {
    confirm({
      title: "Delete item?",
      icon: <IconAlertCircle color={"#faad14"} size="24" className="anticon" />,
      transitionName: "ant-modal-slide-up",
      content: "By deleting this item, it can no longer be recovered",
      okText: "Continue",
      okType: "danger",
      cancelText: "Cancel",
      onOk() {
        deleteBPDestination(id, IDdestination)
          .then(({ data }) => {
            if (data !== null) {
              message.success("Success");
            }
            getDataCallback();
          })
          .catch((err) => {
            message.error(err?.data);
          });
      },
    });
  };  
  
  /* Delete Action */
  const handleDeleteBP = () => {
    confirm({
      title: "Delete item?",
      icon: <IconAlertCircle color={"#faad14"} size="24" className="anticon" />,
      content: "By deleting this item, it can no longer be recovered",
      okText: "Continue",
      okType: "danger",
      cancelText: "Cancel",
      onOk() {
        deleteBP(id)
          .then(({ data }) => {
            if (data !== null) {
              message.success("Success");
            }
            router.push('/business-partners');
          })
          .catch((err) => {
            message.error(err?.data);
          });
      },
    });
  };

  const tableColumns = [
    {
      title: "Name",
      key: "title",
      render: ({ desc }) => <Text>{desc}</Text>,
    },
    {
      title: "Company",
      key: "IDbp",
      dataIndex: "IDbp"
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      className: "table-actions",
      render: (record) => (
        <Space.Compact>
          <Button onClick={() => togglePopup(record)}>Update</Button>
        <Button danger onClick={() => showDeleteConfirm(record?.IDdestination)}>
          Delete
        </Button>
        </Space.Compact>
      ),
    },
  ];

  return (
    <>
      {popup && (
        <DrawerDestination
          opened={popup}
          onClose={togglePopup}
          data={selectedRow}
          onSubmit={handleSubmitDestination}
        />
      )}
      <div className="page">
        <PageActions
          backUrl="/receipts/purchased/items"
          title={<>Details business partner <mark>{idItem}</mark></>}
          extra={[
            <Space>
            <Button
              key="submit"
              htmlType="submit"
              type="primary"
              form="update-bp"
              onClick={() => handleUpdate()}
              loading={loading}
              disabled={!isFormChanged}
            >
              Save
            </Button>
            <Button danger onClick={handleDeleteBP}>Delete</Button>
            </Space>
          ]}
        />
        <div className="page-content">
          <Row gutter={16}>
            <Col span={24}>
              <Card title="Details" className="mb-3">
                <Form
                  layout="vertical"
                  form={form}
                  onFinish={handleUpdate}
                  name="update-bp"
                  onValuesChange={() => setIsFormChanged(true)}
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        label="Name"
                        name="desc"
                        rules={[{ required: true }]}
                      >
                        <Input value={data} />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        label="Is customer?"
                        name="customer"
                        valuePropName="checked"
                      >
                        <Switch checkedChildren="Yes" unCheckedChildren="No" />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        label="Is supplier?"
                        name="supplier"
                        valuePropName="checked"
                      >
                        <Switch checkedChildren="Yes" unCheckedChildren="No" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              </Card>
            </Col>
            <Col span={24}>
              <Card
                title="Destinations"
                className="mb-3 p-0"
                extra={<Button onClick={() => togglePopup()}>Add new</Button>}
              >
                <Table
                  columns={tableColumns}
                  showHeader={false}
                  loading={loading}
                  dataSource={dataDestinations}
                  rowKey="IDdestination"
                  pagination={false}
                />
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
};

export default View;
