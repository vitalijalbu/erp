import React, { useEffect, useState } from "react";
import { getAllMachines, getMachineById } from "@/api/machines/machines";
import PageActions from "@/shared/components/page-actions";
import { Button, Col, Row, Typography } from "antd";
import { IconPlus, IconX } from "@tabler/icons-react";
import Datatable from "@/shared/datatable/datatable";
import ModalMachine from "@/shared/machines/modal-machine";
import _ from "lodash";
import TagSelection from "@/shared/components/tag-selection";

const TableMachines = (props) => {
	const [reload, setReload] = useState(0);
	const [popupMachine, setPopupMachine] = useState(false);
	const [selected, setSelected] = useState(null);
	const [machineIds, setMachineIds] = useState([]);
	const [data, setData] = useState([]);

	const toggleMachinePopup = (record) => {
		if (record) {
			setSelected(record);
		}
		setPopupMachine(!popupMachine);
	};

	useEffect(() => {
		if (props.selectedData) {
			setMachineIds([props.selectedData]);
			setSelected(props.selectedData);
		}
	}, []);

	const handleModalSave = (value) => {
		if (value) {
			if (props.selection === "checkbox") {
				if (_.isArray(selected)) {
					setSelected(_.concat(selected, [value]));
					props.onSelect(_.concat(selected, [value]));
				} else {
					setSelected([value]);
					props.onSelect([value]);
				}
			} else {
				setSelected(value.id);
				props.onSelect(value.id);
			}
			setMachineIds([value.id]);
			setReload(reload + 1);
		} else {
			setSelected(selected);
			setMachineIds(machineIds);
			setReload(reload + 1);
		}
	};

	// Construct the filters and attach to params of datatable
	const handleTableChange = async (filters) => {
		const result = await getAllMachines(_.merge(filters, props.filter));
		setData(result.data?.data);
		return result.data;
	};

	// Define table columns
	const tableColumns = [
		{
			title: "Code",
			key: "id",
			render: (record) => record.code,
		},
		{
			title: "Description",
			key: "description",
			dataIndex: "description",
		},
		{
			title: "Workcenter",
			key: "workcenter.name",
			dataIndex: "workcenter",
		},
		{
			title: "Cost Item",
			key: "cost.item",
			dataIndex: "cost",
			render: (cost) => {
				return (
					<Typography.Text>
						{cost.item} - {cost.item_desc}
					</Typography.Text>
				);
			},
		},
		{
			title: "Men Occupation",
			key: "men_occupation",
			// dataIndex: "hourlyCost",
			// type: "currency",
		},
	];

	return (
		<>
			{popupMachine && (
				<ModalMachine
					opened={popupMachine}
					toggle={toggleMachinePopup}
					data={selected ?? null}
					reload={() => {
						setReload(reload + 1);
						//setSelected(selected);
					}}
					onSave={(value) => handleModalSave(value)}
				/>
			)}
			<div className="page">
				<PageActions
					title={
						<TagSelection
							selected={selected}
							data={data}
							displayField="code"
							callback={getMachineById}
						/>
					}
					extra={[
						props.isModal && !props.isAssociation && (
							<Button
								key={2}
								disabled={!props.selectedData}
								icon={<IconX color="#e20004" />}
								onClick={() => {
									setMachineIds([]);
									setSelected(null);
									props.onSelect(null);
								}}
							>
								Remove current selection
							</Button>
						),
						<Button
							key={0}
							type="primary"
							icon={<IconPlus />}
							onClick={() => toggleMachinePopup()}
						>
							Add new
						</Button>,
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
								rowKey="id"
								watchStates={[reload]}
								rowSelection={
									props.selectable
										? {
												type: props.selection ?? "radio",
												fixed: true,
												preserveSelectedRowKeys: false,
												selectedRowKeys: machineIds,
												onChange: (selectedRowKeys, selectedRows) => {
													if (props.selection === "checkbox") {
														console.log("selectedRows", selectedRows);
														props?.onSelect(selectedRows);
														setMachineIds(_.map(selectedRows, "id"));
													} else {
														const selectedValue = selectedRows[0].id;
														// selectedRows.length === 1
														// ? selectedRows[0].code
														// : selectedRowKeys;
														props?.onSelect(selectedValue);
														setMachineIds([selectedValue]);
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

export default TableMachines;
