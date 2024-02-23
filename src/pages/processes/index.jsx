import React, { useState } from "react";
import Link from "next/link";
import UserPermissions from "@/policy/ability";
import PageActions from "@/shared/components/page-actions";
import { Button, Col, Modal, Row, Space, Tag, Typography, message } from "antd";
const { confirm } = Modal;
const { Text } = Typography;
import { IconPencilMinus, IconTrash, IconPlus } from "@tabler/icons-react";
import Datatable from "@/shared/datatable/datatable";
import { deleteProcess, getAllProcesses } from "@/api/processes/processes";



const Index = ({ selectable, onSelect, isModal }) => {

  // Set page permissions
  if (!UserPermissions.authorizePage("configurator.manage")) {
    return false;
  }

  const [popupProcess, setPopupProcess] = useState(null);
  const [selected, setSelected] = useState(null);
  const [reload, setReload] = useState(0);

  const toggleProcessPopup = (record = null) => {
    setSelected(record);
    setPopupProcess(!popupProcess);
  };

  const handleTableChange = async (filters) => {
    const response = await getAllProcesses(filters);
    return response.data;
  };

  const handleDelete = async (id) => {
    confirm({
      title: "Confirm Deletion",
      transitionName: "ant-modal-slide-up",
      content: "Are you sure you want to delete this process?",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      async onOk() {
        try {
          const { data, error, errorMsg } = await deleteProcess(id);
          if (error) {
            message.error(errorMsg);
          } else {
            message.success("Process deleted successfully");
            setReload(reload + 1);
          }
        } catch (error) {
          message.error("An error occurred while deleting the Process");
        }
      },
    });
  };

  // Table columns
  const tableColumns = [
    {
      title: "Name",
      key: "name",
      dataIndex: "name"
    },
    {
      title: "Code",
      key: "code",
      render: ({code}) => <Tag>{code}</Tag>
    },
    {
      title: "Price Item",
      key: "price_item",
      align: "right",
      render: ({price_item}) => price_item && 
            <Text>{price_item?.item} -
            {price_item?.item_desc}</Text>
    },
    {
      title: "Setup Price Item",
      key: "setup_price_item",
      render: ({setup_price_item}) => setup_price_item && 
      <Text>{setup_price_item?.item} - {setup_price_item?.item_desc}</Text>
    },
    {
      title: "Operator Cost Item",
      key: "operator_cost_item",
      render: ({operator_cost_item}) => operator_cost_item && 
      <Text>{operator_cost_item?.item} - {operator_cost_item?.item_desc}</Text>
    },
    {
      title: "Execution time",
      key: "execution_time",
      dataIndex: "execution_time",
      type: "number",
      hasFilterOperator: true,
      render: (execution_time) => <Tag>{`${execution_time ?? 0} min`}</Tag>
    }, 
    {
      title: "Setup time",
      key: "setup_time",
      dataIndex: "setup_time",
      type: "number",
      hasFilterOperator: true,
      render: (setup_time) =><Tag>{`${setup_time ?? 0} min`}</Tag>
    },
    {
      title: "Need machine",
      key: "need_machine",
      type: "bool",
      sorter: false
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      className: "table-actions",
      render: (record) => (
        <Space.Compact>
          {!isModal ? (
            <Link title="Edit Process" href={`/processes/${record.id}`}>
              <Button icon={<IconPencilMinus />}>Edit</Button>
            </Link>
          ) : (
            <Button
              icon={<IconPencilMinus />}
              onClick={() => toggleProcessPopup(record)}
            >
              Edit
            </Button>
          )}

          <Button
            danger
            icon={<IconTrash />}
            onClick={() => handleDelete(record.id)}
          />
        </Space.Compact>
      ),
    }
  ];

  return (
    <div className="page">
      <PageActions
        key={1}
        title={`Processes`}
        extra={[
          <Link href="/processes/create" key="1">
            <Button type="primary" icon={<IconPlus />}>
              Add new
            </Button>
          </Link>
        ]}
      />
      <div className="page-content">
        <Row>
          <Col span={24} className="mb-3">
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
  );
};

export default Index;
