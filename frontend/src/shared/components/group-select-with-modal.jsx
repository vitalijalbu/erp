import React, { useState, useEffect, useCallback, useRef } from "react";
import {
	Select,
	Button,
	message,
	Divider,
	Row,
	Col,
	Space,
	Tooltip,
	AutoComplete,
	Modal,
	Spin,
	List,
	Tabs,
} from "antd";
import { IconSearch, IconSettings } from "@tabler/icons-react";
import _ from "lodash";
import { setConfig } from "next/config";
const GroupSelectWithModal = ({
	name,
	value,
	setProductKey,
	placeHolder,
	onChange,
	tabEnabled,
	onSearch,
	options,
	extras,
	disabled,
	disabledOptions,
	setItemsType,
	optionsStandardProduct,
	setProduct,
	onTogglePopUp,
	optionValue,
	setConfigurationSaved,
	optionLabel,
	toggleConfigurator,
	setProductSelected,
	groupBy,
	queryLen = 0,
	configurationSaved,
	isloading,
	localValue,
	setLocalValue,
	status = null,
	onReset,
}) => {
	const [loading, setLoading] = useState(false);
	const [data, setData] = useState([]);
	const [popup, setPopup] = useState(false);
	const [query, setQuery] = useState(0);
	const [stdData, setStdData] = useState([]);
	const [itemFiltered, setItemFiltered] = useState({});
	const [valueSelect, setValueSelect] = useState();
	const [toggleModal, setToggleModal] = useState(false);
	const [enabledTab, setEnabledTab] = useState("items");
	const { confirm } = Modal;

	const toggleTest = (params) => {
		console.log(params);
		toggleConfigurator(params);
	};

	const handleSetProduct = (item) => {
		if (item) {
			setProduct(
				_.find(optionsStandardProduct, (o) => {
					console.log("selprod", o, item);
					return o.id === item.value;
				})?.code
			);
			setProductSelected(item.value);
			setProductKey(item.value);
		}
	};

	useEffect(() => {
		setEnabledTab(tabEnabled);
	}, [tabEnabled]);

	const togglePopup = () => {
		setPopup(!popup);
	};

	const confirmEdit = (objEdit, params) => {
		console.log(objEdit);
		if (!objEdit) return;
		confirm({
			title: "Confirm Edit Configuration",
			transitionName: "ant-modal-slide-up",
			content:
				"Are you sure you want to change the standard product? All the configuration will be lost",
			okText: "Confirm",
			okType: "danger",
			cancelText: "Cancel",
			async onOk() {
				try {
					// setProduct(value?.label);
					toggleTest("standard");
					objEdit(params);
				} catch (error) {
					message.error("An error occurred while deleting the BOM constraint");
				}
			},
		});
	};

	const cleanConfiguration = (callBack) => {
		confirm({
			title: "Confirm Delete Configuration",
			transitionName: "ant-modal-slide-up",
			content:
				"Are you sure you want to delete the standard product? All the configuration will be lost",
			okText: "Confirm",
			okType: "danger",
			cancelText: "Cancel",
			async onOk() {
				try {
					callBack();
				} catch (error) {
					message.error("An error occurred while deleting the BOM constraint");
				}
			},
		});
	};

	const createItemLabel = (item, type = "items") => {
		const optionLabel2 = optionLabel?.[type] ?? optionLabel;
		if (typeof optionLabel2 === "string") {
			return item[optionLabel2];
		} else if (typeof optionLabel2 === "object") {
			let labels = [];
			_.each(optionLabel2, (el) => {
				labels.push(item[el]);
			});
			return labels.join(" - ");
		} else if (typeof optionLabel2 === "function") {
			return optionLabel(item);
		}
	};
	const mapOptions = (data, type = "items") => {
		const id = optionValue?.[type];

		const test = _.map(data, (o) => {
			return {
				label: createItemLabel(o, type),
				value: o[id] ?? optionValue,
				disabled: disabledOptions ? disabledOptions.includes(o?.id) : false,
			};
		});

		return test;
	};

	const groupOptions = (data, type) => {
		let localData = _.map(_.groupBy(data, groupBy?.[type]), (v, k) => {
			return {
				label: _.capitalize(k),
				options: mapOptions(v, type),
			};
		});
		return localData;
	};

	const noOptions = () => {
		if (loading) {
			return (
				<div className="flex p-1 display-virtual">
					<Space>
						<Spin size="small" /> <span>Loading Options...</span>
					</Space>
				</div>
			);
		} else if (query < 1 && data?.length === 0 && stdData?.length === 0) {
			return (
				<div className="text-warning p-1 display-virtual">
					Please insert at least 1 character to perform a research!
				</div>
			);
		} else if (data?.length === 0 && stdData?.length === 0)
			return <div className="p-1 display-virtual">NO RESULTS. TRY CHANGE THE QUERY.</div>;
		else {
			return <div className="p-1"></div>;
		}
	};

	const confirmEditCallBack = (callback) => {
		confirm({
			title: "Confirm Edit Configuration",
			transitionName: "ant-modal-slide-up",
			content:
				"Are you sure you want to change the standard product? All the configuration will be lost",
			okText: "Confirm",
			okType: "danger",
			cancelText: "Cancel",
			async onOk() {
				try {
					callback();
				} catch (error) {
					message.error("An error occurred while deleting the BOM constraint");
				}
			},
		});
	};

	useEffect(() => {
		setItemsType(enabledTab);
	}, [enabledTab]);

	const tabsRef = useRef(null);
	const [open, setOpen] = useState(false);
	const handleChange = (value) => {
		console.log(value);
		if (!value) return;
		if (enabledTab === "items") {
			if (configurationSaved?.length > 0)
				confirmEditCallBack(() => {
					setLocalValue(value?.value);
					setProductSelected(value);
					setConfigurationSaved([]);
					setOpen(false);
					onChange(value);
				});
			else {
				setLocalValue(value?.value);
				setProductSelected(value?.label);
				setOpen(false);
				onChange(value);
			}
		} else {
			if (configurationSaved?.length > 0)
				confirmEdit(() => {
					if (!value) return;
					toggleTest("standard");
					setLocalValue("");
					setProductSelected("");
					setConfigurationSaved([]);
				});
			else {
				setProductKey(value?.key);
				handleSetProduct(value);
				if (!value) return;
				toggleTest("standard");
				setOpen(false);
			}
		}
	};

	useEffect(() => {
		if (options) {
			if (groupBy) {
				setData(groupOptions(options, "items"));
			} else {
				setData(mapOptions(options, "items"));
			}
			setStdData(mapOptions(optionsStandardProduct, "standard_products"));
		}
	}, [options]);

	useEffect(() => {
		setQuery(queryLen);
	}, [queryLen]);

	useEffect(() => {
		setLoading(isloading);
	}, [isloading]);

	const selectRef = useRef(null);

	useEffect(() => {
		if (configurationSaved?.[0]?.product) {
			setProductSelected(configurationSaved?.[0]?.product);
		}
	}, [configurationSaved]);

	return (
		<>
			<Space.Compact className="flex w-100">
				<Select
					/* open={open} */
					onKeyDown={(e) => {
						if (e.keyCode === 40) {
							e.preventDefault();
							e.stopPropagation();
							tabsRef.current?.focus();
						}
					}}
					status={status}
					name={name}
					aria-label="Select Item"
					ref={selectRef}
					/* onDropdownVisibleChange={(visible) => setOpen(visible)} */
					value={localValue}
					className="not-display-virtual"
					allowClear
					onClear={() => {
						if (configurationSaved?.length > 0)
							cleanConfiguration(() => {
								// setLocalValue("");
								// setProductSelected("");
								setConfigurationSaved([]);
								setOpen(false);
								onReset();
							});
						else {
							onReset();
						}
					}}
					optionLabelProp="label"
					labelInValue={true}
					autoClearSearchValue={false}
					loading={loading}
					placeholder={placeHolder || "Select Item"}
					optionFilterProp="children"
					style={{ maxWidth: "300px" }}
					showSearch
					showAction={["focus"]}
					disabled={disabled}
					onChange={(value) => {
						handleChange(value);
					}}
					onSearch={_.debounce((val) => onSearch(val), 500)}
					virtual={true}
					notFoundContent={() => noOptions()}
					dropdownRender={(menu) => (
						<div className="not-display-virtual">
							<Tabs
								activeKey={enabledTab}
								defaultActiveKey={"items"}
								itemRef={tabsRef}
								autoFocus
								indicator={{ size: (origin) => origin - 16 }}
								onChange={(key) => setEnabledTab(key)}
							>
								<Tabs.TabPane
									tab={"Items"}
									key={"items"}
									tabKey="items"
								>
									{menu}
								</Tabs.TabPane>

								<Tabs.TabPane
									tab={"Configurable Product"}
									key={"standard_product"}
									tabKey="standard_product"
								>
									{menu}
								</Tabs.TabPane>
							</Tabs>
							<span>{noOptions()}</span>
						</div>
					)}
				>
					{enabledTab === "items"
						? data?.map((item) => (
								<Select.OptGroup
									label={item.label}
									key={item.label}
								>
									{item.options?.map((el) => (
										<Select.Option
											key={el.value}
											value={el.value}
											label={el.label}
											disabled={el.disabled}
										>
											{el.label}
										</Select.Option>
									))}
								</Select.OptGroup>
						  ))
						: stdData?.map((item) => (
								<Select.Option
									key={item.value}
									value={item.value}
									label={item.label}
									disabled={item.disabled}
								>
									{item.label}
								</Select.Option>
						  ))}
				</Select>
				<Tooltip
					placement="top"
					title="Table Look-up"
					mouseEnterDelay={0.5}
				>
					<Button
						icon={<IconSearch />}
						onClick={(e) => {
							onTogglePopUp();
						}}
					></Button>
				</Tooltip>
			</Space.Compact>
			{configurationSaved?.length > 0 && (
				<a
					className="flex-grow-1"
					onClick={toggleConfigurator}
					style={{
						marginTop: 8,
						fontSize: 12,
						color: "#33855c",
						textDecoration: "underline",
					}}
				>
					Edit configuration
				</a>
			)}

			{extras()}
		</>
	);
};

export default GroupSelectWithModal;
