import React, {
	useState,
	useEffect,
	useCallback,
	useRef,
	useContext,
	createContext,
	useMemo,
} from "react";
import {
	Row,
	Col,
	Space,
	Table,
	Button,
	Tag,
	Typography,
	Form,
	Tooltip,
	Modal,
	message,
} from "antd";
const { Text } = Typography;
const { confirm } = Modal;

import * as dayjs from "dayjs";
import { filterCalendarProps } from "@/shared/datatable/filter-calendar";
import { filterOperatorProps } from "@/shared/datatable/filter-operator";
import { filterDropdownProps } from "@/shared/datatable/filter-dropdown";
import { ExportPrompt } from "@/shared/datatable/export-prompt";
import {
	numberFormatter,
	currencyFormatter,
	dateFormatter,
	dateTimeFormatter,
	dateTZFormatter,
	dateTimeTZFormatter,
	sessionFormatter,
} from "@/hooks/formatter";
import { IconFileSpreadsheet, IconTrashX } from "@tabler/icons-react";
import _ from "lodash";

export class DatatableController {
	constructor() {
		[this.refreshState, this.setRefreshState] = useState(false);
		[this.refreshCurrentPageState, this.setRefreshCurrentPageState] = useState(false);
	}

	refresh() {
		//console.log('changed refresh');
		this.setRefreshState(!this.refreshState);
	}

	refreshCurrentPage() {
		this.setRefreshCurrentPageState(!this.refreshCurrentPageState);
	}
}

const DatatableConfigContext = createContext({});

const Datatable = (props) => {
	const [dataSource, setDataSource] = useState([]);
	const [pagination, setPagination] = useState({
		current: 1,
		pageSize: 20,
		total: 0,
	});
	const [sorter, setSorter] = useState({});

	const [loading, setLoading] = useState(false);

	const filters = useRef({});
	const [triggerChange, setTriggerChange] = useState(false);

	const isFirstTimeRun = useRef(true);

	const [exportPromptOpen, setExportPromptOpen] = useState(false);

	const fetchCallCounter = useRef(0);

	const exportData = (selection) => {
		setLoading(true);

		setTimeout(async () => {
			let params = prepareParams(pagination, filters.current, sorter);
			if (selection == "current") {
				params["paginating"] = true;
			}

			try {
				const result = await props.exportData(params);
				const link = document.createElement("a");
				link.href = window.URL.createObjectURL(new Blob([result[0]]));
				link.setAttribute("download", result[1]);
				document.body.appendChild(link);
				link.click();
				window.URL.revokeObjectURL(link.href);
				document.body.removeChild(link);
			} catch (error) {
				console.log(error);
			}
			setLoading(false);
			setExportPromptOpen(false);
		}, 0);
	};
	useEffect(() => {
		if (props.presetFilters && Object.keys(props.presetFilters).length) {
			filters.current = props.presetFilters;
			for (let column in filterForms) {
				filterForms[column].resetFields();
			}
			for (let column in props.presetFilters) {
				if (filterForms[column]) {
					console.log(column, props.presetFilters[column].value, filterForms[column]);
					filterForms[column].setFieldsValue(props.presetFilters[column]);
					reloadAfterChange();
				}
			}
		}
	}, [props.presetFilters]);

	const storeFilters = (filter) => {
		const newFilters = { ...filters.current };
		if (filter.value === null || filter.value?.value === undefined) {
			delete newFilters[filter.column];
		} else {
			newFilters[filter.column] = filter.value;
		}

		filters.current = newFilters;
	};

	// useEffect(() => {
	//     console.log(filters);
	// }, [filters])

	const prepareParams = (pagination, filters, sorter) => {
		//console.log(pagination);
		const params = {
			start: props.pagination === false ? 0 : pagination.pageSize * (pagination.current - 1),
			length: props.pagination === false ? null : pagination.pageSize,
		};
		if (sorter?.column) {
			params["order"] = [
				{
					column: sorter.columnKey,
					dir: sorter.order == "ascend" ? "asc" : "desc",
				},
			];
		}

		const filteredColumns = {};
		for (let filterColumn in filters) {
			filteredColumns[filterColumn] = {
				search: {
					value: filters[filterColumn].value,
				},
			};

			if (filters[filterColumn]?.operator) {
				filteredColumns[filterColumn]["search"]["operator"] =
					filters[filterColumn].operator;
			}
		}
		params["columns"] = filteredColumns;

		return params;
	};

	const fetchData = async (pagination, filters, sorter) => {
		setLoading(true);
		setTimeout(async () => {
			if (props.id) {
				persistUserPrefs(filters, sorter);
			}
			let params = prepareParams(pagination, filters, sorter);

			try {
				let currentCallCounter = ++fetchCallCounter.current;

				const result = await props.fetchData(params);

				if (currentCallCounter == fetchCallCounter.current) {
					//console.log('Last call handled')
					setDataSource(result?.data || []);
					setPagination({
						current: pagination.current,
						pageSize: pagination.pageSize,
						total: result?.recordsFiltered || 0,
					});

					setSorter(sorter);
				}
			} catch (error) {
				console.log(error);
			}
			//console.log(filters);
			setLoading(false);
		}, 0);
	};

	const persistUserPrefs = (filters, sorter) => {
		if (window.localStorage) {
			//console.log(sorter);
			//cleanup sorter from unserializable elements
			let filteredSorter = {};
			if (sorter.column) {
				filteredSorter = sorter;
				filteredSorter.column = (({ copyable, description, key, columnKey, field }) => ({
					copyable,
					description,
					key,
					columnKey,
					field,
				}))(filteredSorter.column);
			}

			window.localStorage.setItem(
				`dt.preferences.${props.id}`,
				JSON.stringify({ filters, sorter: filteredSorter })
			);
		}
	};

	const getUserPrefs = () => {
		if (window.localStorage) {
			let prefs = window.localStorage.getItem(`dt.preferences.${props.id}`);

			return prefs ? JSON.parse(prefs) : null;
		}
		return null;
	};

	const handleTableChange = async (pagination, __filter, sorter) => {
		//console.log("loading on pagination change");
		fetchData(pagination, filters.current, sorter);
	};

	useEffect(() => {
		//console.log("loading on init");
		(async () => {
			let defaultSorter = {};
			let defaultFilters = {};
			if (props.id) {
				let prefs = getUserPrefs();
				if (prefs) {
					defaultSorter = prefs?.sorter || {};
					setSorter(defaultSorter);

					if (prefs?.filters) {
						filters.current = prefs.filters;
						defaultFilters = prefs.filters;

						for (let column in defaultFilters) {
							if (column in filterForms) {
								if (column in filterFormsUnserializer) {
									defaultFilters[column]["value"] = filterFormsUnserializer[
										column
									](defaultFilters[column]["value"]);
								}
								filterForms[column].setFieldsValue(defaultFilters[column]);
							}
						}
					}
				}
			}
			await fetchData(pagination, defaultFilters, defaultSorter);
			isFirstTimeRun.current = false;
		})();
	}, []);

	const reloadAfterChange = function () {
		//console.log(filters);
		if (!isFirstTimeRun.current) {
			console.log("loading on filter change");
			let newPagination = {
				current: 1,
				pageSize: pagination.pageSize,
				total: 0,
			};
			fetchData(newPagination, filters.current, sorter);
		}
	};

	useEffect(() => {
		reloadAfterChange();
	}, [
		triggerChange,
		...(props?.watchStates || []),
		...(props.controller ? [props.controller.refreshState] : []),
	]);

	if (props.controller) {
		useEffect(() => {
			if (!isFirstTimeRun.current) {
				fetchData(pagination, filters.current, sorter);
			}
		}, [props.controller.refreshCurrentPageState]);
	}
	const getNodeText = (node) => {
		if (["string", "number"].includes(typeof node)) return node;
		if (node instanceof Array) return node.map(getNodeText).join("");
		if (typeof node === "object" && node) return getNodeText(node.props.children);
	};

	const getColumnRenderer = (column) => {
		const k = column.key;
		const col = column;
		const copyable = column.copyable || false;
		const ellipsis = column.ellipsis || false;
		return function (row, value, i) {
			const property = k.split(".").reduce((a, b) => a[b], value);

			var node = null;
			switch (col?.type) {
				case "date":
					node = <Text>{dateFormatter(property)}</Text>;
					break;
				case "datetime":
					node = <Text>{dateTimeFormatter(property)}</Text>;
					break;
				case "datetz":
					node = <Text>{dateTZFormatter(property)}</Text>;
					break;
				case "datetimetz":
					node = <Text>{dateTimeTZFormatter(property)}</Text>;
					break;
				case "bool":
					node = (
						<Tag
							color={
								typeof property === "boolean"
									? property
										? "green"
										: null
									: !!parseInt(property)
									? "green"
									: null
							}
						>
							{typeof property === "boolean"
								? property
									? "Yes"
									: "No"
								: !!parseInt(property)
								? "Yes"
								: "No"}
						</Tag>
					);
					break;
				case "number":
					//if (!col.hasOwnProperty('align')) { col.align = 'right';}
					node = (
						<div className="text-right">
							<Text>{sessionFormatter(property)}</Text>
						</div>
					);
					break;
				case "qty":
					//if (!col.hasOwnProperty('align')) {col.align = 'right';}
					const afterValue = typeof col.after === "function" ? col.after(row) : col.after;
					node = (
						<div className="text-right">
							<Text>
								{sessionFormatter(property)} {afterValue}
							</Text>
						</div>
					);
					break;
				case "currency":
					node = <Text>{currencyFormatter(property)}</Text>;
					break;
				default:
					node = <Text>{property}</Text>;
			}

			if (copyable) {
				return React.cloneElement(node, {
					copyable: true,
				});
			}
			//set ellipsis
			if (ellipsis) {
				return (
					<Tooltip title={property}>
						<Text>{property}</Text>
					</Tooltip>
				);
			}

			return node;
		};
	};

	const filterForms = {};
	const filterFormsUnserializer = {};

	const clearFilters = () => {
		for (let _form in filterForms) {
			filterForms[_form].resetFields();
		}
		filters.current = {};
		setTriggerChange(!triggerChange);
	};

	const getColumnFilter = (column) => {
		if (!(column.key in filterForms)) {
			[filterForms[column.key]] = Form.useForm();
		}
		if (
			column?.type == "date" ||
			column?.type == "datetime" ||
			column?.type == "datetz" ||
			column?.type == "datetimetz"
		) {
			filterFormsUnserializer[column.key] = (value) => dayjs(value);
			return filterCalendarProps(
				filterForms[column.key],
				column,
				storeFilters,
				() => setTriggerChange(!triggerChange),
				filters.current,
				true
			);
		}
		if (column?.type == "bool") {
			return filterDropdownProps(
				filterForms[column.key],
				{
					...column,
					...{
						filterOptions: [
							{
								value: 1,
								label: "Yes",
							},
							{
								value: 0,
								label: "No",
							},
						],
					},
				},
				storeFilters,
				() => setTriggerChange(!triggerChange),
				filters.current,
				false
			);
		}

		if (column?.filterOptions) {
			return filterDropdownProps(
				filterForms[column.key],
				column,
				storeFilters,
				() => setTriggerChange(!triggerChange),
				filters.current
			);
		} else if (column?.hasFilterOperator) {
			return filterOperatorProps(
				filterForms[column.key],
				column,
				storeFilters,
				() => setTriggerChange(!triggerChange),
				filters.current,
				true
			);
		}

		return filterOperatorProps(
			filterForms[column.key],
			column,
			storeFilters,
			() => setTriggerChange(!triggerChange),
			filters.current,
			false
		);
	};

	const columns = [];
	for (let column of props.columns) {
		let innerColumn = column;
		if (innerColumn?.sorter === undefined && column.key != "actions") {
			innerColumn.sorter = true;
		}
		if (innerColumn?.render === undefined) {
			innerColumn.render = getColumnRenderer(column);
		}
		if (
			(innerColumn?.filterable == undefined || innerColumn?.filterable == true) &&
			innerColumn.key != "actions"
		) {
			var filterProps = getColumnFilter(innerColumn);

			innerColumn = {
				...innerColumn,
				...filterProps,
			};
		}

		if (innerColumn.description) {
			innerColumn.title = (
				<Tooltip title={innerColumn.description}>
					<span>{innerColumn.title}</span>
				</Tooltip>
			);
		}

		//if the user prefs are persisted the user sort order will be recovered
		if (props.id) {
			let prefs = getUserPrefs();
			if (prefs && prefs?.sorter?.column?.key == innerColumn.key) {
				innerColumn.sortOrder = prefs?.sorter?.order;
			}
		}

		columns.push(innerColumn);
	}

	const defaultProps = {
		scroll: { x: true },
		rowKey: (record) => record.id,
		//onShowSizeChange: setPaginationState
		onChange: handleTableChange,
		dataSource: dataSource,
		loading: loading,
		pagination: {
			...pagination,
			position: ["bottomCenter"],
			hideOnSinglePage: true,
		},
		tableLayout: "fixed",
		size: "small",
		className: "erp-datatable",
	};

	const calculatedProps = {
		columns: columns,
	};

	const innerProps = {
		...defaultProps,
		...props,
		...calculatedProps,
		components: {
			header: {
				wrapper: CustomHeader,
			},
		},
	};

	return (
		<>
			<Row
				className="mb-1"
				align="middle"
			>
				<Col span={12}>
					<Space>
						<Text type="secondary">
							{innerProps.pagination === false
								? `Found ${dataSource.length} ${
										dataSource.length != 1 ? "elements" : "element"
								  }`
								: `Found ${pagination.total} ${
										pagination.total != 1 ? "elements" : "element"
								  }`}
						</Text>

						{Object.keys(filters.current).length > 0 && (
							<Button
								type="text"
								danger
								onClick={clearFilters}
								icon={<IconTrashX />}
							>
								Clear filters
							</Button>
						)}
					</Space>
				</Col>
				<Col
					span={12}
					className="text-right"
				>
					{props.exportData ? (
						<Button
							disabled={
								innerProps.pagination === false
									? dataSource.length == 0
									: pagination.total == 0
							}
							onClick={() => setExportPromptOpen(true)}
							icon={<IconFileSpreadsheet color="#33855c" />}
						>
							Export
						</Button>
					) : null}
				</Col>
			</Row>
			<DatatableConfigContext.Provider value={innerProps}>
				<Table {...innerProps} />
			</DatatableConfigContext.Provider>
			<ExportPrompt
				open={exportPromptOpen}
				onOk={exportData}
				pagination={!(props.pagination === false)}
				onCancel={() => setExportPromptOpen(false)}
				loading={loading}
			/>
		</>
	);
};

const CustomHeader = (props) => {
	const dtConfig = useContext(DatatableConfigContext);

	const stickyOffsets = props.children[0].props?.stickyOffsets?.left || [];
	const hasFiltersRow = dtConfig.columns.reduce(
		(cur, col) => cur || !(col?.filterable === false || col.key == "actions"),
		false
	);

	const rowSelectionFixed = dtConfig.columns[0]?.fixed == "left";
	const rowSelectionClasses = rowSelectionFixed ? "ant-table-cell-fix-left" : null;
	const rowSelectionStyles = rowSelectionFixed ? { position: "sticky", left: 0 } : {};

	return (
		<thead className={props.className}>
			{props.children}
			{hasFiltersRow && (
				<tr className="table-filter-row">
					{dtConfig.rowSelection && (
						<th
							className={rowSelectionClasses}
							style={rowSelectionStyles}
						></th>
					)}
					{dtConfig.columns.map((column, index) => {
						const thClasses = [];
						const thStyles = {};
						if (column?.fixed == "left") {
							thClasses.push("ant-table-cell-fix-left");
							thStyles["position"] = "sticky";
							thStyles["left"] =
								stickyOffsets?.[index + (dtConfig.rowSelection ? 1 : 0)] || 0;
						}

						return (
							<th
								className={thClasses.join(" ")}
								style={thStyles}
								key={`filter-col-${index}`}
							>
								{column?.filterable !== false && column.filterComponent && (
									<column.filterComponent
										key={"filter-col-" + column.key}
										confirm={() => true}
										clearFilters={() => true}
									></column.filterComponent>
								)}
							</th>
						);
					})}
				</tr>
			)}
		</thead>
	);
};

export default Datatable;
