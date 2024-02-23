import React, { useState } from "react";
import { Row, Col, Form, Input, Switch } from "antd";
const { TextArea } = Input;
import SelectAddress from "@/shared/addresses/select-address";
import SelectContact from "@/shared/form-fields/select-contact";
import SelectLanguage from "@/shared/form-fields/select-language";
import SelectCurrency from "@/shared/form-fields/select-currency";
import SelectBPCategory from "@/shared/form-fields/bp/select-bp-category";
import UserPermissions from "@/policy/ability";
import SelectBPGroup from "@/shared/form-fields/bp/select-bp-group";

const TabDetails = (props) => {

	const handleAddressChange = (value) => {
		props?.form.setFieldValue("address_id", value);
	  }

	  const handleContactChange = (value) => {
			props?.form.setFieldValue("contact_id", value);
	  }

	return (
		<>
			<Row gutter={16}>
				<Col span={12}>
					<Form.Item
						label="Description"
						name="desc"
						{...props?.errors?.getInputErrors("desc")}
					>
						<Input allowClear />
					</Form.Item>
				</Col>
				<Col span={12}>
					<Form.Item
						label="Business Reg. Number"
						name="business_registry_registration"
						{...props?.errors?.getInputErrors("business_registry_registration")}
					>
						<Input allowClear />
					</Form.Item>
				</Col>
			</Row>
			<Row gutter={16}>
				<Col span={12}>
					<Form.Item
						label="Main Address"
						name="address_id"
						{...props?.errors?.getInputErrors("address_id")}
					>
						<SelectAddress
							onChange={(value) => handleAddressChange(value)
							}
							// onRemove={() => props?.form.resetFields(["address_id", "address"])}
						/>
					</Form.Item>
				</Col>
				<Col span={12}>
					<Form.Item
						label="Category"
						name="bp_category_id"
						{...props?.errors?.getInputErrors("bp_category_id")}
					>
						<SelectBPCategory />
					</Form.Item>
				</Col>
				<Col span={12}>
					<Form.Item
						label="Bp Group"
						name="group_id"
						{...props?.errors?.getInputErrors("group_id")}
					>
						<SelectBPGroup />
					</Form.Item>
				</Col>
				<Col span={6}>
					<Form.Item
						label="VAT"
						name="vat"
						{...props?.errors?.getInputErrors("vat")}
					>
						<Input allowClear />
					</Form.Item>
				</Col>
				<Col span={6}>
					<Form.Item
						label="Main Contact"
						name="contact_id"
						{...props?.errors?.getInputErrors("contact_id")}
					>
						<SelectContact
							onChange={(value) =>handleContactChange(value)}
						/>
					</Form.Item>
				</Col>
				<Col span={6}>
					<Form.Item
						label="Language"
						name="language"
						{...props?.errors?.getInputErrors("language")}
					>
						<SelectLanguage/>
					</Form.Item>
				</Col>
				<Col span={6}>
					<Form.Item
						label="Currency"
						name="currency_id"
						{...props?.errors?.getInputErrors("currency_id")}
					>
						<SelectCurrency setDefault={(value)=> props.form.setFieldValue('currency_id', value)}/>
					</Form.Item>
				</Col>
				<Col span={4}>
					<Form.Item
						label="Is customer ?"
						name="customer"
						valuePropName="checked"
						initialValue={false}
						{...props?.errors?.getInputErrors("customer")}
					>
						<Switch
							checked={props?.form.getFieldValue("customer")}
							checkedChildren="Yes"
							unCheckedChildren="No"
						/>
					</Form.Item>
				</Col>
				<Col span={4}>
					<Form.Item
						label="Is supplier ?"
						name="supplier"
						valuePropName="checked"
						initialValue={false}
						{...props?.errors?.getInputErrors("supplier")}
					>
						<Switch
							checked={props?.form.getFieldValue("supplier")}
							checkedChildren="Yes"
							unCheckedChildren="No"
						/>
					</Form.Item>
				</Col>
				<Col span={4}>
				<Form.Item
						label="Is carrier ?"
						name="is_carrier"
						valuePropName="checked"
						initialValue={false}
						{...props?.errors?.getInputErrors("is_carrier")}
					>
						<Switch
							defaultChecked={false}
							checked={props?.form.getFieldValue("is_carrier")}
							checkedChildren="Yes"
							unCheckedChildren="No"
						/>
					</Form.Item>
				</Col>
				</Row>
				<Row gutter={16}>
				<Col span={4}>
					<Form.Item
						label="Active ?"
						name="is_active"
						valuePropName="checked"
						initialValue={true}
						{...props?.errors?.getInputErrors("is_active")}
					>
						<Switch
							checked={props?.form.getFieldValue("is_active")}
							checkedChildren="Yes"
							unCheckedChildren="No"
						/>
					</Form.Item>
				</Col>
				{UserPermissions.can("bp.block") && (
					<Col span={4}>
						<Form.Item
							label="Is blocked ?"
							name="is_blocked"
							valuePropName="checked"
							initialValue={false}
							{...props?.errors?.getInputErrors("is_blocked")}
						>
							<Switch
								defaultChecked={false}
								checked={props?.form.getFieldValue("is_blocked")}
								checkedChildren="Yes"
								unCheckedChildren="No"
							/>
						</Form.Item>
					</Col>
				)}
			</Row>
			<Row gutter={16}>
				<Col span={24}>
					<Form.Item
						label="Notes"
						name="notes"
						{...props?.errors?.getInputErrors("notes")}
					>
						<TextArea
							rows={6}
							allowClear
						/>
					</Form.Item>
				</Col>
			</Row>
		</>
	);
};

export default TabDetails;
