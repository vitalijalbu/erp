import React, { useEffect, useState } from "react";
import { getAllWorkcenters, getWorkcenterById } from "@/api/workcenters";
import PageActions from "@/shared/components/page-actions";
import {
    Space,
    Row,
    Col,
    Modal,
    message,
    Button,
} from "antd";
const { confirm } = Modal;
import { IconPencilMinus, IconPlus, IconTrash } from "@tabler/icons-react";
import Datatable from "@/shared/datatable/datatable";

import _ from "lodash";
import TagSelection from "@/shared/components/tag-selection";
import { IconX } from "@tabler/icons-react";
import ModalWorkcenter from "./modal-workcenter";

const TableWorkcenters = (props) => {
	const [reload, setReload] = useState(0);
	const [popupWorkcenter, setPopupWorkcenter] = useState(null);
	const [selected, setSelected] = useState(null);
	const [contactIds, setWorkcenterIds] = useState([]);
    const [data, setData] = useState([]);

	const toggleWorkcenterPopup = (record) => {
		if(record){
            setSelected(record);
        }
		setPopupWorkcenter(!popupWorkcenter);
	};

	useEffect(() => {
		if (props.selectedData) {
			setWorkcenterIds([props.selectedData]);
			setSelected(props.selectedData);
		}
	}, []);

      // Delete action
	  const handleDeleteRow = async (id) => {
        confirm({
        title: "Confirm Deletion",
        transitionName: "ant-modal-slide-up",
        content: "Are you sure you want to delete this workcenter?",
        okText: "Delete",
        okType: "danger",
        cancelText: "Cancel",
        async onOk() {
            try {
                setLoadingAction(id);
                const { data, error } = await deleteWorkcenter(id);
                if (error) {
                    message.error("Error deleting the workcenter");
                } else {
                    message.success("Workcenter deleted successfully");
                    setReload(reload + 1);
                }
                } catch (error) {
                message.error("An error occurred while deleting the workcenter");
                }
                setLoadingAction(null);
        },
        });
    };

	// Construct the filters and attach to params of datatable
	const handleTableChange = async (filters) => {
		const result = await getAllWorkcenters(_.merge(filters, props.filter));
        setData(result.data?.data);
		return result.data;
	};

	// Define table columns
	const tableColumns = [
		{
			title: "Name",
			key: "name",
			dataIndex: "name"
		},
		{
            title: "Actions",
            key: "actions",
            align: "right",
            className: "table-actions",
            render: (record) => (
                <Space.Compact>
                <Button icon={<IconPencilMinus />} onClick={() => toggleWorkcenterPopup(record)}>Edit</Button>
                <Button
                  icon={<IconTrash />}
                  danger
                  onClick={() => handleDeleteRow(record.id)}
                />
              </Space.Compact>
            )
        }
	];

	return (
		<>
			{popupWorkcenter && (
				 <ModalWorkcenter
					opened={popupWorkcenter}
					toggle={toggleWorkcenterPopup}
					data={selected ?? null}
					reload={() => setReload(reload + 1)}
				/>
			)}
			<div className="page">
				<PageActions
                    title={
					<TagSelection 
						selected={selected} 
						data={data} displayField="name" 
						callback={getWorkcenterById}/>}
					extra={[
						props.isModal && !props.isAssociation && (
							<Button
								key={2}
								disabled={!props.selectedData}
								icon={<IconX color="#e20004" />}
								onClick={() => {
									setWorkcenterIds([]);
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
							onClick={() => toggleWorkcenterPopup()}
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
											selectedRowKeys: contactIds,
											onChange: (selectedRowKeys, selectedRows) => {
												if (props.selection === "checkbox") {
													console.log(selectedRows)
													props?.onSelect(selectedRows);
													setWorkcenterIds(_.map(selectedRows, "id"));

												} else {
													const selectedValue = selectedRows[0].id
														// selectedRows.length === 1
															// ? selectedRows[0].id
															// : selectedRowKeys;
													props?.onSelect(selectedValue);
													setWorkcenterIds([selectedValue]);

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

export default TableWorkcenters;