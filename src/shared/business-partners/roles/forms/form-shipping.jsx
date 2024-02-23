import React, { useState } from "react";
import { Row, Col, Form, Switch } from "antd";
import SelectAddress from "@/shared/addresses/select-address";
import SelectContact from "@/shared/form-fields/select-contact";
import SelectBP from "@/shared/form-fields/bp/select-bp";
import SelectLanguageDoc from "@/shared/form-fields/select-language-doc";
import SelectDeliveryTerm from "@/shared/form-fields/bp/select-delivery-term";

const FormShipping = (props) => {
	const [isActive, setIsActive] = useState(props?.form.getFieldValue("is_shipping"));

	const handleSelectChange = (value, field) => {
		
		props?.form.setFieldValue(field, value);
	  };
	
	return (
		<Row gutter={16}>
			<Col span={24}>
				<Row gutter={16}>
					<Col span={24}>
						<Form.Item
							label="Activate"
							valuePropName="checked"
							name="is_shipping"
							initialValue={false}
							{...props?.errors?.getInputErrors("is_shipping")}
						>
							<Switch
								checked={isActive}
								checkedChildren="Yes"
								unCheckedChildren="No"
								onChange={() => {
									setIsActive(!isActive);
								}}
								rules={[{ required: true }]}
							/>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							label="Address"
							name="shipping_address_id"
							{...props?.errors?.getInputErrors("shipping_address_id")}
						>
							<SelectAddress
								disabled={!isActive}
								onChange={(value) => handleSelectChange(value, "shipping_address_id")}
							/>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							label="Contact"
							name="shipping_contact_id"
							{...props?.errors?.getInputErrors("shipping_contact_id")}
						>
							<SelectContact
								disabled={!isActive}
								onChange={(value) => handleSelectChange(value, 'shipping_contact_id')}
							/>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							label="Terms of Delivery"
							name="shipping_delivery_term_id"
							{...props?.errors?.getInputErrors("shipping_delivery_term_id")}
						>
							<SelectDeliveryTerm disabled={!isActive} />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							label="Language DOC"
							name="shipping_document_language_id"
							{...props?.errors?.getInputErrors("shipping_document_language_id")}
						>
							<SelectLanguageDoc disabled={!isActive} />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							label="Carrier"
							name="shipping_carrier_id"
							{...props?.errors?.getInputErrors("shipping_carrier_id")}
						>
							<SelectBP
								disabled={!isActive}
								onChange={(value) =>{
									if(!value) {
										props?.form.resetFields(["shipping_carrier_id"])	
									}
									props?.form.setFieldValue("shipping_carrier_id", value)
								}}
								filter={{ columns: { is_carrier: { search: { value: 1 } } } }}
							/>
						</Form.Item>
					</Col>
				</Row>
			</Col>
		</Row>
	);
};

export default FormShipping;
