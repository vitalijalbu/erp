import React, { useState, useEffect } from "react";
import { getAllFunctions, getAllFunctionCategories, getFunctionById } from "@/api/configurator/functions";
import {
  Space,
  Radio,
  Avatar,
  Button,
  Row,
  Col,
  Typography,
  Table,
  Tag,
  Divider,
  Form,
  Modal,
  Input,
  message,
} from "antd";
import {
  IconCheckbox,
  IconArrowLeft,
  IconTriangleSquareCircle,
  IconArrowRight,
  IconCategory,
  IconSearch,
} from "@tabler/icons-react";

const { Text, Title } = Typography;

const SelectFunctionOld = ({ opened, toggle, setFunction, reload }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [functions, setFunctions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedFunction, setSelectedFunction] = useState(null);
  const [searchValue, setSearchValue] = useState("");

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

  // const fetchFunctions = (category = null) => {

  //   if(category) {
  //     const filter = {"columns[custom_function_category][search][value]": category.id}

  //    getAllFunctions(filter)
  //     .then(({data}) => console.log(data))
  //   }
  // }


  const handleCategoryClick = (category) => {
    // Handle category selection
    setSelectedCategory(category);
    setSelectedFunction(null);
    // fetchFunctions(category)
  };

  const handleFunctionClick = (func) => {
    // Handle function selection
    // setSelectedFunction(func[0])
    getFunctionById(func[0].id)
      .then(( {data} ) => setSelectedFunction(data))
      .catch((e) => message.error('Failed Select function'))

    console.log('selectedFunction', selectedFunction)
  };

  const emitValue = () => {
    // Emit selected function
    console.log(selectedFunction)
    setFunction(selectedFunction);
    toggle();
  };

  return (
    <Modal
      open={opened}
      onCancel={toggle}
      width={"50%"}
      title="Select a function"
      centered
      maskClosable={false}
      focusTriggerAfterClose={false}
      transitionName="ant-modal-slide-up"
      footer={[
        <Button key={0} onClick={toggle}>
          Close
        </Button>,
        <Button type="primary" key={1} icon={<IconCheckbox />} onClick={emitValue} disabled={!selectedFunction}>
          Select
        </Button>,
      ]}
    >
      <div>
        <Input
          allowClear
          placeholder="Search Function"
          onChange={(e) => setSearchValue(e.target.value)}
          prefix={<IconSearch size="16" color="#ccc" />}
        />
      </div>
      <div style={{ minHeight: "500px" }}>
        <Divider className="my-1" />
        {selectedCategory ? (
          // Render functions tab
          <TabViewFunctions
            category={selectedCategory}
            loading={loading}
            onFunctionClick={handleFunctionClick}
            onGoBack={() => setSelectedCategory(null)}
          />
        ) : (
          // Render categories tab
          <TabViewCategories loading={loading} onCategoryClick={handleCategoryClick} />
        )}
      </div>
    </Modal>
  );
};

const TabViewCategories = ({ onCategoryClick }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch all function categories
    setLoading(true);
    getAllFunctionCategories()
      .then(({ data, error }) => {
        if (!error) {
          setCategories(data);
        } else {
          message.error("An error occurred while fetching categories");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);


  // Define table columns
  const tableColumns = [
    {
      title: "Name",
      key: "name",
      render: (record) => (
        <>
          <Text strong>{record.name}</Text>
          {record.id !== null && <Text>{record?.children?.length}</Text>}
        </>
      ),
    },

    {
      title: "Actions",
      key: "actions",
      align: "right",
      className: "table-actions",
      render: (text, record) => (
        <Button onClick={() => onCategoryClick(record)}>
          View functions <IconArrowRight />
        </Button>
      ),
    },
  ];

  return (
    <div className="tab-custom">
      <Table
        columns={tableColumns}
        dataSource={[...categories, { id: null, name: "All categories" }]}
        showHeader={false}
        loading={loading}
        rowKey="id"
        pagination={{ hideOnSinglePage: true }}
        expandable={{ childrenColumnName: "children" }}
      />
    </div>
  );
};

const TabViewFunctions = ({ category, onGoBack, onFunctionClick }) => {
  const [functions, setFunctions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch functions for the selected category
    setLoading(true);
    if (category) {

      const filter = { "columns[custom_function_category][search][value]": category.id }

      getAllFunctions(filter)
        .then(({ data, error }) => {
          if (!error) {
            setFunctions(data?.data || []);
          } else {
            message.error("An error occurred while fetching functions");
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [category]);


  // Define table columns
  const tableColumns = [
    {
      title: "Name",
      sorter: false,
      key: "label",
      render: ({ label }) => (
        <Space>
          <Avatar size="small" shape="square" icon={<IconTriangleSquareCircle />} />
          <Text strong>{label}</Text>
        </Space>
      ),
    },
    {
      title: "Description",
      key: "description",
      sorter: false,
    },
    {
      title: "Category",
      key: "custom_function_category",
      dataIndex: ["custom_function_category"],
      sorter: false,
      render: (name) => name ?? <Tag color="blue">{name}</Tag>,
    },
    {
      title: "ID",
      sorter: false,
      key: "id",
      render: ({ id }) => <Tag color="volcano">{id}</Tag>,
    },
  ];

  return (
    <div className="tab-custom">
      <Button onClick={onGoBack} icon={<IconArrowLeft />}>
        Go back
      </Button>
      <Divider />
      <Table
        showHeader={false}
        rowSelection={{ type: "radio", onChange: (selectedRowKeys, selectedRows) => { onFunctionClick(selectedRows) } }} //Pass here entire object or only ID
        columns={tableColumns}
        loading={loading}
        dataSource={functions}
        pagination={false}
        rowKey="id"
      />
    </div>
  );
};

export default SelectFunctionOld;
