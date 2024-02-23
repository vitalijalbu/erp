import React, { useState, useRef } from "react";
import Link from "next/link";
import UserPermissions from "@/policy/ability";
import { toggleDiscountMatrix, getAllDiscountMatrix, deleteDiscountMatrix } from "@/api/sales/discount-matrix";
import PageActions from "@/shared/components/page-actions";
import { Modal, Space, Row, Col, Button, message, Tag } from "antd";
const { confirm } = Modal;
import { IconEye, IconList, IconPlayerPause, IconPlus, IconTrash } from "@tabler/icons-react";
import Datatable from "@/shared/datatable/datatable";
import { IconAlertCircle } from "@tabler/icons-react";
import _ from "lodash";
import { IconPlayerPlay } from "@tabler/icons-react";
import { parseYesNo } from "@/hooks/formatter";

const Index = () => {
    //Set page permissions
    if (!UserPermissions.authorizePage("sales_price_lists.manage")) {
        return false;
    }
    const [reload, setReload] = useState(0);
    const [loadingAction, setLoadingAction] = useState([]);

    // Delete action
    const handleDeleteRow = async (id) => {
        confirm({
            title: "Confirm delete?",
            icon: <IconAlertCircle color={"#faad14"} size="24" className="anticon" />,
            transitionName: "ant-modal-slide-up",
            content: "Continue with delete",
            okText: "Continue",
            okType: "danger",
            cancelText: "Cancel",
            async onOk() {
                setLoadingAction(['delete', id]);
                const { data, error, validationErrors } = await deleteDiscountMatrix(id);
                if (error || validationErrors) {
                    message.error(error.response.data.message);
                } else {
                    message.success(`Discount deleted successfully`);
                    // Reload all
                    setReload(reload + 1);
                }
                setLoadingAction([]);
            },
        });
    };

    // Toggle Row state
    const toggleRow = async (idRow, isDisabled) => {
        setLoadingAction(['toggle', idRow]);
        var { status, error, errorMsg } = await toggleDiscountMatrix(idRow, {
            disable: !isDisabled,
        });
        if (error) {
            message.error(errorMsg);
        } else {
            message.success("Changes saved succesfully");
            setReload(reload + 1);
        }
        setLoadingAction([]);
    };

    const handleTableChange = async (params) => {
        const result = await getAllDiscountMatrix(params);
        return result.data;
    };

    const tableColumns = [
        {
            title: "Priority",
            key: "priority",
            dataIndex: "priority",
        },
        {
            title: "Description",
            key: "description",
            dataIndex: "description",
            sorter: false,
        },
        {
            title: "Business Partner",
            key: "bp_desc",
            dataIndex: "bp_desc",
            sorter: false,
        },
        {
            title: "Sale Pricelist",
            key: "sale_price_list",
            sorter: false,
            render: (record) => record?.sale_price_list?.code,
        },
        {
            title: "Currency",
            key: "currency_id",
            sorter: false,
        },
        {
            title: "Disabled",
            key: "is_disabled",
            sorter: false,
            type: "bool",
            render: ({is_disabled}) => <Tag color={is_disabled ? "red" : "green"}>{parseYesNo(is_disabled)}</Tag>
        },
        {
            title: "Actions",
            key: "actions",
            align: "right",
            className: "table-actions",
            render: (text, record) =>
                record.id === null ? null : (
                    <Space.Compact>
                        <Link key={0} title="Show" href={`/sales/discount-matrix/${record.id}`}>
                            <Button icon={<IconEye />}>Show</Button>
                        </Link>
                        <Link key={1} title="Show rows" href={`/sales/discount-matrix/${record.id}/rows`}>
                            <Button icon={<IconList />}>Rows</Button>
                        </Link>
                        <Button
                            key={2}
                            icon={record.is_disabled ? <IconPlayerPlay color="#33855c" /> : <IconPlayerPause color="#333" />}
                            onClick={() => toggleRow(record.id, record.is_disabled)}
                            loading={_.isEqual(loadingAction, ['toggle', record.id])}
                        />
                        <Button key={3} icon={<IconTrash />} danger loading={_.isEqual(loadingAction, ['delete', record.id])} onClick={() => handleDeleteRow(record.id)} />
                    </Space.Compact>
                ),
        },
    ];

    return (
        <div className="page">
            <PageActions
                title="Discount Matrix"
                extra={[
                    <Link href="/sales/discount-matrix/create" key={0}>
                        <Button type="primary" icon={<IconPlus />}>
                            Add new
                        </Button>
                    </Link>,
                ]}
            ></PageActions>

            <div className="page-content">
                <Row>
                    <Col span={24} className="mb-3">
                        <Datatable fetchData={handleTableChange} columns={tableColumns} rowKey={(record) => record.id} watchStates={[reload]} />
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default Index;
