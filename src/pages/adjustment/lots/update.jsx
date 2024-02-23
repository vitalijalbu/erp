import React, { useState, useEffect, useCallback } from "react";
import UserPermissions from "@/policy/ability";
import dayjs from "dayjs";
import { getLotStockById, updateLoInfo } from "@/api/lots";
import { useValidationErrors } from "@/hooks/validation-errors";
import { dateTZFormatter, dateTimeTZFormatter, numberFormatter } from "@/hooks/formatter";
import {
    Row,
    Col,
    Form,
    Input,
    Switch,
    DatePicker,
    Tag,
    Table,
    Button,
    Typography,
    Drawer,
    Space,
    message
} from "antd";
const { Text } = Typography;
import PageActions from "@/shared/components/page-actions";
import { IconPencilMinus } from "@tabler/icons-react";



const Update = () => {
    //Set page permissions
    if (!UserPermissions.authorizePage("warehouse_adjustments.management")) {
      return false;
    }
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [selected, setSelected] = useState(null);
    const [popup, setPopup] = useState(false);
    const [submitted, setSubmitted] = useState(false);


    const togglePopup = (record) => {
      if (record) {
        setSelected(record);
      } else {
        setSelected(null);
      }
      setPopup(!popup);
    };





    const getDataCallback = useCallback(() => {
      (async () => {
        setLoading(true);
        const values = form.getFieldsValue();
        const {data, error} = await getLotStockById(values.idLot);
        if(!error) {
          data.eur1 = data.eur1 == 0 ? false : true;
          const transformedData = data.stocks.map((stock) => ({
            ...data,
            ...stock,
          }));
          setData(transformedData);
        }
        else {
          setData([]);
          message.error(error?.response?.status == 404 ? "Lot not found": (error?.data?.response?.message || "Error during lot data retrieving"));
        }
        setLoading(false);
      })();
  }, [form]);

  useEffect(() => {
      if (submitted) {
          // Reload lot value history data here
          getDataCallback();
          setLoading(false);
          setSubmitted(false); // Reset the submitted state to false
      }
  }, [submitted]);




    const tableColumns = [
        {
          title: "Lot",
          dataIndex: "IDlot",
          key: "IDlot",
          render: (IDlot) => <Text copyable>{IDlot}</Text>,
        },
        {
          title: "Item",
          dataIndex: "item",
          key: "item",
          render: (item) => <Text copyable>{item.item}</Text>,
        },
        {
          title: "Description",
          dataIndex: ["item", "item_desc"],
          key: "item_desc",
          render: (item_desc) => <Text>{item_desc}</Text>,
        },
        {
          title: "Warehouse",
          dataIndex: ["warehouse", "desc"],
          key: "warehouse",
          render: (desc) => <Tag>{desc}</Tag>,
        },        
        {
          title: "Date added",
          key: "date_ins",
          render: ({date_ins}) => dateTimeTZFormatter(date_ins),
        },        
        {
          title: "Date lot",
          key: "date_lot",
          render: ({date_lot}) => dateTZFormatter(date_lot),
        }, 
        {
          title: "Eur1",
          key: "eur1",
          render: ({ eur1 }) => (
            <Tag color={eur1 === "1" ? "green" : null}>
              {eur1 == 1 ? "Yes" : "No"}
            </Tag>
          ),
        },
        {
          title: "Qty on stock",
          align: "right",
          key: "qty_stock",
          render: (record) => <Text>{numberFormatter(record.qty_stock)} {record?.item?.um}</Text>,
        },        
        {
          title: "Notes",
          key: "note",
          render: ({note}) => <Text>{note}</Text>,
        },
        {
          title: "Actions",
          key: "actions",
          align: "right",
          render: (text, record) => (
            record.IDstock ? (
              <Button icon={<IconPencilMinus />} onClick={() => togglePopup(record)}>
                Edit
              </Button>
            ) : null             
          ),
        }
      ];

    return (
      <>

        <div className="page">
            <PageActions
                title="Update lot info"
                subTitle={"Search the lot to be updated"}
            >
                <div className="page-subhead_root">
                    <Form layout="inline" form={form} onFinish={getDataCallback}  autoComplete="off">
                        <Form.Item
                            name="idLot"
                            label="Lot number"
                            rules={[{ required: true }]}
                        >
                            <Input allowClear />
                        </Form.Item>
                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                disabled={!form}
                            >
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
                            rowKey={"IDlot"}
                            loading={loading}
                            pagination={{
                                hideOnSinglePage: true,
                            }}
                        />
                    </Col>
                </Row>
            </div>
        </div>
        {popup && <DrawerUpdate opened={popup} toggle={togglePopup} data={selected} reload={getDataCallback}/>}
        </>
    );
};

export default Update;

//=============================================================================
// Component Addon
//=============================================================================

const DrawerUpdate = ({ opened, toggle, data, reload }) => {


  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const validationErrorsBag = useValidationErrors();

  // Action Issue Materials
  const handleSubmit = async (values) => {
    setLoading(true);
    // format the date fields
    const body = {
      ...values,
      dateLot: values?.dateLot?.format("YYYY-MM-DD"),
    };
    
    const { status, error, validationErrors } = await updateLoInfo(
      data?.IDlot,
      body
    );
    if (error) {
      if (validationErrors) {
        validationErrorsBag.setValidationErrors(validationErrors);
        setLoading(false);
      }
      message.error("Error during updating operation");
    } else {
      message.success("Success updated");
      toggle();
      reload();
    }
  };




  return (
    <Drawer
      open={opened}
      width={600}
      onClose={toggle}
      title={<>Update Lot info <mark>{data?.IDlot}</mark></>}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ eur1: data.eur1, dateLot: dayjs(data.date_lot) }}>
        <Form.Item name="eur1" label="Eur1 ?" rules={[{ required: true }]} valuePropName="checked">
          <Switch checkedChildren="Yes" unCheckedChildren="No"/>
        </Form.Item>
        <Form.Item
          name="dateLot"
          label="Lot date"
          rules={[{ required: true }]}
        >
          <DatePicker allowClear format="YYYY-MM-DD"/>
        </Form.Item>
        <Row>
          <Col span={24}>
            <Space wrap className="footer-actions">
              <Button onClick={toggle}>Close</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Update
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>
    </Drawer>
  );
};
