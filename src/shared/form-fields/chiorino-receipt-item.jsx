import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { getLotTrackingReport, exportReportsTracking } from "@/api/reports/lots";
import { 
    Alert, 
    Space, 
    Row, 
    Col, 
    Form, 
    Input,
    Table, 
    Button, 
    message, 
    DatePicker, 
    Tag, 
    Typography, 
    Card,
    Select,
    Tooltip,
    InputNumber
} from "antd";
import PageActions from "@/shared/components/page-actions";
import { useValidationErrors } from "@/hooks/validation-errors";
import { getFromChiorinoItems } from "@/api/receipts";
import { getAllWarehouses } from "@/api/warehouses";
import { numberFormatter, dateTZFormatter } from "@/hooks/formatter";
import { getSession } from "@/lib/api";
import dayjs from "dayjs";
import { IconArrowsMove } from "@tabler/icons-react";
const { Text } = Typography;


const ChiorinoReceiptItem = (props) =>  {

    const item = props.item;
    const index = props.index;
    const locations = props.locations;
    const itemsRef = useRef([]);
    const applyLocation = props.applyLocation;
    const confirmForm = props.confirmForm;
    const validationErrors = props.validationErrors;


    const getPermittedDimensions = useCallback((dimensions) => {
        return dimensions.split(',').map((d) => {
            const value = d.split(':');
            return {
                code: value[0].toLowerCase(),
                label: value[1]
            };
        });
    }, [item]);

    const touchFields = useCallback((index, field, initial) => {
        const item = itemsRef.current?.[index]?.[field];
        if(item) {
            if(confirmForm.getFieldValue([index, field]) == initial) {
                item.classList.remove('touched');
            }
            else {
                item.classList.add('touched');
            }
        }
    }, [index]);

    return (<Card
        key={'item-' + item.IDrecord}
        className="chiorino-receipt-item mb-1"
        title={
            <Space direction="horizontal" style={{alignItems: 'censtartter'}}>
                <Tooltip title={(<>
                    <span>YES: The lot will be received</span><br />
                    <span>NO: to skip the record (and it will not be received)</span>
                </>)}>
                    <Form.Item name={[index, 'received']}>
                        <Select
                            options={[{label: 'Yes', value: 1}, {label: 'No', value: 0}]}
                        ></Select>
                    </Form.Item>
                </Tooltip>
                <Tooltip title="Supplier Lot">
                    <Tag color="green">{item.t_clot}</Tag>
                </Tooltip>
                <Tooltip 
                    title={`Item: ${item.item} - ${item.item_desc}${item.altv_code ? (`${item.altv_code} - ${item.altv_desc}`) : ''}`}
                >
                    <Tag color="blue">{`${item.item} - ${item.item_desc}`}</Tag>
                </Tooltip>
                <Tooltip 
                    title={`Quantity: ${numberFormatter(item.t_qshp)} ${item.um}`}
                >
                    <Tag color="grey">{`${item.t_qshp} ${item.um}`}</Tag>
                </Tooltip>
                <Tooltip 
                    title={`Eur1 Yes(Y) or Not(N)`}
                >
                    <Tag bordered={false} color="geekblue">{item.eur1 == 0 ? 'EUR1: N': 'EUR1: Y'}</Tag>
                </Tooltip>
                <Tooltip 
                    title={`Configured item Yes(Y) or Not(N)`}
                >
                    <Tag bordered={false}>{item.conf_item == 0 ? 'CFG: N': 'CFG: Y'}</Tag>
                </Tooltip>
                <Tooltip 
                    title={`Delivery note: ${item.t_deln} ${dateTZFormatter(item.delivery_note_date)}`}
                >
                    <Tag bordered={false} color="gold">{`${item.t_deln} ${dateTZFormatter(item.delivery_note_date)}`}</Tag>
                </Tooltip>
                {
                    item.LotAlreadyRec != 0 && 
                    <Tooltip 
                        title="Warning! This lot has already been received on the system, please check the ID on tracking page before proceed. The system will automatically set to NO this record"
                    >
                        <Tag color="red">Warning! ALREADY RECEIVED</Tag>
                    </Tooltip>
                    
                }
            </Space>
        }
    >
        <Row>
            <Col>
                <Space direction="horizontal" style={{alignItems: 'start'}}>
                    <Tooltip 
                        title="Lot Date"
                    >
                        <Form.Item name={[index, 'ltdat']} {...validationErrors.getInputErrors(`lots.${item.IDrecord}.lotDate`)}>
                            <DatePicker
                                onChange={() => {
                                    //refs not works with Select
                                    if(confirmForm.getFieldValue([index, 'ltdat'])?.format('YYYY-MM-DD') == dayjs(item['ltdat']).format('YYYY-MM-DD')) {
                                        document.getElementById(`${index}_ltdat`).parentNode.parentNode.classList.remove('touched');
                                    }
                                    else {
                                        document.getElementById(`${index}_ltdat`).parentNode.parentNode.classList.add('touched');
                                    }
                                }}
                            ></DatePicker>
                        </Form.Item>
                    </Tooltip>
                    <Tooltip 
                        title="Order Reference"
                    >
                        <Form.Item name={[index, 'orref']} {...validationErrors.getInputErrors(`lots.${item.IDrecord}.ordRef`)}>
                            <Input
                                ref={el => {
                                    if(!(index in itemsRef.current)) {
                                        itemsRef.current[index] = {};
                                    }
                                    itemsRef.current[index]['orref'] = el?.input;
                                }} 
                                onChange={() => {
                                    touchFields(index, 'orref', item['t_corn']);
                                }}
                            ></Input>
                        </Form.Item>
                    </Tooltip>
                    <Tooltip 
                        title="Lot Text"
                    >
                        <Form.Item name={[index, 'lttxt']} {...validationErrors.getInputErrors(`lots.${item.IDrecord}.lotText`)}>
                            <Input
                                ref={el => {
                                    if(!(index in itemsRef.current)) {
                                        itemsRef.current[index] = {};
                                    }
                                    itemsRef.current[index]['lttxt'] = el?.input;
                                }} 
                                onChange={() => {
                                    touchFields(index, 'lttxt', item['lttxt']);
                                }}
                            ></Input>
                        </Form.Item>
                    </Tooltip>
                </Space>
            </Col>
            <Col flex={1}></Col>
            <Col>
                <Space direction="horizontal" style={{alignItems: 'start'}}>
                {
                    getPermittedDimensions(item.PermittedDim).map((dim) => (
                        <Tooltip 
                            title={dim.label}
                        >
                            <Form.Item name={[index, dim.code]} {...validationErrors.getInputErrors(`lots.${item.IDrecord}.${dim.code}`)}>
                                <InputNumber
                                    ref={el => {
                                        if(!(index in itemsRef.current)) {
                                            itemsRef.current[index] = {};
                                        }
                                        itemsRef.current[index][dim.code] = el;
                                    }} 
                                    onChange={() => {
                                        touchFields(index, dim.code, item[dim.code]);
                                    }}
                                ></InputNumber>
                            </Form.Item>
                        </Tooltip>
                    ))
                }
                    <Tooltip 
                        title="Location"
                    >
                        <Form.Item name={[index, 'locat']} {...validationErrors.getInputErrors(`lots.${item.IDrecord}.idWarehouseLocation`)}>
                            <Select
                                placeholder="Select location"
                                options={locations.map((loc) => (
                                    {
                                        value: loc.IDlocation,
                                        label: loc.desc
                                    }
                                ))}
                                onChange={() => {
                                    //refs not works with Select
                                    if(confirmForm.getFieldValue([index, 'locat']) == item['locat']) {
                                        document.getElementById(`${index}_locat`).parentNode.parentNode.classList.remove('touched');
                                    }
                                    else {
                                        document.getElementById(`${index}_locat`).parentNode.parentNode.classList.add('touched');
                                    }
                                }}
                            ></Select>
                        </Form.Item>
                    </Tooltip>
                    <Tooltip 
                        title="Apply the selected location on this record on every recors"
                    >
                        <Button 
                            className="btn-dark"
                            icon={<IconArrowsMove></IconArrowsMove>}
                            onClick={()=> applyLocation(index)}
                        />
                    </Tooltip>
                </Space>
            </Col>
        </Row>
    </Card>);
}

export default React.memo(ChiorinoReceiptItem);