import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import {
	Card,
	Button,
	Space,
	Form,
	Modal,
	message,
	Row,
	Col,
	Input,
	DatePicker,
	InputNumber,
	Tag,
	Dropdown,
	Select,
	Typography,
} from "antd";
const { confirm } = Modal;
const { Text } = Typography;
import _ from "lodash";
import {
	IconDots,
	IconPlayerPause,
	IconPlayerPlay,
	IconPlus,
	IconTrash,
	IconX,
} from "@tabler/icons-react";
import {
	getAllRows,
	deleteRow,
	addRow,
	toggleRow,
} from "@/api/sales/discount-matrix";
import Datatable from "@/shared/datatable/datatable";
import { useValidationErrors } from "@/hooks/validation-errors";
import SelectItemGroup from "@/shared/form-fields/items/select-item-group";
import SelectItemSubGroup from "@/shared/form-fields/items/select-item-subgroup";
import SelectCostItem from "@/shared/form-fields/select-cost-item";
import { parseYesNo } from "@/hooks/formatter";
import PriceInput from "@/shared/form-fields/price-input";

const TableRows = (props) => {
	const router = useRouter();
	const { id } = router.query;
	const [form] = Form.useForm();
	const hasItem = Form.useWatch("item_id", form) !== undefined;
	const hasItemGroup = Form.useWatch("item_group_id", form) !== undefined;
	const hasItemFamily = Form.useWatch("item_subfamily_id", form) !== undefined;

	// Disable and reset other fields when one field has a value
	const handleFieldValueChange = (changedFields) => {
		const fieldNames = Object.keys(changedFields);
		const otherFields = [
			"item_id",
			"item_group_id",
			"item_subfamily_id",
		].filter((field) => !fieldNames.includes(field));

		// Disable and reset other fields if one field has a value
		if (fieldNames.length === 1 && changedFields[fieldNames[0]] !== undefined) {
			form.setFieldsValue({
				[otherFields[0]]: undefined,
				[otherFields[1]]: undefined,
			});
		}
	};

	const validationErrorsBag = useValidationErrors();

	const [loading, setLoading] = useState(false);
	const [reload, setReload] = useState(0);
	const [loadingAction, setLoadingAction] = useState(null);
	const [selected, setSelected] = useState(null);
	const [isFormChanged, setIsFormChanged] = useState(false);

	const handleTableChange = async (params) => {
		// Define static filters
		const staticFilters = {
			columns: {
				is_disabled: {
					search: { value: 0 },
				},
			},
		};

		const result = await getAllRows(id, params);
		// Use lodash's maxBy to get the object with the greatest 'position'
		const higherIdObject = _.maxBy(result.data?.data, "position");
		// Extract the 'position' value directly
		const higherOrder = higherIdObject ? parseInt(higherIdObject.position) : 0;
		form.setFieldValue("position", higherOrder + 1);

		return result.data;
	};

	const items = [
		{
			key: "1",
			icon: <IconTrash color='#e20004' />,
			label: (
				<a
					key={1}
					onClick={() => handleDelete(selected)}
				>
					Remove
				</a>
			),
		},
	];

	// Delete action
	const handleDelete = async (idRow) => {
		
		confirm({
			title: "Confirm Deletion",
			transitionName: "ant-modal-slide-up",
			content: "Are you sure you want to delete this row?",
			okText: "Delete",
			okType: "danger",
			cancelText: "Cancel",
			async onOk() {
				try {
					setLoadingAction(true);
					const { data, error } = await deleteRow(id, idRow);
					if (error) {
						message.error("Error deleting the Row");
					} else {
						message.success("Row deleted successfully");
						setReload(reload + 1);
					}
				} catch (error) {
					console.log(error);
					message.error("An error occurred while deleting the row");
				}
				setLoadingAction(null);
			},
		});
	};

	//Update form
	const handleSubmit = async (values) => {
		setLoading(true);
		validationErrorsBag.setValidationErrors({});
		var { status, error, validationErrors } = await addRow(id, values);
		if (error) {
			if (validationErrors) {
				validationErrorsBag.setValidationErrors(validationErrors);
			}
			message.error("Error during saving operation");
		} else {
			message.success("Changes saved succesfully");
			setReload(reload + 1);
			form.resetFields();
		}
		setLoading(false);
	};

	//Update form
	const toggleStateRow = async (idRow, isDisabled) => {
		setLoadingAction(idRow);
		validationErrorsBag.setValidationErrors({});
		var { status, error, validationErrors } = await toggleRow(id, idRow, {
			disable: !isDisabled,
		});
		if (error) {
			if (validationErrors) {
				validationErrorsBag.setValidationErrors(validationErrors);
			}
			message.error("Error during saving operation");
		} else {
			message.success("Changes saved succesfully");
			setReload(reload + 1);
		}
		setLoadingAction(null);
	};

	// Table columns
	const tableColumns = [
		{
			title: "Position",
			key: "position",
			width: 50,
			dataIndex: "position",
		},
		{
			title: "Item",
			key: "item_item",
			render: (record) =>
				record.item_item && `${record.item_item} - ${record.item_desc}`,
		},
		{
			title: "Product type",
			key: "group_desc",
			render: (record) =>
				record.item_group && `${record.item_group} - ${record.group_desc}`,
		},
		{
			title: "Item group",
			key: "item_subfamily_description",
			render: (record) =>
				record.item_subfamily_code &&
				`${record.item_subfamily_code} - ${record.item_subfamily_description}`,
		},
		{
			title: "Qty (from)",
			key: "quantity",
			dataIndex: "quantity",
		},	
		{
			title: "Value",
			key: "value",
			dataIndex: "value",
		},
		{
			title: "Date from",
			key: "date_from",
			dataIndex: "date_from",
			type: "date",
		},
		{
			title: "Date to",
			key: "date_to",
			dataIndex: "date_to",
			type: "date",
		},
		{
			title: "Note",
			key: "note",
			dataIndex: "note",
		},
		{
			title: "Disabled",
			key: "is_disabled",
			sorter: false,
			type: "bool",
			render: (record) => (
				<Tag color={record.is_disabled ? "red" : "green"}>
					{parseYesNo(record.is_disabled)}
				</Tag>
			),
		},
		{
			title: "Actions",
			key: "actions",
			align: "right",
			className: "table-actions",
			render: (record) => (
				<Space.Compact>
					<Button
						key={0}
						icon={
							record.is_disabled ? (
								<IconPlayerPlay color='#33855c' />
							) : (
								<IconPlayerPause color='#333' />
							)
						}
						onClick={() => toggleStateRow(record.id, record.is_disabled)}
						loading={loadingAction === record.id}
					>
						{record.is_disabled ? "Enable" : "Disable"}
					</Button>
					<Dropdown
						menu={{ items }}
						trigger={"click"}
						placement='bottomRight'
						arrow
					>
						<Button
							icon={<IconDots />}
							onClick={() => {
								setSelected(record.id);
							}}
						/>
					</Dropdown>
				</Space.Compact>
			),
		},
	];

	return (
		<Row>
			<Col
				span={24}
				className="mb-3"
			>
				<Card
					title="All item rows"
					loading={props.loading}
				>
					<Datatable
						fetchData={handleTableChange}
						columns={tableColumns}
						rowKey={(record) => record.id}
						watchStates={[reload]}
					/>
				</Card>
			</Col>
			<Col span={24}>
				<Card
					title="Add new row"
					loading={loading}
				>
					<Form
						layout="vertical"
						form={form}
						onFinish={handleSubmit}
						name="form-row"
						onValuesChange={handleFieldValueChange && setIsFormChanged}
					>
						<Row gutter={16}>
							<Col span={6}>
								<Form.Item
									label="Position"
									name="position"
									{...validationErrorsBag.getInputErrors("position")}
								>
									<InputNumber min={0} />
								</Form.Item>
							</Col>
							<Col span={6}>
								<Form.Item
									label="Item"
									name="item_id"
									{...validationErrorsBag.getInputErrors("item_id")}
								>
									<SelectCostItem
										withShared={false}
										type={null}
										disabled={hasItemFamily || hasItemGroup}
									/>
								</Form.Item>
							</Col>
							<Col span={6}>
								<Form.Item
									label="Product type"
									name="item_group_id"
									{...validationErrorsBag.getInputErrors("item_group_id")}
								>
									<SelectItemGroup disabled={hasItem || hasItemFamily} />
								</Form.Item>
							</Col>
							<Col span={6}>
								<Form.Item
									label="Item group"
									name="item_subfamily_id"
									{...validationErrorsBag.getInputErrors("item_subfamily_id")}
								>
									<SelectItemSubGroup disabled={hasItem || hasItemGroup} />
								</Form.Item>
							</Col>
							<Col span={6}>
								<Form.Item
									label="Quantity"
									name="quantity"
									{...validationErrorsBag.getInputErrors("quantity")}
								>
									<InputNumber
										placeholder="0"
										min={0}
									/>
								</Form.Item>
							</Col>
							<Col span={6}>
								<Form.Item
									label="Value"
									name="value"
									{...validationErrorsBag.getInputErrors("value")}
								>
									<PriceInput
										currency={"%"}
										currencyOptions={[{ id: "%", symbol: "%" }]}
										noDefaultValue
										showSymbolSelection
									/>
								</Form.Item>
							</Col>
							<Col span={6}>
								<Form.Item
									label="Date from"
									name="date_from"
									{...validationErrorsBag.getInputErrors("date_from")}
								>
									<DatePicker />
								</Form.Item>
							</Col>
							<Col span={6}>
								<Form.Item
									label="Date to"
									name="date_to"
									{...validationErrorsBag.getInputErrors("date_to")}
								>
									<DatePicker />
								</Form.Item>
							</Col>

							<Col span={12}>
								<Form.Item
									label="Note"
									name="note"
									{...validationErrorsBag.getInputErrors("note")}
								>
									<Input />
								</Form.Item>
							</Col>
						</Row>
						<Button
							disabled={!isFormChanged}
							loading={loading}
							type="primary"
							icon={<IconPlus />}
							htmlType="submit"
							form="form-row"
						>
							Add new Row
						</Button>
					</Form>
				</Card>
			</Col>
		</Row>
	);
};

export default TableRows;
