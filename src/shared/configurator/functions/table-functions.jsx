import React, { useState, useEffect, useCallback, useRef } from "react";
import { getAllFunctions, deleteFunction } from "@/api/configurator/functions";
import {
  Space,
  Avatar,
  Button,
  Modal,
  Tag,
  Typography,
  Card,
  message,
} from "antd";
const { confirm } = Modal;
const { Text, Title } = Typography;
import Datatable from "@/shared/datatable/datatable";
import {
  IconEye,
  IconPencilMinus,
  IconTrash,
  IconAlertCircle,
  IconTriangleSquareCircle,
  IconPlus,
} from "@tabler/icons-react";
import ModalFunction from "@/shared/configurator/functions/modal-function";

const TableFunctions = ({ current, edit }) => {
  const [popupFunction, setPopupFunction] = useState(null);
  const [popupCategory, setPopupCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null);

  const [selected, setSelected] = useState(null);
  const [reload, setReload] = useState(0);

  const toggleFunctionPopup = (record) => {
    if (record) {
      setSelected(record);
    } else {
      setSelected(null);
    }
    setPopupFunction(!popupFunction);
  };

  //Datatable handle change
  const handleTableChange = async (params) => {
    // construct filters
    const filters = current
      ? {
        "columns[custom_function_category][search][value]": current.id,
        ...params,
      }
      : params;
    const result = await getAllFunctions(filters);
    return result.data;
  };

  //Delete Action Row
  const handleDeleteRow = async (id) => {
    setLoadingAction(id);
    confirm({
      title: "Confirm delete?",
      icon: <IconAlertCircle color={"#faad14"} size="24" className="anticon" />,
      transitionName: "ant-modal-slide-up",
      content: "Continue with delete",
      okText: "Continue",
      okType: "danger",
      cancelText: "Cancel",
      async onOk() {
        const { data, error, validationErrors } = await deleteFunction(id);
        if (error || validationErrors) {
          message.error(error.response.data.message);
        }
        else {
          message.success(`Function #${id} successfully deleted`);
          // Reload all
          setReload(reload + 1);
        }
        setLoadingAction(null);
      },
    });
  };

  const tableColumns = [
    {
      title: "Name",
      sorter: false,
      key: "label",
    },
    {
      title: "Description",
      key: "description",
      sorter: false,
    },
    {
      title: "Category",
      key: "custom_function_category",
      dataIndex: ["custom_function_category", "name"],
      sorter: false,
      render: (name) => name && <Tag color="blue">{name}</Tag>,
    },
    {
      title: "ID",
      sorter: false,
      key: "id",
      render: ({ id }) => <Tag>{id}</Tag>,
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      className: "table-actions",
      render: (text, record) => (
        <Space.Compact>
          <Button icon={<IconPencilMinus />} onClick={() => toggleFunctionPopup(record)}>
            Edit
          </Button>
          <Button danger icon={ <IconTrash />} onClick={() => handleDeleteRow(record.id)}/>
        </Space.Compact>
      ),
    },
  ];

  return (
    <>
      {popupFunction && (
        <ModalFunction
          opened={popupFunction}
          toggle={toggleFunctionPopup}
          data={selected ?? null}
          reload={() => setReload(reload + 1)}
        />
      )}
      <Card
        key={1}
        title={<>List functions - <mark>{current ? `${current.name}` : 'All'}</mark></>}
        extra={[
          <Button
            key={0}
            type="primary"
            icon={<IconPlus />}
            onClick={() => toggleFunctionPopup()}
          >
            Add new
          </Button>
        ]}
      >
        <Datatable
          columns={tableColumns}
          fetchData={handleTableChange}
          filter={true}
          rowKey={(record) => record.id}
          watchStates={[reload, current]}
        />
      </Card>
    </>
  );
};

export default TableFunctions;
