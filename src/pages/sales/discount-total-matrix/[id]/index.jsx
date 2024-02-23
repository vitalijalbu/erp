import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import UserPermissions from "@/policy/ability";
import PageActions from "@/shared/components/page-actions";
import { Button, Card, Table, Modal, Tag, Typography, message } from "antd";
const { confirm } = Modal;
const { Text } = Typography;
import { parseYesNo } from "@/hooks/formatter";
import { getDiscountTotalMatrix, deleteDiscountTotalMatrix } from "@/api/sales/discount-total-matrix";
import { IconTrash } from "@tabler/icons-react";
import Toolbar from "@/shared/sales/discount-total-matrix/toolbar";

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
            getDiscountTotalMatrix(id)
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
            content: "Are you sure you want to delete this Discount Total Matrix?",
            okText: "Delete",
            okType: "danger",
            cancelText: "Cancel",
            async onOk() {
                try {
                    console.log("try on ok");
                    setLoading(true);
                    const { data, error } = await deleteDiscountTotalMatrix(id);
                    if (error) {
                        message.error("Error deleting the sales pricelist");
                    } else {
                        message.success("Discount Total Matrix deleted successfully");
                        router.push("/sales/discount-total-matrix");
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
				backUrl="/sales/discount-total-matrix"
				title={
					<>
						Discount Total Matrix - <mark>{data?.description}</mark>
					</>
				}
				extra={[
					<Button
						key={0}
						danger
						icon={<IconTrash />}
						onClick={() => handleDelete()}
					>
						Delete
					</Button>,
				]}
			>
				<Toolbar />
			</PageActions>
			<Card
				loading={loading}
				title="Details"
			>
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
							value: (
								<Tag color={data?.is_disabled ? "red" : "green"}>
									{parseYesNo(data?.is_disabled)}
								</Tag>
							),
						},
						{
							label: "Total Item Rows",
							value: <Text>{data?.rows.length}</Text>,
						},
					]}
				/>
			</Card>
		</div>
	);
};

export default Index;
