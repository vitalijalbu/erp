import React, { useState, useEffect } from "react";
import Datatable from "../../datatable/datatable";
import _ from "lodash";
import { Button, Modal, Tag } from "antd";
import { IconCheckbox, IconPlus, IconX } from "@tabler/icons-react";
import ModalFeature from "./modal-feature";
import { getAllFeatures } from "@/api/configurator/features";
import PageActions from "@/shared/components/page-actions";
import TagSelection from "@/shared/components/tag-selection";

const ModalFeatureTable = ({
	opened,
	toggle,
	onSelect,
	filter,
	disabled,
	selectable,
	selectedData,
}) => {
	const [loading, setLoading] = useState(false);
	const [selected, setSelected] = useState(null);
	const [editRecord, setEditRecord] = useState(null);
	const [staticData, setStaticData] = useState([]);
	const [reload, setReload] = useState(0);
	const [popupFeature, setPopupFeature] = useState(false);
	const [featureId, setFeatureId] = useState(null);

	const toggleFeaturePopup = (record = null) => {
		setEditRecord(record);
		setPopupFeature(!popupFeature);
	};

	useEffect(() => {
		if (selectedData) {
			setFeatureId(selectedData);
			setSelected(selectedData);
		}
	}, []);

	const handleTableChange = async (filters) => {
		setLoading(true);
		const response = await getAllFeatures(filters);
		setLoading(false);
		setStaticData(response.data.data);
		return response.data;
	};

	const handleSelection = () => {
		onSelect(selected);
		toggle();
	};

	const handleModalSave = (value) => {
		if (value) {
			setSelected(value.id);
			setFeatureId(value.id);
			// setReload(reload + 1);
		}
		// else {
		//   setSelected(selected);
		//   setFeatureId(selected)
		//   setReload(reload + 1);
		// }
	};

	const isItemDisabled = (recordId) => {
		return disabled.includes(recordId);
	};

	const getDisabledClass = (recordId) => {
		return isItemDisabled(recordId) ? "text-muted" : null;
	};

	// valutare se passarle dall esterno
	const columns = [
		{
			title: "ID",
			key: "id",
			sorter: false,
			filterable: false,
			// render: ({ id }) => <span className={disabled.includes(id) ? "text-muted" : null}>{id}</span>,
			render: ({ id }) => <span className={getDisabledClass(id)}>{id}</span>,
		},
		{
			title: "Label",
			key: "label",
			sorter: false,
			// render: ({ label, record }) => <Tag className={disabled.includes(record?.id) ? "text-muted" : null}>{label}</Tag>,
			render: ({ label }, record) => (
				<Tag className={getDisabledClass(record?.id)}>{label}</Tag>
			),
		},
		{
			title: "Feature type",
			key: "feature_type",
			dataIndex: ["feature_type"],
			filterable: false,
			sorter: false,
			render: (feature_type, record) => (
				<Tag
					color={isItemDisabled(record?.id) ? "" : "blue"}
					className={getDisabledClass(record?.id)}
				>
					{`${feature_type.id} - ${feature_type.label}`}
				</Tag>
			),
		},
	];

	return (
		<Modal
			open={opened}
			onCancel={()=>toggle()}
			width={"60%"}
			title="Features"
			centered
			maskClosable={false}
			className="modal-fullscreen"
			transitionName="ant-modal-slide-up"
			footer={[
				<Button
					key={0}
					onClick={()=>toggle()}
				>
					Close
				</Button>,
				<Button
					key={1}
					type="primary"
					// htmlType="submit"
					icon={<IconCheckbox />}
					onClick={() => handleSelection()}
				>
					Select
				</Button>,
			]}
		>
			{popupFeature && (
				<ModalFeature
					opened={popupFeature}
					toggle={toggleFeaturePopup}
					data={editRecord}
					reload={() => {
						setReload(reload + 1);
						// setSelected(selected);
					}}
					onSave={(value) => handleModalSave(value)}
				/>
			)}

			<PageActions
				title="Select Feature"
				subTitle={
					<TagSelection
						staticKey={true}
						data={staticData}
						selected={featureId && { id: featureId, name: featureId }}
            			displayField="name"
					/>
				}
				extra={[
					<Button
						icon={<IconX color="#e20004" />}
						disabled={!selected}
						onClick={() => {
							setFeatureId(null);
							setSelected(null);
						}}
					>
						Remove current selection
					</Button>,
					<Button
						type="primary"
						key={2}
						icon={<IconPlus />}
						onClick={() => toggleFeaturePopup()}
					>
						Add feature
					</Button>,
				]}
			/>

			<Datatable
				fetchData={handleTableChange}
				rowKey="id"
				columns={columns}
				loading={loading}
				watchStates={[reload]}
				rowSelection={
					selectable
						? {
								type: "radio",
								selectedRowKeys: [featureId],
								getCheckboxProps: (record) => ({
									disabled: isItemDisabled(record.id),
									id: record.id,
								}),
								onChange: (selectedRowKeys, selectedRows) => {
									setFeatureId(selectedRows[0].id);
									setSelected(selectedRows[0].id);
								},
						  }
						: false
				}
			/>
		</Modal>
	);
};

export default ModalFeatureTable;
