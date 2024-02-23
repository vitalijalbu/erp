import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import UserPermissions from "@/policy/ability";
import PageActions from "@/shared/components/page-actions";
import { Button, Card, List, Modal, Table, Tag, Typography, message } from "antd";
const { confirm } = Modal;
const { Text } = Typography;
import { parseYesNo } from "@/hooks/formatter";
import { getSalePricelist, deleteSalePricelist } from "@/api/sales/pricelist";
import { IconTrash } from "@tabler/icons-react";
import Toolbar from "@/shared/sales/pricelists/toolbar";

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
			getSalePricelist(id)
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
			content: "Are you sure you want to delete this sales pricelist?",
			okText: "Delete",
			okType: "danger",
			cancelText: "Cancel",
			async onOk() {
				try {
					console.log("try on ok");
					setLoading(true);
					const { data, error } = await deleteSalePricelist(id);
					if (error) {
						message.error("Error deleting the sales pricelist");
					} else {
						message.success("sales pricelist deleted successfully");
						router.push("/sales/pricelists");
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
				backUrl="/sales/sales-pricelist"
				title={
					<>
						{" "}
						Sale Pricelist - <mark>{data?.code}</mark>
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
			<div className="page-content">
				<Card
					loading={loading}
					title="Details"
				>
					<Table
						columns={[
							{
								title: "Label",
								key: "label",
								dataIndex: "label",
								render: (e) => <b>{e}</b>,
								width: 200,
							},
							{ title: "Value", key: "value", dataIndex: "value" },
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
