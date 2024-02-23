import React, { useState, useEffect } from "react";
import {
	getAllFunctions,
	getAllFunctionCategories,
	getFunctionById,
} from "@/api/configurator/functions";
import {
	Space,
	Radio,
	Avatar,
	Button,
	Row,
	Col,
	Typography,
	Table,
	Tag,
	Divider,
	Form,
	Modal,
	Input,
	message,
} from "antd";
import {
	IconCheckbox,
	IconArrowLeft,
	IconTriangleSquareCircle,
	IconArrowRight,
	IconCategory,
	IconSearch,
	IconPlus,
	IconPencilMinus,
} from "@tabler/icons-react";
import ModalFunction from "../configurator/functions/modal-function";

const { Text, Title } = Typography;

const SelectFunction = ({ opened, toggle, setFunction, func }) => {
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);
	const [categories, setCategories] = useState([]);
	const [functions, setFunctions] = useState([]);
	const [selectedCategory, setSelectedCategory] = useState(null);
	const [selectedFunction, setSelectedFunction] = useState(null);
	const [searchValue, setSearchValue] = useState("");

	const handleCategoryClick = (category) => {
		// Handle category selection
		setSelectedCategory(category);
		setSelectedFunction(null);
		// fetchFunctions(category)
	};
	useEffect(() => {
		setSelectedCategory({ id: null });
		setSelectedFunction(func);
	}, []);

	const fetchFunction = (id) => {
		// Handle function selection
		// setSelectedFunction(func[0])
		getFunctionById(id)
		  .then(({ data }) => setSelectedFunction(data))
		  .catch((e) => message.error("Failed Select function"));
	  };

	const emitValue = () => {
		// Emit selected function
		setFunction(selectedFunction);
		toggle();
	};

	return (
		<Modal
			open={opened}
			onCancel={toggle}
			width={"60%"}
			title="Select a function"
			centered
			maskClosable={false}
			focusTriggerAfterClose={false}
			transitionName="ant-modal-slide-up"
			footer={[
				<Button
					key={0}
					onClick={toggle}
				>
					Close
				</Button>,
				<Button
					type="primary"
					key={1}
					icon={<IconCheckbox />}
					onClick={emitValue}
					disabled={!selectedFunction}
				>
					Select
				</Button>,
			]}
		>
			<Row gutter={16}>
				<Col span={6}>
					<TabViewCategories
						loading={loading}
						onCategoryClick={handleCategoryClick}
					/>
				</Col>
				<Col span={18}>
					{selectedCategory && (
						<TabViewFunctions
							category={selectedCategory}
							loading={loading}
							onFunctionClick={(value) => fetchFunction(value?.id)}
							func={func}
						/>
					)}
				</Col>
			</Row>
		</Modal>
	);
};

const TabViewCategories = ({ onCategoryClick }) => {
	const [categories, setCategories] = useState([]);
	const [loading, setLoading] = useState(false);
	const filterEmptyChildren = (data) => {
		return data.map((item) => {
			const { children, ...rest } = item;
			if (children && children.length > 0) {
				rest.children = filterEmptyChildren(children);
			}
			return rest;
		});
	};

	useEffect(() => {
		// Fetch all function categories
		setLoading(true);
		getAllFunctionCategories()
			.then(({ data, error }) => {
				if (!error) {
					setCategories(filterEmptyChildren(data));
				} else {
					message.error("An error occurred while fetching categories");
				}
			})
			.finally(() => {
				setLoading(false);
			});
	}, []);

	// Define table columns
	const tableColumns = [
		{
			title: "Name",
			key: "name",
			render: (record) => (
				<Button
					type="text"
					onClick={() => onCategoryClick(record)}
				>
					{record.name}
				</Button>
			),
		},
	];

	return (
		<div className="tab-custom">
			<Row>
				<Col>
					<Title
						level={5}
						className="pb-1"
					>
						Categories
					</Title>
					<Input
						allowClear
						placeholder="Search Category"
						onChange={(e) => setSearchValue(e.target.value)}
						prefix={
							<IconSearch
								size="16"
								color="#ccc"
							/>
						}
					/>
				</Col>
			</Row>
			<Table
				columns={tableColumns}
				expandable={{
					rowExpandable: (record) => record.children && record.children.length > 0,
					childrenColumnName: "children",
				}}
				dataSource={[...categories, { id: null, name: "All categories" }]}
				showHeader={false}
				loading={loading}
				rowKey="id"
				pagination={{ hideOnSinglePage: true }}
			/>
		</div>
	);
};

const TabViewFunctions = ({ category, onFunctionClick, func }) => {
	const [functions, setFunctions] = useState([]);
	const [loading, setLoading] = useState(false);
	const [reload, setReload] = useState(0);
	const [localFunc, setlocalFunc] = useState(null);
	const [labelFilter, setLabelFilter] = useState("");
	const [descriptionFilter, setDescriptionFilter] = useState("");
	const [modalPopUp, setModalPopUp] = useState(false);
	const [editRow, setEditRow] = useState(null);

	useEffect(() => {
		setlocalFunc(func);
	}, [func]);

	const handleSelection = (value) => {
		setlocalFunc(value.id);
		onFunctionClick(value);
    // setReload(reload +1)
	};

	const toggleModalPopup = (row = null) => {
		setEditRow(row);
		setModalPopUp(!modalPopUp);
	};

	useEffect(() => {
		// Fetch functions for the selected category
		setLoading(true);
		if (category) {
			const filter = {
				columns: {
					custom_function_category: {
						search: {
							value: category.id,
						},
					},
					label: {
						search: {
							value: labelFilter,
						},
					},
					description: {
						search: {
							value: descriptionFilter,
						},
					},
				},
			};

			getAllFunctions(filter)
				.then(({ data, error }) => {
					if (!error) {
						setFunctions(data?.data || []);
					} else {
						message.error("An error occurred while fetching functions");
					}
				})
				.finally(() => {
					setLoading(false);
				});
		}
	}, [category, labelFilter, descriptionFilter, reload]);

	// Define table columns
	const tableColumns = [
		{
			title: "Name",
			sorter: false,
			key: "label",
			dataIndex: "label",
			render: (label, record) => (
				<div>
					<a
						href={"#"}
						onClick={() => handleSelection(record)}
					>
						{record.label} - <span className="text-muted">{record.id}</span>
					</a>
					{/* <div className="text-xsmall text-muted">{record.id}</div> */}
				</div>
			),
		},
		{
			title: "Description",
			key: "description",
			dataIndex: "description",
			sorter: false,
		},
		{
			title: "Actions",
			key: "actions",
			align: "right",
			className: "table-actions",
			sorter: false,
			render: (record) => (
				<Button
					icon={<IconPencilMinus />}
					onClick={() => toggleModalPopup(record)}
				>
					Edit
				</Button>
			),
		},
	];

	return (
		<div className="tab-custom">
			{modalPopUp && (
				<ModalFunction
					data={editRow}
					opened={modalPopUp}
					toggle={toggleModalPopup}
					reload={() => setReload(reload + 1)}
					onCreated={(val) => handleSelection(val)}
				/>
			)}
			<div className="pb-1">
				<Row gutter={16}>
					<Col span={20}>
						<Title level={5}>Functions</Title>
					</Col>
					<Col span={2}>
						<Button
							icon={<IconPlus />}
							type="primary"
							onClick={() => toggleModalPopup()}
						>
							Add New
						</Button>
					</Col>
				</Row>
			</div>
			<Row gutter={16}>
				<Col span={12}>
					<Input
						allowClear
						placeholder="Search by label"
						value={labelFilter}
						onChange={(e) => setLabelFilter(e.target.value)}
						prefix={
							<IconSearch
								size={16}
								color="#ccc"
							/>
						}
						disabled={!category}
					/>
				</Col>
				<Col span={12}>
					<Input
						allowClear
						placeholder="Search by description"
						value={descriptionFilter}
						onChange={(e) => setDescriptionFilter(e.target.value)}
						prefix={
							<IconSearch
								size={16}
								color="#ccc"
							/>
						}
						disabled={!category}
					/>
				</Col>
			</Row>
			<Table
				showHeader={false}
				rowSelection={{
					type: "radio",
					onChange: (selectedRowKeys, selectedRows) => {
						handleSelection(selectedRows[0]);
					},
					selectedRowKeys: [localFunc],
				}} //Pass here entire object or only ID
				columns={tableColumns}
				loading={loading}
				dataSource={functions}
				pagination={false}
				rowKey="id"
			/>
		</div>
	);
};

export default SelectFunction;
