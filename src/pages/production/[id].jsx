import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import UserPermissions from "@/policy/ability";
import { IconTrash, IconDeviceFloppy, IconPrinter, IconPlus, IconAlertCircle, IconCheck } from "@tabler/icons-react";
import {
    Row,
    Col,
    Card,
    List,
    Form,
    Input,
    Button,
    message,
    Switch,
    Modal,
    Space,
    Typography,
    Table,
    DatePicker,
    Select,
    InputNumber,
    Dropdown,
    Divider,
    Alert
} from "antd";
import PageActions from "@/shared/components/page-actions";
import { getWarehouseById } from "@/api/warehouses";
import {
    getProductionOrderInfo,
    addComponent,
    removeComponent,
    updateOrder,
    confirmOrder
} from "@/api/order-production";
import { useValidationErrors } from "@/hooks/validation-errors";
import { numberFormatter, dateStringToDate } from "@/hooks/formatter";
const { Text } = Typography;
const { confirm } = Modal;

const Production = (props) => {
    //Set page permissions
    if (!UserPermissions.authorizePage("production_order.management")) {
        return false;
    }

    const router = useRouter();
    const { id } = router.query;

    const [loading, setLoading] = useState(false);
    const [lot, setLot] = useState(null);
    const [components, setComponents] = useState([]);
    const [insertedComponents, setInsertedComponents] = useState([]);
    const [form] = Form.useForm();
    const validationErrorsBag = useValidationErrors();
    const [productionForms] = Form.useForm();
    const updateValidationErrorsBag = useValidationErrors();
    const itemsRef = useRef([]);
    const [uncompleted, setUncompleted] = useState(0);
    const [enableConfirm, setEnableConfirm] = useState(true);
    const enableConfirmMessage = useRef([]);
    const [checkDoubleLot, setCheckDoubleLot] = useState(false);

    useEffect(() => {
        if (router.isReady) {
            loadProductionInfo(id);
        }
    }, [router.isReady]);

    const touchFields = (index, field, initial) => {

        const item = itemsRef.current?.[index]?.[field];
        if (item) {
            if (productionForms.getFieldValue([index, field]) == initial) {
                item.classList.remove('touched');
            }
            else {
                item.classList.add('touched');
            }
        }
    }

    const loadProductionInfo = async (lotId) => {
        validationErrorsBag.clear();
        updateValidationErrorsBag.clear();
        const { data, error } = await getProductionOrderInfo(lotId);
        if (!error) {
            setLot({ lotId: lotId, ...data.lotInfo });
            setComponents(data.components.map((c) => ({
                value: c.IDitem,
                label: c.item + ' - ' + c.item_desc
            })));
            setInsertedComponents(data.insertedComponents);

            productionForms.resetFields();
            productionForms.setFieldsValue(data.insertedComponents.map((component) => {
                if (component.auto_lot == 0) {
                    component['method'] = 0;
                }
                if (component.auto_lot == 1) {
                    component['method'] = 1;
                }
                if (component.IDStock === "0") {
                    component['IDStock'] = null;
                }
                if (component['qty'] != null) {
                    component['qty'] = numberFormatter(component['qty']);
                }
                return component;
            }));
            setUncompleted(data.insertedComponents.reduce((accumulator, current) => (
                accumulator + (current['executed'] == 0 ? 1 : 0)
            ), 0))

            enableConfirmMessage.current = [];
            setEnableConfirm(true);
            setCheckDoubleLot(false);
            data.insertedComponents.forEach((component) => {
                if (component['auto_lot'] == 1 && component['qty'] == 0) {
                    setEnableConfirm(false);
                    enableConfirmMessage.current.push(component['item'] + " Automatic lot with 0 quantity");
                }
                if (component['auto_lot'] == 1 && numberFormatter(component['qty']) > numberFormatter(component['qtyOnStock'])) {
                    setEnableConfirm(false);
                    enableConfirmMessage.current.push(component['item'] + " Automatic lot, warehouse quantity not enough");
                }
                if (component['auto_lot'] == 0 && (component['IDStock'] == 0 || component['IDStock'] == null)) {
                    setEnableConfirm(false);
                    enableConfirmMessage.current.push(component['item'] + " Specific lot not selected");
                }
                if (component['auto_lot'] == 0 && component['qty'] == 0) {
                    setEnableConfirm(false);
                    enableConfirmMessage.current.push(component['item'] + " Specific lot selected with 0 quantity");
                }
                if (component['auto_lot'] == 0 && numberFormatter(component['qty']) > numberFormatter(component['qtyOnStockSpecLot']) && component['executed'] == 0) {
                    setEnableConfirm(false);
                    enableConfirmMessage.current.push(component['item'] + " Specific lot selected with warehouse quantity not enough");
                }

                if (component['checkDoubleLotSelection'] != 0) {
                    setCheckDoubleLot(1);
                }
            });

            if (checkDoubleLot) {
                setEnableConfirm(false);
                enableConfirmMessage.current.push("Specific lot selected two times not permitted");
            }
        }
        else {
            message.error(error?.response?.data?.message || "Error during production order data loading");
        }
    }

    const insertNewComponent = async () => {
        setLoading(true);
        validationErrorsBag.clear();
        const { status, error, validationErrors } = await addComponent(lot.lotId, form.getFieldValue('idItem'));
        if (error) {
            if (validationErrors) {
                validationErrorsBag.setValidationErrors(validationErrors);
            }
            message.error(error?.response?.data?.message || "Error during component add");
        }
        else {
            form.setFieldValue('idItem', null);
            message.success("Component added succesfully");
            await loadProductionInfo(lot.lotId);
        }
        setLoading(false);
    }

    const deleteComponent = async (record) => {
        confirm({
            title: 'Attention',
            content: 'Do you want to delete this component?',
            transitionName: "ant-modal-slide-up",
            async onOk() {
                setLoading(true);
                const { status, error } = await removeComponent(record.IDcomp);
                if (!error) {
                    message.success("Component removed succesfully");
                    await loadProductionInfo(lot.lotId);
                }
                else {
                    message.error(error?.response?.data?.message || "Error during component deleting");
                }
                setLoading(false);
            },
            onCancel() {

            },
        });
    }

    const confirmChanges = async () => {
        setLoading(true);
        const body = {
            idLot: lot.lotId,
            components: {},
        };
        for (let index = 0; index < insertedComponents.length; index++) {
            const updatedComponent = {
                method: productionForms.getFieldValue([index, 'method']),
                qty: productionForms.getFieldValue([index, 'qty']),
                idStock: productionForms.getFieldValue([index, 'IDStock']),
            };
            body.components[insertedComponents[index].IDcomp] = updatedComponent;
        }
        updateValidationErrorsBag.clear();
        const { status, error, validationErrors } = await updateOrder(body);
        if (error) {
            if (validationErrors) {
                updateValidationErrorsBag.setValidationErrors(validationErrors);
            }
            message.error(error?.response?.data?.message || "Error during production order update");
        }
        else {
            message.success("Production order updated succesfully");
            await loadProductionInfo(lot.lotId);
        }
        setLoading(false);
    }

    const confirmProductionOrder = async () => {
        confirm({
            title: 'Attention',
            content: 'Do you want to confirm production order?',
            transitionName: "ant-modal-slide-up",
            async onOk() {
                setLoading(true);
                const { status, error, validationErrors } = await confirmOrder(lot.lotId);
                if (error) {
                    message.error(error?.response?.data?.message || "Error during production order confirm");
                }
                else {
                    message.success("Production order confirmed succesfully");
                    await loadProductionInfo(lot.lotId);
                }
                setLoading(false);
            },
            onCancel() {

            },
        });
    }

    return (
        <div className="page">
            <PageActions
                backUrl="/reports/transaction-history"
                title={<> Production Order - <mark>{id}</mark></>}
            />
            <div className="page-content">
                {lot !== null && (
                    <>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Card title="Details" className="mb-3">
                                     <List itemLayout="horizontal" size="small">
                                        <List.Item>
                                            <List.Item.Meta title={"Lot"} />
                                            <Text copyable >{lot.lotId}</Text>
                                        </List.Item>
                                        <List.Item>
                                            <List.Item.Meta title={"Chiorino code"} />
                                            <Text>{`${lot.item} - ${lot.item_desc}`}</Text>
                                        </List.Item>
                                        <List.Item>
                                            <List.Item.Meta title={"Unit of measure"} />
                                            <Text>{lot.um}</Text>
                                        </List.Item>
                                        <List.Item>
                                            <List.Item.Meta title={"Width"} />
                                            <Text>{numberFormatter(lot.la)}</Text>
                                        </List.Item>
                                        <List.Item>
                                            <List.Item.Meta title={"Length"} />
                                            <Text>{numberFormatter(lot.lu)}</Text>
                                        </List.Item>
                                        <List.Item>
                                            <List.Item.Meta title={"Pieces"} />
                                            <Text>{numberFormatter(lot.pz)}</Text>
                                        </List.Item>
                                        <List.Item>
                                            <List.Item.Meta title={"m2"} />
                                            <Text>{numberFormatter(lot.m2)}</Text>
                                        </List.Item>
                                        <List.Item>
                                            <List.Item.Meta title={"Warehouse"} />
                                            <Text>{`${lot.whdesc ?? ''} \ ${lot.whlcdesc ?? ''}`}</Text>
                                        </List.Item>
                                        <List.Item>
                                            <List.Item.Meta title={"Order reference"} />
                                            <Text>{lot.ord_rif}</Text>
                                        </List.Item>
                                    </List>
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Alert
                                    type="warning"
                                    showIcon
                                    message="Warning"
                                    description={<>
                                        <ul>
                                            <li>All components will be consumed on the same warehouse of the main lot.</li>
                                            <li>Automatic method will ignore any selected lots.</li>
                                            <li>Components managed with UM=m2 will be consumed completely.</li>
                                            <li>In order to proceed with the order confirm all fields must be compiled following the correct logic.</li>
                                            <li>You cannot add accessories that are the same item of the main lot.</li>
                                            <li>Any changes made on the records of components (yellow boxes) must be applied before confirm the order clicking on blue button .</li>
                                        </ul>
                                    </>}
                                ></Alert>
                            </Col>
                        </Row>
                        {
                            lot.stepRoll == 0 ?
                                (<><Row>
                                    <Col span={24}>
                                        {
                                            numberFormatter(lot.qty_stock) != 0 ?
                                                (<Card title="Add component" className="mb-3">
                                                    <Form form={form}>
                                                        <Row gutter={16}>
                                                            <Col flex={1}>
                                                                <Form.Item name="idItem" {...validationErrorsBag.getInputErrors('idItem')}>
                                                                    <Select
                                                                        options={components}
                                                                        showSearch
                                                                        allowClear
                                                                        filterOption={(input, option) => (option?.label?.toLowerCase() ?? '').includes(input.toLowerCase())}
                                                                    ></Select>
                                                                </Form.Item>
                                                            </Col>
                                                            <Col>
                                                                <Button loading={loading} onClick={() => insertNewComponent()} type="primary" icon={<IconPlus />}></Button>
                                                            </Col>
                                                        </Row>
                                                    </Form>
                                                </Card>)
                                                :
                                                (<Alert
                                                    type="error"
                                                    message="Additional components isn't permetted when the main lot is alredy consumed"
                                                ></Alert>)
                                        }
                                    </Col>
                                </Row>
                                    <Row>
                                        <Col span={24}>
                                            <Card title="Inserted Component" className="mt-3 mb-3">
                                                <Form form={productionForms}>
                                                    <Table
                                                        id="production-table"
                                                        dataSource={insertedComponents}
                                                        pagination={false}
                                                        rowKey={(record) => JSON.stringify(record)}
                                                        columns={[
                                                            {
                                                                title: 'Component',
                                                                key: 'component',
                                                                render: (value, record, index) => (
                                                                    record.item + ' - ' + record.item_desc
                                                                )
                                                            },
                                                            {
                                                                title: 'UM',
                                                                key: 'um',
                                                                render: (value, record, index) => record.um
                                                            },
                                                            {
                                                                title: 'Qty expected',
                                                                key: 'qty_expected',
                                                                render: (value, record, index) => numberFormatter(record.qty_expected)
                                                            },
                                                            {
                                                                title: 'Qty on warehouse',
                                                                key: 'qtyOnStock',
                                                                render: (value, record, index) => numberFormatter(record.qtyOnStock)
                                                            },
                                                            {
                                                                title: 'Method',
                                                                key: 'method',
                                                                render: (value, record, index) => (
                                                                    <Form.Item name={[index, 'method']} {...updateValidationErrorsBag.getInputErrors(`components.${record.IDcomp}.method`)}>
                                                                        <Select
                                                                            options={[
                                                                                {
                                                                                    value: 0,
                                                                                    label: "Specific Lot"
                                                                                },
                                                                                {
                                                                                    value: 1,
                                                                                    label: "Automatic"
                                                                                }
                                                                            ]}
                                                                            disabled={record.frazionabile == 0 || record.executed == 1}
                                                                            ref={el => {
                                                                                if (!(index in itemsRef.current)) {
                                                                                    itemsRef.current[index] = {};
                                                                                }
                                                                                itemsRef.current[index]['method'] = el;
                                                                            }}
                                                                            onChange={() => {
                                                                                //refs not works with Select
                                                                                if (productionForms.getFieldValue([index, 'method']) == record['method']) {
                                                                                    document.getElementById(`${index}_method`).parentNode.parentNode.classList.remove('touched');
                                                                                }
                                                                                else {
                                                                                    document.getElementById(`${index}_method`).parentNode.parentNode.classList.add('touched');
                                                                                }
                                                                            }}
                                                                        ></Select>
                                                                    </Form.Item>
                                                                )
                                                            },
                                                            {
                                                                title: 'Qty',
                                                                key: 'auto_lot',
                                                                render: (value, record, index) => (
                                                                    record.frazionabile == 0 || record.executed == 1 ?
                                                                        (numberFormatter(record['qty']))
                                                                        :
                                                                        <Form.Item name={[index, 'qty']} {...updateValidationErrorsBag.getInputErrors(`components.${record.IDcomp}.qty`)}>
                                                                            <InputNumber
                                                                                min="0.1"
                                                                                step="0.01"
                                                                                ref={el => {
                                                                                    if (!(index in itemsRef.current)) {
                                                                                        itemsRef.current[index] = {};
                                                                                    }
                                                                                    itemsRef.current[index]['qty'] = el;
                                                                                }}
                                                                                onChange={() => {
                                                                                    touchFields(index, 'qty', record['qty']);
                                                                                }}
                                                                            />
                                                                        </Form.Item>
                                                                )
                                                            },
                                                            {
                                                                title: 'Lot \ Warehouse \ Location',
                                                                key: 'lot',
                                                                render: (value, record, index) => (
                                                                    <Form.Item name={[index, 'IDStock']} {...updateValidationErrorsBag.getInputErrors(`components.${record.IDcomp}.idStock`)}>
                                                                        <Select
                                                                            disabled={record.executed == 1}
                                                                            allowClear
                                                                            options={record.stocks.map((lot) => ({
                                                                                value: lot.IDstock,
                                                                                label: `${lot["IDlot"]} - ${lot["wdesc"]} - ${lot["wldesc"]}: ${lot["um"]} ${numberFormatter(lot["qty_stock"])}`
                                                                            }))}
                                                                            onChange={() => {
                                                                                //refs not works with Select
                                                                                if (productionForms.getFieldValue([index, 'IDStock']) == record['IDStock']) {
                                                                                    document.getElementById(`${index}_IDStock`).parentNode.parentNode.classList.remove('touched');
                                                                                }
                                                                                else {
                                                                                    document.getElementById(`${index}_IDStock`).parentNode.parentNode.classList.add('touched');
                                                                                }
                                                                            }}
                                                                        >
                                                                        </Select>
                                                                    </Form.Item>
                                                                )
                                                            },
                                                            {
                                                                title: 'State',
                                                                key: 'state',
                                                                render: (value, record, index) => (
                                                                    record.executed == 1 ? "Completed" : "Not Completed"
                                                                )
                                                            },
                                                            {
                                                                title: 'Actions',
                                                                key: 'commands',
                                                                align: 'right',
                                                                render: (value, record, index) => {
                                                                    if (record.executed == 0) {
                                                                        return (
                                                                            <Button
                                                                                icon={<IconTrash/>}
                                                                                loading={loading}
                                                                                danger
                                                                                onClick={() => {
                                                                                    deleteComponent(record);
                                                                                }}
                                                                                title="Remove Component"
                                                                            />
                                                                        )
                                                                    }

                                                                    return null;
                                                                }
                                                            }
                                                        ]}
                                                    >

                                                    </Table>
                                                </Form>
                                            </Card>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col span={24}>
                                            {uncompleted != 0 &&
                                                (
                                                    <>
                                                        <Space direction="horizontal">
                                                            <Button
                                                                loading={loading} 
                                                                type="primary"
                                                                title="Any changes made on the records of components (yellow boxes) must be applied clicking this button"
                                                                icon={<IconCheck />}
                                                                onClick={() => confirmChanges()}
                                                            >
                                                            </Button>
                                                            {
                                                                enableConfirm && (
                                                                    <Button
                                                                        loading={loading} 
                                                                        className='btn-info'
                                                                        title="Confirm order"
                                                                        onClick={() => confirmProductionOrder()}
                                                                    >Confirm order</Button>
                                                                )
                                                            }
                                                        </Space>
                                                        {
                                                            !enableConfirm && (
                                                                <Alert
                                                                    type="error"
                                                                    className="mt-3"
                                                                    message={enableConfirmMessage.current.map((msg) => (
                                                                        <p>{msg}</p>
                                                                    ))}
                                                                />
                                                            )
                                                        }
                                                    </>
                                                )
                                            }
                                        </Col>
                                    </Row>

                                </>)
                                :
                                (<Alert
                                    type="error"
                                    icon={<IconAlertCircle />}
                                    message="Warning, this is a step roll, operation not permitted."
                                ></Alert>)
                        }

                    </>
                )}
            </div>
        </div>
    );
};

export default Production;
