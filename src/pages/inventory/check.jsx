

import React, { useState, useCallback } from "react";
import UserPermissions from "@/policy/ability";
import { useValidationErrors } from "@/hooks/validation-errors";
import { checkInventoryByLot, addLotToInventory, deleteLotFromInventory } from "@/api/inventory";
import { Modal, Row, Col, Form, Input, Table, Button, message, Tag, Typography } from "antd";
import PageActions from "@/shared/components/page-actions";
import { IconCheckbox, IconTrash, IconAlertCircle } from "@tabler/icons-react";
const { Text } = Typography;
const { confirm } = Modal;
import { numberFormatter } from "@/hooks/formatter";

const Check = () => {
  //Set page permissions
  if (!UserPermissions.authorizePage("inventory.management")) {
    return false;
  }

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [data, setData] = useState([]);
  const [totalData, setTotalData] = useState(0);
  const validationErrorsBag = useValidationErrors();


  const handleSubmit = (values) => {
    const { idLot } = values;
    fetchData(idLot);
  };
  
  const fetchData = useCallback(async (idLot) => {
    setLoading(true);
    const {data, error} = await checkInventoryByLot(idLot)
    if(!error) {
      setData(data);
      setTotalData(data.length);
    }
    else {
      message.error(error?.response?.status == 404 ? "Lot not found": (error?.data?.response?.message || "Error during lot data retrieving"));
      setData([]);
      setTotalData(0);
    }
    setLoading(false);
  }, []);



  //Handle Add or Deelte Lot
  const handleAction = (type, record) => {
    const body = {
      id_warehouse: record?.IDwarehouse,
      id_warehouse_location: record?.IDlocation
    };

    const actionText = type === 'add' ? 'Add Lot To Inventory' : 'Delete Lot from Inventory';
    const actionApi = type === 'add' ? addLotToInventory : deleteLotFromInventory;

    confirm({
      title: `${actionText}?`,
      icon: <IconAlertCircle color="#faad14" size="24" className="anticon" />,
      transitionName: "ant-modal-slide-up",
      content: `Continue ${type} operation`,
      okText: "Continue",
      cancelText: "Cancel",
      onCancel() {
        setLoadingAction(false);
      },
      onOk: async () => {
        setLoading(true);
        const { status, error, errorMsg, validationErrors } = await actionApi(record?.IDlot, body);
        if (error) {
          if (validationErrors) {
            validationErrorsBag.setValidationErrors(validationErrors);
          }
          message.error(errorMsg);
          setLoading(false);
        } else {
          message.success("Success");
          fetchData(record.IDlot);
        }
      }
    });
  };

  const tableColumns = [
    {
      title: "Item",
      key: "item",
      render: ({ item }) => (
        <Text>{item}</Text>
      ),
    },
    {
      title: "Description",
      key: "item_desc",
      render: ({ item_desc }) => (
        <Text>{item_desc}</Text>
      ),
    },
    {
      title: "Warehouse",
      key: "whdesc",
      render: ({ whdesc }) => (
        <Tag>{whdesc}</Tag>
      ),
    },
    {
      title: "Location",
      key: "lcdesc",
      render: ({ lcdesc }) => (
        <Text>{lcdesc}</Text>
      ),
    },
    {
      title: "W",
      key: "LA",
      dataIndex: "LA",
      render: (LA) => (
        <Text>{numberFormatter(LA)}</Text>
      ),
    },
    {
      title: "L",
      key: "LU",
      dataIndex: "LU",
      render: (LU) => (
        <Text>{numberFormatter(LU)}</Text>
      ),
    },
    {
      title: "ED",
      key: "DE",
      dataIndex: "DE",
      render: (DE) => (
        <Text>{numberFormatter(DE)}</Text>
      ),
    },
    {
      title: "ID",
      key: "DI",
      dataIndex: "DI",
      render: (DI) => (
        <Text>{numberFormatter(DI)}</Text>
      ),
    },
    {
      title: "Qty",
      key: "PZ",
      render: (record) => (
				<span>
					{numberFormatter(record.PZ)} {record.um}
				</span>
			),
    },
    {
      title: "Lot",
      key: "IDlot",
      render: ({ IDlot }) => (
        <Text>{IDlot}</Text>
      ),
    },
    {
      title: "Lot origin",
      key: "IDlot_origine",
      render: ({ IDlot_origine }) => (
        <Text>{IDlot_origine}</Text>
      ),
    },
    {
      title: "Lot date",
      key: "date_lot",
      dataIndex: "date_lot"
    },
    {
      title: "Step roll",
      key: "stepRoll",
      render: ({ stepRoll }) => (
        <Tag color={stepRoll === "Yes" ? "green" : null}>
          {stepRoll}
        </Tag>
      ),
    },
    {
      title: "Inventory",
      key: "IDinventory",
      render: ({ IDinventory }) => (
        <Tag color={IDinventory === null ? null : "green"}>
          {IDinventory === null ? "No" : "Yes"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: 'right',
      className: "table-actions",
      render: (record) => (
        record.IDinventory === null ? (
          <Button type="primary" icon={<IconCheckbox />} onClick={() => handleAction('add', record)} loading={loadingAction}>
            Add
          </Button>
        ) : (
          <Button type="text" danger icon={<IconTrash />} onClick={() => handleAction('delete', record)} loading={loadingAction}>
            Delete
          </Button>
        )
      ),
    }
  ];


  return (
    <div className="page">
      <PageActions title="Inventory check single lot" subTitle={`${totalData} results found`}>
        <div className="page-subhead_root">
          <Form layout="inline" form={form} onFinish={handleSubmit}>
            <Form.Item
              name="idLot"
              label="Lot number"
              rules={[{ required: true }]}
            >
              <Input allowClear />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                Apply filters
              </Button>
            </Form.Item>
          </Form>
        </div>
      </PageActions>
      <div className="page-content">
        <Row>
          <Col span={24}>
            <Table
              columns={tableColumns}
              dataSource={data}
              loading={loading}
              pagination={{
                hideOnSinglePage: true
              }}
            />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Check;
