import React, { useEffect, useState, useLayoutEffect, useRef } from "react";
import { Form, Table, Modal, Card, notification, Button, message } from "antd";
import {
	managmentCommandsEnabled,
	manipolateDataFromApi,
	dataReprocessing,
	managmentCommandsValue,
} from "@/hooks/seller-configurator";
import {
	eventConfigurator,
	initializeConfigurator,
	completeConfiguration,
} from "@/api/configurator/seller-configurator";
import {
	CustomCheckbox,
	CustomMultiLineInput,
	CustomSelect,
} from "@/shared/components/input-seller-configurator";
import { columnFeaturesSellerConfigurator } from "@/data/column-features-seller-configurator";
import PageActions from "@/shared/components/page-actions";
import {
	GroupedCheckboxInput,
	GroupedMultiLineInput,
	GroupedNumberInput,
	GroupedProductSelectInput,
	GroupedSelectInput,
	GroupedStandardInput,
} from "@/shared/components/grouped-custom-input";
import { CustomSelectProduct } from "@/shared/components/input-seller-configurator";
import {
	CustomInput,
	CustomInputNumber,
} from "@/shared/components/input-seller-configurator";
import { IconTrashX } from "@tabler/icons-react";
import { math } from "blockly/blocks";

const { confirm } = Modal;

const SellerConfigurator = ({
	productSelected,
	businessPartners,
	sendData = false,
	productID,
	setConfigurationSaved,
	configurationSaved,
	setSendData,
	toggleModal,
}) => {
	const [focusValue, setFocusValue] = useState({
		code: "",
		value: "",
		index: -1,
	});
	const [product, setProduct] = useState(null);
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState([]);
	const [featureValue, setFeatureValue] = useState("");
	const [originData, setOriginalData] = useState([]);
	const [form] = Form.useForm();
	const [fieldEdites, setFieldEdited] = useState([]);
	const [intialData, setInitialData] = useState([]);
	// useState for the events call api response (commands)
	const [commands, setCommands] = useState([]);
	// Define table columns for features
	const columns = columnFeaturesSellerConfigurator(RenderElement);
	const [isReidrataed, setIsReidrataed] = useState(false);
	const [isValidConfiguration, setIsValidConfiguration] = useState(false);
	//use effect withe the dependency of the errors, if the errors change set the error in the form
	const [firstRendering, setFirstRendering] = useState(false);

	useEffect(() => {
		if (!firstRendering && originData?.length > 0 && focusValue?.code === "") {
			setTimeout(() => {
				const element = document.querySelectorAll(
					`[id*=${originData[0].code}__0`
				);
				console.log(element, "element");
				element?.[0]?.focus();
			}, 1000);
			setFirstRendering(true);
		}
	}, [originData]);

	useEffect(() => {
		form.validateFields();
		errors?.forEach((el) =>
			form.setFields([
				{ name: el.code, errors: [el.message || "Validation error"] },
			])
		);
	}, [errors]);

	useEffect(() => {
		setProduct(productSelected);
		setIsValidConfiguration(
			!!configurationSaved?.filter((el) => el?.product === productSelected)?.[0]
				?.configuration
		);
	}, [product, productSelected]);

	const completeCallApi = async (features) => {
		try {
			setLoading(true);
			const response = await completeConfiguration({
				product: productSelected,
				bp: businessPartners,
				configuration: configurationSaved?.filter(
					(el) => el?.product === productSelected
				)?.[0]?.configuration,
			});
			sourceDataManipulation({
				features,
				execution: response.data.execution,
			});
			setLoading(false);
		} catch (e) {
			console.log(e);
			setLoading(false);
		}
	};

	const clearConfiguration = () => {
		confirm({
			title: "Are you sure you want to clear the configuration?",
			content: "All the configuration will be lost",
			okText: "Yes",
			okType: "danger",
			cancelText: "No",
			async onOk() {
				try {
					form.resetFields();
					const response = await initializeConfigurator({
						product: productSelected,
						bp: businessPartners,
					});
					if (configurationSaved?.length > 0) reidratateForm();
					else sourceDataManipulation(response.data);
					setLoading(false);
				} catch (e) {
					// console.log(e);
					setLoading(false);
				}
			},
		});
	};

	const reidratateForm = () => {
		const valTempEdited = [];
		if (configurationSaved?.length > 0 && !isReidrataed) {
			const configuration = configurationSaved?.find(
				(el) => el?.product === product
			)?.configuration;
			if (!!configuration) {
				setFieldEdited(Object?.keys(configuration));
				Object?.keys(configuration).forEach((el) => {
					valTempEdited.push(el);
					// if is an array set the value as an array of object with the value
					// console.log(configuration[el],'configuration el')
					if (Array.isArray(configuration[el])) {
						const array = configuration[el].map((el2) => ({ value: el2 }));

						// console.log(array)

						form.setFieldsValue({ [el]: array });
					} else {
						form.setFieldsValue({ [el]: configuration[el] });
					}
				});
				setFieldEdited(_.merge(fieldEdites, valTempEdited));
				setIsReidrataed(true);
			}
		}
	};

	useEffect(() => {
		sendData === true ? saveConfiguration() : null;
	}, [sendData]);

	//take the data from the api and set the original data and the commands in the state
	const sourceDataManipulation = (data, params = "init") => {
		try {
			const command = data.execution?.commands;
			const dataManipulation = manipolateDataFromApi(data);

			setOriginalData(dataManipulation);
			const commands_value = command?.filter(
				(el) => el.cmd === "set_feature_value"
			);

			setCommands(commands_value);
			const valueEditedTemp = [];
			commands_value?.forEach((el) => {
				const code = el.feature;
				if (!fieldEdites.includes(code)) {
					valueEditedTemp.push(code);
				}
			});

			data?.features?.forEach((el) => {
				if (el?.feature?.feature_type_id === "bool") {
					if (!fieldEdites.includes(el?.feature_id)) {
						valueEditedTemp.push(el?.feature_id);
					}
				}
			});

			setFieldEdited(_.merge(fieldEdites, valueEditedTemp));
			return dataManipulation;
		} catch (error) {
			console.log(error);
			setLoading(false);
			return { data: [] };
		}
	};

	async function saveConfiguration() {
		const payload = prepareToSendData();
		const configuration = payload.configuration;
		const responseComplete = await completeConfiguration({
			bp: businessPartners || null,
			configuration,
			product: product,
		});

		if (responseComplete.error) {
			message.error(responseComplete.error.message);
			setSendData(false);
		} else {
			message.success("Configuration saved successfully");
			if (typeof setConfigurationSaved === "function") {
				setConfigurationSaved([
					{
						productID,
						product,
						configuration:
							responseComplete.data.execution.configuration.features,
					},
				]);
				const tempFeaturesEdited = Object.keys(configuration);
				setFieldEdited(_.merge(fieldEdites, tempFeaturesEdited));
				setSendData(false);
				if (typeof toggleModal === "function") {
					toggleModal();
				}
			} else {
				/* 	}
		}  */
				message.error("Configuration not saved, please check the errors");
			}
		}
	}

	const saveStandardFeature = (response) => {
		setInitialData(response.data?.features);
	};

	// use effect to initialize the configurator
	useEffect(() => {
		if (product === null) return;
		const initConfigurator = async (payload) => {
			const response = await initializeConfigurator({
				...payload,
				debug: true,
			});
			sourceDataManipulation(response.data);
			saveStandardFeature(response);
			setLoading(false);
			if (configurationSaved?.[0]?.product === productSelected) {
				completeCallApi(response?.data?.features);
			}
		};
		setLoading(true);
		initConfigurator({
			product: productSelected || "test_vendite",
			bp: businessPartners || null,
		});
		reidratateForm();
	}, [product]);

	function changeValue(code, index, e) {
		if (fieldEdites.indexOf(code) === -1 && !!form.getFieldValue(code)) {
			setFieldEdited([...fieldEdites, code]);
		}
		setFocusValue({ code: code, value: e, index: index });
		setFeatureValue({ code: code, value: e || "" });
	}

	// use effect that do a call api events when i change the value of one feature
	useEffect(() => {
		// console.log('test')
		if (!featureValue) return;
		const makeApiCall = async () => {
			try {
				setLoading(true);
				const payload = prepareToSendData();
				if (payload.configuration == {}) return setLoading(false);
				const response = await eventConfigurator({
					...payload,
					bp: businessPartners || null,
				});

				if (response.error) {
					//exclude cancelled error
					message.error(response.error.message);
				} else {
					const { errorArray, newArray, command, touchedElemet } =
						dataReprocessing(
							response.data.execution.commands,
							originData,
							errors
						);

					let valueTemp;
					valueTemp = !!configurationSaved?.[0]
						? _.merge(
								fieldEdites,
								touchedElemet,
								Object?.keys(
									configurationSaved?.filter(
										(el) => el?.product === product
									)?.[0]?.configuration
								)
						  )
						: fieldEdites;
					touchedElemet?.map((el) => valueTemp.push(el));
					valueTemp = valueTemp.filter(
						(item, index) => valueTemp.indexOf(item) === index
					);

					console.log(touchedElemet);
					setFieldEdited(_.merge(fieldEdites, valueTemp));
					setErrors(errorArray);
					setOriginalData(newArray);
					setCommands(command);
				}
				setLoading(false);
			} catch (e) {
				console.log(e);
				setLoading(false);
			}
			return focusValue;
		};
		makeApiCall().then((res) => {
			const elemet = document.querySelectorAll(
				`[id='${focusValue.code}__${focusValue.index}']`
			);
			elemet?.[0]?.focus();
		});
	}, [featureValue]);

	// function that return the element of the table of the features the type could be 'int','text','bool','dropdown','decimal' or 'product'
	function RenderElement(row) {
		switch (row.row.type) {
			case "text":
				return (
					<>
						{row.row.multiple ? (
							<GroupedStandardInput
								row={row}
								focusValue={focusValue}
								onChange={changeValue}
								errors={errors}
							/>
						) : (
							<CustomInput
								row={row}
								focusValue={focusValue}
								changeValue={changeValue}
								errors={errors}
							/>
						)}
					</>
				);
			case "multiline_text":
				return (
					<>
						{row.row.multiple ? (
							<GroupedMultiLineInput
								row={row}
								focusValue={focusValue}
								onChange={changeValue}
								errors={errors}
							/>
						) : (
							<CustomMultiLineInput
								row={row}
								focusValue={focusValue}
								changeValue={changeValue}
								errors={errors}
							/>
						)}
					</>
				);

			case "decimal":
				return (
					<>
						{row.row.multiple ? (
							<GroupedNumberInput
								row={row}
								focusValue={focusValue}
								onChange={changeValue}
								errors={errors}
								precision={2}
								form={form}
							/>
						) : (
							<CustomInputNumber
								row={row}
								focusValue={focusValue}
								changeValue={changeValue}
								errors={errors}
								precision={2}
								form={form}
							/>
						)}
					</>
				);

			case "int":
				return (
					<>
						{row.row.multiple ? (
							<GroupedNumberInput
								row={row}
								focusValue={focusValue}
								onChange={changeValue}
								errors={errors}
								precision={2}
								form={form}
							/>
						) : (
							<CustomInputNumber
								row={row}
								focusValue={focusValue}
								changeValue={changeValue}
								errors={errors}
								precision={0}
								form={form}
							/>
						)}
					</>
				);
			case "bool":
				return (
					<>
						{row.row.multiple ? (
							<GroupedCheckboxInput
								row={row}
								focusValue={focusValue}
								onChange={changeValue}
								errors={errors}
							/>
						) : (
							<CustomCheckbox
								row={row}
								focusValue={focusValue}
								changeValue={changeValue}
								errors={errors}
								precision={2}
								form={form}
							/>
						)}
					</>
				);

			case "dropdown":
				return (
					<>
						{row.row.multiple ? (
							<GroupedSelectInput
								row={row}
								focusValue={focusValue}
								onChange={changeValue}
								errors={errors}
							/>
						) : (
							<CustomSelect
								changeValue={changeValue}
								errors={errors}
								row={row}
								index={2}
								focusValue={focusValue}
							/>
						)}
					</>
				);
			case "product":
				return (
					<>
						{row.row.multiple ? (
							<GroupedProductSelectInput
								row={row}
								focusValue={focusValue}
								onChange={changeValue}
								errors={errors}
								form={form}
							/>
						) : (
							<CustomSelectProduct
								changeValue={changeValue}
								form={form}
								errors={errors}
								row={row}
								focusValue={focusValue}
							/>
						)}
					</>
				);
			default:
				return null;
		}
	}

	//Function that is dispatched on change of the commands use state,
	//that is received from the events api call
	const [api, contextHolder] = notification.useNotification();

	useEffect(() => {
		if (form.getFieldsValue() == {} || commands.length === 0) return;

		if (configurationSaved?.length > 0) reidratateForm();
		else managmentCommandsValue(commands, form, originData);

		const messageToShow = commands
			.filter((el) => el.cmd === "show_message")
			.map((el) => el.message);
		messageToShow?.forEach((el) =>
			api.warning({
				message: "Attention",
				description: `${el}`,
				placement: "top",
				duration: 0,
			})
		);
	}, [commands]);

	useLayoutEffect(() => {
		async function handleFocus() {
			if (!window.lastFocusedInput) {
				return;
			}

			const node = document.getElementById(window.lastFocusedInput.id);
			if (!node) {
				return () => {};
			}

			if (!node.id) {
				node.id = "temp-id-" + Math.random();
			}
			var closestNode = Array.from(
				document.querySelectorAll(
					".configurator-input:read-write, .configurator-input input:not([readonly])"
				)
			);
			if (!closestNode.length) {
				return;
			}
			var selfNodeIndex = closestNode.indexOf(node);
			if (selfNodeIndex < 0) {
				return;
			}
			if (window.lastTabDirection === "up") {
				closestNode =
					selfNodeIndex == 0
						? closestNode[selfNodeIndex]
						: closestNode[selfNodeIndex - 1];
			} else {
				closestNode =
					selfNodeIndex == closestNode.length - 1
						? closestNode[selfNodeIndex]
						: closestNode[selfNodeIndex + 1];
			}
			if (!closestNode) {
				return;
			}
			/*
			const nodeList = closestNode.querySelectorAll(
				".configurator-input:read-write, .configurator-input input:not([readonly])"
			);
			if (!nodeList.length) {
				return;
			}
			*/
			closestNode.focus();
			window.lastFocusedInput = null;
			/*
			const nodeArray = Array.from(nodeList);
			const nodeIndex = nodeArray.indexOf(node);
			let newIndex = 0;
			if (window.lastTabDirection === "down") {
				newIndex = Math.min(nodeIndex + 2, nodeArray.length - 1);
			} else {
				newIndex = Math.max(nodeIndex, 0);
			}
			const element = document.querySelectorAll(
				`[id='${focusValue.code}__${focusValue.index}']`
			);
			console.log(element);
			
			element?.[0]?.focus();
			*/
		}
		handleFocus();
	}, [originData]);

	//Function that from the actual form prepare the data in the correct format to send to the api
	function prepareToSendData() {
		let configuration = managmentCommandsEnabled(form, originData);
		// console.log(configuration,'test configuration')
		const keysFiltered = Object.keys(configuration).filter((el) =>
			fieldEdites.includes(el)
		);
		configuration = _.pick(configuration, keysFiltered);
		const data = {
			product: product,
			event: "feature_change",
			event_data: {
				feature: focusValue.code,
			},
			configuration,
			debug: true,
		};
		return data;
	}

	return (
		<div className='page'>
			{configurationSaved?.filter((el) => el?.product === productSelected)
				?.length > 0 && (
				<PageActions
					extra={[
						<Button
							type='text'
							danger
							onClick={clearConfiguration}
							icon={<IconTrashX />}
						>
							Clear configuration
						</Button>,
					]}
				/>
			)}
			{contextHolder}
			<Form
				form={form}
				component={false}
			>
				<Card key={1}>
					<Table
						loading={loading}
						dataSource={_.filter(originData, (o) => o.enabled && !o.hidden)}
						columns={columns}
						pagination={false}
						tableLayout='fixed'
					/>
				</Card>
				{/* 	<Button onClick={()=>// console.log(form.getFieldsValue())}>Save</Button> */}
			</Form>
		</div>
	);
};

export default SellerConfigurator;
