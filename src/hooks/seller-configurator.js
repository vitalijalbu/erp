import _, { find, isArray } from "lodash";

// Retrieve data from the api response, if the commands is set_feature_value return the value of the feature
export function retrieveValueFeature(commands, value) {
	const val = _.last(
		commands
			?.filter((el) => el.cmd === "set_feature_value")
			?.filter((el) => el?.feature === value)
	);
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
	const val = _.last(
		commands
			?.filter((el) => el.cmd === "set_feature_dataset")
			?.filter((el) => el?.feature === value)
	);
	
	// if (!product) {
	// 		const data= val?.dataset?.data || [{value:'',label:''}]
	// 		const keys = Object.keys(data?.[0]);

	// const obj = data?.map((val) => 
	// 	({
	// 		value: val[keys[0]],
	// 		label: val[keys[1]],
	// 	}));
	// 	return obj;

	// }
	// if (product) {
		// const val = _.last(
		// 	commands
		// 		?.filter((el) => el.cmd === "set_feature_dataset")
		// 		?.filter((el) => el?.feature === value)
		// )?.dataset;
		// console.log('obj val',val?.dataset)
		return val?.dataset
	// // }
	// return obj;
}

export function manipolateDataFromApi(data) {
	console.log(data,'data source manipolate')
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
			value: !!retrieveValueFeature(command, el.feature_id) ? retrieveValueFeature(command, el.feature_id) : el.feature.feature_type_id === "bool" ? false : '',
			options:
				el.feature.feature_type_id === "dropdown"
					? returnOptions(command, el.feature_id, false)
					: el.feature.feature_type_id === "product"
					? returnOptions(command, el.feature_id, true)
					: null,
			
		});
	});
	console.log(dataManipulation)
	return dataManipulation;
}

// function that reprocess the data from the api response and the commands to display the data in the table
export function dataReprocessing(command, originData, errors) {
	// toDo fix errors checking previus errors and set validity true
	const touchedElemet=[]
	let tempData = originData;
	let newArray = [];
	const errorToDisplay = _.filter(command, (o) => {
		return o.cmd === "set_feature_validity";
	});

	let errorArray = _.cloneDeep(errors);
	errorToDisplay.forEach((el) => {
		if (el.status === false) {
			let oldError = _.findIndex(errorArray, (o) => o.code === el.feature);
			if (oldError !== -1) {
				errorArray[oldError]["message"] = el.message;
			} else {
				errorArray.push({ code: el.feature, message: el.message });
			}
		} else {
			_.remove(errorArray, (o) => o.code === el.feature);
		}
	});
	tempData.map((el) => {
		let commandsToExecute = command.filter((el2) => el2.feature === el.code);
		if (commandsToExecute.length === 0) return newArray.push(el);
		commandsToExecute.forEach((el3) => {
			if (el3.cmd === "set_feature_enabled") {
				el["enabled"] = el3.status;
			} else if (el3.cmd === "set_feature_value") {
				touchedElemet.push(el3?.feature)
				el["value"] = el3.value;
			} else if (el3.cmd === "set_feature_dataset") {
				el["options"] = el3.dataset;
			}
		});
		newArray.push(el);
	});
	return { errorArray, newArray, command,touchedElemet };
}

function getFieldType(originData, code) {
	return originData.filter((el) => el.code === code)?.[0]?.type;
}

export function managmentCommandsValue(commands, form, originData) {
	// filtra comandi per setting
	commands
		.filter((el) => el?.cmd === "set_feature_value")
		?.forEach((el) => {
			const multiple = _.find(originData, (o) => o.code === el.feature)?.multiple;
			const type = getFieldType(originData, el.feature);
			let value = form.getFieldValue(el.feature);
			
			if (type === "dropdown") {
				if (isArray(el.value)) value = el.value;
				else value = [el.value];
			} else {
				if (multiple) {
					if (isArray(el.value)) {
						value = _.map(el.value, (o) => {
							return { value: o };
						});
					} else {
						value = [{ value: el.value }];
					}
				} else {
					if (isArray(el.value)) {
						value = el.value[0];
					} else {
						value = el.value;
					}
				}
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
	// console.log("originData", originDataClone);

	// take the keys of the form and filter them with the enabled features
	const formValues = form.getFieldsValue(filteredEnabled);

	// for each key take the value of the form and put it in the configuration object into the correct format
	// if the value is an array it means that the feature is a dropdown and the value is an array of value
	// if the value is not an array it means that the feature is not a dropdown and the value is a single value

	let configuration = {};

	_.forIn(formValues, (value, key) => {
		let newValue;
		let testCase = _.find(originDataClone, (o) => o.code === key);
		if (_.isArray(value)) {
			newValue = _.map(value, (o) => {
				if (_.has(o, "value") ) {
					if (_.isNil(o.value) || _.isNull(o.value) || o.value == "" && o.value !==false) {
						return null;
					}
					return o.value;
				} else {
					return o;
				}
			});
			// replace with null
			// _.remove(newValue, (o) => {
			// 	return _.isNil(o) || _.isNull(o) || o == "";
			// });

			if (!testCase.multiple) {
				newValue = newValue[0];
			}
		} else {
			newValue = _.isObject(value) && "value" in value ? value.value : value;
			if (_.isNil(newValue)) {
				newValue = null;
			}
		}
		
		configuration[key] = newValue;
	});

	// console.log("conf", configuration);

	return configuration;
}
