import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getAllSalesPricelist, getSalePricelist } from "@/api/sales/pricelist";
import PageActions from "@/shared/components/page-actions";
import { Col, Row, Modal, Space, Form, Input, Button, message, InputNumber  } from "antd";
import {	
	IconCopy,
	IconEye,
	IconList,
	IconPlus,
	IconTrash,
	IconX 
} from "@tabler/icons-react";
import Datatable from "@/shared/datatable/datatable";
import ModalContact from "@/shared/contacts/modal-contact";
import _ from "lodash";
import TagSelection from "@/shared/components/tag-selection";

const TableSalesPricelist = (props) => {
	const [reload, setReload] = useState(0);
	const [popupContact, setPopupContact] = useState(null);
	const [selected, setSelected] = useState(null);
	const [contactIds, setContactIds] = useState([]);
    const [data, setData] = useState([]);

	const toggleContactPopup = (record) => {
		if(record){
            setSelected(record);
        }
		setPopupContact(!popupContact);
	};

	useEffect(() => {
		if (props.selectedData) {
			setContactIds([props.selectedData]);
			setSelected(props.selectedData);
		}
	}, []);

	const handleModalSave = (value) => {
		if (value) {
			if (props.selection === "checkbox"){
				if(_.isArray(selected)){
					setSelected(_.concat(selected,[value]))
					props.onSelect(_.concat(selected,[value]))
				} else{
					setSelected([value])	
					props.onSelect([value])
				}  
			}
			else{
				setSelected(value.id)
				props.onSelect(value.id)
			}
			setContactIds([value.id])
			setReload(reload + 1)
		} else {
			setSelected(selected)
			setContactIds(contactIds)
			setReload(reload + 1)
		}
	}

	// Construct the filters and attach to params of datatable
	const handleTableChange = async (filters) => {
		const result = await getAllSalesPricelist(_.merge(filters, props.filter));
        setData(result.data?.data);
		return result.data;
	};

	// Define table columns
	const tableColumns = [
        {
            title: "Code",
            key: "code",
            dataIndex: "code"
        },
        {
            title: "Business Partner",
            key: "bp_desc",
            dataIndex: "bp_desc",
            sorter: false
        },
        {
            title: "Currency",
            key: "currency_id",
            sorter: false,
        }, 
		{
			title: "Disabled",
			key: "is_disabled",
            sorter: false,
            type: 'bool',
        },
    ];

	return (
		<>
			<div className="page">
				<PageActions
                    title={
					<TagSelection 
						selected={selected} 
						data={data} displayField="name" 
						callback={getSalePricelist}/>}
					extra={[
						props.isModal && !props.isAssociation && (
							<Button
								key={2}
								disabled={!props.selectedData}
								icon={<IconX color="#e20004" />}
								onClick={() => {
									setContactIds([]);
									setSelected(null);
									props.onSelect(null);
								}}
							>
								Remove current selection
							</Button>
						),
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
													setContactIds(_.map(selectedRows, "id"));

												} else {
													const selectedValue = selectedRows[0].id
														// selectedRows.length === 1
															// ? selectedRows[0].id
															// : selectedRowKeys;
													props?.onSelect(selectedValue);
													setContactIds([selectedValue]);

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

export default TableSalesPricelist;