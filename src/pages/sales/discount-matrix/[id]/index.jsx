import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import UserPermissions from "@/policy/ability";
import PageActions from "@/shared/components/page-actions";
import { Button, Card, Table, Modal, Tag, Typography, message } from "antd";
const { confirm } = Modal;
const { Text } = Typography;
import { getDiscountMatrix, deleteDiscountMatrix } from "@/api/sales/discount-matrix";
import { parseYesNo } from "@/hooks/formatter";
import { IconTrash } from "@tabler/icons-react";
import Toolbar from "@/shared/sales/discount-matrix/toolbar";

const Index = () => {
    //Set page permissions
    if (!UserPermissions.authorizePage("sales_price_lists.manage")) {
        return false;
    }

    const router = useRouter();
    const { id } = router.query;
    const [loading, setLoading] = useState(false);
    const [reload, setReload] = useState(1);
    const [data, setData] = useState(null);

    useEffect(() => {
        if (router.isReady && id) {
            setLoading(true);
            getDiscountMatrix(id)
                .then((response) => {
                    if (response.data) {
                        setData(response.data);
                    }
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [router.isReady, id, reload]);

    // Delete action
    const handleDelete = async () => {
        confirm({
            title: "Confirm Deletion",
            transitionName: "ant-modal-slide-up",
            content: "Are you sure you want to delete this Discount Matrix?",
            okText: "Delete",
            okType: "danger",
            cancelText: "Cancel",
            async onOk() {
                try {
                    console.log("try on ok");
                    setLoading(true);
                    const { data, error } = await deleteDiscountMatrix(id);
                    if (error) {
                        message.error("Error deleting the sales pricelist");
                    } else {
                        message.success("Discount Matrix deleted successfully");
                        router.push("/sales/discount-matrix");
                    }
                } catch (error) {
                    console.log(error);
                    message.error("An error occurred while deleting the sales pricelist");
                }
                setLoading(false);
            },
        });
    };

    return (
        <div className="page">
            <PageActions
                loading={loading}
                backUrl="/sales/discount-matrix"
                title={
                    <>
                        Discount Matrix - <mark>{data?.description}</mark>
                    </>
                }
                extra={[
                    <Button key={1} danger icon={<IconTrash />} onClick={() => handleDelete()}>
                        Delete
                    </Button>,
                ]}
            >
                <Toolbar />
            </PageActions>
            <Card loading={loading} title="Details">
            <Table
                    columns={[
                        {
                            label: "Label",
                            key: "label",
                            dataIndex: "label",
                            render: (e) => <b>{e}</b>,
                            width: 200,
                        },
                        { label: "Value", key: "value", dataIndex: "value" },
                    ]}
                    showHeader={false}
                    pagination={false}
                    rowKey="label"
                    dataSource={[
                        {
                            label: "Description",
                            value: <Text>{data?.description}</Text>,
                        },
                        {
                            label: "Priority",
                            value: <Text>{data?.priority}</Text>,
                        },
                        {
                            label: "Currency",
                            value: <Tag>{data?.currency_id}</Tag>,
                        },
                        {
                            label: "Disabled",
                            value: <Tag color={data?.is_disabled ? "red" : "green"}>{parseYesNo(data?.is_disabled)}</Tag>,
                        },
                        {
                            label: "Business Partner",
                            value: (
                                <Link href={`/business-partners/${data?.bp?.IDbp}`} target="_blank">
                                    {data?.bp?.desc ?? "-"}
                                </Link>
                            ),
                        },
                        {
                            label: "Sales Pricelist",
                            value: (
                                <Link href={`/sales/sales-pricelist/${data?.sale_price_list?.id}`} target="_blank">
                                    {data?.sale_price_list?.code ?? "-"}
                                </Link>
                            ),
                        },
                        {
                            label: "Total Item Rows",
                            value: <Text>{data?.rows.length}</Text>,
                        }
                    ]}
                />
            </Card>
        </div>
    );
};

export default Index;
