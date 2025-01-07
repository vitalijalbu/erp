import React from "react";
import {
	Row,
	Col,
	Form,
	Input,
	Alert,
	Space,
	InputNumber,
	Checkbox,
	Select,
	Flex,
} from "antd";
import AddRemoveIcon from "@/shared/components/add-remove-icon";
import SelectWithModal from "./select-with-modal";

import ModalFeatureTable from "@/shared/configurator/configuration/modal-feature-select-product";
import _ from "lodash";
import SelectWithModalTablefiltered from "./select-with-modal-tablefiltered";

async function validatorFunction(row, errors) {
	const index = errors.findIndex((el) => el.code === row.row.code);
	if (index === -1) return Promise.resolve();
	return Promise.reject(new Error());
}

function returnMessageErrors(errors, code) {
	if (errors.length === 0) return [];
	return errors.filter((el) => el.code === code);
}

function returnValidField(errors, code) {
	if (errors.length === 0) return true;
	return errors.filter((el) => el.code === code).length === 0;
}

export function ErrorAlert({ row, errors }) {
	const errorsArray = returnMessageErrors(errors, row.row.code);
	if (errorsArray.length === 0) return null;
	return (
		<Col
			span={24}
			className='mt-1'
		>
			<Alert
				key={row.row.code}
				message={errorsArray.map((el) => (
					<div key={row.row.code}>{el.message || "Generic Error"}</div>
				))}
				type='error'
			/>
		</Col>
	);
}
export const CustomInput = ({
	field = {},
	fields = [],
	row,
	index = 0,
	add,
	remove,
	focusValue,
	errors,
	changeValue,
	type = "text",
}) => {
	const name = !_.isEmpty(field) ? [field?.name, "value"] : row.row.code;
	const key = !_.isEmpty(field) ? [field?.code, "value"] : row.row.code;
	const [isChanged, setIsChanged] = React.useState(false);
	return (
		<>
			<Space.Compact
				style={{ maxWidth: "100%", display: "flex", marginBottom: 0 }}
			>
				<Form.Item
					style={{ width: "100%", marginBottom: 0 }}
					hidden={row.row.hidden}
					{...field}
					name={name}
					initialValue={null}
					key={key}
					rules={[
						{ validator: async () => await validatorFunction(row, errors) },
					]}
				>
					<Input
						placeholder={row.description}
						id={row.row.code + "__" + index}
						disabled={row.row.readonly}
						readOnly={row.row.readonly}
						aria-readonly={row.row.readonly}
						className='configurator-input'
						style={{
							marginBottom:
								fields.length > 1 && index < fields.length - 1 ? 5 : 0,
							width: "100%",
						}}
						autoFocus={
							focusValue.code === row.row.code && focusValue.index === index
						}
						onChange={() => {
							setIsChanged(true);
						}}
						onKeyDown={(e) => {
							e.stopPropagation();
							if (e.key == "Tab") {
								window.lastFocusedInput = e.target;
								window.lastTabDirection = e.getModifierState("Shift")
									? "up"
									: "down";
							}
						}}
						onBlur={(value) =>
							setTimeout(
								() => {
									if (!isChanged) return;
									changeValue(row.row.code, index, value);
									setIsChanged(false);
								},
								row.row.multiple ? 0 : 0
							)
						}
					/>
				</Form.Item>

				{row.row.multiple && (
					<AddRemoveIcon
						index={index}
						field={field}
						add={add}
						remove={remove}
						multiple={row.row.multiple}
					/>
				)}
			</Space.Compact>
			<ErrorAlert
				row={row}
				errors={errors}
			/>
		</>
	);
};

export const CustomMultiLineInput = ({
	field = {},
	fields = [],
	row,
	index = 0,
	add,
	remove,
	focusValue,
	errors,
	changeValue,
}) => {
	const name = !_.isEmpty(field) ? [field?.name, "value"] : row.row.code;
	const key = !_.isEmpty(field) ? [field?.code, "value"] : row.row.code;
	// console.log('dddddd')
	const [isChanged, setIsChanged] = React.useState(false);
	return (
		<>
			<Space.Compact
				style={{ maxWidth: "100%", display: "flex", marginBottom: 0 }}
			>
				<Form.Item
					style={{ width: "100%", marginBottom: 0 }}
					initialValue={null}
					hidden={row.row.hidden}
					{...field}
					name={name}
					key={key}
					rules={[
						{ validator: async () => await validatorFunction(row, errors) },
					]}
				>
					<Input.TextArea
						placeholder={row.description}
						id={row.row.code + "__" + index}
						disabled={row.row.readonly}
						readOnly={row.row.readonly}
						aria-readonly={row.row.readonly}
						className='configurator-input'
						autoSize
						style={{
							marginBottom:
								fields.length > 1 && index < fields.length - 1 ? 5 : 0,
							width: "100%",
						}}
						autoFocus={
							focusValue.code === row.row.code && focusValue.index === index
						}
						onChange={() => {
							setIsChanged(true);
						}}
						onKeyDown={(e) => {
							e.stopPropagation();
							if (e.key == "Tab") {
								window.lastFocusedInput = e.target;
								window.lastTabDirection = e.getModifierState("Shift")
									? "up"
									: "down";
							}
						}}
						onBlur={(value) =>
							setTimeout(
								() => {
									if (!isChanged) return;
									changeValue(row.row.code, index, value);
									setIsChanged(false);
								},
								row.row.multiple ? 0 : 0
							)
						}
					/>
				</Form.Item>
				{row.row.multiple && (
					<AddRemoveIcon
						index={index}
						field={field}
						add={add}
						remove={remove}
						multiple={row.row.multiple}
						changeValue={changeValue}
						row={row}
					/>
				)}
			</Space.Compact>
			<ErrorAlert
				row={row}
				errors={errors}
			/>
		</>
	);
};

export const CustomInputNumber = ({
	precision,
	field = {},
	fields = [],
	row,
	index = 0,
	add,
	remove,
	focusValue,
	errors,
	changeValue,
}) => {
	// manage autonomus use of component
	const name = !_.isEmpty(field) ? [field?.name, "value"] : row.row.code;
	const key = !_.isEmpty(field) ? [field?.key, "value"] : row.row.code;
	const [isChanged, setIsChanged] = React.useState(false);
	// manage the changes without block the user
	const handleChanges = (value) => {
		if (String(value).includes(".")) {
			changeValue(row.row.code, index, value);
		} else {
			changeValue(row.row.code, index, parseFloat(String(value)));
		}
	};

	return (
		<>
			<Space.Compact
				style={{ maxWidth: "100%", display: "flex", marginBottom: 0 }}
			>
				<Form.Item
					style={{ width: "100%", marginBottom: 0 }}
					initialValue={null}
					hidden={row.row.hidden}
					{...field}
					name={name}
					key={key}
					rules={[
						{ validator: async () => await validatorFunction(row, errors) },
					]}
				>
					<InputNumber
						placeholder={row.description}
						className='configurator-input'
						id={row.row.code + "__" + index}
						disabled={row.row.readonly}
						style={{
							marginBottom:
								fields.length > 1 && index < fields.length - 1 ? 5 : 0,
							width: "100%",
						}}
						readOnly={row.row.readonly}
						precision={precision}
						decimalSeparator=','
						/* ={
							focusValue.code === row.row.code && focusValue.index === index
						} */
						// onChange={_.debounce(handleChanges, 2000)}
						onPressEnter={(value) => handleChanges(value)}
						onChange={() => setIsChanged(true)}
						onKeyDown={(e) => {
							e.stopPropagation();
							if (e.key == "Tab") {
								window.lastFocusedInput = e.target;
								window.lastTabDirection = e.getModifierState("Shift")
									? "up"
									: "down";
							}
						}}
						onBlur={(value) =>
							setTimeout(
								() => {
									if (!isChanged) return;
									changeValue(row.row.code, index, value);
									setIsChanged(false);
								},
								row.row.multiple ? 0 : 0
							)
						}
					/>
				</Form.Item>
				{row.row.multiple && (
					<AddRemoveIcon
						index={index}
						field={field}
						add={add}
						remove={remove}
						multiple={row.row.multiple}
					/>
				)}
			</Space.Compact>
			<ErrorAlert
				row={row}
				errors={errors}
			/>
		</>
	);
};

export const CustomCheckbox = ({
	field = {},
	fields = [],
	row,
	index = 0,
	add,
	remove,
	focusValue,
	errors,
	changeValue,
}) => {
	const name = !_.isEmpty(field) ? [field?.name, "value"] : row.row.code;
	const key = !_.isEmpty(field) ? [field?.key, "value"] : row.row.code;
	// console.log("row", row)
	return (
		<>
			{/* <Space.Compact style={{ maxWidth: "100%", display: "flex", marginBottom: 0, justifyContent: 'space-between' }}> */}
			<Flex
				justify='space-between'
				align='center'
				style={{ width: "100%" }}
			>
				<Form.Item
					style={{ marginBottom: 0 }}
					initialValue={false}
					hidden={row.row.hidden}
					name={name}
					key={key}
					valuePropName='checked'
					rules={[
						{ validator: async () => await validatorFunction(row, errors) },
					]}
				>
					<Checkbox
						disabled={!row.row.enabled || row.row.readonly}
						rootClassName='configurator-input'
						autoFocus={
							focusValue.code === row.row.code && focusValue.index === index
						}
						/* 	defaultChecked={false} */
						id={row.row.code + "__" + index}
						className={
							!returnValidField(errors, row.row.code)
								? "error-checkbox"
								: "configuration-input"
						}
						onChange={(e) => {
							changeValue(row.row.code, index, e.target.checked);
						}}
						onKeyDown={(e) => {
							e.stopPropagation();
							if (e.key == "Tab") {
								window.lastFocusedInput = e.target;
								window.lastTabDirection = e.getModifierState("Shift")
									? "up"
									: "down";
							}
						}}
					>
						<span
							style={{
								color: !returnValidField(errors, row.row.code) && "#ff7975",
							}}
						>
							{row.row.description}
						</span>
					</Checkbox>
				</Form.Item>
				{row.row.multiple && (
					<AddRemoveIcon
						index={index}
						field={field}
						add={() => {
							add();
							changeValue(row.row.code, index, false);
						}}
						remove={remove}
						multiple={row.row.multiple}
					/>
				)}
			</Flex>
			{/* </Space.Compact> */}
			<ErrorAlert
				errors={errors}
				row={row}
			/>
		</>
	);
};

export const CustomSelect = ({
	fields = [],
	field = {},
	row,
	index = 0,
	add,
	remove,
	focusValue,
	errors,
	changeValue,
	form = null,
}) => {
	const name = !_.isEmpty(field) ? [field?.name, "value"] : row.row.code;
	const key = !_.isEmpty(field)
		? [field?.key, "value"]
		: [row.row.code, "value"];

	// console.log(row.row.options)
	// const options = _.isArray(row.row.options)
	// 	? row.row.options
	// 	: _.map(row.row.options, (v, k) => {
	// 			return { value: k, label: v };
	// 	  }) || [];
	const [modalStandardProduct, setModalStandardProduct] = React.useState(false);

	const handleSelect = (value) => {
		if (!row.row.multiple) {
			form.setFieldsValue({ [row.row.code]: { value: value } });
		}
		changeValue(row.row.code, index, { value: value });
	};

	const columns = row.row?.options?.columns;

	return (
		<>
			<Row gutter={16}>
				<Col span={24}>
					<Space.Compact
						style={{
							maxWidth: "100%",
							display: "flex",
							marginBottom:
								fields.length > 1 && index < fields.length - 1 ? 5 : 0,
						}}
					>
						<Form.Item
							key={key}
							name={name}
							style={{ marginBottom: 0, width: "100%" }}
							{...field}
							hidden={row.row.hidden}
							rules={[
								{ validator: async () => await validatorFunction(row, errors) },
							]}
						>
							<SelectWithModalTablefiltered
								options={row.row.options || []}
								optionLabel={
									columns?.length > 1
										? [columns?.[0].name, columns?.[1].name]
										: columns?.[0].name
								}
								optionValue={columns?.[0].name}
								autoFocus={
									focusValue?.code === row.row.code &&
									focusValue?.index === index
								}
								onSelect={(val) => {
									console.log("onselect");
									handleSelect(val);
								}}
								onChange={(val) => {
									changeValue(row.row.code, index, val);
								}}
								onTogglePopUp={() => {
									console.log(this);
									setModalStandardProduct(!modalStandardProduct);
								}}
								id={row.row.code + "__" + index}
								className={"configurator-input"}
								title={"Select the standard"}
								onFocus={(e) => {
									window.lastFocusedInput = e.target;
								}}
								/* 			autoFocus={
									focusValue.code === row.row.code && focusValue.index === index
								} */
								/* 								extras={
									<ModalFeatureTable
										selectable={true}
										title={row.row.code}
										onSelect={(val) => {
												handleSelect(val)
										}}
										opened={modalStandardProduct}
										toggle={setModalStandardProduct}
										dataSource={row.row.options || []}
									/>
								}
 */ toggleModal={setModalStandardProduct}
							/>
						</Form.Item>
						{row.row.multiple && (
							<AddRemoveIcon
								index={index}
								field={field}
								add={add}
								remove={remove}
								multiple={row.row.multiple}
							/>
						)}
					</Space.Compact>
				</Col>
			</Row>
			<ErrorAlert
				row={row}
				errors={errors}
			/>
		</>
	);
};

export const CustomSelectProduct = ({
	field = {},
	fields = [],
	row,
	index = 0,
	add,
	remove,
	focusValue,
	errors,
	changeValue,
	form = null,
}) => {
	const name = !_.isEmpty(field) ? [field?.name, "value"] : row.row.code;
	const key = !_.isEmpty(field)
		? [field?.key, "value"]
		: [row.row.code, "value"];
	// const options = _.isArray(row.row.options)
	// 	? row.row.options
	// 	: _.map(row.row.options, (v, k) => {
	// 			return { value: k, label: v };
	// 	  }) || [];
	const [modalStandardProduct, setModalStandardProduct] = React.useState(false);

	const handleSelect = (value) => {
		if (!row.row.multiple) {
			form.setFieldsValue({ [row.row.code]: { value: value } });
		}
		changeValue(row.row.code, index, { value: value });
	};

	const columns = row.row?.options?.columns;
	return (
		<>
			<Row gutter={16}>
				<Col span={24}>
					<Space.Compact
						style={{
							maxWidth: "100%",
							display: "flex",
							marginBottom:
								fields.length > 1 && index < fields.length - 1 ? 5 : 0,
						}}
					>
						<Form.Item
							key={key}
							name={name}
							style={{ marginBottom: 0, width: "100%" }}
							{...field}
							hidden={row.row.hidden}
							rules={[
								{ validator: async () => await validatorFunction(row, errors) },
							]}
						>
							<SelectWithModalTablefiltered
								options={row.row.options || []}
								id={row.row.code + "__" + index}
								className={"configurator-input"}
								optionLabel={
									columns?.length > 1
										? [columns?.[0].name, columns?.[1].name]
										: columns?.[0].name
								}
								optionValue={columns?.[0].name}
								autoFocus={
									focusValue?.code === row.row.code &&
									focusValue?.index === index
								}
								onSelect={(val) => {
									handleSelect(val);
								}}
								onChange={(val) => {
									changeValue(row.row.code, index, val);
								}}
								onTogglePopUp={() => {
									setModalStandardProduct(!modalStandardProduct);
								}}
								title={"Select the standard"}
								onFocus={(e) => {
									window.lastFocusedInput = e.target;
								}}
								// placeHolder={'Select Product'}
								/* 								extras={
									<ModalFeatureTable
										selectable={true}
										title={row.row.code}
										onSelect={(val) => {
												handleSelect(val)
										}}
										opened={modalStandardProduct}
										toggle={setModalStandardProduct}
										dataSource={row.row.options || []}
									/>
								}
 */ toggleModal={setModalStandardProduct}
							/>
						</Form.Item>
						{row.row.multiple && (
							<AddRemoveIcon
								index={index}
								field={field}
								add={add}
								remove={remove}
								multiple={row.row.multiple}
							/>
						)}
					</Space.Compact>
				</Col>
			</Row>
			<ErrorAlert
				row={row}
				errors={errors}
			/>
		</>
	);
};
