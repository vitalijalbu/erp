import React, { useState, useCallback, useEffect } from "react";
import UserPermissions from "@/policy/ability";
import * as dayjs from "dayjs";
import { useRouter } from "next/router";
import { getItemById } from "@/api/items";
import { getLastTransactionsBySupplier } from "@/api/transactions";
import { updateLotText } from "@/api/lots";
import { confirmReceiptPurchase } from "@/api/receipts";
import { useValidationErrors } from "@/hooks/validation-errors";
import {
    Form,
    Input,
    Switch,
    DatePicker,
    Space,
    Tag,
    Card,
    Drawer,
    Row,
    Col,
    Table,
    Button,
    Typography,
    Divider,
    message
} from "antd";
const { Text } = Typography;
const { TextArea } = Input;
import PageActions from "@/shared/components/page-actions";
import { IconPencilMinus, IconTransferIn } from "@tabler/icons-react";
import WarehouseSelect from "@/shared/form-fields/warehouse-select";
import DynamicDimensions from "@/shared/form-fields/dynamic-dimensions";
import { printLabelsPdf } from "@/api/print";
import { useExport } from "@/hooks/download";


const View = (props) => {
    //Set page permissions
    if (!UserPermissions.authorizePage("items_receipts.management")) {
        return false;
    }
    const router = useRouter();
    const { idItem, idBP } = router.query;

    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({});
    const [transactions, setTransactions] = useState([]);
    const validationErrorsBag = useValidationErrors();
    const [popup, setPopup] = useState(false);
    const [selected, setSelected] = useState(null);

    const togglePopup = (record) => {
        if (record) {
            setSelected(record);
        } else {
            setSelected(null);
        }
        setPopup(!popup);
    };
    //data callback
    const getTransactionsCallback = useCallback(() => {
        setLoading(true);
        getLastTransactionsBySupplier({ idItem, idBP })
          .then(({ data, error }) => {
            if (!error) {
              setTransactions(data || []);
            } else {
              message.error("An error occurred while fetching transactions");
            }
          })
          .finally(() => {
            setLoading(false);
          });
      }, [idItem, idBP]);
      

    const getItemCallback = useCallback(() => {
        setLoading(true);
        getItemById(idItem)
            .then(({ data }) => {
                setData(data);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [idItem, idBP]);

    const printLabel = async (transaction) => {
        setLoading(true);
        const { data, error } = await printLabelsPdf([transaction.IDlot]);
        if (!error) {
            useExport(data, `label_${transaction.IDlot}.pdf`);
        }
        else {
            message.error("Error during label pdf generation");
        }
        setLoading(false);
    }

    // Query API here
    useEffect(() => {
        if (router.isReady) {
            getItemCallback();
            getTransactionsCallback();
        }
    }, [idItem, idBP, router.isReady]);

    // Action Form Submit
    const handleSubmit = async (values) => {
        setLoading(true);
        const body = {
            ...values,
            idItem,
            idBP,
            lotDate: values?.lotDate?.format("YYYY-MM-DD"),
        };
        validationErrorsBag.clear();
        const { status, error, validationErrors } = await confirmReceiptPurchase(body);
        if (error) {
            if (validationErrors) {
                validationErrorsBag.setValidationErrors(validationErrors);
            }
            message.error("Error during saving operation");
        } else {
            message.success("Success confirmed");
            form.resetFields();
            getItemCallback();
            getTransactionsCallback();
            //router.push("/receipts/purchased");
        }

        setLoading(false);
    };

    const tableColumns = [
        {
            title: "Ref. order",
            key: "ord_rif",
            render: ({ ord_rif }) => <Text copyable>{ord_rif}</Text>,
        },
        {
            title: "Supplier Lot Number",
            key: "IDlot_fornitore",
            dataIndex: ["lot"],
            render: ({ IDlot_fornitore }) => <Text copyable>{IDlot_fornitore}</Text>,
        },
        {
            title: "Lot",
            key: "IDlot",
            render: ({ IDlot }) => <Text>{IDlot}</Text>,
        },
        {
            title: "Lot date",
            key: "lot_date_ins",
            render: ({ lot_date_ins }) => dayjs(lot_date_ins).format("YYYY-MM-DD"),
        },
        {
            title: "Warehouse",
            dataIndex: ["warehouse_location", "warehouse", "desc"],
            key: "warehouse",
            render: (desc) => <Text>{desc}</Text>,
        },
        {
            title: "Location",
            key: "warehouse_location",
            dataIndex: ["warehouse_location", "desc"],
        },
        {
            title: "Dimension (mm)",
            key: "dimensions",
            dataIndex: "dimensions",
        },
        {
            title: "Eur1",
            key: "eur1",
            render: ({ lot }) => <Tag color={lot.eur1 == 1 ? "green" : null}>{lot.eur1 == 1 ? "Yes" : "No"}</Tag>,
        },
        {
            title: "Cfg",
            key: "cfg",
            render: ({ lot }) => <Tag color={lot.conf_item == 1 ? "green" : null}>{lot.conf_item == 1 ? "Yes" : "No"}</Tag>,
        },
        {
            title: "Notes",
            key: "note",
            dataIndex: ["lot", "note"],
        },
        {
            title: "Actions",
            key: "actions",
            align: "right",
            className: "table-actions",
            render: (text, record) => 
                <Space>
                    <Button loading={loading} title="Print label" onClick={() => printLabel(record)}>Label</Button>
                    <Button icon={<IconPencilMinus />} onClick={() => togglePopup(record)} />
                </Space>
                
        },
    ];
    return (
        <>
            {popup && (
                <DrawerUpdate opened={popup} toggle={togglePopup} data={selected} reload={getTransactionsCallback} />
            )}
            <div className="page">
                <PageActions
                    backUrl={`/receipts/purchased/items?idBP=${idBP}`}
                    title={<>Receipt for <mark>{data?.item} - {data?.item_desc}</mark></>}
                />
                <div className="page-content">
                    <Row>
                        <Col span={24} className="mb-1">
                            <Table
                                columns={tableColumns}
                                dataSource={transactions}
                                pagination={{ hideOnSinglePage: true }}
                            />
                        </Col>
                        <Divider />
                        <Col span={24} className="mt-1">
                            <Card title="Confirm reception">
                                <Form layout="vertical" onFinish={handleSubmit} form={form}>
                                    <Row gutter={16}>
                                        <Col span="12">
                                            <Form.Item
                                                name="ordRiferimento"
                                                label="Reference order"
                                                {...validationErrorsBag.getInputErrors("ordRiferimento")}
                                            >
                                                <Input allowClear/>
                                            </Form.Item>
                                            <Form.Item
                                                name="lotFornitore"
                                                label="Supplier Lot Number"
                                                {...validationErrorsBag.getInputErrors("lotFornitore")}
                                            >
                                                <Input allowClear/>
                                            </Form.Item>
                                            <Form.Item
                                                name="deliveryNote"
                                                label="Delivery notes"
                                                {...validationErrorsBag.getInputErrors("deliveryNote")}
                                            >
                                                <TextArea rows="6" allowClear />
                                            </Form.Item>
                                            <Form.Item 
                                                name="eur1" 
                                                label="Eur1 ?"
                                                {...validationErrorsBag.getInputErrors("eur1")}
                                            >
                                                <Switch checkedChildren="Yes" unCheckedChildren="No" />
                                            </Form.Item>
                                            <Form.Item 
                                                name="confItem" 
                                                label="Cfg ?"
                                                {...validationErrorsBag.getInputErrors("confItem")}
                                            >
                                                <Switch checkedChildren="Yes" unCheckedChildren="No" />
                                            </Form.Item>
                                        </Col>
                                        <Col span="12">
                                        <DynamicDimensions um={data?.um} validationErrors={validationErrorsBag} />
                                            <Form.Item 
                                                name="lotDate" 
                                                label="Lot date" 
                                                {...validationErrorsBag.getInputErrors("lotDate")}
                                            >
                                                <DatePicker allowClear format="YYYY-MM-DD" />
                                            </Form.Item>

                                            <WarehouseSelect onChange={form.setFieldsValue} validationErrors={validationErrorsBag}/>
                                        </Col>
                                    </Row>
                                    <Divider />
                                    <Form.Item>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            loading={loading}
                                            icon={<IconTransferIn />}
                                        >
                                            Confirm reception
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </div>
        </>
    );
};

export default View;

//=============================================================================
// Component Addon Drawer
//=============================================================================

const DrawerUpdate = ({ opened, toggle, data, reload }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const validationErrorsBag = useValidationErrors();

    // Action Issue Materials
    const handleSubmit = async (values) => {
        setLoading(true);
        const { status, error, validationErrors } = await updateLotText(data?.IDlot, values);
        if (error) {
            if (validationErrors) {
                validationErrorsBag.setValidationErrors(validationErrors);
            }
            message.error("Error during saving operation");
        } else {
            message.success("Success updated");
            toggle();
            setLoading(false);
            reload();
        }
    };

    // Set data form value
    useEffect(() => {
        if (data) {
            form.setFieldsValue({
                ordRef: data?.lot?.ord_rif,
                note: data?.lot?.note,
            });
        }
    }, []);

    return (
        <Drawer open={opened} width={600} onClose={toggle} title={`Update Lot text #${data?.IDlot}`}>
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Form.Item name="ordRef" label="Order ref.">
                    <Input allowClear/>
                </Form.Item>
                <Form.Item name="note" label="Lot text">
                    <TextArea rows="6" allowClear />
                </Form.Item>
                <Row>
                    <Col span={24}>
                        <Space wrap className="footer-actions">
                            <Button onClick={toggle}>Close</Button>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                Update
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Form>
        </Drawer>
    );
};
