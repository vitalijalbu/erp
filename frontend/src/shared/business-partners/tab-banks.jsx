import React, { useState, useEffect } from "react";
import _ from "lodash";
import { Row, Col, Form, Space, Tag, Button, Table, Typography, Modal, Flex, Input } from "antd";
const { Text, Title } = Typography;
import SelectAddress from "@/shared/addresses/select-address";
import { IconPencilMinus, IconPlus, IconTrash } from "@tabler/icons-react";
import { getAddressById } from "@/api/addresses/addresses";

const TabBanks = (props) => {
  const { data, errors, loading, onChange, isActive, changesWatcher } = props;

  const [listBanks, setListBanks] = useState([]);
  const [popup, setPopup] = useState(false);
  const [selected, setSelected] = useState(null);
  // State for holding errors
  const [errorsArray, setErrorsArray] = useState([]);

  // Initialize the errorsArray using useEffect
  useEffect(() => {
    // Convert errors object to an array of errors and ensure the correct order
    const newErrorsArray = _.orderBy(
      _.flatMap(errors?.errors || {}, (errorArray, key) => errorArray.map(() => key)),
      _.identity,
    );

    setErrorsArray(newErrorsArray);
  }, [errors]);


  const togglePopup = (record) => {
    setSelected(record || null); // Set to null if record is falsy
    setPopup(!popup);
  };

  // Initialize the pivotState using useEffect
  useEffect(() => {
    if (data?.length > 0) {
      //callback parent
      setListBanks(data);
    }
  }, []);

  // Initialize the pivotState using useEffect
  useEffect(() => {
    //changesWatcher(true);
    onChange(listBanks);
  }, [listBanks]);

  const handleSubmit = async (row) => {
    // If selected is not empty or null, it means update all rows with the same name
    console.log('ddd', row)
    let localRow = _.cloneDeep(row)
    if(localRow.address_id){
      getAddressById(row.address_id).then(({data, error})=> {
        if(!error) {
          localRow['address'] = data 
        }
        const updatedRows = selected
          ? listBanks.map((item) => (item.name === selected.name ? { ...item, ...localRow } : item))
          : [...listBanks, localRow];
    
        setListBanks(updatedRows);
        togglePopup(); // Close the popup
    
        // Clear the selected state after updating rows
        setSelected(null);
        changesWatcher(true);
      })
    }
  };

  // Handle Delete with Single Row
  const handleDelete = async (index) => {
    // Use _.filter to exclude the row with the specified id
    const updatedRows = _.filter(listBanks, (_, i) => i !== index);

    setListBanks(updatedRows);
    changesWatcher(true);
  };

  const tableColumns = [
    {
      title: "Name",
      dataIndex: "name",
      render: (text, record, index) => <Tag>{text}</Tag>,
    },
    {
      title: "IBAN",
      dataIndex: "iban",
      render: (text, record, index) => (
        <Space>
          <Text type={errorsArray.includes(`bank_accounts.${index}.iban`) ? "danger" : null}>{record.iban}</Text>
          {errorsArray.includes(`bank_accounts.${index}.iban`) && <Text type="danger">duplicated value</Text>}
        </Space>
      ),
    },
    {
      title: "SWIFT CODE",
      dataIndex: "swift_code",
    },
    {
      title: "Address",
      key: "address_id",
      dataIndex: ["address", "name"],
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      className: "table-actions",
      render: (text, record, index) => (
        <Space.Compact>
          <Button icon={<IconPencilMinus />} onClick={() => togglePopup(record)}>
            Edit
          </Button>
          <Button danger icon={<IconTrash />} onClick={() => handleDelete(index)} />
        </Space.Compact>
      ),
    },
  ];

  return (
    <>
      {popup && (
        <ModalIBAN
          opened={popup}
          toggle={() => togglePopup()}
          data={selected}
          onSubmit={(values) => handleSubmit(values)}
          //reload={() => setReload(reload + 1)}
        />
      )}
      <Col span="24">
        <Flex justify="space-between" className="mb-3">
          <div>
            <Title level={5}>Bank accounts ({listBanks?.length})</Title>
            <Text type="secondary">Manage bank accounts for business partner</Text>
          </div>
          <div>
            <Button icon={<IconPlus color="#33855c" />} onClick={() => togglePopup()}>
              Add new Bank
            </Button>
          </div>
        </Flex>

        <Table
          disabled={!isActive}
          columns={tableColumns}
          dataSource={listBanks}
          loading={loading}
          pagination={{ hideOnSinglePage: true, pageSize: 30 }}
        />
      </Col>
    </>
  );
};

export default TabBanks;

//=============================================================================
// Component Addon
//=============================================================================

const ModalIBAN = (props) => {
  const { data, opened, toggle, onSubmit } = props;
  const [form] = Form.useForm();
  const [isFormChanged, setIsFormChanged] = useState(false);


  const handleAddressChange = (value) => {
		if (_.isNull(value)) {
			form.resetFields(["address_id"]);
		}

		form.setFieldValue("address_id", value);
  };
  
  useEffect(() => {
    if (data != null) {
      form.setFieldsValue({
        name: data?.name,
        iban: data?.iban.toUpperCase(),
        swift_code: data?.swift_code.toUpperCase(),
        address_id: data?.address_id,
      });
    }
  }, [data, form]);

  // Transform to uppercase
  const handleUppercase = (fieldName, inputValue) => {
    const uppercasedValue = inputValue.toUpperCase();
    form.setFieldsValue({ [fieldName]: uppercasedValue });
  };

  return (
    <>
      <Modal
        title={
          data !== null ? (
            <>
              Update Bank account - <mark>{data?.name}</mark>
            </>
          ) : (
            "Add new Bank account"
          )
        }
        transitionName="ant-modal-slide-up"
        centered
        width="40%"
        open={opened}
        destroyOnClose={true}
        onCancel={toggle}
        footer={
          <Space>
            <Button onClick={toggle}>Close</Button>
            <Button
              key="submit"
              type="primary"
              htmlType="submit"
              form="form-bank"
              onClick={() => onSubmit(form.getFieldsValue())}
              disabled={!isFormChanged}
            >
              {data ? "Update" : "Create"}
            </Button>
          </Space>
        }
      >
        <Form
          layout="vertical"
          name="form-bank"
          form={form}
          onFinish={onSubmit}
          onValuesChange={() => setIsFormChanged(true)}
        >
          <Row gutter={16}>
            <Col span="12">
              <Form.Item label="Name" name="name" tooltip="Give a custom name" rules={[{ required: true }]}>
                <Input allowClear placeholder="Bank 1" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Address" name="address_id" rules={[{ required: true }]}>
                <SelectAddress onChange={(value) => handleAddressChange(value)} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="IBAN"
                name="iban"
                rules={[
                  { required: true, message: "Please enter IBAN" },
                  {
                    pattern: /^[a-zA-Z0-9]+$/, // Example pattern
                    message: "Invalid IBAN format",
                  },
                ]}
              >
                <Input placeholder="IBAN" allowClear onChange={(e) => handleUppercase("iban", e.target.value)} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="SWIFT CODE"
                name="swift_code"
                rules={[
                  { required: true, message: "Please enter SWIFT CODE" },
                  {
                    pattern: /^[a-zA-Z0-9]+$/, // Example pattern
                    message: "Invalid IBAN format",
                  },
                ]}
              >
                <Input
                  placeholder="SWIFT CODE"
                  allowClear
                  onChange={(e) => handleUppercase("swift_code", e.target.value)}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};
