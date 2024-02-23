import React, { useState, useCallback, useEffect } from "react";
import UserPermissions from "@/policy/ability";
import {
	getAllMaterialTransfer,
	confirmMaterialTransfer,
	deleteMaterialTransfer,
} from "@/api/stocks";
import { numberFormatter } from "@/hooks/formatter";
import { useValidationErrors } from "@/hooks/validation-errors";
import {
	Form,
	Row,
	Col,
	Table,
	Button,
	message,
	Tag,
	Typography,
	Modal,
} from "antd";
import WarehouseSelect from "@/shared/form-fields/warehouse-select";
import PageActions from "@/shared/components/page-actions";
import {
	IconTransferIn,
	IconAlertCircle,
	IconTrash,
} from "@tabler/icons-react";
import _ from "lodash";
const { Text } = Typography;
const { confirm } = Modal;

const Transfer = () => {
	//Set page permissions
	if (!UserPermissions.authorizePage("materials.management")) {
		return false;
	}

	const [form] = Form.useForm();
	const [submittable, setSubmittable] = React.useState(false);
	const [loading, setLoading] = useState(false);
	const [loadingAction, setLoadingAction] = useState(null);
	const [data, setData] = useState([]);
	const [totalData, setTotalData] = useState(0);
	const [reload, setReload] = useState(0);
	const validationErrorsBag = useValidationErrors();

	// Api call
	useEffect(() => {
		setLoading(true);
		getAllMaterialTransfer()
			.then(({ data }) => {
				setData(data || []);
				setTotalData(data.length || 0);
			})
			.finally(() => {
				setLoading(false);
			});
	}, [reload]);

	// Action Transfer Materials
	const handleSubmit = (values) => {
		confirm({
			title: "Confirm material transfer?",
			icon: (
				<IconAlertCircle
					color={"#faad14"}
					size='24'
					className='anticon'
				/>
			),
			transitionName: "ant-modal-slide-up",
			content: "Continue with material transfer",
			okText: "Continue",
			cancelText: "Cancel",
			onOk: async () => {
				setLoading(true);
				validationErrorsBag.clear();
				const { status, error, errorMsg, validationErrors } =
					await confirmMaterialTransfer(values);
				if (error) {
					if (validationErrors) {
						validationErrorsBag.setValidationErrors(validationErrors);
					}
					message.error(errorMsg);
					setLoading(false);
				} else {
					message.success("Material transfer successfully confirmed");
					setReload(reload + 1);
				}
			},
		});
	};

	const handleDeleteRow = async (record) => {
		confirm({
			title: "Confirm delete?",
			icon: (
				<IconAlertCircle
					color={"#faad14"}
					size='24'
					className='anticon'
				/>
			),
			transitionName: "ant-modal-slide-up",
			content: "Continue with delete",
			okText: "Continue",
			okType: "danger",
			cancelText: "Cancel",
			async onOk() {
				setLoadingAction(record.IDtrans);
				const { data, error, validationErrors } = await deleteMaterialTransfer(record.IDtrans);
				if (error || validationErrors) {
					message.error(error.response.data.message);
					setLoading(false);
					setLoadingAction(false);
				} else {
					message.success(`Lot ${record?.IDlot} successfully deleted`);
					// Reload all
					setReload(reload + 1);
				}
				setLoadingAction(null);
			},
		});
	};

	const tableColumns = [
		{
			title: "Lot",
			key: "IDlot",
			render: ({ IDlot }) => <Text>{IDlot ?? "Lot not found"} </Text>,
		},
		{
			title: "Step Roll",
			key: "stepRoll",
			render: ({ stepRoll }) => (
				<Tag color={stepRoll === "1" ? "green" : null}>
					{stepRoll === "1" ? "Yes" : "No"}
				</Tag>
			),
		},
		{
			title: "Item",
			key: "item",
			render: ({ item }) => <Text>{item}</Text>,
		},
		{
			title: "Description",
			key: "item_desc",
			dataIndex: "item_desc",
		},
		{
			title: "Qty",
			key: "qty",
			align: "right",
			render: (record) => <Text>{numberFormatter(record.qty)} {record.um}</Text>,
		},
		{
			title: "Dimensions",
			key: "dim",
			dataIndex: "dim",
		},
		{
			title: "Warehouse",
			key: "whdesc",
			render: ({ whdesc }) => <Tag>{whdesc} </Tag>,
		},
		{
			title: "Warehouse location",
			key: "lcdesc",
			render: ({ lcdesc }) => <Tag>{lcdesc} </Tag>,
		},
		{
			title: "Actions",
			key: "actions",
			align: "right",
			dataIndex: "actions",
			render: (text, record) => (
				<Button
					type='text'
					onClick={() => handleDeleteRow(record)}
					danger
					icon={<IconTrash />}
					loading={loadingAction === record.IDtrans}
				/>
			),
		},
	];
	return (
		<div className='page'>
			<PageActions
				title='Transfer plan'
				subTitle={`${totalData} results found`}
			>
				<div className='page-subhead_root'>
					<Form
						layout='inline'
						form={form}
						onFinish={handleSubmit}
						disabled={data <= 0}
					>
						<WarehouseSelect
							onChange={form.setFieldsValue}
							validationErrors={validationErrorsBag}
						/>
						<Form.Item>
							<Button
								type='primary'
								htmlType='submit'
								loading={loading}
								icon={<IconTransferIn />}
								disabled={data <= 0}
							>
								Confirm material transfer
							</Button>
						</Form.Item>
					</Form>
				</div>
			</PageActions>
			<div className='page-content'>
				<Row>
					<Col span={24}>
						<Table
							columns={tableColumns}
							dataSource={data}
							loading={loading}
							rowKey='IDtrans'
							pagination={{
								hideOnSinglePage: true,
								pageSize: 100,
								position: ["bottomCenter"],
							}}
						/>
					</Col>
				</Row>
			</div>
		</div>
	);
};

export default Transfer;
