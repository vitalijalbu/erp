import React, { useState, useEffect } from "react";
import Link from "next/link";
import UserPermissions from "@/policy/ability";
import { useValidationErrors } from "@/hooks/validation-errors";
import { getAllItems, toggleItem, setAlternativeCode } from "@/api/items";
import { Flex, Row, Col, Space, Button, Modal, Form, message, Tag, Dropdown, Input, Drawer, Alert, Popover, Typography } from "antd";
const { confirm } = Modal;
import PageActions from "@/shared/components/page-actions";
import { IconTrendingUp, IconPower, IconPencilMinus, IconPlus, IconTrash, IconDots, IconSettings2, IconEye } from "@tabler/icons-react";
import Datatable from "@/shared/datatable/datatable";
import ConfigurationDetailsTable from "@/shared/items/configuration-details-table";

const Index = () => {
    //Set page permissions
    if (!UserPermissions.authorizePage("items.management")) {
        return false;
    }
    const [loading, setLoading] = useState(null);

    const [selected, setSelected] = useState(null);
    const [popup, setPopup] = useState(false);
    const [reload, setReload] = useState(0);

    const togglePopup = () => {
        if (selected) {
            setSelected(selected);
        } else {
            setSelected(null);
        }
        setPopup(!popup);
    };

    // Fetch API data
    const handleTableChange = async (params) => {
        const result = await getAllItems(params);
        return result.data;
    };

    //Define the action dropdown items, the name of it has to stay items
    const items = [
        {
            key: 1,
            icon: <IconPencilMinus />,
            label: <Link href={`/items/${selected?.id}/edit`}>Edit</Link>,
            disabled: selected?.editable == false
        },
        {
            key: 2,
            icon: <IconTrendingUp />,
            label: <Link href={`/items/${selected?.id}/stock-limits`}>Stock limits</Link>,
        },
        {
            key: 3,
            icon: <IconPencilMinus />,
            label: <a onClick={() => setPopup(!popup)}>Alternative code</a>,
        },
        /*{
            key: 3,
            danger: true,
            icon: <IconTrash />,
            label: <a onClick={() => handleDelete()}>Delete</a>,
        },*/
    ];

    const tableColumns = [
        {
            title: "Item",
            fixed: "left",
            key: "item",
            dataIndex: "item",
            width: "8%"        
        },
        {
            title: "Description",
            fixed: "left",
            description: "Item description",
            key: "item_desc",
            sorter: false,
            render: (record) => record.configured_item ? 
                <Flex align="center">
                    <Typography.Text style={{maxWidth:400}} ellipsis={{rows:1}} symbol="...">
                        {record?.item_desc}
                    </Typography.Text>
                    <Popover placement='right' content={<ConfigurationDetailsTable configuration={record.configuration_details}></ConfigurationDetailsTable>} title="Item Configuration">
                        <Button type="link"><IconSettings2></IconSettings2></Button>
                    </Popover>
                </Flex>:
                <Typography.Text>{record?.item_desc}</Typography.Text>,
        },
        {
            title: "Type",
            fixed: "left",
            key: "type",
            width: "8%",
            sorter: false,
            render: ({type}) => type && <Tag>{type}</Tag>,
            filterOptions: ([
                {label: "Product", value:"product"}, 
                {label: "Purchased", value:"purchased"}, 
                {label: "Service", value:"service"}, 
                {label: "Cost", value:"cost"} 
            ])
        },
        {
            title: "A. Code",
            description: "Alternative item code",
            key: "altv_code",
            sorter: false,
        },
        {
            title: "A. Desc",
            description: "Alternative item description",
            key: "altv_desc",
            sorter: false,
        },
        {
            title: "UM",
            key: "um",
            width: "6%",
            sorter: false,
        },
        {
            title: "Product Type",
            key: "item_group",
            width: "8%",
            sorter: false,
        },
        {
            title: "Company",
            key: "company.desc",
            sorter: false,
        },
        {
            title: "D.u.v",
            description: "Default Unit Value",
            key: "default_unit_value",
            type: "number",
            filterable: false,
            sorter: false,
        },
        {
            title: "Enabled",
            key: "enabled",
            type: "bool",
            filterable: false,
            sorter: false,
            render: (record) => (
                <Space>
                    <Button
                        className={record.enabled ? "btn-success" : "btn-danger"}
                        icon={<IconPower />}
                        loading={loading === record.id}
                        title={record.enabled ? "Disable Item" : "Enable Item"}
                        onClick={async () => {
                            setLoading(record.id);
                            const { result, error } = await toggleItem(record.id, record.enabled ? 0 : 1);
                            if (error) {
                                message.error("Error during item state change operation");
                                setLoading(null);
                            }else{
                            setReload(reload + 1);
                            setLoading(null);
                            message.success("Item enabled successfully");
                            }
                        }}
                    ></Button>
                    <Tag color={record.enabled ? "green" : "red"}>{record.enabled ? "Yes" : "No"}</Tag>
                </Space>
            ),
        },
        {
            title: "Actions",
            key: "actions",
            align: "right",
            className: "table-actions",
            render: (record) => (
                <Space.Compact>
                    <Link key={0} href={`/items/${record.id}`}>
                        <Button key="show-item" icon={<IconEye />}>
                            Show
                        </Button>
                    </Link>
                    <Dropdown key={1} menu={{ items }} trigger={"click"} placement="bottomRight" arrow>
                        <Button
                            icon={<IconDots />}
                            onClick={() => {
                                setSelected(record);
                            }}
                        />
                    </Dropdown>
                </Space.Compact>
            ),
        },
    ];

    return (
        <>
            {popup && <DrawerUpdate opened={popup} toggle={togglePopup} data={selected} reload={() => setReload(reload + 1)} />}
            <div className="page">
                <PageActions
                    title="Item Master Data"
                    extra={[
                        <Link href="/items/create" key={0}>
                            <Button type="primary" icon={<IconPlus />} key="add-item">
                                Add new
                            </Button>
                        </Link>,
                    ]}
                />

                <div className="page-content">
                    <Row>
                        <Col span={24}>
                            <Datatable fetchData={handleTableChange} columns={tableColumns} rowKey={(record) => record.id} watchStates={[reload]} />
                        </Col>
                    </Row>
                </div>
            </div>
        </>
    );
};

export default Index;

//=============================================================================
// Component Addon
//=============================================================================

const DrawerUpdate = ({ opened, toggle, data, reload }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const validationErrorsBag = useValidationErrors();
    const [item, setItem] = useState(null);
    const [isFormChanged, setIsFormChanged] = useState(false);

    useEffect(() => {
        if (data) {
            form.setFieldsValue({
                altv_code: data?.altv_code,
                altv_desc: data?.altv_desc,
            });
        }
    }, [data]);

    const updateDetails = async () => {
        setLoading(true);
        validationErrorsBag.clear();
        const { status, error, validationErrors } = await setAlternativeCode(data?.id, form.getFieldsValue());
        if (error) {
            if (validationErrors) {
                validationErrorsBag.setValidationErrors(validationErrors);
            }

            message.error(error?.response?.data?.message || "Error during saving operation");
        } else {
            message.success("Item details saved successfully");
            reload();
            toggle();
        }
        setLoading(false);
    };

    return (
        <Drawer
            open={opened}
            width={600}
            onClose={toggle}
            title={
                <>
                    {" "}
                    Alternative details for item{" "}
                    <mark>
                        {data?.item} - {data?.item_desc}
                    </mark>
                </>
            }
            extra={[
                <Space wrap className="footer-actions">
                    <Button key={0} onClick={toggle}>
                        Close
                    </Button>
                    <Button disabled={!isFormChanged} key={1} type="primary" htmlType="submit" loading={loading} onClick={updateDetails}>
                        Update
                    </Button>
                </Space>,
            ]}
        >
            <Form layout="vertical" form={form} onFinish={updateDetails} onValuesChange={() => setIsFormChanged(true)}>
                <Form.Item label="Alternative Code" name="altv_code" {...validationErrorsBag.getInputErrors("altv_code")}>
                    <Input allowClear />
                </Form.Item>
                <Form.Item label="Alternative Description" name="altv_desc" {...validationErrorsBag.getInputErrors("altv_desc")}>
                    <Input allowClear />
                </Form.Item>
            </Form>
            <Alert message="Before updating alternative codes, Item must be enabled!" type="warning" />
        </Drawer>
    );
};
