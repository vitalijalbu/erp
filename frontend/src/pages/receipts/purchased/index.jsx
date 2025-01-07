import React, { useState } from "react";
import Link from "next/link";
import UserPermissions from "@/policy/ability";
import { getAllSuppliers } from "@/api/bp";
import { Form, Input, Space, Row, Col, Divider, Table, Button, Typography, Avatar } from "antd";
const { Text } = Typography;
import PageActions from "@/shared/components/page-actions";
import Datatable from "@/shared/datatable/datatable";
import { IconArrowRight, IconUserSearch } from "@tabler/icons-react";

const Index = () => {
    //Set page permissions
    if (!UserPermissions.authorizePage("items_receipts.management")) {
        return false;
    }
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [totalData, setTotalData] = useState(0);
    const [form] = Form.useForm();

    //Datatable handle change
    const handleTableChange = async (params) => {
        const result = await getAllSuppliers(params);
        return result.data;
    };

    const tableColumns = [
        {
            title: "Business partner",
            key: "desc",
            sorter: false,
            render: ({ desc, id }) => (
                <Space>
                    <Avatar shape="square" size="small" icon={<IconUserSearch className="anticon" />} />
                    {desc}
                </Space>
            ),
        },
        {
            title: "ID",
            key: "id",
            sorter: false,
            render: ({ id }) => <Text copyable>{id}</Text>,
        },
        {
            title: "Actions",
            key: "actions",
            align: "right",
            className: "table-actions",
            render: (text, record) => (
                <Link href={`/receipts/purchased/items?idBP=${record.id}`}>
                    <Button icon={<IconArrowRight />}>
                        Reception of purchased materials
                    </Button>
                </Link>
            ),
        },
    ];
    return (
        <div className="page">
            <PageActions title="Receipts purchased materials" />
            <div className="page-content">
                <Row>
                    <Col span={24}>
                        <Datatable columns={tableColumns} fetchData={handleTableChange} rowKey="idLot" />
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default Index;
