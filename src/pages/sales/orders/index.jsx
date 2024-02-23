import { getAllSales } from "@/api/orders";
import PageActions from "@/shared/components/page-actions";
import Datatable from "@/shared/datatable/datatable";
import { IconEye, IconPencilMinus, IconPlus } from "@tabler/icons-react";
import { Button, Col, Row, Space, Tag } from "antd";
import Link from "next/link";
import { useState } from "react";
import _ from "lodash";

const Index = () => {
    const [reload, setReload] = useState(0);

    // Fetch API data
    const apiCall = async (filters) => {
        const result = await getAllSales(_.merge(filters, { columns: { sale_type: { search: { value: "sale" } } } }));
        return result.data;
    };

    // Defins colors tags for different states
    const stateColors = {
        closed: 'red',
        canceled: 'red',
        approved: 'green',
        inserted: 'blue'
    };

    // Define table columns
    const tableColumns = [
        {
            title: "Code",
            key: "code",
            width: "10%",
            render: ({code}) => <Tag>{code}</Tag>
        },
        {
            title: "BP description",
            key: "bp_desc",
            sorter: false,
        },
        {
            title: "BP id",
            key: "bp_id",
            dataIndex: "bp_id",
        },
        {
            title: "State",
            key: "state",
            width: "10%",
            sorter: false,
            filterOptions: [
				{ label: "Inserted", value: "inserted" },
				{ label: "Approved", value: "approved" },
				{ label: "Canceled", value: "canceled" },
				{ label: "Closed", value: "closed" },
			],
            render: ({ state }) => <Tag color={stateColors[state]}>{state}</Tag>,
        },
        {
            title: "Customer order ref.",
            key: "customer_order_ref",
            sorter: false,
        },
        {
            title: "Created at",
            key: "created_at",
            type: "date",
        },
        {
            title: "Sale Internal contact",
            key: "sale_internal_contact",
            sorter: false,
        },
        {
            title: "Delivery date",
            key: "delivery_date",
            type: "date",
        },
        {
            title: "Actions",
            key: "actions",
            align: "right",
            className: "table-actions",
            render: (record) => (
                <Space.Compact>
                    <Link key={0} href={`/sales/orders/${record.id}`}>
                        <Button key={'show_'+record.id} icon={<IconEye />}>
                            Show
                        </Button>
                    </Link>
                    <Link key={1} href={`/sales/orders/${record.id}/edit`}>
                        <Button disabled={record.state !== 'inserted'} key={'edit_' + record.id} icon={<IconPencilMinus />}>
                            Edit
                        </Button>
                    </Link>
                </Space.Compact>
            ),
        },
    ];

    return (
        <div className="page">
            <PageActions key={1} title="Sales orders"                
            extra={[
                    <Link href="/sales/orders/create" key="1">
                        <Button type="primary" icon={<IconPlus />}>
                            Add new
                        </Button>
                    </Link>,
                ]}
            />
            <div className="page-content">
                <Row>
                    <Col span={24} className="mb-3">
                        <Datatable
                            columns={tableColumns}
                            fetchData={apiCall}
                            rowKey={(record) => record.id}
                            watchStates={[reload]}
                        />
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default Index;
