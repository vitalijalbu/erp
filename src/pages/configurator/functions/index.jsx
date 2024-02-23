import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  getAllFunctionCategories,
  deleteFunctionCategory,
} from "@/api/configurator/functions";
import UserPermissions from "@/policy/ability";
import {
  Row,
  Col,
  Space,
  Button,
  Modal,
  Form,
  Tabs,
  Table,
  Tag,
  Menu,
  Card,
  Avatar,
  Typography,
  message,
} from "antd";
const { confirm } = Modal;
const { Text, Title } = Typography;
import PageActions from "@/shared/components/page-actions";
import {
  IconAlertCircle,
  IconPlus,
  IconCategory,
  IconTrash,
  IconEye,
  IconPencilMinus
} from "@tabler/icons-react";
import TableFunctions from "@/shared/configurator/functions/table-functions";

//import modals
import ModalFunctionCategory from "@/shared/configurator/functions/modal-function-category";


const Index = () => {
  //Set page permissions
  if (!UserPermissions.authorizePage("configurator.manage")) {
    return false;
  }
  const [popupFunction, setPopupFunction] = useState(null);
  const [popupCategory, setPopupCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null);
  const [categories, setCategories] = useState([]);
  // Default selected category
  const [selected, setSelected] = useState(null);
  // Default selected category for view functions
  const [current, setCurrent] = useState(null);
  const [reload, setReload] = useState(0);


  const toggleCategoryPopup = (record) => {
    if (record) {
      setSelected(record);
    } else {
      setSelected(null);
    }
    setPopupCategory(!popupCategory);
  };

  // Filter Empty Children Array
  const filterEmptyChildren = (data) => {
    return data.map((item) => {
      const { children, ...rest } = item;
      if (children && children.length > 0) {
        rest.children = filterEmptyChildren(children);
      }
      return rest;
    });
  };

  // API Call
  useEffect(() => {
    setLoading(true);
    getAllFunctionCategories()
      .then(({ data, error }) => {
        if (!error) {
          const filteredData = filterEmptyChildren(data);
          setCategories(filteredData || []);
        } else {
          message.error("An error occurred while fetching API");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [reload]);

  //Delete Action Row
  const handleDeleteRow = (id) => {
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
        deleteFunctionCategory(id)
          .then(({ data }) => {
            if (data !== null) {
              message.success(`Function #${id} successfully deleted`);
            }
            //Reload all
            setReload(reload + 1);
          })
          .catch((err) => {
            message.error(err?.data);
          })
          .finally(() => {
            setLoadingAction(null);
          });
      },
    });
  };

  // Define table columns
  const tableColumns = [
    {
      title: "Name",
      key: "name",
      render: (record) => (
          <Button type="text" onClick={() => setCurrent(record)}>{record.name}</Button>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      className: "table-actions",
      render: (text, record) =>
        record.id === null ? null 
        :(
          <Space.Compact>
            <Button icon={<IconPencilMinus />} onClick={() => toggleCategoryPopup(record)}/>
            <Button
              icon={<IconTrash />}
              danger
              onClick={() => handleDeleteRow(record.id)}
            />
          </Space.Compact>
        ),
    }
  ];

  return (
    <>
      {popupCategory && (
        <ModalFunctionCategory
          opened={popupCategory}
          toggle={toggleCategoryPopup}
          data={selected ?? null}
          reload={() => setReload(reload + 1)}
        />
      )}
      <div className="page">
        <PageActions
          //favorite={{is_favorite: true, toggle: true }}
          title="Functions & categories"
          subTitle="Select a category to view all related functions" />
        <div className="page-content">
          <Row gutter={16}>
            {/* Categories list */}
            <Col lg={8} md={12} xs={24} sm={24}>
              <Card
                key={0}
                title="Categories"
                className="p-0"
                extra={[
                  <Button
                    key={0}
                    icon={<IconPlus />}
                    type="primary"
                    onClick={() => toggleCategoryPopup()}
                  >
                    Add new
                  </Button>
                ]}
              >
                <Table
                  columns={tableColumns}
                  /*expandable={{
                    rowExpandable: (record) => record.children && record.children.length > 0,
                    childrenColumnName: "children",
                  }}*/
                  dataSource={[...categories, { id: null, name: "All categories" }]}
                  showHeader={false}
                  loading={loading}
                  rowKey="id"
                  pagination={{ hideOnSinglePage: true }}
                />


              </Card>
            </Col>
            <Col lg={16} md={12} sm={24} xs={24}>
              <TableFunctions current={current} />
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
};

export default Index;
