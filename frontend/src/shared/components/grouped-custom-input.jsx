import React from "react";
import {
	Form,
} from "antd";
import {
	CustomInput,
	CustomInputNumber,
	CustomCheckbox,
	CustomSelect,
	CustomSelectProduct,
	CustomMultiLineInput,
} from "./input-seller-configurator";

export const GroupedStandardInput = ({
	row,
	focusValue,
	errors,
	onChange,
	type,
}) => {
	return (
		<Form.List
			name={row.row.code}
			initialValue={[{ value: "" }]}
		>
			{(fields, { add, remove }) => (
				<>
					{fields.map((field, index) => (
						<CustomInput
							changeValue={onChange}
							errors={errors}
							row={row}
							fields={fields}
							field={field}
							index={index}
							add={add}
							type={type}
							remove={remove}
							focusValue={focusValue}
						/>
					))}
				</>
			)}
		</Form.List>
	);
};

export const GroupedMultiLineInput = ({
	row,
	focusValue,
	errors,
	onChange,
}) => {
	return (
		<Form.List
			name={row.row.code}
			initialValue={[{ value: "" }]}
		>
			{(fields, { add, remove }) => (
				<>
					{fields.map((field, index) => (
						<CustomMultiLineInput
							changeValue={onChange}
							errors={errors}
							row={row}
							fields={fields}
							field={field}
							index={index}
							add={add}
							remove={remove}
							focusValue={focusValue}
						/>
					))}
				</>
			)}
		</Form.List>
	);
};

export const GroupedNumberInput = ({
	precision,
	onChange,
	errors,
	row,
	focusValue,
}) => {
	let initialValues = _.isArray(row.row.value)
		? _.map(row.row.value, (o) => {
				return { value: o };
		  })
		: [{ value: row.row.value }];
	return (
		<Form.List
			name={row.row.code}
			initialValue={initialValues}
		>
			{(fields, { add, remove }) => (
				<>
					{fields.map((field, index) => {
						return (
							<CustomInputNumber
								precision={precision}
								changeValue={onChange}
								errors={errors}
								row={row}
								fields={fields}
								field={field}
								index={index}
								add={add}
								remove={remove}
								focusValue={focusValue}
							/>
						);
					})}
				</>
			)}
		</Form.List>
	);
};

export const GroupedCheckboxInput = ({ row, focusValue, errors, onChange }) => {
	let initialValues = _.isArray(row.row.value)
		? _.map(row.row.value, (o) => {
				return { value: o };
		  })
		: [{ value: row.row.value }];
	return (
		<Form.List
			name={row.row.code}
			initialValue={initialValues}
		>
			{(fields, { add, remove }) => (
				<>
					{fields.map((field, index) => {
						return (
							<CustomCheckbox
								changeValue={onChange}
								errors={errors}
								row={row}
								fields={fields}
								field={field}
								index={index}
								add={add}
								remove={remove}
								focusValue={focusValue}
							/>
						);
					})}
				</>
			)}
		</Form.List>
	);
};
export const GroupedSelectInput = ({ row, focusValue, errors, onChange }) => {
	let initialValues = _.isArray(row.row.value)
		? _.map(row.row.value, (o) => {
				return { value: o };
		  })
		: [{ value: row.row.value }];
	return (
		<Form.List
			name={row.row.code}
			initialValue={initialValues}
		>
			{(fields, { add, remove }) => (
				<>
					{fields.map((field, index) => {
						return (
							<CustomSelect
								changeValue={onChange}
								errors={errors}
								row={row}
								fields={fields}
								field={field}
								index={index}
								add={add}
								remove={remove}
								focusValue={focusValue}
							/>
						);
					})}
				</>
			)}
		</Form.List>
	);
};
export const GroupedProductSelectInput = ({
	row,
	focusValue,
	errors,
	onChange,
	form,
}) => {
	let initialValues = _.isArray(row.row.value)
		? _.map(row.row.value, (o) => {
				return { value: o };
		  })
		: [{ value: row.row.value }];

	const handleChange = (code, index, value) => {
		form.setFieldsValue({ [code]: { [index]: value } });
		onChange(code, index, value);
	};

	return (
		<Form.List
			name={row.row.code}
			initialValue={initialValues}
			form={form}
		>
			{(fields, { add, remove }) => (
				<>
					{fields.map((field, index) => {
						return (
							<CustomSelectProduct
								changeValue={(code, index, value) =>
									handleChange(code, index, value)
								}
								errors={errors}
								row={row}
								fields={fields}
								field={field}
								index={index}
								add={add}
								remove={remove}
							/>
						);
					})}
				</>
			)}
		</Form.List>
	);
};
