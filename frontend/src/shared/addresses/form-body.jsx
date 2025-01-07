import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { IconTrash, IconAlertCircle, IconPlus } from "@tabler/icons-react";
import {
	Row,
	Col,
	Card,
	Form,
	Input,
	Button,
	message,
	Switch,
	Modal,
	Divider,
	Typography,
	Table,
	Select,
} from "antd";
import PageActions from "@/shared/components/page-actions";
import { useValidationErrors } from "@/hooks/validation-errors";
import SelectNation from "../geo-db/selects/select-country";
import SelectProvince from "../geo-db/selects/select-province";
import SelectCity from "../geo-db/selects/select-city";
import SelectZip from "../geo-db/selects/select-zip";
import {
	createAddress,
	getAddressById,
	updateAddress,
} from "@/api/addresses/addresses";
import _ from "lodash";
import SelectTimezone from "../form-fields/select-timezone";

const { Text } = Typography;
const { confirm } = Modal;

const AddressForm = ({
	id,
	address,
	isModal,
	toggle,
	reload,
	onSave,
	onLoading,
}) => {
	const router = useRouter();

	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);
	const [country, setCountry] = useState(null);
	const [province, setProvince] = useState(null);
	const [city, setCity] = useState(null);
	const [zipCode, setZipCode] = useState(null);

	const validationErrorsBag = useValidationErrors();

	const handleCountryChange = (value) => {
		if (_.isNull(value)) {
			form.resetFields(["nation_id"]);
		}

		if (value !== country) {
			form.resetFields(["province_id", "city_id", "zip_id"]);
		}

		form.setFieldValue("nation_id", value);
		setCountry(value);
	};

	const handleProvinceChange = (value) => {
		if (_.isNull(value)) {
			form.resetFields(["province_id"]);
		}

		if (value !== province) {
			form.resetFields(["city_id", "zip_id"]);
		}

		form.setFieldValue("province_id", value);
		setProvince(value);
	};

	const handleCityChange = (value) => {
		if (_.isNull(value)) {
			form.resetFields(["city_id"]);
		}

		if (value !== city) {
			form.resetFields(["zip_id"]);
		}

		form.setFieldValue("city_id", value);
		setCity(value);
	};

	const handleZipCodeChange = (value) => {
		if (_.isNull(value)) {
			form.resetFields(["zip_id"]);
		}

		form.setFieldValue("zip_id", value);
	};

	useEffect(() => {
		if (router.isReady) {
			setLoading(true);

			if (id && !address) {
				getAddressById(id)
					.then(({ data }) => {
						setCountry(_.get(data, "nation_id"));
						setProvince(_.get(data, "province_id"));
						setCity(_.get(data, "city_id"));
						setZipCode(_.get(data, "zip_id"));
						form.setFieldsValue(data);
					})
					.catch((error) => message.error(error));
			} else {
				setCountry(_.get(address, "nation_id"));
				setProvince(_.get(address, "province_id"));
				setCity(_.get(address, "city_id"));
				setZipCode(_.get(address, "zip_id"));
				form.setFieldsValue(address);
			}
		}
		setLoading(false);
	}, [router.isReady, address?.id]);

	const handleSubmit = async (values) => {
		setLoading(true);
		validationErrorsBag.clear();

		try {
			const { error, data, validationErrors } = id
				? await updateAddress(address.id, values)
				: await createAddress(values);
			if (error) {
				if (validationErrors) {
					validationErrorsBag.setValidationErrors(validationErrors);
				}
				message.error("Error during saving operation");
				setLoading(false);
			} else {
				const successMessage = id
					? "Address updated successfully"
					: "Address created successfully";
				message.success(successMessage);

				if (!isModal) {
					router.push("/addresses");
				} else {
					data ? onSave(data) : onSave();
					reload();
					toggle();
				}
			}
		} catch (error) {
			console.error("An error occurred:", error);
		}
	};

	return (
		<>
			<div className='page-content'>
				<Row gutter={16}>
					<Col span={24}>
						<Form
							layout='vertical'
							form={form}
							name='address-form'
							onFinish={(values) => handleSubmit(values)}
						>
							<Row gutter={16}>
								<Col span={12}>
									<Form.Item
										label='Name'
										name='name'
										{...validationErrorsBag.getInputErrors("name")}
									>
										<Input allowClear />
									</Form.Item>
								</Col>
								<Col span={12}>
									<Form.Item
										label='Country'
										name='nation_id'
										{...validationErrorsBag.getInputErrors("nation_id")}
									>
										<SelectNation
											onChange={(value) => handleCountryChange(value)}
										/>
									</Form.Item>
								</Col>
								<Col span={12}>
									<Form.Item
										label='Province'
										name='province_id'
										{...validationErrorsBag.getInputErrors("province_id")}
									>
										<SelectProvince
											onChange={(value) => handleProvinceChange(value)}
											disabled={!country || !address?.id ? !country : false}
											countryId={country}
										/>
									</Form.Item>
								</Col>
								<Col span={12}>
									<Form.Item
										label='City'
										name='city_id'
										{...validationErrorsBag.getInputErrors("city_id")}
									>
										<SelectCity
											onChange={(value) => handleCityChange(value)}
											disabled={!country || !address?.id ? !country : false}
											countryId={country}
											provId={province}
										/>
									</Form.Item>
								</Col>
								<Col span={12}>
									<Form.Item
										label='Zip code'
										name='zip_id'
										{...validationErrorsBag.getInputErrors("zip_id")}
									>
										<SelectZip
											cityId={city}
											disabled={
												((!city || !province || !country) && address?.id) ||
												!address?.id
													? !country || !city
													: false
											}
											onChange={(value) => handleZipCodeChange(value)}
										/>
									</Form.Item>
								</Col>
								<Col span={12}>
									<Form.Item
										label='Address'
										name='address'
										{...validationErrorsBag.getInputErrors("address")}
									>
										<Input allowClear />
									</Form.Item>
								</Col>
								<Col span={12}>
									<Form.Item
										label='Apartment or unit number'
										name='apartment_unit'
										{...validationErrorsBag.getInputErrors("apartment_unit")}
									>
										<Input allowClear />
									</Form.Item>
								</Col>
								<Col span={12}>
									<Form.Item
										label='Street Number'
										name='street_number'
										{...validationErrorsBag.getInputErrors("street_number")}
									>
										<Input allowClear />
									</Form.Item>
								</Col>
								<Col span={12}>
									<Form.Item
										label='Timezone'
										name='timezone'
										{...validationErrorsBag.getInputErrors("timezone")}
									>
										<SelectTimezone />
									</Form.Item>
								</Col>
							</Row>
						</Form>
					</Col>
				</Row>
			</div>
		</>
	);
};

export default AddressForm;
