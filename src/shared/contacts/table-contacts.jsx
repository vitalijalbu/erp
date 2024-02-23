import React, { useEffect, useState } from "react";
import { getAllContacts, getContactById } from "@/api/contacts";
import PageActions from "@/shared/components/page-actions";
import { Button, Col, Row, Space, Tag } from "antd";
import { IconPencilMinus, IconPlus, IconX } from "@tabler/icons-react";
import Datatable from "@/shared/datatable/datatable";
import ModalContact from "@/shared/contacts/modal-contact";
import _ from "lodash";
import TagSelection from "@/shared/components/tag-selection";

const TableContacts = (props) => {
	const [reload, setReload] = useState(0);
	const [popupContact, setPopupContact] = useState(false);
	const [selected, setSelected] = useState(null);
	const [row, setRow] = useState(null);
	const [contactIds, setContactIds] = useState([]);
    const [data, setData] = useState([]);

	// Toggle Modal
	const toggleContactPopup = (record) => {
		if(record){
			setRow(record);
        }
		console.log('selected-row', row);
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
		const result = await getAllContacts(_.merge(filters, props.filter));
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
			title: "Type",
			key: "type",
			sorter: false,
			render: ({ type }) => <Tag color={type != "person" ? "blue" : "orange"}>{type}</Tag>,
			filterOptions: [
				{ label: "Person", value: "person" },
				{ label: "Business", value: "business" },
			],
		},
		{
			title: "Qualification",
			key: "qualification",
			sorter: false,
		},
		{
			title: "Department",
			key: "department",
			sorter: false,
		},
		{
			title: "Address",
			key: "full_address",
			sorter: false,
			render: (record) => <span>{record.full_address?.join(", ")}</span>,
		},
		{
			title: "Phone",
			key: "mobile_phone",
			sorter: false,
		},
		{
			title: "Office Phone",
			key: "office_phone",
			sorter: false,
		},
		{
			title: "E-mail",
			key: "email",
			sorter: false,
			render: ({ email }) => email && <Tag>{email}</Tag>,
		},
		{
			title: "Language",
			key: "language",
			sorter: false,
			width: "5%",
			render: ({ language }) => <Tag>{language.toUpperCase()}</Tag>,
		},
		{
            title: "Actions",
            key: "actions",
            align: "right",
            className: "table-actions",
            render: (record) => (
                <Space.Compact>
                    <Button icon={<IconPencilMinus />} onClick={() => toggleContactPopup(record)}>Edit</Button>
                </Space.Compact>
            )
        },
	];

	return (
		<>
			{popupContact && (
				<ModalContact
					opened={popupContact}
					toggle={toggleContactPopup}
					data={row ?? null}
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
						data={data} displayField="name" 
						callback={getContactById}
						canEdit={true}
						onEdit={() => toggleContactPopup()}/>}
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
						<Button
							key={0}
							type="primary"
							icon={<IconPlus />}
							onClick={() => toggleContactPopup()}
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
													//console.log(selectedRows)
													setRow(selectedRows[0]) // important for update button tagselection
													props?.onSelect(selectedRows);
													setContactIds(_.map(selectedRows, "id"));

												} else {
													const selectedValue = selectedRows[0].id
														// selectedRows.length === 1
															// ? selectedRows[0].id
															// : selectedRowKeys;
													setRow(selectedRows[0]) // important for update button tagselection
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

export default TableContacts;