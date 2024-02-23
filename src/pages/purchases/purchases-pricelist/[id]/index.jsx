import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import UserPermissions from "@/policy/ability";
import PageActions from "@/shared/components/page-actions";
import { Button, Card, Table, Modal, Tag, Typography, message } from "antd";
const { confirm } = Modal;
const { Text } = Typography;
import { parseYesNo } from "@/hooks/formatter";
import { getPurchasePricelist, deletePurchasePricelist } from "@/api/purchases/pricelist";
import { IconTrash } from "@tabler/icons-react";
import Toolbar from "@/shared/purchases/pricelists/toolbar";

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
	const [isFormChanged, setIsFormChanged] = useState(false);

	useEffect(() => {
		if (router.isReady && id) {
			setLoading(true);
			getPurchasePricelist(id)
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
			content: "Are you sure you want to delete this purchases pricelist?",
			okText: "Delete",
			okType: "danger",
			cancelText: "Cancel",
			async onOk() {
				try {
					console.log("try on ok");
					setLoading(true);
					const { data, error } = await deletePurchasePricelist(id);
					if (error) {
						message.error("Error deleting the sales pricelist");
					} else {
						message.success("purchases pricelist deleted successfully");
						router.push("/purchases/purchases-pricelist");
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
				backUrl="/purchases/purchases-pricelist"
				title={
					<>
						Edit Purchases Pricelist - <mark>{data?.code}</mark>
					</>
				}
				extra={[
					<Button
						key={1}
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
			<div className="page-content">
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
								label: "Code",
								value: <Text>{data?.code}</Text>,
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
								label: "Business Partner",
								value: (
									<Link
										href={`/business-partners/${data?.bp?.IDbp}`}
										target="_blank"
									>
										{data?.bp?.desc}
									</Link>
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
		</div>
	);
};

export default Index;
