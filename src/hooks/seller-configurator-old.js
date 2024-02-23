import _, { isArray } from "lodash";

// Retrieve data from the api response, if the commands is set_feature_value return the value of the feature
export function retrieveValueFeature(commands, value) {
	const val = commands
		?.filter((el) => el.cmd === "set_feature_value")
		?.filter((el) => el?.feature === value)?.[0];
	return val?.value || null;
}

// Return if the feature is enabled or not
export function checkIfEnabled(commands, value) {
	const val = _.last(
		commands
			?.filter((el) => el.cmd === "set_feature_enabled")
			?.filter((el) => el?.feature === value)
	);
	return val?.status || false;
}

// Return the options of the feature the params product is to do different logic if it's a product or not (example : could be a dropdown)
export function returnOptions(commands, value, product = false) {
	const val = commands
		?.filter((el) => el.cmd === "set_feature_dataset")
console.log(commands)

	//	?.filter((el) => el?.feature === value)?.[0];
		console.log(val)
	if (!product) {
		const obj = Object.keys(val.dataset).map((key) => ({
			value: key,
			label: val.dataset[key],
		}));
		return obj;
	}
	if (product) {
		const val = commands
			?.filter((el) => el.cmd === "set_feature_dataset")
			?.filter((el) => el?.feature === value)?.[0]?.dataset;
		return val;
	}
	return obj;
}

export function manipolateDataFromApi(data) {
	const command = data.execution.commands;
	const dataManipulation = [];
	data.features.forEach((el) => {
		dataManipulation.push({
			key: el.id,
			code: el.feature_id,
			description: el.feature.label,
			type: el.feature.feature_type_id,
			multiple: el.multiple === "1" ? true : false,
			readonly: el.readonly === "1" ? true : false,
			hidden: el.hidden === "1" ? true : false,
			enabled: checkIfEnabled(command, el.feature_id),
			value: retrieveValueFeature(command, el.feature_id) || true,
			options:
				el.feature.feature_type_id === "dropdown"
					? returnOptions(command, el.feature_id, false)
					: el.feature.feature_type_id === "product"
					? returnOptions(command, el.feature_id, true)
					: null,
		});
	});
	return dataManipulation;
}

// function that reprocess the data from the api response and the commands to display the data in the table
export function dataReprocessing(command, originData) {
	console.log('test', command)
	let tempData = originData;
	let newArray = [];
	const errorToDisplay = command.filter(
		(el) => el.cmd === "set_feature_validity" && el.status === false
	);
	const errorArray = [];
	errorToDisplay.forEach((el) => {
		errorArray.push({ code: el.feature, message: el.message });
	});

	tempData.map((el) => {
		let commandsToExecute = command.filter((el2) => el2.feature === el.code);
		if (commandsToExecute.length === 0) return newArray.push(el);
		commandsToExecute.forEach((el3) => {
			if (el3.cmd === "set_feature_enabled") {
				el["enabled"] = el3.status;
			} else if (el3.cmd === "set_feature_value") {
				el["value"] = el3.status;
			} else if (el3.cmd === "set_feature_dataset") {
				console.log(el3.dataset)
				el["options"] = el3.dataset;
			}
		});
		newArray.push(el);
	});
	console.log(newArray);
	return { errorArray, newArray, command };
}

function getFieldType(originData, code) {
	return originData.filter((el) => el.code === code)?.[0]?.type;
}

export function managmentCommandsValue(commands, form, originData) {
	commands
		.filter((el) => el?.cmd === "set_feature_value")
		?.forEach((el) => {
			const type = getFieldType(originData, el.feature);
			let value = form.getFieldValue(el.feature);
			if (type === "dropdown") {
				if (isArray(el.value)) value = el.value;
				else value = [el.value];
			} else {
				if (isArray(value) && value?.length > 0) value[0].value = el.value;
				else value = el.value;
			}
			form.setFieldsValue({ [el.feature]: value });
		});
}

export function managmentCommandsEnabled(form, originData) {
	// clone origin data to avoid side effects
	const originDataClone = _.cloneDeep(originData);
	// filter the data that was received from the init api call and get the enabled features
	const filteredEnabled = _.map(
		_.filter(originDataClone, (o) => o.enabled),
		"code"
	);

	// take the keys of the form and filter them with the enabled features
	const formValues = form.getFieldsValue(filteredEnabled);
	console.log("keys", formValues);

	// for each key take the value of the form and put it in the configuration object into the correct format
	// if the value is an array it means that the feature is a dropdown and the value is an array of value
	// if the value is not an array it means that the feature is not a dropdown and the value is a single value

	let configuration = {};
	_.each(formValues, (value, key) => {
		let newValue;
		let testCase = _.find(originDataClone, (o) => (o.code = key));
		if (_.isArray(value)) {
			newValue = _.map(value, (o) => {
				if (_.has(o, "value") && o.value !== undefined) {
					return o.value;
				} else {
					return o;
				}
			});
			_.remove(newValue, (o) => {
				return _.isNil(o) || _.isNull(o) || o == "";
			});

			if (!testCase.multiple) {
				newValue = newValue[0];
			}
		} else {
			newValue = value?.value || value;
			if (_.isNil(newValue)) {
				newValue = null;
			}
		}

		configuration[key] = newValue;
		// console.log(configuration);
	});
	// keys.map((el) => {
	// 	const valueTemp = form.getFieldsValue()[el];
	// 	const arrayValue = [];

	// 	if (isArray(valueTemp)) {
	// 		if (valueTemp?.length > 1) {
	// 			if (!!valueTemp[0].value) valueTemp?.map((el) => arrayValue.push(el?.value || el));
	// 			else {
	// 				if (isArray(valueTemp) && valueTemp[0])
	// 					valueTemp?.map((el) => arrayValue.push(el));
	// 				else arrayValue.push(valueTemp);
	// 			}
	// 			return (configuration = { ...configuration, [el]: arrayValue });
	// 		} else {
	// 			return (configuration = {
	// 				...configuration,
	// 				[el]: valueTemp[0]?.value !== undefined ? valueTemp[0].value : valueTemp[0],
	// 			});
	// 		}
	// 	} else {
	// 		if (valueTemp?.value !== undefined) {
	// 			return (configuration = {
	// 				...configuration,
	// 				[el]: valueTemp?.value,
	// 			});
	// 		} else if (valueTemp !== "") {
	// 			return (configuration = {
	// 				...configuration,
	// 				[el]: valueTemp,
	// 			});
	// 		} else {
	// 			return configuration;
	// 		}
	// 	}
	// });
	console.log("conf", configuration);

	// //filter the configuration object to remove the empty values
	// Object.keys(configuration).forEach((key) => {
	// 	if (
	// 		configuration[key] === undefined ||
	// 		configuration[key] === null ||
	// 		configuration[key] === "" ||
	// 		(_.has(configuration[key], "value") && _.isEmpty(configuration[key].value))
	// 	) {
	//     let testCase = _.find(originData, (o) => o.code = key)
	//     if(testCase){
	//       configuration[key] = testCase.multiple ? [] : null
	//     }
	// 	}
	// });

	return configuration;
}
