import React, { useState } from "react";
import { Row, Col, Form, Switch } from "antd";

import SelectAddress from "@/shared/addresses/select-address";
import SelectContact from "@/shared/form-fields/select-contact";
import SelectNaics from "@/shared/form-fields/select-naics";
import SelectOrderType from "@/shared/form-fields/select-order-type";
import SelectCurrency from "@/shared/form-fields/select-currency";
import SelectLanguageDoc from "@/shared/form-fields/select-language-doc";

const FormSales = (props) => {
	const [isActive, setIsActive] = useState(props?.form.getFieldValue("is_sales"));

	const handleAddressChange = (value) => {
		
		props?.form.setFieldValue("sales_address_id", value);
	};

	const handleContactChange = (value, field) => {
		
		props?.form.setFieldValue(field, value);
	};

	return (
		<Row gutter={16}>
			<Col span={24}>
				<Row gutter={16}>
					<Col span={24}>
						<Form.Item
							label="Activate"
							name="is_sales"
							valuePropName="checked"
							initialValue={false}
							{...props?.errors?.getInputErrors("is_sales")}
						>
							<Switch
								checked={isActive}
								checkedChildren="Yes"
								unCheckedChildren="No"
								onChange={() => {
									setIsActive(!isActive);
								}}
							/>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							label="Address"
							name="sales_address_id"
							{...props?.errors?.getInputErrors("sales_address_id")}
						>
							<SelectAddress
								disabled={!isActive}
								onChange={(value) => handleAddressChange(value)}
							/>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							label="Contact"
							name="sales_contact_id"
							{...props?.errors?.getInputErrors("sales_contact_id")}
						>
							<SelectContact
								disabled={!isActive}
								key={`contact-` + 1}
								onChange={(value) => handleContactChange(value, "sales_contact_id")}
							/>
						</Form.Item>
					</Col>
					<Col span={8}>
						<Form.Item
							label="NAICS Code Level 1"
							name="naics_l1"
							{...props?.errors?.getInputErrors("naics_l1")}
						>
							<SelectNaics
								key={0}
								level={1}
								onChange={(value) => {
									props?.form.setFieldsValue({
										naics_l2: null, // Clear value of the second component
										naics_l3: null, // Clear value of the third component
									});
								}}
								disabled={!isActive}
							/>
						</Form.Item>
					</Col>
					<Col span={8}>
						<Form.Item
							label="NAICS Code Level 2"
							name="naics_l2"
							{...props?.errors?.getInputErrors("naics_l2")}
						>
							<SelectNaics
								key={1}
								level={2}
								onChange={(value) => {
									props?.form.setFieldsValue({
										naics_l3: null, // Clear value of the third component
									});
								}}
								filter={props?.form.getFieldValue("naics_l1")}
								disabled={!isActive || !props?.form.getFieldValue("naics_l1")}
							/>
						</Form.Item>
					</Col>
					<Col span={8}>
						<Form.Item
							label="NAICS Code Level 3"
							name="naics_l3"
							{...props?.errors?.getInputErrors("naics_l3")}
						>
							<SelectNaics
								key={2}
								level={3}
								onChange={(value) => props?.form.setFieldValue("naics_l3", value)}
								filter={props?.form.getFieldValue("naics_l2")}
								disabled={!isActive || !props?.form.getFieldValue("naics_l2")}
							/>
						</Form.Item>
					</Col>

					<Col span={12}>
						<Form.Item
							label="Currency"
							name="sales_currency_id"
							disabled={!isActive}
							{...props?.errors?.getInputErrors("sales_currency_id")}
						>
							<SelectCurrency
								disabled={!isActive}
								setDefault={(value) =>
									props.form.setFieldValue("sales_currency_id", value)
								}
							/>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							label="Default order type"
							name="sales_order_type_id"
							{...props?.errors?.getInputErrors("sales_order_type_id")}
						>
							<SelectOrderType disabled={!isActive} />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							label="Internal Sales Representative"
							name="sales_internal_contact_id"
							{...props?.errors?.getInputErrors("sales_internal_contact_id")}
						>
							<SelectContact
								disabled={!isActive}
								onChange={(value) =>
									handleContactChange(value, "sales_internal_contact_id")
								}
								filter={{ columns: { is_employee: { search: { value: 1 } } } }}
							/>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							label="External Sales Representative"
							name="sales_external_contact_id"
							{...props?.errors?.getInputErrors("sales_external_contact_id")}
						>
							<SelectContact
								key={`contact-` + 2}
								disabled={!isActive}
								onChange={(value) =>
									handleContactChange(value, "sales_external_contact_id")
								}
								filter={{ columns: { is_employee: { search: { value: 1 } } } }}
							/>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							label="Language DOC"
							name="sales_document_language_id"
							{...props?.errors?.getInputErrors("sales_document_language_id")}
						>
							<SelectLanguageDoc disabled={!isActive} />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							label="Has Chiorino stamp?"
							name="sales_has_chiorino_stamp"
							valuePropName="checked"
							initialValue={false}
							{...props?.errors?.getInputErrors("sales_has_chiorino_stamp")}
						>
							<Switch
								checkedChildren="Yes"
								unCheckedChildren="No"
								disabled={!isActive}
								checked={props?.form.getFieldValue("sales_has_chiorino_stamp")}
							/>
						</Form.Item>
					</Col>
				</Row>
			</Col>
		</Row>
	);
};

export default FormSales;
