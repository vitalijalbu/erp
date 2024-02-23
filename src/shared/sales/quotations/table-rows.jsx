import { useState, useEffect, useRef } from "react";
import _ from "lodash";
import { Table, Button, Card, Tooltip, message, Typography } from "antd";
const { Text } = Typography;
import { IconPlus } from "@tabler/icons-react";
import { columnQuotations } from "@/hooks/useColumnQuotations";
import DrawerItem from "./quotation-drawer";
import { getSaleRowPrices, storeRowItem } from "@/api/orders";
import RowPriceDetailsModal from "@/shared/sales/quotations/row-price-details-modal";
import { getAllCurrencies } from "@/api/bp";
import { useValidationErrors } from "@/hooks/validation-errors";
import dayjs from "dayjs";

export const PRICE_CALCULATION_KEYS = [
	"item_id",
	"configuration",
	"quantity",
	"workcenter_id",
	"force_price_processing",
	"override_total_discount",
];
const TableRows = (props) => {
	/* 
    The component works with simply form object, set it to state then inline form inputs 
    calls handleInput() to change the old value with new one 
    data, parentData = formBody object from form-body.jsx
    */

	const {
		rows,
		data,
		saleId,
		errors,
		loading,
		onChange,
		syncRowSelection,
		changesWatcher,
		currencies,
		isConversion,
		approveOverride,
		openedPopup,
		closePopup,
		targetItem
	} = props;

	const [popup, setPopup] = useState(false);
	const [loadingAction, setLoadingAction] = useState(false);
	const [selected, setSelected] = useState(null);
	const [itemRows, setItemRows] = useState([]);
	const [nextIndex, setNextIndex] = useState(0);
	const hasErrors = useRef({});
	const [hasChanges, setHasChange] = useState(false);
	const [isBusy, setIsBusy] = useState(false);
	const [showModalPrice, setShowModalPrice] = useState(false);
	const [modalPriceRow, setModalPriceRow] = useState(null);
	const [abortController, setAbortController] = useState(new AbortController());
	const [columns, setColumns] = useState(null);
	const localCurrencies = useRef([]);
	const [removeOverride, setRemoveOverride] = useState([]);
	const [rowAdded, setRowAdded] = useState(false); // extra state to define if a row was added
	const validationErrorsBag = useValidationErrors();



	// Use useEffect to update the popup state when openedPopup changes
	useEffect(() => {
		setPopup(openedPopup);
	}, [openedPopup]);

			
	useEffect(() => {
		// if (localCurrencies.length <= 0) {
		getAllCurrencies()
			.then(({ data, error }) => {
				!error ? (localCurrencies.current = data) : message.error(error.message);
			})
			.finally(() => {
				const col = columnQuotations(
					handleInput,
					handleDataSort,
					sortedInfo,
					errorMessage,
					handleDelete,
					togglePopup,
					toggleModalPrice,
					data,
					localCurrencies.current,
					itemRows,
					setItemRows,
					isConversion,
					approveOverride,
					removeOverride,
					setRemoveOverride
				);
				setColumns(col);
			});
		// }
	}, [itemRows]);
	useEffect(() => {
		itemRows.forEach((v, i) => {
			handleInput(i, "force_price_processing", true);
		});
	}, [data?.currency_id]);

	// const [errorsArray, setErrorsArray] = useState({});
	const [sortedInfo, setSortedInfo] = useState({
		order: "ascend",
		columnKey: "position",
	});
	const [rowsSelected, setRowSelected] = useState([]);

	// On row select pass only selected ones to parent
	const onRowSelect = (ids) => {
		setRowSelected(ids);
		// Use lodash to filter itemRows based on the IDs in rowsSelected
		syncRowSelection(ids); // pass to parent
	};

	const resetItem = (row) => {
		let newRow = _.cloneDeep(row);
		newRow["item_id"] = null;
		newRow["um"] = null;
		newRow["item_type"] = null;
		newRow["configuration"] = null;
		newRow["standard_product_id"] = null;

		return newRow;
	};

	// format error message in a human friendly way
	const errorMessage = (field, index) => {
		if (itemRows[index]?.errors?.[field]) {
			const regex = /\w+\.\d\./gi;
			let message = itemRows[index]?.errors?.[field]
				.replace(regex, "")
				.replaceAll("_id", "")
				.replaceAll("_", " ");
			return (
				<Text
					type="danger"
					style={{ fontSize: "12px" }}
					// key={field + index}
				>
					{message}
				</Text>
			);
		} else {
			return <></>;
		}
	};
	// Add sorter to table
	const handleTableChange = (pagination, filters, sorter) => {
		setSortedInfo(sorter);
	};

	// sort data on position change, set or reset errors, scroll to modified element
	const handleDataSort = (value, index) => {
		let temp = _.cloneDeep(itemRows);
		const oldValue = itemRows[index].position;
		temp[index].position = value;

		let duplicate = _.filter(temp, (o) => o.position === value);

		if (duplicate.length > 1) {
			if (_.has(temp[index], "errors")) {
				temp[index].errors.position = "Cannot assign 2 row the same position.";
			} else {
				temp[index].errors = {
					position: "Cannot assign 2 row the same position.",
				};
			}
			temp[index].position = oldValue;
			setItemRows(temp);
			return;
		} else {
			if (_.has(temp[index], "errors")) {
				temp[index].errors = _.omit(temp[index].errors, "position");
			}
		}
		// add pull and push index
		let modded = temp[index];
		temp.splice(index, 1);
		temp.splice(0, 0, modded);

		temp.sort((a, b) => parseInt(a.position) - parseInt(b.position));
		// setData(data)
		hasErrors.current[index] = false;
		setHasChange(true);
		setSortedInfo({
			order: "ascend",
			columnKey: "position",
		});

		if (rowsSelected.includes(oldValue)) {
			const newSelection = _.clone(rowsSelected);
			newSelection.splice(
				_.findIndex(rowsSelected, (o) => o == oldValue),
				1,
				value
			);
			setRowSelected(_.uniq(newSelection));
		}
		// scroll to element
		const element = document.getElementById(
			"position-" + _.findIndex(temp, (o) => o.position === value)
		);
		element.scrollIntoView({ behavior: "instant", block: "center" });
		setItemRows(temp);
		changesWatcher(true);
	};

	
	// Toggle Drawer
	const togglePopup = (record, index) => {
		if (record) {
			setSelected({ ...record, index });
		} else {
			setSelected(null);
		}
		setPopup(!popup);
		closePopup(); // close also the parent state for form-body
	};

	// Set static Array
	useEffect(() => {
		if (rows.length > 0) {
			setItemRows(_.cloneDeep(rows).sort((a, b) => a.position - b.position));
			setNextIndex(_.last(rows)?.position || 0);
			if (rowAdded === false) {
				setRowSelected(_.map(rows, "position")); // Use rows directly as dependency
			}
			// else {
			// 	onRowSelect(rowsSelected);
			// }
		}
	}, [rows]);

	// detached error function
	const setErrorsFunction = (errors, rows) => {
		let clonedRows = _.cloneDeep(_.map(rows, (o) => _.omit(o, "errors")));
		let restOfRows = [];
		if (rowsSelected.length > 0 && rowsSelected.length !== rows.length) {
			restOfRows = _.filter(clonedRows, (el) => !_.includes(rowsSelected, el.position));
			clonedRows = _.filter(clonedRows, (el) => rowsSelected.includes(el.position));
			clonedRows = _.concat(clonedRows, restOfRows);
		}
		_.forIn(errors, (v, k) => {
			let splitted = k.split(".");
			if (_.has(clonedRows, splitted[1])) {
				clonedRows[splitted[1]]["errors"] = {
					...clonedRows[splitted[1]]["errors"],
					[splitted[2]]: v[0],
				};
			}
		});

		return clonedRows.sort((a, b) => parseInt(a.position) - parseInt(b.position));
	};

	// Set Error on parent error change
	useEffect(() => {
		// get keys
		if (!_.isEmpty(errors?.errors) && itemRows.length !== 0) {
			setItemRows(() =>
				setErrorsFunction(
					errors.errors,
					_.map(itemRows, (o) => _.omit(o, "errors"))
				)
			);
		} else if (_.isEmpty(errors?.errors) && itemRows.length !== 0) {
			setItemRows(_.cloneDeep(_.map(itemRows, (o) => _.omit(o, "errors"))));
		}
	}, [errors.errors]);

	// price calculation call: return a updated row with prices
	const getCalculatedPriceRow = async (row) => {
		if (
			_.isNull(row.item_id) &&
			_.isNull(row.standard_product_id) &&
			_.isNull(row.configuration)
		)
			return row;
		try {
			// Abort the previous request
			abortController.abort();

			// Create a new AbortController
			const newAbortController = new AbortController();
			setAbortController(newAbortController);

			// Make the API call with the new AbortController
			const response = await getSaleRowPrices(
				{
					sale_type: data.sale_type,
					bp_id: data.bp_id,
					currency_id: data.currency_id,
					sale_row: row,
				},
				newAbortController.signal
			);
			if (response.error) {
				const errors = response.error.response.data.errors;
				_.forIn(errors, (v, k) => {
					let splitted = k.split(".");
					row["errors"] = {
						...row["errors"],
						[splitted[1]]: v[0],
					};
				});
				if (response.status !== 422) {
					message.error(response.errorMsg);
					return _.extend(
						_.omit(row, [
							"errors",
							"total_price",
							"total_discount",
							"total_final_price",
							"total_cost",
							"total_profit",
						]),
						{ isPriceCalcFailed: true }
					);
				}
				return _.extend(
					_.omit(row, [
						"total_price",
						"total_discount",
						"total_final_price",
						"total_cost",
						"total_profit",
					]),
					{ isPriceCalcFailed: true }
				);
			}

			return _.extend(
				_.omit(row, ["errors", "isPriceCalcFailed"]),
				_.pick(response?.data, [
					"total_price",
					"total_discount",
					"total_final_price",
					"total_cost",
					"total_profit",
					"total_routing_cost",
					"item",
					"price",
					"profit",
					"discount",
					"cost",
					"final_price",
					"sale_price_components",
					"sale_routing_cost_components",
					"sale_total_discount_matrix_row",
					"sale_total_discount_matrix_row_id",
				])
			);
		} catch (error) {}
	};

	const handleSubmit = async (row) => {
		const formBody = {
			...row,
			delivery_date: row["delivery_date"]
				? dayjs(row["delivery_date"]).format("YYYY-MM-DD")
				: null,
		};
		setLoadingAction(true);
		// let isUpdate = saleId !== undefined || saleId !== null;   
		// using the OR operator 1 of the condition will result always true. in this case is better to use the !! (not not) annotation
		let isUpdate = !!saleId;
		validationErrorsBag.clear();
		console.log(saleId);
		// Start code singular Row
		if (isUpdate) {
			console.log("adding-post-row", isUpdate);
			try {
				const { status, error, errorMsg, validationErrors } = await storeRowItem(
					saleId,
					formBody
				);
				if (error) {
					if (validationErrors) {
						validationErrorsBag.setValidationErrors(validationErrors);
					}
					message.error(errorMsg);
					setLoadingAction(false);
				} else {
					addStaticRow(formBody, isUpdate);
					setPopup(false);
					//console.log('addStaticRow', addStaticRow);
				}
			} catch (error) {
				console.log("Error while storing row::", error);
				setLoadingAction(false);
			} finally {
				setLoadingAction(false);
			}
		} else {
			console.log("adding-static-row", isUpdate);
			addStaticRow(formBody, isUpdate);
			setPopup(false);
		}
	};

	// Delete single Row
	const addStaticRow = async (row, isUpdate) => {
		let calculatedRow = await getCalculatedPriceRow(row);

		row = calculatedRow;

		let updatedRows;
		if (selected) {
			updatedRows = itemRows.map((item, index) =>
				index === selected.index ? { ...item, ...row } : item
			);
		} else {
			updatedRows = [...itemRows, row];
		}

		setItemRows(updatedRows);
		setNextIndex(_.last(updatedRows)?.position);
		onChange(updatedRows, "force_price_processing");

		setSelected(null);
		setRowSelected(_.uniq([...rowsSelected, row.position]));
		setRowAdded(true);

		// ChangesWatcher set to true only if saleId is undefined or null
		if (!isUpdate) {
			changesWatcher(true);
		}
		message.success(
			`Row item successfully ${isUpdate ? (selected ? "updated" : "created") : "added"}`
		);
		setLoadingAction(false);
	};

	// Delete single Row
	const handleDelete = (index) => {
		const updatedRows = itemRows.filter((_, i) => i !== index);
		setItemRows(updatedRows);
		onChange(updatedRows);
		setNextIndex(_.last(itemRows)?.position);
		changesWatcher(true);
		setPopup(false);
		setSelected(null);
		message.success(`Row item #${index} successfully deleted`);
	};
	const firePriceCalculations = async (index, fieldName) => {
		abortController.abort();
		const row = await getCalculatedPriceRow(
			_.cloneDeep(itemRows[index]) //,
		);
		itemRows[index] = row;
		setItemRows(_.cloneDeep(itemRows));

		onChange(_.cloneDeep(itemRows), fieldName);
		changesWatcher(true);
	};

	// Function to handle inline input changes
	const handleInput = async (index, fieldName, value) => {
		// setIsBusy(true);
		// Create a new array with the updated record
		if (!itemRows[index]) return;

		if (fieldName === "reset_item") {
			itemRows[index] = _.cloneDeep(resetItem(itemRows[index]));
		} else {
			itemRows[index][fieldName] = value;
		}
		//itemRows[index]["id"] = null;

		if (fieldName === "item_type" && value === "service") {
			itemRows[index]["delivery_date"] = null;
			itemRows[index]["carrier_id"] = null;
			itemRows[index]["delivery_term_id"] = null;
			itemRows[index]["destination_address_id"] = null;
		}

		setItemRows(_.cloneDeep(itemRows));
		if (itemRows.length > 0) {
			setNextIndex(_.last(itemRows)?.position || 0);
		}
		onChange(_.cloneDeep(itemRows), fieldName);
		changesWatcher(true);

		// check if a price calculation is necessary
		if (PRICE_CALCULATION_KEYS.includes(fieldName)) {
			firePriceCalculations(index, fieldName);
		}
		setIsBusy(false);
	};

	const toggleModalPrice = (row = null) => {
		setShowModalPrice(!showModalPrice);
		setModalPriceRow(row);
	};

	return (
		<>
			{popup && (
				<DrawerItem
					opened={popup}
					loadingAction={loadingAction}
					toggle={() => togglePopup()}
					parentData={data} // pass form data here
					selected={selected}
					nextIndex={nextIndex}
					targetItem={targetItem} //items or std products, coming from parent component form-body
					onSubmit={(values) => handleSubmit(values)}
					onDelete={handleDelete}
					currencies={currencies}
					formErrors={validationErrorsBag}
					priceFunction={getCalculatedPriceRow}
				/>
			)}
			{showModalPrice && (
				<RowPriceDetailsModal
					detailObj={modalPriceRow}
					onToggle={(val) => setShowModalPrice(val)}
					open={showModalPrice}
					currencies={localCurrencies.current}
					currencyId={data.currency_id}
					companyCurrencyId={data.company_currency_id}
				/>
			)}

			<Card
				title="Row items"
				key={"card-" + 2}
				loading={loading}
				extra={[
					<Tooltip
						title="To add rows, select BP first"
						key={0}
					>
						<Button
							disabled={
								!data?.bp_id || data?.bp_id === null || data?.bp_id === undefined
							}
							icon={<IconPlus color="#33855c" />}
							onClick={() => togglePopup()}
							key={1}
						>
							Add new row
						</Button>
					</Tooltip>,
				]}
			>
				<Table
					dataSource={itemRows} /* {sortBy(itemRows, 'position')}  */
					columns={columns}
					tableLayout="fixed"
					loading={loading || isBusy}
					onChange={handleTableChange}
					scroll={{ x: "max-content" }}
					rowKey={"position"}
					rowClassName="row-align-top"
					pagination={false} // Disable pagination for simplicity
					rowSelection={
						props.selectable
							? {
									type: "checkbox",
									fixed: true,
									preserveSelectedRowKeys: false,
									selectedRowKeys: rowsSelected,
									onChange: (selectedRowKeys, selectedRows) => {
										onRowSelect(selectedRowKeys);
									},
							  }
							: false
					}
				/>
			</Card>
		</>
	);
};

export default TableRows;
