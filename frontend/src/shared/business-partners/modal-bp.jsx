import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Row, Col, Form, Button, message, Tabs, Alert, Modal, Flex, Typography } from "antd";
const { Title } = Typography;
import PageActions from "@/shared/components/page-actions";
import { getBPById, createBP, updateBP } from "@/lib/api/bp";
import { useValidationErrors } from "@/hooks/validation-errors";
import _ from "lodash";
import TabContacts from "./tab-contacts";
import TabDetails from "./tab-details";
import TabRoles from "./tab-roles";
import TabAddresses from "./tab-addresses";
import { IconAlertTriangle } from "@tabler/icons-react";
import LastActivity from "@/shared/users/last-activity";
import { parseBool } from "@/hooks/formatter";
import TabBanks from "./tab-banks";


const ModalBp = (props) => {
    const { opened, toggle, dataParent, reloadParent, onSave } = props;
    // const router = useRouter();
    // const { id } = router.query;

	const [form] = Form.useForm();
	const formBody = Form.useWatch([], { form, preserve: true });
	const [loading, setLoading] = useState(false);
	const [loadingAction, setLoadingAction] = useState(false);
	const [reload, setReload] = useState(0);
	const [data, setBPData] = useState({});
	const [bankAccounts, setBankAccounts] = useState([]);
	const [contactsArray, setContactsArray] = useState([]);
	const [addressArray, setAddressArray] = useState([]);
	const [pivotAddresses, setPivotAddresses] = useState(null);
	const [pivotContacts, setPivotContacts] = useState(null);
	const [isFormChanged, setIsFormChanged] = useState(false);
	const [isBpBlocked, setIsBpBlocked] = useState(false);
	const validationErrorsBag = useValidationErrors();
	const [activeTab, setActiveTab] = useState("details");
	const [tabErrors, setTabErrors] = useState([]);
	const [roles, setRoles] = useState({});

    // Function to handle role change
    const handleRoleChange = (values) => {
        // Merge the existing roles with the new values and update the state
        const updatedRoles = _.merge({}, roles, values);
        setRoles(updatedRoles);
    };

    // Function to update the state in the parent component
    const updateBankAccounts = (rows) => {
        setBankAccounts(rows);
    };

    // Function to update the state in the parent component
    const updatePivotsAddresses = (rows) => {
        setPivotAddresses(rows);
    };

    // Function to update the state in the parent component
    const updatePivotsContacts = (rows) => {
        setPivotContacts(rows);
    };

    // Submit BP form
    const handleSubmit = async () => {
        let response; // Declare response outside the try-catch block
        setLoading(true);
        try {
            validationErrorsBag.clear();

            // Extract contactsArray and pivotAddresses outside the try block
            const updatedValues = {
                ...formBody,
                contacts: pivotContacts || [],
                addresses: pivotAddresses || [],
                bank_accounts: bankAccounts || [],
            };

            if (dataParent?.id) {
                response = await updateBP(dataParent?.id, updatedValues);
            } else {
                response = await createBP(updatedValues);
            }

            const { error, data, validationErrors, errorMsg } = response;

            if (error) {
                if (validationErrors) {
                    validationErrorsBag.setValidationErrors(validationErrors);
                    constructErrorsTab(validationErrors);
                    setLoading(false);
                    setLoading(false);
                }
                message.error(errorMsg);
            } else {
                message.success("Business Partner saved successfully");
                setReload(reload + 1);
                toggle();
                reloadParent();
                response.data ? onSave(response.data) : onSave();
               // setActiveTab("details");
                setLoading(true);
                setTabErrors(null);
                setIsFormChanged(false);
                setTabErrors([]);
                setLoading(false);
            }
        } catch (error) {
            // Handle unexpected errors
            console.error("An unexpected error occurred:", error);
            message.error("An unexpected error occurred");
        } finally {
            // Only set loading to false if there is no error
            if (!response || !response.error) {
                setLoading(false);
                setLoading(false);
            }
        }
    };

    // Get BP details
    useEffect(() => {
       
            setLoading(true);
            let formattedData;

            // Get ID BP and set data state
            if (dataParent) {
				(async () => {
					const { data, error } = await getBPById(dataParent?.id);
					if (!error) {
						// Set state contacts required here
						setAddressArray(data?.addresses);
						setContactsArray(data?.contacts);
						setBankAccounts(data?.bank_accounts);
						// Set form values
						const formattedData = {
							desc: data?.desc,
							customer: parseBool(data?.customer),
							supplier: parseBool(data?.supplier),
							is_blocked: parseBool(data?.is_blocked),
							is_active: parseBool(data?.is_active),
							is_carrier: parseBool(data?.is_carrier),
							bp_category_id: data?.bp_category_id,
							address: data?.address,
							main_contact: data?.main_contact,
							language: data?.language,
							currency_id: data?.currency_id,
							business_registry_registration: data?.business_registry_registration,
							vat: data?.vat,
							notes: data?.notes,
							// Roles - Sales
							is_sales: parseBool(data?.is_sales),
							sales_order_type_id: data?.sales_order_type_id ?? null,
							sales_document_language_id: data?.sales_document_language_id ?? null,
							sales_currency_id: data?.sales_currency_id ?? null,
							sales_address_id: data?.sales_address_id ?? null,
							sales_contact_id: data?.sales_contact_id ?? null,
							sales_has_chiorino_stamp: parseBool(data?.sales_has_chiorino_stamp), //data?.has_stamp ?? null,
							naics_l1: data?.naics_l1 ?? null,
							naics_l2: data?.naics_l2 ?? null,
							naics_l3: data?.naics_l3 ?? null,
							sales_internal_contact_id: data?.sales_internal_contact_id ?? null,
							sales_external_contact_id: data?.sales_external_contact_id ?? null,
							// Roles - Invoice
							is_invoice: parseBool(data?.is_invoice),
							invoice_address_id: data?.invoice_address_id ?? null,
							invoice_contact_id: data?.invoice_contact_id ?? null,
							invoice_payment_term_id: data?.invoice_payment_term_id ?? null,
							invoice_payment_method_id: data?.invoice_payment_method_id ?? null,
							invoice_shipping_method_id: data?.invoice_shipping_method_id ?? null,
							invoice_document_language_id:
								data?.invoice_document_language_id ?? null,
							// Roles - Shipping
							is_shipping: parseBool(data?.is_shipping),
							shipping_address_id: data?.shipping_address_id ?? null,
							shipping_contact_id: data?.shipping_contact_id ?? null,
							shipping_carrier_id: data?.shipping_carrier_id ?? null,
							shipping_document_language_id:
								data?.shipping_document_language_id ?? null,
							shipping_delivery_term_id: data?.shipping_delivery_term_id ?? null,
							// Roles - Purchase
							is_purchase: parseBool(data?.is_purchase),
							purchase_address_id: data?.purchase_address_id ?? null,
							purchase_contact_id: data?.purchase_contact_id ?? null,
							purchase_currency_id: data?.purchase_currency_id ?? null,
							purchase_payment_term_id: data?.purchase_payment_term_id ?? null,
							purchase_payment_method_id: data?.purchase_payment_method_id ?? null,
							purchase_document_language_id:
							data?.purchase_document_language_id ?? null,
						};
						
						//set static data to pass everything between tabs
						setBPData(data);
						setIsBpBlocked(formattedData.is_blocked)
						// set default form values
						form.setFieldsValue(formattedData);
						
					}
					setLoading(false);
                    setIsFormChanged(false);
				})();
			} else {
				// Static FALSE for all switch form fields if create page
				const formattedData = {
					is_sales: false,
					is_invoice: false,
					is_shipping: false,
					is_purchase: false,
				};
				// set default form values
				form.setFieldsValue(formattedData);
				setLoading(false);
                setIsFormChanged(false);
			}
    }, [reload, dataParent]);

	// Function to construct tab errors
	const constructErrorsTab = (validationErrors) => {
        // Clear previous errors
        setTabErrors([]);
      
        // Check if any of the specified conditions are met using Lodash's _.some
        if (_.some(["currency_id", "bp_category_id"], (key) => _.has(validationErrors, key))) {
          setTabErrors((prevTabs) => [...prevTabs, "details"]);
        }
      
        if (
          _.some(
            ["is_invoice", "is_purchase", "is_shipping", "purchases", "supplier"],
            (key) => _.has(validationErrors, key)
          )
        ) {
          setTabErrors((prevTabs) => [...prevTabs, "roles"]);
        }
      
        if (_.has(validationErrors, "address")) {
          setTabErrors((prevTabs) => [...prevTabs, "addresses"]);
        }
      
        if (_.has(validationErrors, "contacts")) {
          setTabErrors((prevTabs) => [...prevTabs, "contacts"]);
        }
      
        if (
          _.some(
            ["bank_accounts.0.iban", "bank_accounts.1.iban"],
            (key) => _.has(validationErrors, key)
          )
        ) {
          setTabErrors((prevTabs) => [...prevTabs, "bank_accounts"]);
        }
      };
      

	// Define tabs items
	const items = [
		{
			label: (
				<Button
					type="text"
					danger={tabErrors.includes("details")}
					icon={tabErrors.includes("details") && <IconAlertTriangle/>}
				>
					General information
				</Button>
			),
			key: "details",
			default: true,
			children: (
				<TabDetails
					changesWatcher={() => setIsFormChanged(true)}
					data={data}
					form={form}
					errors={validationErrorsBag}
					// addressRemove={() => {
					// 	// form.resetFields(['address', 'address_id'])
					// 	// formBody.address = {}
					// 	// formBody.address_id = null
					// 	}}
				/>
			),
		},
		{
			label: (
				<Button
					type="text"
					danger={tabErrors.includes("contacts")}
					icon={tabErrors.includes("contacts") && <IconAlertTriangle/>}
				>
					Contacts
				</Button>
			),
			key: "contacts",
			children: (
				<TabContacts
					errors={validationErrorsBag}
					data={data?.contacts}
					changesWatcher={() => setIsFormChanged(true)}
					onChange={(rows) => updatePivotsContacts(rows)}
				/>
			),
		},
		{
			label: (
				<Button
					type="text"
					danger={tabErrors.includes("addresses")}
					icon={tabErrors.includes("addresses") && <IconAlertTriangle/>}
				>
					Addresses
				</Button>
			),
			key: "addresses",
			children: (
				<TabAddresses
					errors={validationErrorsBag}
					data={data?.addresses}
					changesWatcher={() => setIsFormChanged(true)}
					onChange={(rows) => updatePivotsAddresses(rows)}
				/>
			),
		},
		{
			label: (
				<Button
					type="text"
					danger={tabErrors.includes("roles")}
					icon={tabErrors.includes("roles") && <IconAlertTriangle/>}
				>
					Roles
				</Button>
			),
			key: "roles",
			children: (
				<TabRoles
					errors={validationErrorsBag}
					data={data}
					form={form}
					changesWatcher={() => setIsFormChanged(true)}
					onChange={(values) => handleRoleChange(values)}
				/>
			),
		},
		{
			label: (
				<Button
					type="text"
					danger={tabErrors.includes("bank_accounts")}
					icon={tabErrors.includes("bank_accounts") && <IconAlertTriangle/>}
				>
					Bank accounts
				</Button>
			),
			key: "bank_accounts",
			children: (
				<TabBanks
					errors={validationErrorsBag}
					data={data?.bank_accounts}
					changesWatcher={() => setIsFormChanged(true)}
					onChange={(rows) => updateBankAccounts(rows)}
				/>
			),
		},
	];


    return (
        <>
            <Modal
                open={opened}
                onCancel={toggle}
                width="90%"
                transitionName="ant-modal-slide-up"
                className="modal-fullscreen"
                title={
                    dataParent?.id ? (
                        <>
                            Edit Business Partner - <mark>{data?.desc}</mark>
                        </>
                    ) : (
                        "Add new Business Partner"
                    )
                }
                centered
                maskClosable={false}
                footer={[
                    <Button key={0} onClick={toggle}>
                        Close
                    </Button>,
                    <Button
                        disabled={!isFormChanged}
                        key={1}
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        form="form-bp"
                        //onClick={() => handleSubmit()}
                    >
                        Save
                    </Button>,
                ]}
            >
                    {isFormChanged && (
                        <Alert
                            message="The form has changes. please save before move away."
                            type="warning"
							className="mb-1"
                            showIcon
                        />
                    )}
                <div className="page-content">
                    <Row gutter={16}>
                        <Col span={24}>
                            <Flex justify="space-between">
                                <Title level={5}>Details</Title>
                               <div>
                                    {data && (
                                        <LastActivity
                                            data={{
                                                last_modification: data.last_modification || {},
                                                creation: data.creation || {},
                                            }}
                                            title={data.desc}
                                        />
                                    )}
                                    </div>
                            </Flex>
                                 <Form
									layout="vertical"
									name="form-bp"
									initialValues={data}
									//disabled={isBpBlocked}
									form={form}
									onFinish={handleSubmit}
									onValuesChange={() => setIsFormChanged(true)}
								>
                                    <Tabs
                                        tabPosition="top"
                                        activeKey={activeTab}
                                        defaultActiveKey="details"
                                        onChange={setActiveTab}
                                        items={items}
                                    />
                                </Form>
                        </Col>
                    </Row>
                </div>


            </Modal>

        </>
    );
};

export default ModalBp;
