import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { getAllStocks, getAllStocksExport, removeLotFromInventory } from "@/api/stocks";
import PageActions from "@/shared/components/page-actions";
import { Button, Col, Row, Space, Tag, Tooltip, Typography } from "antd";
import {
	IconAlertCircle,
	IconCircleCheck,
	IconCircleOff,
	IconLayersIntersect,
	IconList,
	IconPencilMinus,
	IconPlus,
	IconScissorsOff,
	IconSettings,
	IconX,
} from "@tabler/icons-react";
import Datatable from "@/shared/datatable/datatable";
import { DatatableController } from "@/shared/datatable/datatable";
import _ from "lodash";

const TableStocks = (props) => {
	const [reload, setReload] = useState(0);
	const [popupStock, setPopupStock] = useState(null);
	const [selected, setSelected] = useState(null);
	const [loading, setLoading] = useState(false);
	const [lotIds, setLotIds] = useState([]);
	const currentInventory = useRef(null);
	const router = useRouter();
	const pageUrl = router.asPath;

	localStorage.setItem("pageUrl", pageUrl);
	const dtController = new DatatableController();

	const toggleStockPopup = (record = null) => {
		setSelected(record);
		setPopupStock(!popupStock);
	};

	useEffect(() => {
		if (props.selectedData) {
			setLotIds([props.selectedData]);
			setSelected(props.selectedData);
		}
	}, []);

	const handleTableChange = async (filters) => {
		setLoading(true);
		const result = await getAllStocks(_.merge(filters, props.filter));
		currentInventory.current = result.data.id_inventory;
		setLoading(false);
		return result.data;
	};

	const tableColumns = [
		{
			title: "Lot",
			description: "Lot ID",
			key: "id_lot",
			fixed: "left",
			copyable: true,
			ellipsis: false,
			sorter: false,
			width: "8%",
		},
		{
			title: "Origin Lot",
			key: "id_lot_origine",
			copyable: true,
			sorter: false,
			fixed: "left",
			width: "8%",
		},
		{
			title: "Item",
			description: "Item code",
			key: "item_code",
			hasFilterOperator: true,
			sorter: false,
			fixed: "left",
			render: (value, record) => {
				return record.altv_code?.length ? (
					<Tooltip title={record.altv_code}>{record.item_code}</Tooltip>
				) : (
					<>{record.item_code}</>
				);
			},
		},
		{
			title: "Description",
			description: "Item description",
			key: "item_desc",
			hasFilterOperator: true,
			sorter: false,
			width: "8%",
			render: (value, record) => {
				return record.altv_desc?.length ? (
					<Tooltip title={record.altv_desc}>{record.item_desc}</Tooltip>
				) : (
					<>{record.item_desc}</>
				);
			},
		},
		{
			title: "WHS",
			description: "Warehouse",
			key: "warehouse",
			sorter: false,
		},
		{
			title: "LOC",
			description: "Warehouse location",
			key: "warehouse_location",
			sorter: false,
			hasFilterOperator: true,
		},
		{
			title: "W",
			description: "Width (mm)",
			key: "la",
			type: "number",
			sorter: false,
			hasFilterOperator: true,
		},
		{
			title: "L",
			description: "Lenght (mm)",
			key: "lu",
			type: "number",
			hasFilterOperator: true,
		},
		{
			title: "P",
			description: "Pieces",
			key: "pz",
			type: "number",
			hasFilterOperator: true,
		},
		{
			title: "E",
			description: "External diameter (mm)",
			key: "de",
			type: "number",
			hasFilterOperator: true,
		},
		{
			title: "I",
			description: "Internal diameter (mm)",
			key: "di",
			type: "number",
			hasFilterOperator: true,
		},
		{
			title: "Cuts",
			description: "Count of planned cuts",
			key: "cutNum",
			type: "number",
			hasFilterOperator: true,
			render: (record) =>
				record.cutNum > 0 ? (
					<Tag color="red">{record.cutNum}</Tag>
				) : (
					<Typography.Text>{record.cutNum}</Typography.Text>
				),
		},
		{
			title: "Qty",
			description: "Quantity um",
			align: "right",
			key: "qty_stock",
			type: "qty",
			after: (record) => record.item_um,
			hasFilterOperator: true
		},
		{
			title: "Lot date",
			key: "date_lot",
			type: "datetz",
			sorter: false,
			width: "6%",
		},
		{
			title: "Loy",
			description: "Lot origin year",
			key: "lot_ori_year",
			type: "number",
			hasFilterOperator: true,
		},
		{
			title: "Sr",
			description: "Step roll",
			key: "step_roll",
			type: "bool",
			sorter: false,
		},
		{
			title: "E1",
			description: "Eur 1 lots",
			key: "eur1",
			type: "bool",
			sorter: false,
		},
		{
			title: "Cfg",
			description: "Configured item",
			key: "conf_item",
			type: "bool",
			sorter: false,
		},
		{
			title: "Mgr",
			description: "Merged lot",
			key: "merged_lot",
			type: "bool",
			sorter: false,
		},
		{
			title: "Ord. ref",
			description: "Order reference",
			key: "lot_ord_rif",
			dataIndex: "lot_ord_rif",
			sorter: false,
		},
	];

	return (
		<>
			<div className="page">
				<PageActions
					extra={[
						props.isModal && !props.isAssociation && (
							<Button
								key={2}
								disabled={!props.selectedData}
								icon={<IconX color="#e20004" />}
								onClick={() => {
									setLotIds([]);
									setSelected(null);
									props.onSelect(null);
								}}
							>
								Remove current selection
							</Button>
						),
						// <Button
						// 	key={0}
						// 	type="primary"
						// 	icon={<IconPlus />}
						// 	onClick={() => toggleStockPopup()}
						// >
						// 	Add new
						// </Button>,
					]}
				/>
				<div className="page-content">
					<Row>
						<Col
							span={24}
							className="mb-3"
						>
							<Datatable
								fetchData={handleTableChange}
								columns={tableColumns}
								rowKey="id_lot"
								loading={loading}
								watchStates={[reload]}
								rowSelection={
									props.selectable
										? {
												type: props.selection ?? "radio",
												fixed: true,
												preserveSelectedRowKeys: false,
												selectedRowKeys: lotIds,
												onChange: (selectedRowKeys, selectedRows) => {
													if (props.selection === "checkbox") {
														props?.onSelect(selectedRows);
														setLotIds(_.map(selectedRows, "id_lot"));
													} else {
														props?.onSelect(selectedRows[0].id_lot);
														setLotIds([selectedRows[0].id_lot]);
													}
												},
										  }
										: false
								}
							/>
						</Col>
					</Row>
				</div>
			</div>
		</>
	);
};

export default TableStocks;
