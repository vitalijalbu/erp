import React, { useEffect } from "react";
import { Input, Table, Row, Button, Form, Col, Space, Typography } from "antd";
import { IconTrashX } from "@tabler/icons-react";

const TableFiltered = ({
	dataSource,
	selectable = true,
	columns,
	onSelect,
	ref,
	value,
	loading = false,
	callBack = null,
	id,
	...props
}) => {
	const [filter, setFilter] = React.useState({});
	const [newColumns, setNewColumns] = React.useState([]);
	const [filterData, setFilterData] = React.useState(dataSource);
	const form = Form.useFormInstance();
	const { Text } = Typography;
	useEffect(() => {
		setFilterData(dataSource);
		const colummFilter = columns.map((column) => {
			if (column.inputFilter) {
				return {
					...column,
					title: (
						<>
							<Row>
								<span>{column.title}</span>
							</Row>
							<Row>
								<Form.Item
									name={["column_" + column.title, "value"]}
									style={{ width: "100%" }}
								>
									<Input
										placeholder={column.title}
										// style={{ width: '100%', marginRight:0,marginBottom: 8, display: 'block' }}
										onChange={(e) => {
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
			} else {
				return {
					...column,
					title: (
						<>
							<Row >
								<span>{column.title}</span>
							</Row>
							<Row>
								<Form.Item/>
							</Row>
						</>
					),
				};
			}
		});
		setNewColumns(colummFilter);
	}, [dataSource]);

	useEffect(() => {
		const filterData = dataSource.filter((data) => {
			let result = true;
			Object.keys(filter).forEach((key) => {
				if (data[key].toString().toLowerCase().includes(filter[key].toLowerCase())) {
					result = result && true;
				} else {
					result = result && false;
				}
			});
			return result;
		});
		setFilterData(filterData);
	}, [filter]);

	function resetFilter() {
		const formFields = form.getFieldValue();
		Object.keys(formFields)
			.filter((el) => el.includes("column_"))
			.forEach((el) => {
				form.setFieldsValue({ [el]: { value: "" } });
			});
		setFilter({});
	}

	const defaultProps = {
		scroll: { x: true },
		rowKey: (record) => record.IDItem || record.id || record.code,
		//onShowSizeChange: setPaginationState
		dataSource: dataSource,
		loading: loading,
		tableLayout: "fixed",
		size: "small",
		className: "erp-datatable",
		columns: newColumns,
	};

	const innerProps = {
		...defaultProps,
		...props,
	};

	return (
		<Form
			form={form}
			component={false}
		>
			<Row
				className="mb-1"
				align="bottom"
			>
				<Col span={24}>
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

			<Row
				justify={"center"}
				style={{ marginBottom: 8 }}
			>
				<Col span={24}>
					<Table
						{...innerProps}
						dataSource={filterData}
						showSorterTooltip
						className="erp-datatable"
						transitionName="ant-modal-slide-up"
					/>
				</Col>
			</Row>
		</Form>
	);
};

export default TableFiltered;
