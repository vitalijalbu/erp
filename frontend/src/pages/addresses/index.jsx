import React, { useState } from "react";
import Link from "next/link";
import UserPermissions from "@/policy/ability";
import PageActions from "@/shared/components/page-actions";
import { Button, Col, Modal, Row, Space, message } from "antd";
import { IconPencilMinus, IconTrash, IconPlus } from "@tabler/icons-react";
import Datatable from "@/shared/datatable/datatable";
import { getAllAddresses, deleteAddress } from "@/api/addresses/addresses";

const { confirm } = Modal;

const Index = ({ selectable, onSelect, isModal }) => {
  //Set page permissions
  if (!UserPermissions.authorizePage("bp.management")) {
    return false;
  }

  const [popupAddress, setPopupAddress] = useState(null);
  const [selected, setSelected] = useState(null);
  const [reload, setReload] = useState(0);

  const toggleAddressPopup = (record = null) => {
    setSelected(record);
    setPopupAddress(!popupAddress);
  };

  const handleTableChange = async (filters) => {
    const response = await getAllAddresses(filters);
    return response.data;
  };
  const handleDelete = async (id) => {
    confirm({
      title: "Confirm Deletion",
      transitionName: "ant-modal-slide-up",
      content: "Are you sure you want to delete this address?",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      async onOk() {
        try {
          const { data, error } = await deleteAddress(id);
          if (error) {
            message.error("Error deleting the Address");
          } else {
            message.success("Address deleted successfully");
            setReload(reload + 1);
          }
        } catch (error) {
          message.error("An error occurred while deleting the Address");
        }
      },
    });
  };

  //Table columns
  const tableColumns = [
    {
      title: "Name",
      key: "name",
      dataIndex: "name"
    },
    {
      title: "Address",
      dataIndex: "Address",
      width: "20%",
      key: "address",
      sorter: false
    },
    {
      title: "Street Number",
      dataIndex: "street_number",
      key: "street_number",
      render: (street_number) => street_number,
      sorter: false
    },
    {
      title: "City",
      dataIndex: ["city", "name"],
      key: "city",
      render: (name) => name,
      sorter: false
    },
    {
      title: "Zip code",
      dataIndex: ["zip", "code"],
      key: "zip",
      render: (code) => code,
      sorter: false
    },
    {
      title: "Province",
      dataIndex: ["province", "name"],
      key: "province",
      render: (name) => name,
      sorter: false
    },
    {
      title: "Nation",
      dataIndex: ["nation", "name"],
      key: "nation",
      render: (name) => name,
      sorter: false
    },
    {
      title: "Time Zone",
      dataIndex: "timezone",
      key: "timezone",
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
            <Link title="Edit Address" href={`/addresses/${record.id}`}>
              <Button icon={<IconPencilMinus />}>Edit</Button>
            </Link>
          ) : (
            <Button
              icon={<IconPencilMinus />}
              onClick={() => toggleAddressPopup(record)}
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
        title={`Addresses`}
        extra={[
            <Link href="/addresses/create" key="1">
                  <Button type="primary" icon={<IconPlus />}>
                    Add new
                  </Button>
                </Link>
        ]
        }
      />
      <div className="page-content">
        <Row>
          <Col span={24} className="mb-3">
            <Datatable
              columns={tableColumns}
              fetchData={handleTableChange}
              rowKey="id"
              watchStates={[reload]}
            />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Index;
