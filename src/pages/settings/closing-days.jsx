import React, { useState, useEffect, useCallback } from "react";
import _ from "lodash";
import {
  Row,
  Col,
  Space,
  Button,
  Modal,
  Form,
  message,
  Tag,
  Divider,
  Drawer,
  Select, 
  Input,
  Typography,
  Switch,
  Table,
  Tabs,
  DatePicker,
  Radio,
  Alert,
} from "antd";
const { confirm } = Modal;
const { RangePicker } = DatePicker;
const { Title } = Typography;
import {
  IconTrash,
  IconCalendarPlus,
  IconPencilMinus,
  IconCalendarDown,
  IconCalendarUp,
  IconArrowRight,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import UserPermissions from "@/policy/ability";
import { useValidationErrors } from "@/hooks/validation-errors";
import {
  createWorkingDate,
  getAllWorkingDays,
  updateWorkingDate,
  deleteWorkingDate
} from "@/api/globals/working-days";
import PageActions from "@/shared/components/page-actions";


const ClosingDays = () => {
  // Set page permissions
  if (!UserPermissions.authorizePage("calendar.manage")) {
    return false;
  }
  const [loading, setLoading] = useState(null);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selected, setSelected] = useState(null);
  const [popup, setPopup] = useState(false);
  const [typeParam, setTypeParam] = useState(true);
  const [reload, setReload] = useState(0);


  const togglePopup = (record) => {
    if (record) {
      setSelected(record);
    } else {
      setSelected(null);
    }
    setPopup(!popup);
  };

  // Define an array of day names
  const dayNames = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // Api get data
  useEffect(() => {
    setLoading(true);
    getAllWorkingDays()
      .then(({ data }) => {
        setData(data || []);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [reload]);


 


  // Handle delete date
  const handleDelete = async (id) => {
    confirm({
      title: "Confirm Deletion",
      transitionName: "ant-modal-slide-up",
      content: "Are you sure you want to delete this date?",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      async onOk() {
        try {
          const { data, error } = await deleteWorkingDate(id);
          if (error) {
            message.error("Error deleting the Day");
          } else {
            message.success("Day deleted successfully");
            setReload(reload + 1);
          }
        } catch (error) {
          message.error("An error occurred while deleting the Day");
        }
      },
    });
  };

  
  //Define table columns
  const tableColumns = [
    {
      title: "Date start - Date end",
      key: "start",
      width: "20%",
      render: (record) => (
        <Space size="0" split={<IconArrowRight color="#a1a1a1" size="14"/>}>
          {record.start === record.end ? (
            <Button type="text" icon={<IconCalendarUp color="#a1a1a1"/>} onClick={() => togglePopup(record)}>
              {record.start}
            </Button>
          ) : (
            <>
              <Button type="text" icon={<IconCalendarUp color="#a1a1a1"/>} onClick={() => togglePopup(record)}>
                {record.start}
              </Button>
              <Button type="text" onClick={() => togglePopup(record)}>
                {record.end}
              </Button>
            </>
          )}
        </Space>
      ),
    },
    {
      title: "Type",
      key: "type",
      width: "8%",
      render: ({ type }) => (
        <Tag color={type === true ? "green" : "red"}>
          {type === true ? "Opened" : "Closed"}
        </Tag>
      ),
    },
    {
      title: "Repeat every year",
      key: "repeat",
      width: "10%",
      render: ({ repeat }) => (
        <Tag color={repeat === true ? "blue" : null}>
          {repeat === true ? "Yes" : "No"}
        </Tag>
      ),
    },
    {
      title: "Days of week",
      key: "days_of_week",
      render: ({ days_of_week }) => (
        <Space size="2" split={<Divider type="vertical"/>}>
          {days_of_week?.map((dayNumber) => (
            <Tag style={{ marginRight: "2px" }} key={dayNumber}>{dayNames[dayNumber - 1]}</Tag>
          ))}
        </Space>
      ),
    }, 
    {
      title: "Note",
      key: "note",
      dataIndex: "note"
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      className: "table-actions",
      render: (record) => (
        <Space.Compact>
          <Button
            icon={<IconPencilMinus />}
            onClick={() => togglePopup(record)}
          >
            Edit
          </Button>
          <Button
            danger
            icon={<IconTrash />}
            onClick={() => handleDelete(record.id)}
          />
        </Space.Compact>
      ),
    },
  ];


  // Tab items
  const items = [
    {
      key: "0",
      label: "Closing days",
      children:(
        <RenderTable data={data} typeParam={false} loading={loading} tableColumns={tableColumns}/>
      ),
    },
    {
      key: "1",
      label: "Exceptions",
      children: (
        <RenderTable data={data} typeParam={true} loading={loading} tableColumns={tableColumns}/>
      ),
    },
  ];

  return (
    <>
      {popup && (
        <DrawerUpdate
          opened={popup}
          toggle={() => togglePopup()}
          data={selected}
          reload={() => setReload(reload + 1)}
        />
      )}
      <div className="page">
        <PageActions
          title="Manage calendar"
          extra={[
            <Button
              type="primary"
              key={0}
              onClick={() => togglePopup()}
              icon={<IconCalendarPlus />}
            >
              Add date
            </Button>,
          ]}
        />

        <div className="page-content">
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Title level={5}></Title>
              <Tabs defaultActiveKey="0" items={items} />
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
};

export default ClosingDays;

const RenderTable = ({ data, typeParam, loading, tableColumns }) => {
  const [filteredData, setFilteredData] = useState([]);
  useEffect(() => {
    const dataF = _.filter(data, { type: typeParam });
    setFilteredData(dataF || []);
  }, [data, typeParam]);

  return (
    <>
    <Alert showIcon 
    message={typeParam === false ? 
    "Define in this section all the days on which the company is not operational."
    :
    "Define in this section any exceptions to be considered during the closing periods."}
    className="mb-3"/>
    <Table
      columns={tableColumns}
      dataSource={filteredData}
      loading={loading}
      rowKey="id"
      pagination={{ hideOnSinglePage: true, pageSize: 30 }}
    />
    </>
  );
};

//=============================================================================
// Component Addon
//=============================================================================

const DrawerUpdate = ({ opened, toggle, data, reload }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const validationErrorsBag = useValidationErrors();
  const [isFormChanged, setIsFormChanged] = useState(false);

  // Define day names
  const dayOptions = [
    { label: "Monday", value: 1 },
    { label: "Tuesday", value: 2 },
    { label: "Wednesday", value: 3 },
    { label: "Thursday", value: 4 },
    { label: "Friday", value: 5 },
    { label: "Saturday", value: 6 },
    { label: "Sunday", value: 7 },
  ];


  useEffect(() => {
    if (data != null) {
      form.setFieldsValue({
        type: data?.type,
        days_of_week: data?.days_of_week,
        repeat: data?.repeat,
        note: data?.note,
        dates: [
          dayjs(data?.start, "YYYY-MM-DD") ?? null, // Use dayjs to parse the date
          dayjs(data?.end, "YYYY-MM-DD") ?? null,   // Use dayjs to parse the date
        ],
      });
    }
  }, [data, form]);

  // Submit form
  const handleSubmit = async (values) => {
    setLoading(true);
    validationErrorsBag.clear();
    const formBody = {
      ..._.omit(values, ['dates']),
      start: values.dates && values.dates.length >= 1 ? dayjs(values.dates[0]).format("YYYY-MM-DD") : null,
      end: values.dates && values.dates.length >= 1 ? dayjs(values.dates[1]).format("YYYY-MM-DD") : null,
    };

    try {
      const {
        error,
        data: responseData,
        validationErrors,
      } = data?.id ? await updateWorkingDate(data?.id, formBody) : await createWorkingDate(formBody);

      

      if (error) {
        if (validationErrors) {
          validationErrorsBag.setValidationErrors(validationErrors);
        }
        message.error("Error during saving operation");
      } else {
        message.success("Date saved successfully");
        toggle();
        reload();
      }
    } catch (error) {
      console.error("An error occurred:", error);
    } finally {
      setLoading?.(false);
    }
  };


  return (
    <Drawer
      open={opened}
      width={600}
      onClose={toggle}
      title={
        data !== null ? (
          <>
            Update date - <mark>{data?.start} - {data?.end}</mark>
          </>
        ) : (
          "Add date to calendar"
        )
      }
            
      extra={[
        <Space>
          <Button key={0} onClick={toggle}>
            Close
          </Button>
          <Button
            key="submit"
            type="primary"
            htmlType="submit"
            loading={loading}
            form="form-day"
            onClick={()=> handleSubmit}
            disabled={!isFormChanged}
          >
            {data ? "Update" : "Create"}
          </Button>
        </Space>,
      ]}
    >
      <Form layout="vertical" name="form-day" form={form} onFinish={handleSubmit} onValuesChange={() => setIsFormChanged(true)}>
        <Row gutter={16}>
          <Col span="12">
            <Form.Item label="Type" name="type" initialValue={false} {...validationErrorsBag.getInputErrors("type")}>
            <Radio.Group options={[{label: 'Closed', value: false}, {label: 'Opened', value: true}]} />
            </Form.Item>
          </Col>
          <Col span="12">
            <Form.Item
              label="Repeat every year ?"
              name="repeat"
              valuePropName="checked"
              initialValue={false}
              {...validationErrorsBag.getInputErrors("repeat")}
            >
              <Switch checkedChildren="Yes" unCheckedChildren="No" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label="Date start - Date end" name="dates" {...validationErrorsBag.getInputErrors('start')}>
          <RangePicker allowClear format="YYYY-MM-DD"/>
        </Form.Item>
        <Form.Item label="Days of week" name="days_of_week" initialValue={[]} {...validationErrorsBag.getInputErrors("days_of_week")}>
          <Select allowClear options={dayOptions} mode="multiple" maxTagCount="responsive" />
        </Form.Item>
        <Form.Item label="Notes" name="note" {...validationErrorsBag.getInputErrors("note")}>
          <Input.TextArea allowClear rows="6" />
        </Form.Item>
      </Form>
    </Drawer>
  );
};
