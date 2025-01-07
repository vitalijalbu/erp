import { getAllItems, getItemById } from "@/api/items";
import PageActions from "@/shared/components/page-actions";
import Datatable from "@/shared/datatable/datatable";
import { Button, Col, Dropdown, Row, Space, Tag } from "antd";
import Link from "next/link";
import _ from "lodash";
import { useEffect, useState } from "react";
import TagSelection from "@/shared/components/tag-selection";

const ItemTable = (props) => {
	const [loading, setLoading] = useState(null);
	const [selected, setSelected] = useState(null);
	const [popup, setPopup] = useState(false);
	const [reload, setReload] = useState(0);
	const [itemIds, setItemIds] = useState([]);
	const [currentRow, setCurrentRow] = useState(null);
	const [isSelectedItemInCurrentPage, setSelectedItemInCurrentPage] = useState(true);

	useEffect(() => {
		if (props.selectedData) {
			setItemIds(props.selectedData);
			setSelected(props.selectedData);
			handleItemById(props.selectedData);
		}
	}, []);

	// Fetch API data
	const handleTableChange = async (params) => {
		const result = await getAllItems(_.merge(props.filter, params));
		//find item in the list
		const selectedItem = selected ? selected : currentRow?.IDitem;
		setSelectedItemInCurrentPage(_.includes(_.map(result.data.data, "id"), selectedItem));
		return result.data;
	};

	const handleItemById = async (id) => {
		const result = await getItemById(id);
		setCurrentRow(result.data);
		return result.data;
	};

	const tableColumns = [
		{
			title: "Item",
			fixed: "left",
			key: "item",
			width: "8%",
			copyable: true,
		},
		{
			title: "Description",
			fixed: "left",
			description: "Item description",
			key: "item_desc",
			sorter: false,
			render: (record) => (
				<Link
					href={record?.editable === true ? `/items/${record.id}` : `#`}
					target="_blank"
				>
					{record?.item_desc}
				</Link>
			),
		},
		{
			title: "Type",
			fixed: "left",
			key: "type",
			width: "8%",
			sorter: false,
			filterable: false,
			render: ({ type }) => type && <Tag>{type}</Tag>,
			// filterOptions: [
			// 	{ label: "Product", value: "product" },
			// 	{ label: "Purchased", value: "purchased" },
			// 	{ label: "Service", value: "service" },
			// 	{ label: "Cost", value: "cost" },
			// ],
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
			<div className="page">
				<PageActions title={"Cost Items"} />
				<div
					className="page-content"
					style={{ width: "100%" }}
				>
					{currentRow && !isSelectedItemInCurrentPage && (
						<TagSelection
							staticKey={true}
							row={currentRow}
							displayField={currentRow.item_desc}
						/>
					)}
					<Datatable
						fetchData={handleTableChange}
						columns={tableColumns}
						rowKey="id"
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
											setItemIds(selectedRows?.[0]?.id);
											setCurrentRow(null);
											setSelected(selectedRows?.[0]?.id);
											props?.onSelect(selectedRows?.[0]?.id);
										},
								  }
								: false
						}
					/>
				</div>
			</div>
		</>
	);
};
export default ItemTable;
