import React, { useState, useEffect } from "react";
import _ from "lodash";
import Link from "next/link";
import { getAllBP, getAllBPSupplier, getBPById } from "@/api/bp";
import PageActions from "@/shared/components/page-actions";
import { Button, Col, Row, Space } from "antd";
import { IconEye, IconPencilMinus, IconPlus, IconX } from "@tabler/icons-react";
import Datatable from "@/shared/datatable/datatable";
import ModalBp from "@/shared/business-partners/modal-bp";
import TagSelection from "@/shared/components/tag-selection";

const TableBP = (props) => {
	const [loading, setLoading] = useState(false);
	const [reload, setReload] = useState(0);
	const [popup, setPopupBP] = useState(false);
	const [selected, setSelected] = useState(props?.selectedData);
	const [bpIds, setBpIds] = useState([]);
	const [row, setRow] = useState(null);
	const [data, setData] = useState([]);

	const togglePopup = (record) => {
		if (record) {
			setSelected(record);
		}
		setPopupBP(!popup);
	};

	const removeSelection = async () => {
		setBpIds([]);
		setSelected(null);
		props?.onSelect(null);
		// props?.onTableRemove();
	};

	useEffect(() => {
		if (props.selectedData) {
			setBpIds([props.selectedData]);
			handleBpById(selected);
		}
	}, []);

	// Get BP by ID
	const handleBpById = async (id) => {
		const result = await getBPById(id);
		setRow(result.data);
		return result.data;
	};

	const handleModalSave = (value) => {
		setSelected(value?.id);

		// Update bpIds based on the condition
		setBpIds(value ? [value.id] : bpIds);

		// Trigger a reload by incrementing reload state
		setReload(reload + 1);
	};

	// Construct the filters and attach to params of datatable
	const handleTableChange = async (filters) => {
		try {
			const result = await getAllBPSupplier(_.merge(props.filter, filters));

			setLoading(false);
			setData(result.data?.data);
			return result.data;
		} catch (error) {
			console.error("Error handling table change:", error);
			return [];
		}
	};

	const tableColumns = [
		{
			title: "Business Partner",
			key: "desc",
			dataIndex: "desc",
			width: "20%",
		},

		{
			title: "Customer",
			key: "customer",
			type: "bool",
			sorter: false,
		},
		{
			title: "Carrier",
			key: "is_carrier",
			type: "bool",
			sorter: false,
		},
		{
			title: "Active",
			key: "is_active",
			type: "bool",
			sorter: false,
		},
		{
			title: "Address",
			key: "address",
			sorter: false,
		},
		{
			title: "VAT",
			key: "vat",
			sorter: false,
		},
		{
			title: "Tot. destinations",
			key: "bp_destinations_count",
			sorter: false,
		},
		props?.hasActions && {
			title: "Actions",
			key: "actions",
			align: "right",
			className: "table-actions",
			render: (record) => (
				<Space.Compact>
					<Link
						key={0}
						href={`/business-partners/${record.id}`}
						target='_blank'
					>
						<Button icon={<IconEye />}>Show</Button>
					</Link>
					<Button
						icon={<IconPencilMinus />}
						onClick={() => togglePopup(record)}
					>
						Edit
					</Button>
				</Space.Compact>
			),
		},
	];

	return (
		<>
			{popup && (
				<ModalBp
					opened={popup}
					toggle={togglePopup}
					dataParent={selected || null}
					//isCreate={true}
					reloadParent={() => {
						setReload(reload + 1);
						//setSelected(selected)
					}}
					onSave={(value) => handleModalSave(value)}
				/>
			)}
			<div className='page'>
				<PageActions
					title={
						<TagSelection
							selected={selected}
							data={data}
							displayField='desc'
							callback={getBPById}
						/>
					}
					extra={[
						props.isModal ? (
							<Button
								key={2}
								disabled={!props.selectedData}
								icon={<IconX color='#e20004' />}
								onClick={removeSelection}
							>
								Remove current selection
							</Button>
						) : null,
						props.isModal ? (
							<Button
								type='primary'
								icon={<IconPlus />}
								onClick={() => togglePopup()}
							>
								Add new
							</Button>
						) : (
							<Link
								target='_blank'
								href='/business-partners/create'
								key='1'
							>
								<Button
									type='primary'
									icon={<IconPlus />}
								>
									Add new
								</Button>
							</Link>
						),
					]}
				/>

				<div className='page-content'>
					<Row>
						<Col
							span={24}
							className='mb-3'
						>
							<Datatable
								fetchData={handleTableChange}
								columns={tableColumns}
								rowKey={"id"}
								watchStates={[reload]}
								rowSelection={
									props.selectable
										? {
												type: props.selection ?? "radio",
												fixed: true,
												preserveSelectedRowKeys: false,
												selectedRowKeys: bpIds,
												onChange: (selectedRowKeys, selectedRows) => {
													if (props.selection === "checkbox") {
														props?.onSelect(selectedRows);
														setBpIds(_.map(selectedRows, "id"));
														setRow(null);
														setSelected(selectedRows);
													} else {
														const selectedValue = selectedRows[0].id;
														// selectedRows.length === 1
														// ? selectedRows[0].id
														// : selectedRowKeys;
														props?.onSelect(selectedValue);
														setBpIds([selectedValue]);
														setRow(null);
														setSelected(selectedValue);
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

export default TableBP;
