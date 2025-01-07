import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import { getItemById, createItem, updateItem } from "@/api/items";
import { Row, Col, Tag, Button, Form, message, Card, Input, Alert, Divider, InputNumber, Space, Switch } from "antd";
import PageActions from "@/shared/components/page-actions";
import { useValidationErrors } from "@/hooks/validation-errors";
//import SelectBP from "@/shared/form-fields/select-bp";
import SelectProductLine from "@/shared/form-fields/items/select-product-line";
import SelectItemSubGroup from "@/shared/form-fields/items/select-item-subgroup";
import Toolbar from "@/shared/items/toolbar";
import SelectItemGroup from "@/shared/form-fields/items/select-item-group";
import SelectUM from "@/shared/form-fields/select-um";
import SelectUMWeight from "@/shared/form-fields/select-um-weights";
import SelectItemType from "../form-fields/items/select-item-type";
import _ from "lodash";
import { parseBool } from "@/hooks/formatter";
//import SelectItemClassification from "@/shared/form-fields/items/select-item-classification";

const values = (props) => {
  const router = useRouter();
  const { id } = router.query;

  const [form] = Form.useForm();
  const validationErrorsBag = useValidationErrors();
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(0);
  const [data, setData] = useState({});
  const [isFormChanged, setIsFormChanged] = useState(false);

  // Define the dependency for the visibility of certain fields
  const typeFieldValue = Form.useWatch("type", form);
  const isProductOrPurchased = typeFieldValue === "product" || typeFieldValue === "purchased";

  // Get BP API
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (router.isReady && id) {
          setLoading(true);

          const { data, error } = await getItemById(id);

          if (error) {
            setLoading(false);
            return;
          }

          if (data?.editable === false) {
            router.push("/items");
            message.error("Item is not editable");
          } else {
            const formattedData = {
              item_desc: data?.item_desc,
              long_description: data?.long_description,
              altv_code: data?.altv_code,
              item_group: data?.item_group,
              item_subgroup: data?.item_subgroup,
              product_line: data?.product_line,
              um: data?.um,
              type: data?.type,
              weight_um: data?.weight_um,
              weight: data?.weight,
              customs_code: data?.customs_code,
              number_of_plies: data?.number_of_plies,
              configurator_only: parseBool(data?.configurator_only),
            };
            setData(data);
            form.setFieldsValue(formattedData);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        router.push(`/items`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router.isReady, reload, id, form]);

  // Form Submit
  const handleSubmit = async (values) => {
    let response; // Declare response outside the try-catch block
    console.log(values)
    setLoading(true);
    try {
      validationErrorsBag.clear();

      if (id) {
        response = await updateItem(id, values);
      } else {
        response = await createItem(values);
      }

      const { data, error, validationErrors, errorMsg } = response;

      if (error) {
        if (validationErrors) {
          validationErrorsBag.setValidationErrors(validationErrors);
          setLoading(false);
        }
        message.error(errorMsg);
      } else {
        message.success("Item saved successfully");
        setReload(reload + 1);
        setLoading(true);
        setIsFormChanged(false);

        if (!id) {
          router.push(`/items/${data?.IDitem}`);
        }
      }
    } catch (error) {
      // Handle unexpected errors
      console.error("An unexpected error occurred:", error);
      message.error("An unexpected error occurred");
    } finally {
      // Only set loading to false if there is no error
      if (!response || !response.error) {
        setLoading(false);
      }
    }
  };

  const handleSelectChange = (value, field) => {
	  form.setFieldValue(field, value);
  };

  return (
		<div className="page">
			<PageActions
				loading={loading}
				backUrl={`/items/${id}`}
				title={
					id ? (
						<>
							Edit Item -{" "}
							<mark>
								{data?.item} - {data?.item_desc}
							</mark>
						</>
					) : (
						"Add new Item"
					)
				}
				extra={[
					<Button
						key="submit"
						htmlType="submit"
						type="primary"
						loading={loading}
						form="form-item"
						disabled={!isFormChanged}
					>
						Save
					</Button>,
				]}
			>
				{id ? <Toolbar /> : null}
				<Alert
					message="Warning"
					description={
						<ul>
							<li>
								Chiorno S.p.A's item family codes isn't permetted (NA,CG,TC,...).
							</li>
							<li>
								In order to create a new item you have to use the families of your
								specific company.
							</li>
							<li>New item codes is managed by the system.</li>
							<li>In case of doubts please send an email to helpdesk@chiorino.com</li>
						</ul>
					}
					type="warning"
					showIcon
					closable
				/>
				{isFormChanged && (
					<Alert
						message="The form has changes. please save before moving away."
						type="warning"
						showIcon
					/>
				)}
			</PageActions>

			<div className="page-content">
				<Row>
					<Col span={24}>
						<Card
							loading={loading}
							className="mb-3"
							title="Item details"
						>
							<Form
								layout="vertical"
								form={form}
								name="form-item"
								onFinish={handleSubmit}
								onValuesChange={() => setIsFormChanged(true)}
							>
								<Row gutter={16}>
									<Col
										lg={8}
										md={12}
										sm={24}
									>
										<Form.Item
											label="Item type"
											name="type"
											initialValue={"product"}
											{...validationErrorsBag.getInputErrors("type")}
										>
											<SelectItemType />
										</Form.Item>
									</Col>
									<Col
										lg={8}
										md={12}
										sm={24}
									>
										<Form.Item
											label="Configurator only?"
											name="configurator_only"
											valuePropName="checked"
											initialValue={false}
											{...validationErrorsBag.getInputErrors(
												"configurator_only"
											)}
										>
											<Switch
												checkedChildren="Yes"
												unCheckedChildren="No"
											/>
										</Form.Item>
									</Col>
								</Row>
								<Row gutter={16}>
									<Col
										lg={8}
										md={8}
										sm={12}
									>
										<Form.Item
											label="Item Description"
											name="item_desc"
											{...validationErrorsBag.getInputErrors("item_desc")}
										>
											<Input
												allowClear
												placeholder="Description example"
											/>
										</Form.Item>
									</Col>
									<Col
										lg={8}
										md={8}
										sm={12}
									>
										<Form.Item
											label="Item Long Description"
											name="long_description"
											{...validationErrorsBag.getInputErrors(
												"long_description"
											)}
										>
											<Input.TextArea
												allowClear
												placeholder="Description example"
												autoSize
											/>
										</Form.Item>
									</Col>
								</Row>
								<Row gutter={16}>
									{!id && (
										<Col
											lg={8}
											md={8}
											sm={12}
										>
											<Form.Item
												label="Product type"
												name="item_group"
												{...validationErrorsBag.getInputErrors(
													"item_group"
												)}
												// trigger="onFocus"
											>
												<SelectItemGroup
													keyName={"item_group"}
													onChange={(value) =>
														handleSelectChange(value, "item_group")
													}
												/>
											</Form.Item>
										</Col>
									)}
									<Col
										lg={8}
										md={8}
										sm={12}
									>
										<Form.Item
											label="Item Group"
											name="item_subgroup"
											{...validationErrorsBag.getInputErrors("item_subgroup")}
										>
											<SelectItemSubGroup
												onChange={(value) =>
													handleSelectChange(value, "item_subgroup")
												}
											/>
										</Form.Item>
									</Col>
									<Col
										lg={8}
										md={8}
										sm={12}
									>
										<Form.Item
											label="Product Line"
											name="product_line"
											{...validationErrorsBag.getInputErrors("product_line")}
										>
											<SelectProductLine
												onChange={(value) =>
													handleSelectChange(value, "product_line")
												}
											/>
										</Form.Item>
									</Col>
								</Row>
								<Divider
									orientation="left"
									orientationMargin="0"
								>
									Additional info
								</Divider>
								<Row gutter={16}>
									<Col
										lg={8}
										md={8}
										sm={12}
									>
										<Form.Item
											label="UM"
											name="um"
											{...validationErrorsBag.getInputErrors("um")}
										>
											<SelectUM />
										</Form.Item>
									</Col>
									{isProductOrPurchased && (
										<>
											<Col
												lg={8}
												md={8}
												sm={12}
											>
												<Form.Item
													label="Weight UM"
													name="weight_um"
													{...validationErrorsBag.getInputErrors(
														"weight_um"
													)}
												>
													<SelectUMWeight />
												</Form.Item>
											</Col>
											<Col
												lg={8}
												md={8}
												sm={12}
											>
												<Form.Item
													label="Weight"
													name="weight"
													{...validationErrorsBag.getInputErrors(
														"weight"
													)}
													initialValue={0}
												>
													<InputNumber
														min={0}
														max={9999999}
													/>
												</Form.Item>
											</Col>
											<Col
												lg={8}
												md={8}
												sm={12}
											>
												<Form.Item
													label="Customs Code"
													name="customs_code"
													{...validationErrorsBag.getInputErrors(
														"customs_code"
													)}
												>
													<Input allowClear />
												</Form.Item>
											</Col>
											<Col
												lg={8}
												md={8}
												sm={12}
											>
												<Form.Item
													label="Number of Plies"
													name="number_of_plies"
													initialValue={"0"}
													{...validationErrorsBag.getInputErrors(
														"number_of_plies"
													)}
												>
													<Input allowClear />
												</Form.Item>
											</Col>
										</>
									)}
								</Row>
								{/*<Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Standard Joint" name="std_joint" {...validationErrorsBag.getInputErrors("std_joint")}>
                      <Select placeholder="Select Standard Joint" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Standard Joint with guides" name="std_joint_guides" {...validationErrorsBag.getInputErrors("std_joint_guides")}>
                      <Select placeholder="Select Standard Joint with guides" />
                    </Form.Item>
                  </Col>
                </Row>
                <Divider orientation="left">Classification</Divider>
                <Row gutter={16}>
                    <Col span={16}>
                      <SelectItemClassification
                        form={form}
                        errors={validationErrorsBag}
                        onRequiredBP={(value) => setRequiredBP(value)}
                      />
                    </Col>
                    {requiredBP === 1 &&
                    (<Col lg={8} md={8} sm={12}>
                      <Form.Item
                        label={<Space>Owner <Tag color="blue">customers</Tag></Space>}
                        name="owner"
                        help={requiredBP === 1 && 'Required'}
                        rules={[{ required: requiredBP === 1 }]}
                        {...validationErrorsBag.getInputErrors("owner")}
                      >
                        <SelectBP
                          // disabled={!requiredBP}
                          onChange={(value) => form.setFieldValue("owner", value)}
                          filter={{ columns: { customer: { search: { value: 1 } } } }}
                        />
                      </Form.Item>
                    </Col>)}
                    </Row>*/}
							</Form>
						</Card>
						<Alert
							showIcon
							message="Item code, example: NA30, MANAGED BY THE SYSTEM"
						/>
					</Col>
				</Row>
			</div>
		</div>
  );
};

export default values;
