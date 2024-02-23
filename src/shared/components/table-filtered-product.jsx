import React, { useEffect, useState } from "react";
import { Input, Table, Row, Button, Select, Form, Col, Space, Typography, InputNumber } from "antd";
import { IconTrashX } from "@tabler/icons-react";
import { set } from "lodash";
const { Column } = Table;

const TableFiltered = ({ dataSource, columns, onSelect, ...props }) => {
	const [filter, setFilter] = useState({});
	const [newColumns, setNewColumns] = useState([]);
	const [filterData, setFilterData] = useState(dataSource);
	const form = Form.useForm()[0];
	const { Text } = Typography;

	function getBool(val) {
		return !!JSON.parse(String(val).toLowerCase());
	}

	function returnFilterInput(type, column) {
		if (type === "string") {
			return {
				...column,
				width: 200,
				sorter: (a, b) => a[column.dataIndex].localeCompare(b[column.dataIndex]),
				title: (
					<>
						<Row style={{ marginBottom: 8 }}>
							<span>{column.title}</span>
						</Row>
						<Row>
							<Form.Item name={["column_" + column.title, "value"]}>
								<Input
									placeholder={column.title}
									onClick={(e) => e.stopPropagation()}
									onChange={(e) => {
										console.log(e);
										const { value } = e.target;
										setFilter((prevState) => ({
											...prevState,
											[column.key]: value,
										}));
									}}
								/>
							</Form.Item>
						</Row>
					</>
				),
			};
		}
		if (column.type === "integer") {
			return {
				...column,
				width: 200,
				sorter: (a, b) => a[column.dataIndex] - b[column.dataIndex],
				title: (
					<>
						<Row style={{ marginBottom: 8 }}>
							<span>{column.title}</span>
						</Row>
						<Row>
							<Form.Item name={["column_" + column.title, "value"]}>
								<InputNumber
									onClick={(e) => e.stopPropagation()}
									precision={0}
									placeholder={column.title}
									onChange={(e) => {
										setFilter((prevState) => ({
											...prevState,
											[column.key]: e || "",
										}));
									}}
								/>
							</Form.Item>
						</Row>
					</>
				),
			};
		}

		if (column.type === "date" || column.type === "datetime") {
			return {
				...column,
				width: 200,
				sorter: (a, b) => a[column.dataIndex] - b[column.dataIndex],
				title: (
					<>
						<Row style={{ marginBottom: 8 }}>
							<span>{column.title}</span>
						</Row>
						<Row>
							<Form.Item name={["column_" + column.title, "value"]}>
								<Input
									type="date"
									onClick={(e) => e.stopPropagation()}
									precision={0}
									placeholder={column.title}
									onChange={(e) => {
										setFilter((prevState) => ({
											...prevState,
											[column.key]: e.target.value || "",
										}));
									}}
								/>
							</Form.Item>
						</Row>
					</>
				),
			};
		}

		if (column.type === "decimal") {
			return {
				...column,
				width: 200,
				sorter: (a, b) => a[column.dataIndex] - b[column.dataIndex],
				title: (
					<>
						<Row style={{ marginBottom: 8 }}>
							<span>{column.title}</span>
						</Row>
						<Row>
							<Form.Item name={["column_" + column.title, "value"]}>
								<InputNumber
									precision={2}
									placeholder={column.title}
									decimalSeparator="."
									onChange={(e) => {
										setFilter((prevState) => ({
											...prevState,
											[column.key]: e || "",
										}));
									}}
								/>
							</Form.Item>
						</Row>
					</>
				),
			};
		}

		if (column.type === "boolean") {
			return {
				...column,
				width: 200,
				sorter: (a, b) => a[column.dataIndex].localeCompare(b[column.dataIndex]),
				title: (
					<>
						<Row style={{ marginBottom: 8 }}>
							<span>{column.title}</span>
						</Row>
						<Row>
							<Form.Item name={["column_" + column.title, "value"]}>
								<Select
									onClick={(e) => e.stopPropagation()}
									placeholder={column.title}
									options={[
										{ label: "", value: "" },
										{ label: "Yes", value: 1 },
										{ label: "No", value: 0 },
									]}
									onChange={(e) => {
										setFilter((prevState) => ({
											...prevState,
											[column.key]: e === "" ? "" : e,
										}));
									}}
								/>
							</Form.Item>
						</Row>
					</>
				),
			};
		} else {
			return {
				...column,
				width: 10,
				title: (
					<Row style={{ marginBottom: "6px" }}>
						<span>{column.title}</span>
					</Row>
				),
			};
		}
	}

	function returnColumnType(key) {
		const column = columns.filter((column) => column.key === key);
		return column?.[0]?.type || "string";
	}

	useEffect(() => {
		setFilterData(dataSource);
		const colummFilter = columns.map((column) => {
			return returnFilterInput(column.type, column);
		});
		setNewColumns(colummFilter);
		console.log(colummFilter);
	}, [columns]);

	useEffect(() => {
		const filterData2 = dataSource.filter((data) => {
			let result = true;
			Object.keys(filter).forEach((key) => {
				const type = returnColumnType(key);

				if (type === "boolean" && filter[key] === "null") {
					if (filter[key] === "null") return;
					if (getBool(data[key]) === getBool(filter[key])) {
						result = result && true;
					} else {
						result = result && false;
					}
				} else if (
					data[key]
						.toString()
						.toLowerCase()
						.includes(filter[key].toString()?.toLowerCase())
				) {
					returnColumnType(key);
					result = result && true;
				} else {
					result = result && false;
				}
			});
			return result;
		});
		setFilterData(filterData2);
	}, [filter]);

	function resetFilter() {
		const formFields = form.getFieldsValue();
		Object.keys(formFields)
			.filter((el) => el.includes("column_"))
			.forEach((el) => {
				form.setFieldsValue({ [el]: { value: "" } });
			});
		setFilter({});
	}

	return (
		<Form
			form={form}
			component={false}
		>
			<Row
				className="mb-1"
				align="bottom"
			>
				<Col span={12}>
					<Space>
						<Text type="secondary">Found {filterData.length} records</Text>
						{Object.keys(filter).length > 0 && (
							<Button
								type="text"
								danger
								onClick={resetFilter}
								icon={<IconTrashX />}
							>
								Clear filters
							</Button>
						)}
					</Space>
				</Col>
			</Row>



			<Table
				showSorterTooltip
				rowSelection={{
					type: "radio",
					getCheckboxProps: (record) => ({
						id: record.id,
					}),
					onChange: (selectedRowKeys, selectedRows) => {
						onSelect(selectedRowKeys[0]);
					},
				}}
				dataSource={filterData}
				rowKey={(record) => record[columns?.[0]?.dataIndex]}
				pagination
				size="large"
				{...props}
				scroll={{ y: 500, scrollToFirstRowOnChange: true }}
			>
				{newColumns.length > 1
					? newColumns.map(
							(column, index) =>
								index > 0 && (
									<Column
										key={index}
										{...column}
										width={column.width}
										fixed={index === 1 ? "left" : ""}
										dataIndex={column.dataIndex}
									/>
								)
					  )
					: newColumns.map((column, index) => (
							<Column
								key={index}
								{...column}
								width={column.width}
								fixed={index === 1 ? "left" : ""}
								dataIndex={column.dataIndex}
							/>
					  ))}
			</Table>
		</Form>
	);
};

export default TableFiltered;
