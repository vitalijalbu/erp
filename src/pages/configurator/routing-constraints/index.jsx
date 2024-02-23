import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import UserPermissions from "@/policy/ability";
import {
  getAllConstraints,
  deleteConstraint,
} from "@/api/configurator/constraints";
import PageActions from "@/shared/components/page-actions";
import Datatable from "@/shared/datatable/datatable";
import { Row, Col, Space, Button, Modal, message, Tag, Dropdown } from "antd";
const { confirm } = Modal;
import { IconPlus, IconTrash, IconPencilMinus, IconCopy, IconDots } from "@tabler/icons-react";

import ModalClone from "@/shared/configurator/constraints/modal-clone";
//import ToolbarRouting from "@/shared/configurator/constraints/toolbar-routing";

const Index = () => {

  //Set page permissions
  if (!UserPermissions.authorizePage("configurator.manage")) {
    return false;
  }

  const router = useRouter();
  //Get URL param for type
  const { subtype } = router.query;
  //const [form] = Form.useForm();
  const [reload, setReload] = useState(0);
  const [selected, setSelected] = useState(null);
  const [popup, setPopup] = useState(false);

  // Get Data
  const handleTableChange = async (params) => {
    // construct filters 
    const filters = subtype ? { 'columns[subtype][search][value]': subtype, ...params } : params;
    filters['columns']['constraint_type'] = {
      search: {
        value: 'routing'
      }
    };
    const result = await getAllConstraints(filters);
    return result.data;
  };


  // Delete action
  const handleDelete = async () => {
    confirm({
      title: "Confirm Deletion",
      transitionName: "ant-modal-slide-up",
      content: "Are you sure you want to delete this constraints?",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      async onOk() {
        try {
          const { data, error } = await deleteConstraint(selected?.id);
          if (error) {
            message.error("Error deleting the constraint");
          } else {
            message.success("Constraint deleted successfully");
            setReload(reload + 1);
          }
        } catch (error) {
          message.error("An error occurred while deleting the constraint");
        }
      },
    });
  };

  //Define the action dropdown items, the name of it has to stay items
  const items = [
    {
      key: '1',
      icon: <IconCopy />,
      label: (
        <a onClick={() => setPopup(!popup)}  >
          Duplicate
        </a>
      ),

    },
    {
      key: '2',
      icon: <IconTrash />,
      danger: true,
      label: (
        <a onClick={() => handleDelete()}  >
          Delete
        </a>
      ),
    }

  ];

  // Define table columns
  const tableColumns = [
    {
      title: "ID",
      key: "id",
      dataIndex: "id",
      sorter: false
    },
    {
      title: "Label",
      key: "label",
      sorter: false,
    },
    {
      title: "Subtype",
      key: "subtype",
      sorter: false,
      render: ({ subtype }) => (
        subtype && <Tag>{subtype}</Tag>
      ),
    },
    {
      title: "Description",
      key: "description",
      sorter: false,
    },
    {
      title: "Draft",
      key: "is_draft",
      type: "bool",
      sorter: false
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      className: "table-actions",
      render: (record) => (
        <>
          <div>
            <Space.Compact>
              <Link key={1} href={`/configurator/routing-constraints/${record.id}`}>
                <Button icon={<IconPencilMinus />}>Edit</Button>
              </Link>
              <Dropdown menu={{ items }} trigger={'click'} placement="bottomRight" arrow >
                <Button icon={<IconDots />} style={{ padding: 0 }} onClick={() => {
                  setSelected(record)
                }} />
              </Dropdown>
            </Space.Compact>
          </div>
        </>
      ),
    },
  ];

  
  return (
    <>
      <div className="page">
      <PageActions
          title={
            subtype ? (
              <>
                Routing Constraints - <mark>{subtype.toUpperCase()}</mark>
              </>
            ) : (
              "All Routing Constraints"
            )
          }
          extra={[
            <Link href="/configurator/routing-constraints/create" key={0}>
              <Button type="primary" icon={<IconPlus />}>
                Add new
              </Button>
            </Link>
          ]}
        /> {/* <ToolbarRouting/>*/}
        <div className="page-content">
          <Row>
            <Col span={24}>
              <Datatable
                fetchData={handleTableChange}
                columns={tableColumns}
                rowKey={(record) => record.id}
                watchStates={[reload, subtype]}
              />
            </Col>
          </Row>
        </div>
      </div>
      {popup && <ModalClone opened={popup} toggle={() => setPopup(!popup)} data={selected} reload={() => setReload(reload + 1)} />}
    </>
  );
};

export default Index;
