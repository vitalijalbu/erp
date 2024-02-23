import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import UserPermissions from "@/policy/ability";
import { getAllItemsEnabled } from "@/api/items";
import { Form, Input, Space, Row, Col, Divider, Table, Button, Typography, Avatar } from "antd";
import PageActions from "@/shared/components/page-actions";
import Datatable from "@/shared/datatable/datatable";
const { Text } = Typography;
import { IconArrowRight, IconUserSearch } from "@tabler/icons-react";

const Items = (props) => {
    //Set page permissions
    if (!UserPermissions.authorizePage("items_receipts.management")) {
        return false;
    }
    const router = useRouter();
    const { idBP } = router.query;
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [totalData, setTotalData] = useState(0);

    //Datatable handle change
    const handleTableChange = async (params) => {
        const result = await getAllItemsEnabled(params);
        return result.data;
    };

    const tableColumns = [
        {
            title: "Item",
            key: "item",
            copyable: true,
            sorter: false
        },
        {
            title: "Description",
            key: "item_desc",
            sorter: false
        },
        {
            title: "UM",
            key: "um",
            sorter: false,
            filterable: false,
        },
        {
            title: "Item group",
            key: "item_group",
            sorter: false
        },
        {
            title: "Actions",
            key: "actions",
            align: "right",
            className: "table-actions",
            render: (text, record) => (
                <Link href={`/receipts/purchased/view?idItem=${record.id}&idBP=${idBP}`}>
                    <Button icon={<IconArrowRight />}>
                        Reception of purchased materials
                    </Button>
                </Link>
            ),
        },
    ];
    return (
        <div className="page">
            <PageActions
                backUrl="/receipts/purchased"
                title="Receipts purchased materials"
            />
            <div className="page-content">
                <Row>
                    <Col span={24}>
                        <Datatable columns={tableColumns} fetchData={handleTableChange} rowKey="item" />
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default Items;
