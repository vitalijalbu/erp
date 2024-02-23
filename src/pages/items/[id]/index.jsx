import React, { useState, useEffect, useCallback, useRef } from "react";
import UserPermissions from "@/policy/ability";
import { getItemById } from "@/api/items";
import { Card, message, Tabs, Table, Space, Button, Tag, List } from "antd";

import { useRouter } from "next/router";
import PageActions from "@/shared/components/page-actions";
import ConfigurationDetailsTable from "@/shared/items/configuration-details-table";
import BOMDetailsTable from "@/shared/items/bom-details-table";
import RoutingDetailsTable from "@/shared/items/routing-details-table";

import { IconPencilMinus, IconPower } from "@tabler/icons-react";
import Link from "next/link";
import { parseBoolColors, parseYesNo } from "@/hooks/formatter";

const Show = () => {
	//Set page permissions
	if (!UserPermissions.authorizePage("items.management")) {
		return false;
	}

	const router = useRouter();
	const { id } = router.query;
	const [loading, setLoading] = useState(true);
	const [item, setItem] = useState(null);
	const tabs = useRef([]);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				if (router.isReady && id) {
					const { data, error } = await getItemById(id);
					if (error) {
						router.push("/items");
						message.error("404 - Record Not Found");
						setLoading(false);
						return;
					}
					setItem(data);
				}
			} catch (error) {
				message.error("Error during item data loading");
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, [router.isReady, id]);

	if (item) {
		const _tabs = [
			{
				key: "1",
				label: "General Informations",
				children: (
					<Card>
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
							rowKey={"label"}
							showHeader={false}
							pagination={false}
							dataSource={[
								{
									label: "ID",
									value: item.IDitem,
								},
								{
									label: "Item Code",
									value: item.item,
								},
								{
									label: "Company",
									value: item.company.desc,
								},
								{
									label: "Description",
									value: item.item_desc,
								},
								{
									label: "Long Description",
									value: item.long_description,
								},
								{
									label: "Type",
									value: item.type,
								},
								{
									label: "A. Code",
									value: item.altv_code,
								},
								{
									label: "A. Desc",
									value: item.altv_desc,
								},
								{
									label: "Product Type",
									value:
										item?.item_group?.item_group +
										" - " +
										item?.item_group?.group_desc,
								},
								{
									label: "Item group",
									value: item?.item_subfamily?.description,
								},
								{
									label: "Product Line",
									value: item?.item_line?.description,
								},
								{
									label: "Default Unit Value",
									value: item.default_unit_value,
								},
								{
									label: "UM",
									value: item.um,
								},
								{
									label: "Weight UM",
									value: item.weight_um,
								},
								{
									label: "Customs Code",
									value: item.customs_code,
								},
								{
									label: "Number of Piles",
									value: item.number_of_piles,
								},
								{
									label: "Enabled",
									value: (
										<Space>
											<Button
												className={
													item.enabled ? "btn-success" : "btn-danger"
												}
												icon={<IconPower />}
												title={
													item.enabled ? "Item Enabled" : "Item Disabled"
												}
											></Button>
											<Tag color={item.enabled ? "green" : "red"}>
												{parseYesNo(item.enabled)}
											</Tag>
										</Space>
									),
								},
								{
									label: "Configurator Only",
									value: (
										<Space>
											<Button
												className={
													item.configurator_only == "1"
														? "btn-success"
														: "btn-danger"
												}
												icon={<IconPower />}
												title={
													item.configurator_only == "1"
														? "Configurator Only"
														: "Not Configurator Only"
												}
											></Button>
											<Tag
												color={
													item.configurator_only == "1" ? "green" : "red"
												}
											>
												{parseYesNo(item.configurator_only)}
											</Tag>
										</Space>
									),
								},
							]}
						></Table>
					</Card>
				),
			},
		];

		if (item.configured_item) {
			_tabs.push({
				key: "2",
				label: "Configuration",
				children: (
					<>
						<Card>
							<List
								className="mb-5"
								itemLayout="horizontal"
								dataSource={[
									{
										label: "Standard Product",
										value:
											item.standard_product.code +
											"-" +
											item.standard_product.name,
									},
									{
										label: "Base Item",
										value: !!item?.base_item && (
											<Link
												target="_blank"
												href={`/items/${item.IDitem}/edit`}
											>
												{item?.base_item?.item} -{" "}
												{item?.base_item?.item_desc}
											</Link>
										),
									},
								]}
								renderItem={(item, index) => (
									<List.Item>
										<List.Item.Meta
											title={item.label}
											description={item.value}
										/>
									</List.Item>
								)}
							></List>
							<ConfigurationDetailsTable
								configuration={item.configuration_details}
							></ConfigurationDetailsTable>
						</Card>
					</>
				),
			});
			_tabs.push({
				key: "3",
				label: "BOM",
				children: (
					<Card>
						<BOMDetailsTable materials={item.item_materials}></BOMDetailsTable>
					</Card>
				),
			});
			_tabs.push({
				key: "4",
				label: "Routing",
				children: (
					<Card>
						<RoutingDetailsTable routing={item.item_routing}></RoutingDetailsTable>
					</Card>
				),
			});
		}

		tabs.current = _tabs;
	}

	return (
		<div className="page">
			<PageActions
				loading={loading}
				backUrl="/items"
				title={item ? item?.item : null}
				subTitle={item ? item?.item_desc : null}
				extra={[
					item && (
						<Button
							href={`/items/${item.IDitem}/edit`}
							icon={<IconPencilMinus />}
							key={0}
							disabled={!item?.editable}
						>
							Edit
						</Button>
					),
				]}
			></PageActions>
			<div className="page-content">
				{tabs.current.length > 0 && (
					<Tabs
						defaultActiveKey="1"
						items={tabs.current}
					/>
				)}
			</div>
		</div>
	);
};

export default Show;
