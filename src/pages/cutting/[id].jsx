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
    DatePicker,
    Select,
    InputNumber,
    Dropdown,
    Divider,
    Alert
} from "antd";
import PageActions from "@/shared/components/page-actions";
import {
    getCuttingInfo,
    addNewCut,
    removeCut,
    updateCuttingOrder,
    confirmCuttingOrder,
    printCuttingPlanPdf,
} from "@/api/cutting";
import { printLabelsPdf } from "@/api/print";
import { getWarehouseById } from "@/api/warehouses";
import { numberFormatter, dateStringToDate } from "@/hooks/formatter";
import { useValidationErrors } from "@/hooks/validation-errors";
import { useExport } from "@/hooks/download";
const { Text } = Typography;
const { confirm } = Modal;



const Cutting = (props) => {
    //Set page permissions
    if (!UserPermissions.authorizePage("cutting_order.management")) {
        return false;
    }
    const router = useRouter();
    const { id } = router.query;
    const [backUrl, setBackUrl] = useState('')
    const [loading, setLoading] = useState(false);
    const [lot, setLot] = useState(null);
    const [cuts, setCuts] = useState([]);
    const [cutsLength, setCutsLength] = useState(0);
    const [lotsByStepRollLot, setLotsByStepRollLot] = useState([]);
    const [checkExecutedCut, setCheckExecutedCut] = useState(false);
    const [qtyStock, setQtyStock] = useState(0);
    const [cutForms] = Form.useForm();
    const [form] = Form.useForm();
    const [locations, setLocations] = useState([]);
    const waste = useRef({
        cutSum: 0,
        m2LotToCut: 0,
        lengthStepRollTot: 0,
        lengthSum: 0
    });
    const validationErrorsBag = useValidationErrors();
    const updateValidationErrorsBag = useValidationErrors();
    const itemsRef = useRef([]);
    const dateRef = useRef(null);

    useEffect(() => {
        if (router.isReady) {
            loadCuttingInfo(id);
        }
    }, [router.isReady])


    useEffect(() => {
        const receivedUrl = localStorage.getItem('pageUrl');
        if (receivedUrl) {
            setBackUrl(receivedUrl);
        }
    }, [])

    const round = (value) => {
        const number = typeof value === 'string' ? parseFloat(value) : value;
        return isNaN(number) ? null : Math.round((value * 100)) / 100;
    };

    const touchFields = (index, field, initial) => {
        const item = itemsRef.current?.[index]?.[field];
        if (item) {
            if (cutForms.getFieldValue([index, field]) == initial) {
                item.classList.remove('touched');
            }
            else {
                item.classList.add('touched');
            }
        }
    }

    const loadCuttingInfo = async (lotId) => {
        const { data, error } = await getCuttingInfo(lotId);
        if (!error) {
            itemsRef.current = [];
            updateValidationErrorsBag.clear();
            validationErrorsBag.clear();

            setLot({ lotId: lotId, ...data.lotInfo });
            form.setFieldValue(
                'plannedDate',
                data.lotInfo.date_planned ? dateStringToDate(data.lotInfo.date_planned) : null
            );
            const dateEl = document.getElementById('plannedDate')?.parentElement?.parentElement;
            if (dateEl) {
                dateEl.style.backgroundColor = 'transparent';
            }

            Object.assign(waste, {
                cutSum: 0,
                m2LotToCut: 0,
                lengthStepRollTot: 0,
                lengthSum: 0
            });
            waste['m2LotToCut'] = round(data.lotInfo['m2']);

            if (data.lotInfo.stepRoll) {
                waste['m2LotToCut'] = 0;
                for (let step of data.lotsByStepRollLot) {
                    waste['m2LotToCut'] += round(step['qtyLot']);
                    waste['lengthStepRollTot'] += round(step['dimensions'][0]['lu']);
                }
            }

            let executed = false;
            for (let cut of data.cuts) {
                executed = cut.executed == 1
                waste['cutSum'] += round(cut['m2']);
                waste['lengthSum'] += round(cut['LU']) * round(cut['PZ']);
            }
            setCheckExecutedCut(executed);

            if (waste['cutSum'] == 0) {
                waste['m2DiffCuttedParent'] = waste['m2LotToCut'];
                waste['wastePerc'] = 100;
            }
            else {
                waste['m2DiffCuttedParent'] = waste['m2LotToCut'] - waste['cutSum'];
                if (waste['m2LotToCut'] != 0) {
                    waste['wastePerc'] = round(waste['m2DiffCuttedParent'] * 100 / waste['m2LotToCut']);
                }
                else {
                    waste['wastePerc'] = 0;
                }
            }
            if (data.lotInfo.stepRoll) {
                waste['leftoverLength'] = waste['lengthStepRollTot'] - waste['lengthSum'];
                waste['initialLength'] = waste['lengthStepRollTot'];
                waste['leftoverLengthC'] = round(waste['m2DiffCuttedParent'] * 1000000 / round(data.lotInfo['la']));
            }
            else {
                waste['leftoverLength'] = data.lotInfo['lu'] - waste['lengthSum'];
                waste['initialLength'] = data.lotInfo['lu'];
                waste['leftoverLengthC'] = round(waste['m2DiffCuttedParent'] * 1000000 / round(data.lotInfo['la']));
            }

            let qtyStock = numberFormatter(data.lotInfo.qty_stock);
            setQtyStock(qtyStock);

            cutForms.resetFields();


            setCutsLength(data.cuts.length);

            if (!executed && qtyStock > 0) {
                data.cuts.push({
                    insertNewRow: true,
                })
            }

            cutForms.setFieldsValue(data.cuts.map((cut) => {
                if (cut.insertNewRow) {
                    cut['step_roll'] = 0;
                    cut['step_roll_order'] = 0;
                    cut['loc'] = data.lotInfo?.IDwhl;
                }
                else {
                    cut['LA'] = round(cut['LA']);
                    cut['LU'] = round(cut['LU']);
                    cut['PZ'] = round(cut['PZ']);
                }
                return cut;
            }));

            setCuts(data.cuts);

            const lotsByStepRollLot = data.lotsByStepRollLot.map((f) => {
                const { ['stocks']: _, ...rest } = f;
                f = f['stocks'].map(val => ({ ...rest, ['stocks']: val }));
                return f;
            }).flat();

            setLotsByStepRollLot(lotsByStepRollLot);

            if (data.lotInfo.IDwh) {
                const { data: locData, error: locError } = await getWarehouseById(data.lotInfo.IDwh);
                if (!locError) {
                    setLocations(locData.warehouse_locations);
                }
                else {
                    message.error(locError?.response?.data?.message || "Error during warehouse location loading");
                }
            }

        }
        else {
            message.error(error?.response?.data?.message || "Error during lot cutting info data loading");
        }
    }

    const calculateArea = (index) => {
        const values = cutForms.getFieldsValue();
        if (index in values) {
            values[index]['aream2'] = (values[index]['LA'] * values[index]['LU'] * values[index]['PZ']) / 1000000;
            if (isNaN(values[index]['aream2'])) {
                values[index]['aream2'] = null;
            }
        }
        cutForms.setFieldsValue(values);
    }

    const addCut = async (index) => {
        setLoading(true);
        const values = cutForms.getFieldsValue();
        validationErrorsBag.clear();
        if (index in values) {
            const formValues = values[index];
            const { status, error, validationErrors } = await addNewCut({
                idLot: lot.lotId,
                la: formValues?.LA,
                lu: formValues?.LU,
                pz: formValues?.PZ,
                stepRoll: formValues?.step_roll,
                stepRollOrder: formValues?.step_roll_order,
                ordRef: formValues?.ord_rif,
                idWarehouseLocation: formValues?.loc
            });
            if (error) {
                if (validationErrors) {
                    validationErrorsBag.setValidationErrors(validationErrors);
                }
                message.error(error?.response?.data?.message || "Error during cut creation");
            }
            else {
                message.success("Cut added succesfully");
                await loadCuttingInfo(lot.lotId);
            }
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
                const { status, error } = await removeCut(record.IDcut);
                if (!error) {
                    message.success("Cut removed succesfully");
                    await loadCuttingInfo(lot.lotId);
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

    const confirmCutting = async () => {
        confirm({
            title: 'Attention',
            content: 'Do you want to confirm this cutting order?',
            transitionName: "ant-modal-slide-up",
            async onOk() {
                setLoading(true);
                const { status, error } = await confirmCuttingOrder(lot.lotId);
                if (!error) {
                    message.success("Cutting order confirmed succesfully");
                    await loadCuttingInfo(lot.lotId);
                }
                else {
                    message.error(error?.response?.data?.message || "Error during cutting order confirmation");
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
            cuts: {},
            plannedDate: form.getFieldValue('plannedDate')?.format('YYYY-MM-DD')
        };
        for (let index = 0; index < cutsLength; index++) {
            const updatedCut = {
                la: cutForms.getFieldValue([index, 'LA']),
                lu: cutForms.getFieldValue([index, 'LU']),
                pz: cutForms.getFieldValue([index, 'PZ']),
            };
            body.cuts[cuts[index].IDcut] = updatedCut;
        }
        updateValidationErrorsBag.clear();
        const { status, error, validationErrors } = await updateCuttingOrder(body);
        if (error) {
            if (validationErrors) {
                updateValidationErrorsBag.setValidationErrors(validationErrors);
            }
            message.error(error?.response?.data?.message || "Error during cutting order update");
        }
        else {
            message.success("Cutting order updated succesfully");
            await loadCuttingInfo(lot.lotId);
        }
        setLoading(false);
    }

    const printPlan = async () => {
        setLoading(true);
        const { data, error } = await printCuttingPlanPdf(lot.lotId);
        if (!error) {
            useExport(data, "cutting_order_plan.pdf");
        }
        else {
            message.error("Error during cutting plan pdf generation");
        }
        setLoading(false);
    }

    const printLabel = async (cut) => {
        setLoading(true);
        const { data, error } = await printLabelsPdf([cut.IDlot_new]);
        if (!error) {
            useExport(data, `cutting_label_${cut.IDlot_new}.pdf`);
        }
        else {
            message.error("Error during cutting label pdf generation");
        }
        setLoading(false);
    }

    const printAllLabels = async () => {
        setLoading(true);
        const lots = cuts.map((cut) => cut.IDlot_new);
        const { data, error } = await printLabelsPdf(lots);
        if (!error) {
            useExport(data, `cutting_labels_${lot.lotId}.pdf`);
        }
        else {
            message.error("Error during cutting label pdf generation");
        }
        setLoading(false);
    }

    return (
        <div className="page">
            <PageActions
                backUrl={backUrl}
                title={<>Cutting order <mark>{id}</mark></>}
            />
            <div className="page-content">
                {lot !== null && (
                    <>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Card title="Details" className="mb-2 p-0">
                                    <List itemLayout="horizontal" size="small">
                                        <List.Item>
                                            <List.Item.Meta title={"Lot to cut"} />
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
                                <Card title="Execution planned date" className="mb-2">
                                    <Form form={form}>
                                        <Form.Item name="plannedDate">
                                            <DatePicker
                                                disabled={!lot.date_planned || checkExecutedCut != 0}
                                                onChange={() => {
                                                    const item = document.getElementById('plannedDate')
                                                        .parentElement
                                                        .parentElement;
                                                    if (form.getFieldValue('plannedDate').format('YYYY-MM-DD') == dateStringToDate(lot.date_planned).format('YYYY-MM-DD')) {
                                                        item.style.backgroundColor = 'transparent';
                                                    }
                                                    else {
                                                        item.style.backgroundColor = '#ffc107';
                                                    }
                                                }}
                                            />
                                        </Form.Item>
                                    </Form>
                                </Card>

                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={24}>
                                <Card title="Cutting details" className="p-0">
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <List size="small">
                                                <List.Item>
                                                    <List.Item.Meta title="Cutted m2" />
                                                    <Text>{waste['cutSum']}</Text>
                                                </List.Item>
                                                <List.Item>
                                                    <List.Item.Meta title="Waste material m2" />
                                                    <Text >{waste['m2DiffCuttedParent']}</Text>
                                                </List.Item>
                                                <List.Item>
                                                    <List.Item.Meta title="Waste percentage %" />
                                                    <Text >{waste['wastePerc']}</Text>
                                                </List.Item>
                                            </List>
                                        </Col>
                                        <Col span={12}>
                                            <List size="small">
                                                <List.Item>
                                                    <List.Item.Meta title="Leftover length (mm)" />
                                                    <Text>
                                                        {`${waste['leftoverLength']} (${waste['lengthSum']} / ${waste['initialLength']})`}
                                                    </Text>
                                                </List.Item>
                                                <List.Item>
                                                    <List.Item.Meta title="Leftover m2 / width (mm)" />
                                                    <Text>{waste['leftoverLengthC']}</Text>
                                                </List.Item>
                                            </List>
                                        </Col>
                                    </Row>
                                </Card>
                            </Col>
                        </Row>
                        {
                            lot.stepRoll == 1 && (
                                <Row className="mb-2">
                                    <Col span={24}>
                                        <Alert className="mb-2" type="warning" message="Warning, this is a step roll and it will be consumed 
                                        together the below lots, moreover the cuttable quantity 
                                        is the sum of the lots.">
                                        </Alert>
                                        <Table
                                            columns={[
                                                {
                                                    title: 'Lot',
                                                    key: 'IDlot',
                                                    dataIndex: 'IDlot',
                                                },
                                                {
                                                    title: 'm2 stock',
                                                    key: 'stocks.qty_stock',
                                                    render: (record) => numberFormatter(record.stocks?.qty_stock)
                                                },
                                                {
                                                    title: 'm2 Lot',
                                                    key: 'qtyLot',
                                                    render: (record) => numberFormatter(record.qtyLot)
                                                },
                                                {
                                                    title: 'Dim',
                                                    key: 'dim',
                                                    dataIndex: 'dim',
                                                },
                                            ]}
                                            dataSource={lotsByStepRollLot}
                                            pagination={false}
                                            rowKey={(record) => JSON.stringify(record)}
                                        />
                                    </Col>
                                </Row>
                            )
                        }
                    </>
                )}
                <Row>
                    <Col span={24}>
                        <Card title="Cutting Plan" className="mt-3 mb-2">
                            <Form form={cutForms}>
                                <Table
                                    id="cutting-table"
                                    dataSource={cuts}
                                    pagination={false}
                                    rowKey={(record) => JSON.stringify(record)}
                                    columns={[
                                        {
                                            title: 'Width (mm)',
                                            key: 'width',
                                            render: (value, record, index) => (
                                                record.insertNewRow ?
                                                    <Form.Item name={[index, 'LA']} {...validationErrorsBag.getInputErrors('la')}>
                                                        <InputNumber
                                                            size="10"
                                                            min="0.1"
                                                            step={0.01}
                                                            onChange={() => calculateArea(index)}
                                                        ></InputNumber>
                                                    </Form.Item>
                                                    :
                                                    <Form.Item name={[index, 'LA']} {...updateValidationErrorsBag.getInputErrors(`cuts.${record.IDcut}.la`)}>
                                                        <InputNumber
                                                            ref={el => {
                                                                if (!(index in itemsRef.current)) {
                                                                    itemsRef.current[index] = {};
                                                                }
                                                                itemsRef.current[index]['LA'] = el;
                                                            }}
                                                            size="10"
                                                            min="0.1"
                                                            step={0.01}
                                                            disabled={checkExecutedCut}
                                                            onChange={() => {
                                                                touchFields(index, 'LA', record['LA']);
                                                            }}
                                                        ></InputNumber>
                                                    </Form.Item>
                                            )
                                        },
                                        {
                                            title: 'Length (mm)',
                                            key: 'length',
                                            render: (value, record, index) => (
                                                record.insertNewRow ?
                                                    <Form.Item name={[index, 'LU']} {...validationErrorsBag.getInputErrors('lu')}>
                                                        <InputNumber
                                                            size="10"
                                                            min="0.1"
                                                            step={0.01}
                                                            onChange={() => calculateArea(index)}
                                                        ></InputNumber>
                                                    </Form.Item>
                                                    :
                                                    <Form.Item name={[index, 'LU']}>
                                                        <InputNumber
                                                            ref={el => {
                                                                if (!(index in itemsRef.current)) {
                                                                    itemsRef.current[index] = {};
                                                                }
                                                                itemsRef.current[index]['LU'] = el;
                                                            }}
                                                            size="10"
                                                            min="0.1"
                                                            step={0.01}
                                                            disabled={checkExecutedCut}
                                                            onChange={() => {
                                                                touchFields(index, 'LU', record['LU']);
                                                            }}
                                                        ></InputNumber>
                                                    </Form.Item>
                                            )
                                        },
                                        {
                                            title: 'Pieces (N)',
                                            key: 'pieces',
                                            render: (value, record, index) => (
                                                record.insertNewRow ?
                                                    <Form.Item name={[index, 'PZ']} {...validationErrorsBag.getInputErrors('pz')}>
                                                        <InputNumber size="10" step="1" onChange={() => calculateArea(index)}></InputNumber>
                                                    </Form.Item>
                                                    :
                                                    <Form.Item name={[index, 'PZ']}>
                                                        <InputNumber
                                                            ref={el => {
                                                                if (!(index in itemsRef.current)) {
                                                                    itemsRef.current[index] = {};
                                                                }
                                                                itemsRef.current[index]['PZ'] = el;
                                                            }}
                                                            size="10"
                                                            step="1"
                                                            disabled={checkExecutedCut}
                                                            onChange={() => {
                                                                touchFields(index, 'PZ', record['PZ']);
                                                            }}
                                                        ></InputNumber>
                                                    </Form.Item>
                                            )
                                        },
                                        {
                                            title: 'm2',
                                            key: 'm2',
                                            render: (value, record, index) => (
                                                record.insertNewRow ?
                                                    <Form.Item name={[index, 'aream2']}>
                                                        <InputNumber
                                                            size="10"
                                                            disabled
                                                        >
                                                        </InputNumber>
                                                    </Form.Item>
                                                    :
                                                    numberFormatter(record['m2'])
                                            )

                                        },
                                        {
                                            title: 'Order reference',
                                            key: 'ord_rif',
                                            render: (value, record, index) => (
                                                record.insertNewRow ?
                                                    <Form.Item name={[index, 'ord_rif']} {...validationErrorsBag.getInputErrors('ordRef')}>
                                                        <Input></Input>
                                                    </Form.Item>
                                                    :
                                                    record['ord_rif']
                                            )
                                        },
                                        {
                                            title: 'Step Roll',
                                            key: 'step_roll',
                                            render: (value, record, index) => (
                                                record.insertNewRow ?
                                                    <Form.Item name={[index, 'step_roll']} {...validationErrorsBag.getInputErrors('stepRoll')}>
                                                        {numberFormatter(lot['pz']) == 1 ?
                                                            <Select options={[{ value: 0, label: 'No' }, { value: 1, label: 'Yes' }]}></Select>
                                                            :
                                                            <Select
                                                                options={[{ value: 0, label: 'No' }, { value: 1, label: 'Yes' }]}
                                                                disabled
                                                            ></Select>
                                                        }
                                                    </Form.Item>
                                                    :
                                                    (record['step_roll'] == 0 ? 'No' : 'Yes')
                                            )
                                        },
                                        {
                                            title: 'Step roll order',
                                            key: 'step_roll_order',
                                            render: (value, record, index) => (
                                                record.insertNewRow ?
                                                    <Form.Item name={[index, 'step_roll_order']} {...validationErrorsBag.getInputErrors('stepRollOrder')}>
                                                        {numberFormatter(lot['pz']) == 1 ?
                                                            <Input></Input>
                                                            :
                                                            <Input disabled></Input>
                                                        }
                                                    </Form.Item>
                                                    :
                                                    record['step_roll_order']
                                            )
                                        },
                                        {
                                            title: 'New lot',
                                            key: 'IDlot_new',
                                            render: (value, record, index) => {
                                                if (!record.insertNewRow && checkExecutedCut) {
                                                    return (<Text copyable>
                                                        {record['IDlot_new']}
                                                    </Text>)
                                                }
                                                return null;
                                            }
                                        },
                                        {
                                            title: 'Location',
                                            key: 'whldesc',
                                            render: (value, record, index) => (
                                                record.insertNewRow ?
                                                    <Form.Item name={[index, 'loc']} {...validationErrorsBag.getInputErrors('idWarehouseLocation')}>
                                                        <Select
                                                            options={locations.map((l) => (
                                                                {
                                                                    value: l.IDlocation,
                                                                    label: l.desc
                                                                }
                                                            ))}
                                                        ></Select>
                                                    </Form.Item>
                                                    :
                                                    record['warehouse_location']['desc']
                                            )
                                        },
                                        {
                                            title: 'Actions',
                                            key: 'commands',
                                            align: 'right',
                                            render: (value, record, index) => {
                                                if (record.insertNewRow) {
                                                    return (
                                                        <Button loading={loading} className="btn-success" onClick={() => addCut(index)}>Add Cut</Button>
                                                    )
                                                }
                                                if (!checkExecutedCut) {
                                                    return (
                                                        <Button loading={loading} onClick={() => deleteCut(record)} title="Delete cut" danger icon={<IconTrash />} />
                                                    )
                                                }
                                                return (
                                                    <Button loading={loading} title="Print label" onClick={() => printLabel(record)} icon={<IconPrinter />} />
                                                )
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
                        {checkExecutedCut == 1 ?
                            (
                                <>
                                    <Alert type="warning" message="Cutting order completed" className="mb-2"></Alert>
                                    <Space direction="horizontal">
                                        <Button loading={loading} onClick={() => printPlan()} title="Print cutting plan" icon={<IconPrinter />}>
                                            Print cutting plan A4
                                        </Button>
                                        <Button loading={loading} onClick={() => printAllLabels()} className="btn-warning" icon={<IconPrinter />}>Print all labels</Button>
                                    </Space>
                                </>
                            )
                            :
                            (
                                qtyStock > 0 && cutsLength > 0 ?
                                    (
                                        <Space direction="horizontal">
                                            <Button loading={loading} onClick={() => printPlan()} title="Print cutting plan" icon={<IconPrinter />}>
                                                Print cutting plan A4
                                            </Button>
                                            <Button
                                                loading={loading}
                                                className="btn-info"
                                                title="If you made changes (yellow box) you have to apply it before confirm the cutting process"
                                                icon={<IconCheck />}
                                                onClick={() => confirmChanges()}
                                            ></Button>
                                            <Button
                                                loading={loading}
                                                className="btn-success"
                                                onClick={() => confirmCutting()}
                                            >Confirm Cutting Order</Button>
                                        </Space>
                                    )
                                    :
                                    (
                                        <Alert
                                            type="warning"
                                            showIcon
                                            message={
                                                qtyStock <= 0 ?
                                                    'Warning lot not in stock' :
                                                    (cutsLength <= 0 ? 'Please insert at least 1 cut' : '')
                                            }
                                        ></Alert>
                                    )
                            )
                        }
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default Cutting;
