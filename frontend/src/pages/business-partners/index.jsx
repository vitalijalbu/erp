import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import UserPermissions from "@/policy/ability";
import { getAllBP } from "@/api/bp";
import PageActions from "@/shared/components/page-actions";
import {
    Space,
    Row,
    Col,
    Typography,
    Button,
} from "antd";
import { IconPlane, IconPencilMinus, IconPlus } from "@tabler/icons-react";
import Datatable from "@/shared/datatable/datatable";



const Index = () => {
    //Set page permissions
    if (!UserPermissions.authorizePage("bp.management")) {
        return false;
    }
    const [reload, setReload] = useState(0);
    
    const handleTableChange = async (params) => {
        const result = await getAllBP(params);
        return result.data;
    };



    const tableColumns = [
        {
            title: "Business Partner",
            key: "desc",
            dataIndex: "desc",
            width: "20%"
        },
        {
            title: "Supplier",
            key: "supplier",
            type: 'bool',
            sorter: false
        },
        {
            title: "Customer",
            key: "customer",
            type: 'bool',
            sorter: false
        }, 
        {
            title: "Carrier",
            key: "is_carrier",
            type: 'bool',
            sorter: false
        }, 
        {
            title: "Active",
            key: "is_active",
            type: 'bool',
            sorter: false
        },
        {
            title: "Blocked",
            key: "is_blocked",
            type: 'bool',
            sorter: false
        },
        {
            title: "Address",
            key: "address",
            sorter: false
        },
        {
            title: "VAT",
            key: "vat",
            sorter: false
        },
        {
            title: "Actions",
            key: "actions",
            align: "right",
            className: "table-actions",
            render: (record) => (
                <Space.Compact>
                    <Link key={1} title="Edit BP" href={`/business-partners/${record.id}`}>
                        <Button icon={<IconPencilMinus />}>Edit</Button>
                    </Link>
                    <Link key={0} title="Go to destination management" href={`/business-partners/${record.id}/destinations`}>
                        <Button type="info" icon={<IconPlane />}>
                            {record.bp_destinations_count}
                        </Button>
                    </Link>
                </Space.Compact>
            ),
        }
    ];

    return (
        <div className="page">
            <PageActions
                title="Business Partner"
                extra={[<Link href="/business-partners/create" key="1">
                    <Button type="primary" icon={<IconPlus/>}>Add new</Button>
                </Link>]}
            >
            </PageActions>

            <div className="page-content">
                <Row>
                    <Col span={24} className="mb-3">
                        <Datatable
                            fetchData={handleTableChange}
                            columns={tableColumns}
                            watchStates={[reload]}
                            rowKey={(record) => record.id}
                        />
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default Index;
