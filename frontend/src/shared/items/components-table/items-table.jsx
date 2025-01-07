import { getAllItems, getItemById } from "@/api/items";
import PageActions from "@/shared/components/page-actions";
import Datatable from "@/shared/datatable/datatable";
import { IconPencilMinus, IconPlus, IconPower } from "@tabler/icons-react";
import {
	Button,
	Col,
	Dropdown,
	Row,
	Space,
	Tag,
	Menu,
	Tabs,
	Modal,
	Checkbox,
} from "antd";
import Link from "next/link";
import _ from "lodash";
import { useEffect, useState } from "react";
import { getAllStdProducts } from "@/api/configurator/standard-products";
import TagSelection from "@/shared/components/tag-selection";

const ItemTable = (props) => {
	const [loading, setLoading] = useState(null);
	const [selected, setSelected] = useState(null);
	const [popup, setPopup] = useState(false);
	const [reload, setReload] = useState(0);
	const [itemIds, setItemIds] = useState([]);
	const [selectedTab, setSelectedTab] = useState("items");
	const [currentRow, setCurrentRow] = useState(null);
	const [isSelectedItemInCurrentPage, setSelectedItemInCurrentPage] =
		useState(true);

	useEffect(() => {
		setSelectedTab(props.tabEnabled);
	}, [props.tabEnabled]);

	useEffect(() => {
		props.setTempSelected(props.localValue);
	}, []);

	useEffect(() => {
		if (props.selectedData) {
			setItemIds(props.localValue);
			setSelected(props.selectedData);
			handleItemById(props.localValue);
		}
	}, []);

	useEffect(() => {}, [props.configurationSaved]);

	useEffect(() => {
		setItemIds(props.tempSelected?.value || props.tempSelected);
	}, [props.tempSelected]);

	useEffect(() => {
		console.log(props);
	}, [props]);

	// Fetch API data
	const handleTableChange = async (params) => {
		const enabledFilter = {
			columns: { enabled: { search: { value: 1 } } },
		};
		const result = await getAllItems(_.merge(enabledFilter, params));
		//find item in the list
		const selectedItem = selected ? selected : currentRow?.IDitem;
		console.log(currentRow);
		setSelectedItemInCurrentPage(
			_.includes(_.map(result.data.data, "id"), selectedItem)
		);
		console.log(
			selected,
			_.includes(_.map(result.data.data, "id"), selectedItem),
			currentRow,
			result.data
		);
		return result.data;
	};

	const handleItemById = async (id) => {
		const result = await getItemById(id);
		setCurrentRow(result.data);
		console.log(currentRow);
		return result.data;
	};

	const handleTableChangeStd = async (params) => {
		const result = await getAllStdProducts(params);
		// filter data company is not Chiorino shared
		result.data.data = result.data.data.filter(
			(item) => item.company.IDcompany !== "0"
		);
		console.log(result.data.data);
		return result.data;
	};

	const tableColumnsStd = [
		{
			title: "Name",
			key: "name",
			sorter: false,
			render: ({ id, name, code }) => (
				<div style={{ display: "flex", flexDirection: "column" }}>
					<span>{name}</span>
					{props.configurationSaved?.[0]?.product === code && (
						<a
							className='flex-grow-1'
							onClick={() => {
								props.setProductKey(id);
								props.setProduct(code);
								props.setProductSelected(id);
								//props.setProductSelected({ value: id, label: code });
							}}
							style={{
								marginTop: 8,
								fontSize: 12,
								color: "#33855c",
								textDecoration: "underline",
							}}
						>
							Edit configuration
						</a>
					)}
				</div>
			),
		},
		{
			title: "Code",
			key: "code",
			sorter: false,
			render: ({ code }) => <Tag>{code}</Tag>,
		},
		{
			title: "Item Group",
			dataIndex: ["item_group", "group_desc"],
			key: "item_group",
			sorter: false,
			render: (group_desc) => group_desc && <Tag>{group_desc}</Tag>,
		},
		{
			title: "Company",
			dataIndex: ["company", "desc"],
			key: "company",
			sorter: false,
			render: (desc) => desc,
		},
		{
			title: "UM",
			dataIndex: ["um", "IDdim"],
			key: "IDdim",
			filterable: false,
			sorter: false,
			render: (IDdim) => IDdim,
		},
	];

	const tableColumns = [
		{
			title: "Description",
			fixed: "left",
			description: "Item description",
			key: "item_desc",
			sorter: false,
			render: (record) => (
				<Link
					href={record?.editable === true ? `/items/${record.id}` : `#`}
					target='_blank'
				>
					{record?.item_desc}
				</Link>
			),
		},
		{
			title: "Item",
			fixed: "left",
			key: "item",
			width: "8%",
			copyable: true,
		},
		{
			title: "Type",
			fixed: "left",
			key: "type",
			width: "8%",
			sorter: false,
			render: ({ type }) => type && <Tag>{type}</Tag>,
			filterOptions: [
				{ label: "Product", value: "product" },
				{ label: "Purchased", value: "purchased" },
				{ label: "Service", value: "service" },
				{ label: "Cost", value: "cost" },
			],
		},
		{
			title: "A. Code",
			description: "Alternative item code",
			key: "altv_code",
			sorter: false,
		},
		{
			title: "A. Desc",
			description: "Alternative item description",
			key: "altv_desc",
			sorter: false,
		},
		{
			title: "UM",
			key: "um",
			width: "6%",
			sorter: false,
		},
		{
			title: "Item group",
			key: "item_group",
			width: "8%",
			sorter: false,
		},
		{
			title: "Company",
			key: "company.desc",
			filterable: false,
			sorter: false,
		},
		{
			title: "D.u.v",
			description: "Default Unit Value",
			key: "default_unit_value",
			type: "number",
			filterable: false,
			sorter: false,
		},
	];
	const { confirm } = Modal;

	const confirmEdit = (callback) => {
		if (props.configurationSaved?.[0]?.product) {
			confirm({
				title: "Confirm Edit Configuration",
				transitionName: "ant-modal-slide-up",
				content:
					"Are you sure you want to change the standard product? All the configuration will be lost",
				okText: "Confirm",
				okType: "danger",
				cancelText: "Cancel",
				async onOk() {
					try {
						callback();
					} catch (error) {
						message.error(
							"An error occurred while deleting the BOM constraint"
						);
					}
				},
			});
		} else callback();
	};
	return (
		<>
			{popup && (
				<DrawerUpdate
					opened={popup}
					toggle={togglePopup}
					data={selected}
					reload={() => setReload(reload + 1)}
				/>
			)}
			<div className='page'>
				<PageActions
					title={
						selectedTab == "items" ? "Item Master Data" : "Standard Product"
					}
				/>
				<div
					className='page-content'
					style={{ width: "100%" }}
				>
					<Row>
						<Tabs
							defaultActiveKey='items'
							activeKey={selectedTab}
							onChange={(key) => setSelectedTab(key)}
							style={{ width: "100%" }}
						>
							<Tabs.TabPane
								tab={"items"}
								key={"items"}
								tabKey={"items"}
								style={{ width: "100%" }}
							>
								{currentRow && !isSelectedItemInCurrentPage ? (
									<TagSelection
										staticKey={true}
										displayField={currentRow.item_desc}
									/>
								) : null}
								<Datatable
									fetchData={handleTableChange}
									columns={tableColumns}
									rowKey='id'
									style={{ width: "100%" }}
									watchStates={[reload]}
									rowSelection={
										props.selectable
											? {
													type: props.selection ?? "radio",
													fixed: true,
													preserveSelectedRowKeys: false,
													selectedRowKeys: [itemIds],
													onChange: (_, selectedRows) => {
														confirmEdit(() => {
															props.setItemsType("items");
															setItemIds(selectedRows?.[0]?.id);
															setCurrentRow(null);
															setSelected(selectedRows?.[0]?.id);
															props?.onSelect({
																value: selectedRows?.[0]?.id,
																label: selectedRows?.[0]?.item_desc,
																type: selectedRows?.[0]?.type,
																um: selectedRows?.[0]?.um,
															});
														});
													},
											  }
											: false
									}
								/>
							</Tabs.TabPane>

							<Tabs.TabPane
								tab={"Configurable Products"}
								key={"standard_product"}
								tabKey={"standard_product"}
								style={{ width: "100%" }}
							>
								<Datatable
									fetchData={handleTableChangeStd}
									columns={tableColumnsStd}
									style={{ width: "100%" }}
									rowKey='id'
									watchStates={[reload]}
									rowSelection={
										props.selectable
											? {
													type: props.selection ?? "radio",
													fixed: true,
													preserveSelectedRowKeys: false,
													selectedRowKeys: [itemIds],
													onChange: (_, selectedRows) => {
														const selectedValue = selectedRows[0].code;
														const selectedProductID = selectedRows[0].id;
														props.setProductKey(selectedProductID);
														props.setProduct(selectedRows[0]?.code);
														props.setItemsType("product");
														setItemIds([selectedValue]);
														confirmEdit(() => {
															props.setProductSelected({
																value: selectedProductID,
																label: selectedValue,
															});
															props?.onSelect({
																value: selectedRows?.[0]?.id,
																label: selectedRows?.[0]?.code,
																type: "standard_product",
																um: selectedRows?.[0]?.um.IDdim,
															});
														});
													},
											  }
											: false
									}
								/>
							</Tabs.TabPane>
						</Tabs>
					</Row>
				</div>
			</div>
		</>
	);
};
export default ItemTable;
