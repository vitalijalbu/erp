import React, { useState, useEffect, useCallback, useRef } from "react";

import {
	itemsSearch,
	itemsSearchAutoComplete,
	searchItemsAutocomplete,
} from "@/api/items";
import { Button, Form, message, Modal, Select, Spin } from "antd";
import GroupSelectWithModal from "@/shared/components/group-select-with-modal";
import { IconCheckbox } from "@tabler/icons-react";
import Datatable from "@/shared/datatable/datatable";
import ItemTable from "@/shared/items/components-table/items-table";
import SellerConfigurator from "@/pages/seller-configurator/configurator";
import FocusLock from "react-focus-lock";

const ItemAutocomplete = (props) => {
	const [loading, setLoading] = useState(false);
	const [localValue, setLocalValue] = useState("");
	const [productKey, setProductKey] = useState(null);
	const [items, setItems] = useState([]);
	const [options, setOptions] = useState([]);
	const [queryLen, setQueryLen] = useState(0);
	const [selected, setSelected] = useState(null);
	const [popup, setPopup] = useState(false);
	const [optionsStandardProducts, setOptionsStandardProducts] = useState([]);
	const [modalConfigurator, setModalConfigurator] = useState(false);
	const [productSelected, setProductSelected] = useState(null);
	const [typeConfigurator, setTypeConfigurator] = useState();
	const [tempConfiguration, setTempConfiguration] = useState(null);
	const [product, setProduct] = useState();
	const [typeItems, setItemsType] = useState();
	const [tabEnabled, setTabEnabled] = useState("items");

	const [sendData, setSendData] = useState(false);
	const togglePopup = () => {
		setPopup(!popup);
	};

	const [configurationSaved, setConfigurationSaved] = useState([]);
	const toggleConfigurator = (type) => {
		setModalConfigurator(!modalConfigurator);
		if (!!type) setTypeConfigurator(type);
	};

	const handleSelection = async () => {
		if (typeItems === "product") {
			await searchItems(selected.value);

			setLocalValue(selected.value);
			setConfigurationSaved(tempConfiguration);
			props.onStdChange(selected.value, selected.type, selected.um);
			props?.onConfigurationSaved(tempConfiguration?.[0]?.configuration);
		}
		if (typeItems === "items") {
			await searchItems(selected.value);

			setConfigurationSaved([]);
			setTempConfiguration([]);
			setLocalValue(selected.value);
			props.onConfigurationSaved(null);
			props?.onItemChange(selected.value, selected.type, selected.um);
		}

		togglePopup();
	};

	useEffect(() => {
		if (typeConfigurator === "standard" && !!tempSelected) {
			setLocalValue(tempSelected);
			itemsSearchAutoComplete(tempConfiguration?.[0].productID).then(
				({ standard_products }) => {
					let stProd = _.find(
						standard_products,
						(o) => o.id === tempConfiguration?.[0].productID
					);
					if (!!tempConfiguration) {
						props.onStdChange(stProd.id, "standard_product", stProd.um_id);
						props?.onConfigurationSaved(tempConfiguration?.[0]?.configuration);
						setConfigurationSaved(tempConfiguration);
					}
				}
			);
		}
	}, [tempConfiguration]);

	const searchItems = async (text) => {
		setLoading(true);
		setQueryLen(text?.length);
		/* 	if (!text || (text?.length < 1 && props.value.value)) {
			setLoading(false);
			return;
		} */
		const {
			items: data,
			standard_products: data2,
			error,
		} = await itemsSearchAutoComplete(text);
		if (!error) {
			let mappedOpts = data.map((item) => {
				if (!item.type) {
					item.type = "product";
				}
				return item;
			});
			if (props.itemValue) {
				let item = _.find(data, (o) => o.IDitem === props.itemValue);
				if (_.has(item, "configuration") && !_.isNull(item.configuration)) {
					const { standard_products, error } = await itemsSearchAutoComplete(
						item.standard_product_id
					);
					if (!error) {
						let productCode = _.find(
							standard_products,
							(el) => el.id === item.standard_product_id
						)?.code;
						setConfigurationSaved([
							{
								productID: item.standard_product_id,
								product: productCode,
								configuration: item.configuration.features,
							},
						]);
						setProductKey(item.standard_product_id);
						setProduct(productCode);
						// props.onConfigurationSaved(item.configuration.features);
					}
				}
			}
			if (props.stdValue) {
				let item = _.find(data2, (o) => o.id === props.stdValue);
				setProductKey(item?.id);
				setProduct(item?.code);
				setConfigurationSaved([
					{
						productID: productKey,
						product: item,
						configuration: props.configuration,
					},
				]);
			}
			setOptions(mappedOpts);
			setOptionsStandardProducts(data2);
		} else {
			message.error("Error while searching items");
		}
		setLoading(false);
	};

	// do a call to the api to get the items also text is empty

	useEffect(() => {
		if (!props.itemValue && !props.stdValue) {
			searchItems("");
		}
	}, []);

	const [tempSelected, setTempSelected] = useState(null);

	useEffect(() => {
		if (props.itemValue) {
			searchItems(props.itemValue);
			setLocalValue(props.itemValue);
			setTabEnabled("items");
		}
		if (props.stdValue) {
			searchItems(props.stdValue);
			setLocalValue(props.stdValue);
			setTabEnabled("standard_product");
		}
	}, [props.itemValue, props.stdValue]);

	useEffect(() => {
		if (props.stdValue) {
			setConfigurationSaved([
				{
					productID: props.stdValue,
					product: _.find(
						optionsStandardProducts,
						(o) => o.id === props.stdValue
					)?.code,
					configuration: props.configuration,
				},
			]);
		}
	}, [optionsStandardProducts]);

	return (
		<GroupSelectWithModal
			callBack={searchItemsAutocomplete}
			value={{ value: localValue }}
			name={props?.name}
			setProduct={setProduct}
			setProductKey={setProductKey}
			onChange={(value) => {
				setTempSelected(value?.value);

				if (typeItems === "items") {
					let item = _.find(options, (o) => o.IDitem === value?.value);
					props.onItemChange(value?.value, item?.type, item?.um);
					props.onConfigurationSaved(null);
				} else {
					props.onStdChange(
						value?.value,
						_.find(options, (o) => o.IDitem === value?.value)?.type
					);
				}
			}}
			onSearch={(value) => {
				value.length > 0 && searchItems(value);
			}}
			status={props.status}
			options={options}
			setItemsType={setItemsType}
			optionValue={{ items: "IDitem", standard_products: "id" }}
			optionsStandardProduct={optionsStandardProducts}
			groupBy={{ items: "type" }}
			tabEnabled={tabEnabled}
			optionLabel={{
				items: ["item", "item_desc"],
				standard_products: ["code", "name"],
			}}
			queryLen={queryLen}
			setConfigurationSaved={setConfigurationSaved}
			setProductSelected={setTempSelected}
			toggleConfigurator={() => toggleConfigurator("standard")}
			isloading={loading}
			localValue={localValue}
			setLocalValue={setLocalValue}
			configurationSaved={configurationSaved}
			onTogglePopUp={togglePopup}
			onReset={() => {
				if (props.resetData && _.isFunction(props.resetData)) {
					setLocalValue(null);
					setConfigurationSaved([]);
					props.resetData();
				} else {
					() => {};
				}
			}}
			extras={() => (
				<>
					{popup && (
						<Modal
							open={popup}
							onCancel={togglePopup}
							title='Items'
							width='90%'
							transitionName='ant-modal-slide-up'
							className='modal-fullscreen'
							centered
							maskClosable={false}
							footer={[
								<Button
									key={0}
									onClick={() => {
										togglePopup();
										setTempSelected();
										setTempConfiguration();
									}}
								>
									Close
								</Button>,

								<Button
									key={1}
									type='primary'
									htmlType='submit'
									icon={<IconCheckbox />}
									onClick={() => handleSelection(tempSelected)}
								>
									Select
								</Button>,
							]}
						>
							<ItemTable
								isSplitted={true}
								selectable={true}
								setProduct={setProduct}
								setProductKey={setProductKey}
								onSelect={(value) => {
									setTempSelected(value);
									setSelected(value);
									setTypeConfigurator("modal");
								}}
								selectedData={tempSelected}
								configurationSaved={tempConfiguration || configurationSaved}
								localValue={localValue}
								setTempSelected={setTempSelected}
								setItemsType={setItemsType}
								setDefaultValue={setTempSelected}
								setProductSelected={(val) => {
									setTempSelected(val);
									toggleConfigurator("modal");
								}}
								tempSelected={tempSelected}
								tabEnabled={tabEnabled}
							/>
						</Modal>
					)}
					{modalConfigurator && (
						<Modal
							open={modalConfigurator}
							onCancel={toggleConfigurator}
							title='Standard Product'
							width='50%'
							transitionName='ant-modal-slide-up'
							className='modal-fullscreen'
							centered
							destroyOnClose
							maskClosable={false}
							footer={[
								<Button
									key={0}
									onClick={() => {
										toggleConfigurator("modal");
										setTempSelected();
									}}
								>
									Close
								</Button>,
								<Button
									key={1}
									type='primary'
									htmlType='submit'
									icon={<IconCheckbox />}
									loading={sendData}
									onClick={() => {
										setSendData(true);
										setTempSelected(productKey);
									}}
								>
									Save Configuration
								</Button>,
							]}
						>
							{/* <FocusLock disabled={false}> */}
							<SellerConfigurator
								businessPartners={props.bp}
								productID={productKey}
								setSendData={setSendData}
								productSelected={product}
								sendData={sendData}
								setConfigurationSaved={setTempConfiguration}
								configurationSaved={configurationSaved || tempConfiguration}
								toggleModal={toggleConfigurator}
							/>
							{/* 		</FocusLock> */}
						</Modal>
					)}
				</>
			)}
		/>
	);
};

export default ItemAutocomplete;
