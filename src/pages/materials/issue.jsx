import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  getAllMaterialIssue,
  confirmMaterialIssue,
  deleteMaterialIssue,
} from "@/api/stocks";
import UserPermissions from "@/policy/ability";
import { numberFormatter } from "@/hooks/formatter";
import {
  Form,
  Row,
  Col,
  Table,
  Button,
  message,
  Tag,
  Typography,
  Modal,
} from "antd";
import PageActions from "@/shared/components/page-actions";
import { IconAlertCircle, IconTrash, IconCheckbox } from "@tabler/icons-react";
const { Text } = Typography;
const { confirm } = Modal;
import DrawerIssue from "@/shared/materials/drawer-issue";



const Issue = () => {
  //Set page permissions
  if (!UserPermissions.authorizePage("materials.management")) {
    return false;
  }


  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null);
  const [data, setData] = useState([]);
  const [totalData, setTotalData] = useState(0);
  const [popup, setPopup] = useState(false);
  const [reload, setReload] = useState(0);

  const togglePopup = () => {
    setPopup(!popup);
  };


  // Api call
  useEffect(() => {
    setLoading(true);
    getAllMaterialIssue()
      .then(({ data }) => {
        setData(data || []);
        setTotalData(data.length || 0);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [reload]);


  //Delete Action Row
  const handleDeleteRow = async (record) => {
    confirm({
      title: "Confirm delete?",
      icon: <IconAlertCircle color={"#faad14"} size="24" className="anticon" />,
      transitionName: "ant-modal-slide-up",
      content: "Continue with delete",
      okText: "Continue",
      okType: "danger",
      cancelText: "Cancel",
      async onOk() {
        setLoadingAction(record.IDissue);
        const { data, error, validationErrors } = await deleteMaterialIssue(record?.IDissue);
        if (error || validationErrors) {
            message.error(error.response.data.message);
        } else {
            message.success(`Lot ${record?.IDlot} successfully deleted`);
            // Reload all
            setReload(reload + 1);
        }
        setLoadingAction(null);
     },
    });
  };


  const tableColumns = [
    {
      title: "Lot",
      key: "IDlot",
      render: ({ IDlot }) => <Text>{IDlot ?? 'Lot not found'}</Text>,
    },
    {
      title: "Step Roll",
      key: "stepRoll",
      render: ({ stepRoll }) => (
        <Tag color={stepRoll === "1" ? "green" : null}>
          {stepRoll === "1" ? "Yes" : "No"}
        </Tag>
      ),
    },
    {
      title: "Item",
      key: "item",
      render: ({ item }) => <Text>{item}</Text>,
    },
    {
      title: "Description",
      key: "item_desc",
      dataIndex: "item_desc",
    },
    {
      title: "Qty",
      key: "qty",
      align: "right",
      render: (record) => <Text>{numberFormatter(record.qty)} {record.um}</Text>,
    },
    {
      title: "Dimensions",
      key: "dim",
      dataIndex: "dim",
    },
    {
      title: "Warehouse",
      key: "whdesc",
      render: ({ whdesc }) => <Tag>{whdesc}</Tag>,
    },
    {
      title: "Warehouse location",
      key: "lcdesc",
      render: ({ lcdesc }) => <Tag>{lcdesc}</Tag>,
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      dataIndex: "actions",
      render: (text, record) => (
        <Button
          type="text"
          onClick={() => handleDeleteRow(record)}
          danger
          icon={<IconTrash />}
          loading={loadingAction === record.IDissue}
        />
      ),
    },
  ];
  return (
    <>
      {popup && <DrawerIssue opened={popup} toggle={togglePopup} reload={() => setReload(reload + 1)} />}
      <div className="page">
        <PageActions
          title="Material shipment to customer"
          subTitle={`${totalData} results found`}
          extra={[
            <Button
              key={0}
              type="primary"
              onClick={togglePopup}
              loading={loading}
              disabled={data <= 0}
              icon={<IconCheckbox />}
            >
              Confirm material issues
            </Button>,
          ]}
        />
        <div className="page-content">
          <Row>
            <Col span={24}>
              <Table
                columns={tableColumns}
                dataSource={data}
                loading={loading}
                rowKey="IDissue"
                pagination={{
                  hideOnSinglePage: true,
                  pageSize: 100,
                  position: ["bottomCenter"],
                }}
              />
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
};

export default Issue;
