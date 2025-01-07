import React, { useState, useEffect, useCallback } from "react";
import { getLotValueHistory } from "@/api/reports/lots";
import { updateLotValue } from "@/api/lots";
import UserPermissions from "@/policy/ability";
import { useValidationErrors } from "@/hooks/validation-errors";
import { numberFormatter } from "@/hooks/formatter";
import * as dayjs from "dayjs";
import { Form, Input, InputNumber, Space, Row, Col, Divider, Table, Button, message, Tag, Drawer, Card, Statistic, Typography } from "antd";
const { Text } = Typography;
const { TextArea } = Input;
import PageActions from "@/shared/components/page-actions";
import { IconPencilMinus } from "@tabler/icons-react";

const ValueHistory = () => {
    //Set page permissions
    if (!UserPermissions.authorizePage("items_value.show")) {
        return false;
    }
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [form] = Form.useForm();
    const validationErrorsBag = useValidationErrors();
    const [popup, setPopup] = useState(false);
    const [selected, setSelected] = useState(null);
    const [submitted, setSubmitted] = useState(false);

    //toggle popup
    const togglePopup = (record) => {
        if (record) {
            setSelected(record);
        } else {
            setSelected(null);
        }
        setPopup(!popup);
    };

    const getDataCallback = useCallback(() => {
        setLoading(true);
        getLotValueHistory(form.getFieldValue("id"))
            .then(({ data, error }) => {
                if(error) {
                    setData(null);
                    message.error(error?.response?.data?.message || "Error during lot data loading");
                }
                else {
                    setData(data || {});
                }
            })
            .finally(() => {
                setLoading(false);
            });
    }, [form]);

    useEffect(() => {
        if (submitted) {
            // Reload lot value history data here
            getDataCallback();
            setSubmitted(false); // Reset the submitted state to false
        }
    }, [submitted]);

    const tableColumns = [
        {
            title: "Lot",
            key: "IDlot",
            render: ({ IDlot }) => <Text copyable>{IDlot}</Text>,
        },
        {
            title: "Value date",
            key: "date_ins",
            render: ({ date_ins }) => <Text>{date_ins}</Text>,
        },
        {
            title: "Unit value",
            key: "UnitValue",
            render: ({ UnitValue }) => <Text>{numberFormatter(UnitValue)}</Text>,
        },
        {
            title: "Lot date",
            key: "data",
            render: ({ text, record }) => <Text>{dayjs(data?.date_lot).format("YYYY-MM-DD")}</Text>,
        },
        {
            title: "Username",
            key: "username",
            render: ({ username }) => <Tag>{username}</Tag>,
        },
        {
            title: "Notes",
            key: "note",
            dataIndex: "note",
            sorter: false,
            filterable: false
        },
        {
            title: "Actions",
            key: "actions",
            align: "right",
            render: (text, record) =>
                record.IDlot ? (
                    <Button icon={<IconPencilMinus />} onClick={() => togglePopup(record)}>
                        Edit
                    </Button>
                ) : null,
        },
    ];
    return (
        <>
            {popup && <DrawerUpdate opened={popup} toggle={togglePopup} data={selected} reload={getDataCallback} />}
            <div className="page">
                <PageActions title="Lot value history">
                    {data && (
                        <Row className="mb-3">
                            <Col span={24}>
                                <Card bordered loading={loading}>
                                    <Space
                                        split={<Divider type="vertical" />}
                                        size="large"
                                        style={{ width: '100%' }}
                                    >
                                        <Space.Compact>
                                            <Statistic title="Checked date" value={dayjs(data?.checked_value_date).format("YYYY-MM-DD")} />
                                        </Space.Compact>
                                        <Space.Compact>
                                            <Statistic title="Current stock value" value={numberFormatter(data?.current_stock_value)} />
                                        </Space.Compact>
                                    </Space>
                                </Card>
                            </Col>
                        </Row>
                    )}
                    <div className="page-subhead_root">
                        <Form layout="inline" form={form} onFinish={getDataCallback}>
                            <Form.Item name="id" label="Lot number" rules={[{ required: true }]}>
                                <Input allowClear autoComplete="false" type="text"/>
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
                                loading={loading}
                                dataSource={data?.lot?.values}
                                rowKey="id"
                                hide
                                pagination={{
                                    hideOnSinglePage: true,
                                    pageSize: 100,
                                    position: ["bottomCenter"],
                                }}
                            />
                        </Col>
                    </Row>
                </div>
            </div>
        </>
    );
};

export default ValueHistory;


//=============================================================================
// Component Popup
//=============================================================================

const DrawerUpdate = ({ opened, toggle, data, reload }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const validationErrorsBag = useValidationErrors();

    const handleSubmit = async (values) => {
        setLoading(true);
        const { status, error, validationErrors } = await updateLotValue(data?.IDlot, values);
        if (error) {
            if (validationErrors) {
                validationErrorsBag.setValidationErrors(validationErrors);
                setLoading(false);
            }
            message.error("Error during saving operation");
        } else {
            message.success("Success updated");
            toggle();
            setLoading(false);
            reload(); // Call the callback to reload data
        }
    };

    useEffect(() => {
        if (data) {
            form.setFieldsValue({
                value: numberFormatter(data?.UnitValue),
                note: data?.note,
            });
        }
    }, [data, form]);

    return (
        <Drawer open={opened} width={600} onClose={toggle} title="Update Lot value">
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Form.Item
                    name="value"
                    label="Lot cost per m2"
                    {...validationErrorsBag.getInputErrors('value')}
                    rules={[
                        { required: true },
                        {
                            validator(_, value) {
                                if (value && value.toString().split(".")[1]?.length > 4) {
                                    return Promise.reject(new Error("Maximum of 4 decimal digits allowed"));
                                }
                                return Promise.resolve();
                            },
                        }
                    ]}
                >
                    <InputNumber allowClear />
                </Form.Item>
                <Form.Item name="note" label="Notes" {...validationErrorsBag.getInputErrors('note')}>
                    <TextArea rows="6" allowClear />
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
