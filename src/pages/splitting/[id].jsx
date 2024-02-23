import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import UserPermissions from "@/policy/ability";
import { IconTrash, IconDeviceFloppy, IconPrinter, IconCheck } from "@tabler/icons-react";
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
    Select,
    InputNumber,
    Alert
} from "antd";
import PageActions from "@/shared/components/page-actions";
import {
    getSplittingInfo,
    addNewCut,
    removeCut,
    confirmSplitOrder
} from "@/api/splitting";
import { printLabelsPdf } from "@/api/print";
import { numberFormatter, dateStringToDate } from "@/hooks/formatter";
import { useValidationErrors } from "@/hooks/validation-errors";
import { useExport } from "@/hooks/download";
import { getWarehouseById } from "@/api/warehouses";

const { Text } = Typography;
const { confirm } = Modal;



const Splitting = (props) => {
    //Set page permissions
    if (!UserPermissions.authorizePage("split_order.management")) {
        return false;
    }

    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [lot, setLot] = useState(null);
    const [cuts, setCuts] = useState([]);
    const [locations, setLocations] = useState([]);
    const waste = useRef({
        qtySplitted: 0,
        qtyWaste: 0,
        wastePerc: 0
    });
    const [form] = Form.useForm();
    const validationErrorsBag = useValidationErrors();
    const [executed, setExecuted] = useState(false);
    const qtyStock = useRef(0);

    useEffect(() => {
        if (router.isReady) {
            loadSplittingInfo(router.query.id);
        }
    }, [router.isReady])

    const round = (value) => {
        const number = typeof value === 'string' ? parseFloat(value) : value;
        return isNaN(number) ? null : Math.round((value * 100)) / 100;
    };

    const loadSplittingInfo = async (idStock) => {
        const { data, error } = await getSplittingInfo(idStock);
        if (!error) {
            validationErrorsBag.clear();

            setLot({ idStock: idStock, ...data.lot });
            qtyStock.current = numberFormatter(data.lot.qty_stock)

            Object.assign(waste, {
                qtySplitted: 0,
                qtyWaste: 0,
                wastePerc: 0
            });

            waste['qtySplitted'] = round(data.cuts.reduce(
                (accumulator, currentValue) => accumulator + numberFormatter(currentValue.qty_split),
                0
            ));
            waste['qtyWaste'] = qtyStock.current - waste['qtySplitted'];

            if (waste['qtySplitted'] == 0) {
                waste['wastePerc'] = 100;
            }
            else {
                waste['wastePerc'] = round(waste['qtyWaste'] * 100 / qtyStock.current);
            }

            form.resetFields();
            form.setFieldValue('idWarehouseLocation', data.lot.IDlocation);

            const executed = data.cuts.filter(cut => cut.executed == 1).length > 0;
            setExecuted(executed);

            if (!executed && qtyStock.current > 0 && data.lot['um'].toLowerCase() != 'm2') {
                data.cuts.push({
                    insertNewRow: true
                })
            }

            setCuts(data.cuts);


            if (data.lot.IDwarehouse != 0) {
                const { data: locData, error: locError } = await getWarehouseById(data.lot.IDwarehouse);
                if (!locError) {
                    setLocations(locData.warehouse_locations);
                }
                else {
                    message.error(locError?.response?.data?.message || "Error during warehouse location loading");
                }
            }


        }
        else {
            message.error(error?.response?.data?.message || "Error during lot info data loading");
        }
    }

    const addCut = async () => {
        setLoading(true);
        const values = form.getFieldsValue();
        validationErrorsBag.clear();
        const { status, error, validationErrors } = await addNewCut({
            idStock: lot.idStock,
            ...values
        });
        if (error) {
            if (validationErrors) {
                validationErrorsBag.setValidationErrors(validationErrors);
            }
            message.error(error?.response?.data?.message || "Error during cut creation");
        }
        else {
            message.success("Cut added succesfully");
            await loadSplittingInfo(lot.idStock);
        }
        setLoading(false);
    }

    const deleteCut = async (record) => {
        confirm({
            title: 'Attention',
            content: 'Do you want to delete this cut?',
            transitionName: "ant-modal-slide-up",
            async onOk() {
                setLoading(true);
                const { status, error } = await removeCut(record.IDRowSplit);
                if (!error) {
                    message.success("Cut removed succesfully");
                    await loadSplittingInfo(lot.idStock);
                }
                else {
                    message.error(error?.response?.data?.message || "Error during cut deleting");
                }
                setLoading(false);
            },
            onCancel() {

            },
        });
    }

    const confirmSplit = async () => {
        confirm({
            title: 'Attention',
            content: 'Do you want to confirm this splitting order?',
            transitionName: "ant-modal-slide-up",
            async onOk() {
                setLoading(true);
                const { status, error } = await confirmSplitOrder(lot.idStock);
                if (!error) {
                    message.success("Cutting order confirmed succesfully");
                    await loadSplittingInfo(lot.idStock);
                }
                else {
                    message.error(error?.response?.data?.message || "Error during splitting order confirmation");
                }
                setLoading(false);
            },
            onCancel() {

            },
        });
    }

    const printLabel = async (cut) => {
        setLoading(true);
        const { data, error } = await printLabelsPdf([cut.IDlot_new]);
        if (!error) {
            useExport(data, `split_label_${cut.IDlot_new}.pdf`);
        }
        else {
            message.error("Error during label pdf generation");
        }
        setLoading(false);
    }

    const printAllLabels = async () => {
        setLoading(true);
        const lots = cuts.map((cut) => cut.IDlot_new);
        const { data, error } = await printLabelsPdf(lots);
        if (!error) {
            useExport(data, `split_labels_${lot.idStock}.pdf`);
        }
        else {
            message.error("Error during label pdf generation");
        }
        setLoading(false);
    }

    return (
        <div className="page">
            <PageActions
                title={`Splitting order`}
            />
            <div className="page-content">
                {lot !== null && (
                    <>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Card title="Details" className="mb-3">
                                     <List itemLayout="horizontal" size="small">
                                        <List.Item>
                                            <List.Item.Meta title={"Lot to split"} />
                                            <Text copyable >{lot.IDlot}</Text>
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
                                            <List.Item.Meta title={"Quantity"} />
                                            <Text>{numberFormatter(lot.qty_stock)}</Text>
                                        </List.Item>
                                        <List.Item>
                                            <List.Item.Meta title={"Warehouse"} />
                                            <Text>{`${lot.whdesc ?? ''} \ ${lot.whlcdesc ?? ''}`}</Text>
                                        </List.Item>
                                        <List.Item>
                                            <List.Item.Meta title={"Order reference"} />
                                            <Text>{lot.ord_rif}</Text>
                                        </List.Item>
                                        <List.Item>
                                            <List.Item.Meta
                                                title={"Lot text (it will be copied on the cuts)"}
                                            />
                                            <Text>{lot.note}</Text>
                                        </List.Item>
                                    </List>
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Alert
                                    type="warning"
                                    showIcon
                                    message="Warning"
                                    description={
                                        <ul>
                                            <li>The selected lot \ warehouse \ location will be cosumed completely</li>
                                            <li>The selected lot \ warehouse \ location must be not transfer during the splitting order</li>
                                            <li>Components managed with UM=N can be splitted only without decimal quantity</li>
                                        </ul>
                                    }
                                >
                                </Alert>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <p>
                                    {`Splitted ${lot.um}:`} <b>{waste.qtySplitted}</b>
                                    {` Waste material ${lot.um}:`} <b>{numberFormatter(waste.qtyWaste)}</b>
                                    {` Waste percentage %:`} <b>{numberFormatter(waste.wastePerc)}</b>
                                </p>
                            </Col>
                        </Row>

                        <Row>
                            <Col span={24}>
                                <Card title="Splitting Plan" className="mt-3 mb-3">
                                    <Form form={form}>
                                        <Table
                                            id="cutting-table"
                                            dataSource={cuts}
                                            pagination={false}
                                            rowKey={(record) => JSON.stringify(record)}
                                            columns={[
                                                {
                                                    title: `Quantity (${lot?.um})`,
                                                    key: 'qty_split',
                                                    render: (value, record, index) => (
                                                        record.insertNewRow ?
                                                            <Form.Item name={'qty'} {...validationErrorsBag.getInputErrors('qty')}>
                                                                <InputNumber
                                                                    size="10"
                                                                    min={lot['um'] == 'm' ? 0.1 : 1}
                                                                    step={lot['um'] == 'm' ? 0.01 : 1}
                                                                ></InputNumber>
                                                            </Form.Item>
                                                            :
                                                            <Form.Item>
                                                                <InputNumber
                                                                    value={record.qty_split}
                                                                    disabled={true}
                                                                ></InputNumber>
                                                            </Form.Item>
                                                    )
                                                },
                                                {
                                                    title: 'Order reference',
                                                    key: 'ord_ref',
                                                    render: (value, record, index) => (
                                                        record.insertNewRow ?
                                                            <Form.Item name={'ordRef'} {...validationErrorsBag.getInputErrors('ordRef')}>
                                                                <Input
                                                                ></Input>
                                                            </Form.Item>
                                                            :
                                                            <Form.Item>
                                                                <InputNumber
                                                                    value={record.ord_ref}
                                                                    disabled={true}
                                                                ></InputNumber>
                                                            </Form.Item>
                                                    )
                                                },
                                                {
                                                    title: 'Location',
                                                    key: 'whldesc',
                                                    render: (value, record, index) => (
                                                        record.insertNewRow ?
                                                            <Form.Item name={'idWarehouseLocation'} {...validationErrorsBag.getInputErrors('idWarehouseLocation')}>
                                                                <Select
                                                                    showSearch
                                                                    filterOption={(input, option) => (option?.label?.toLowerCase() ?? '').includes(input.toLowerCase())}
                                                                    options={locations.map((l) => (
                                                                        {
                                                                            value: l.IDlocation,
                                                                            label: l.desc
                                                                        }
                                                                    ))}
                                                                ></Select>
                                                            </Form.Item>
                                                            :
                                                            record['whldesc']
                                                    )
                                                },
                                                {
                                                    title: 'New lot',
                                                    key: 'IDlot_new',
                                                    render: (value, record, index) => {
                                                        if (!record.insertNewRow && record.executed == 1) {
                                                            return (<Text copyable>
                                                                {record['IDlot_new']}
                                                            </Text>)
                                                        }
                                                        return null;
                                                    }
                                                },
                                                {
                                                    title: 'Actions',
                                                    key: 'commands',
                                                    align: 'right',
                                                    render: (value, record, index) => (
                                                        record.insertNewRow ? (
                                                            <Button
                                                                type="primary"
                                                                title="Add split"
                                                                onClick={() => { addCut() }}
                                                                loading={loading}
                                                            >Add Split</Button>
                                                        ) :
                                                            (
                                                                !executed ?
                                                                    (
                                                                        <Button
                                                                            danger
                                                                            icon={<IconTrash/>}
                                                                            onClick={() => deleteCut(record)}
                                                                            loading={loading}
                                                                        >
                                                                        </Button>
                                                                    )
                                                                    :
                                                                    (
                                                                        <Button
                                                                            onClick={() => printLabel(record)}
                                                                            loading={loading}
                                                                        >Print Label</Button>
                                                                    )
                                                            )
                                                    )
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
                                {!executed ?
                                    (
                                        qtyStock.current > 0 ?
                                            (
                                                <Button
                                                    type="primary"
                                                    title="Confirm split order"
                                                    loading={loading}
                                                    onClick={() => confirmSplit()}
                                                >
                                                    Confirm split order
                                                </Button>
                                            )
                                            :
                                            (
                                                <Alert
                                                    type="error"
                                                    showIcon
                                                    message="Warning, lot not in stock"
                                                >
                                                </Alert>
                                            )
                                    )
                                    :
                                    (
                                        <Alert
                                            type="info"
                                            message="Splitting order completed"
                                            description={
                                                <Button
                                                    className="btn-info"
                                                    onClick={() => printAllLabels()}
                                                    loading={loading}
                                                >Print All Labels</Button>
                                            }
                                        >
                                        </Alert>
                                    )
                                }
                            </Col>
                        </Row>
                    </>
                )}
            </div>
        </div>
    );
};

export default Splitting;
