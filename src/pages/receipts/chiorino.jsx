

import React, { useState, useEffect, useCallback, useRef } from "react";
import UserPermissions from "@/policy/ability";
import { getLotTrackingReport, exportReportsTracking } from "@/api/reports/lots";
import { 
    Alert, 
    Space, 
    Row, 
    Col, 
    Form, 
    Input,
    Button, 
    message,  
    Select,
} from "antd";
import PageActions from "@/shared/components/page-actions";
import { useValidationErrors } from "@/hooks/validation-errors";
import { getFromChiorinoItems, confirmReceiptFromChiorino } from "@/api/receipts";
import { getAllWarehouses } from "@/api/warehouses";
import { numberFormatter, dateTZFormatter } from "@/hooks/formatter";
import { getSession } from "@/lib/api";
import dayjs from "dayjs";
import { IconArrowsMove, IconSearch } from "@tabler/icons-react";
import ChiorinoReceiptItem from "@/shared/form-fields/chiorino-receipt-item";


const ReceiptChiorinoLots = () => {
      //Set page permissions
        if(!UserPermissions.authorizePage("items_receipts.management")) {
            return false;
        }
    const [form] = Form.useForm();
    const [confirmForm] = Form.useForm();
    const validationErrorsBag = useValidationErrors();
    const confirmValidationErrorsBag = useValidationErrors();
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState([]);
    const [found, setFound] = useState(false);
    const [warehouses, setWarehouses] = useState([]);
    const [locations, setLocations] = useState([]);
    const itemsRef = useRef([]);
    const user = getSession();

    useEffect(() => {
        (async() => {
            await loadWarehouses();
        })();
    }, []);

    const loadWarehouses = async () => {
        const {data, error} = await getAllWarehouses();
        if(error) {
            message.error("Error during warehouses loading");
        }
        else {
            setWarehouses(data);
            if(user.IDwarehouseUserDef) {
                loadLocations(data, user.IDwarehouseUserDef);
            }
        }
    }

    const loadLocations = (warehouses, warehouseId) => {
        const selected = warehouses.filter((w) => w.IDwarehouse == warehouseId);
        setLocations([]);
        if(selected[0]) {
            setLocations(selected[0].warehouse_locations);
        }
    }

    const updateLocations = (warehouseId) => {
        const selected = warehouses.filter((w) => w.IDwarehouse == warehouseId);
        setLocations([]);
        let defaultLoc = null;
        if(selected[0]) {
            setLocations(selected[0].warehouse_locations);
            defaultLoc = selected[0].warehouse_locations.filter(
                (l) => l.IDlocation == user.default_warehouse_location_id
            )?.[0]?.IDlocation
        }
        
        const oldValues = confirmForm.getFieldsValue();
        for(let index in items) {
            oldValues[index].locat = defaultLoc;
            //confirmForm.setFieldValue([index, 'locat'], defaultLoc);
        }
        confirmForm.setFieldsValue(oldValues);
    }

    const applyLocation = (index) => {
        const selected = confirmForm.getFieldValue([index, 'locat']);
        const oldValues = confirmForm.getFieldsValue();
        for(let index in items) {
            oldValues[index].locat = selected;
            if(confirmForm.getFieldValue([index, 'locat']) == items[index]['locat']) {
                document.getElementById(`${index}_locat`).parentNode.parentNode.classList.remove('touched');
            }
            else {
                document.getElementById(`${index}_locat`).parentNode.parentNode.classList.add('touched');
            }
        }
        confirmForm.setFieldsValue(oldValues);
    }

    const searchItems = async () => {
        setLoading(true);
        const params = {}
        validationErrorsBag.clear();
        confirmValidationErrorsBag.clear();
        
        if(
            form.getFieldValue('deliveryNote')?.toString().trim().length
        ) {
            params['deliveryNote'] = form.getFieldValue('deliveryNote');
        }
        if(
            form.getFieldValue('idLot')?.toString().trim().length
        ) {
            params['idLot'] = form.getFieldValue('idLot');
        }
        const {data, error, validationErrors} = await getFromChiorinoItems(params)
        if(error) {
            if(validationErrors) {
                validationErrorsBag.setValidationErrors(validationErrors);
            }
            else {
                message.error("Error during items data fetching");
            }
            setFound(false);
        }
        else {
            setFound(true);
        }
        setItems(data);
        confirmForm.resetFields();
        confirmForm.setFieldsValue(data.map((item) => (
            {
                received: item.LotAlreadyRec == 0 ? 1 : 0,
                ltdat: dayjs(),
                orref: item.t_corn,
                ...(getPermittedDimensions(item.PermittedDim).map((dim) => (
                    {
                        [dim.code]: item[dim.code] || item[dim.code.toUpperCase()]
                    }
                ))).reduce((acc, i) => ({...acc, ...i}), {}),
                locat: locations.filter((l) => l.IDlocation == user.default_warehouse_location_id)?.[0]?.IDlocation
            }
        )));
        form.setFieldValue('warehouse', user.IDwarehouseUserDef);
        setLoading(false);
    }

    const confirmReception = async () => {
        const data = confirmForm.getFieldsValue();
        const body = {lots: {}};
        if(
            form.getFieldValue('deliveryNote')?.toString().trim().length
        ) {
            body['deliveryNote'] = form.getFieldValue('deliveryNote');
        }
        if(
            form.getFieldValue('idLot')?.toString().trim().length
        ) {
            body['idLot'] = form.getFieldValue('idLot');
        }

        for(let index in items) {
            
            const itemValues = confirmForm.getFieldValue(index);
            const dims = getPermittedDimensions(items[index].PermittedDim).map((d) => d.code);
            body['lots'][items[index].IDrecord] = {};
            
            for(let dim of dims) {
                body['lots'][items[index].IDrecord][dim] = itemValues[dim] || itemValues[dim.toUpperCase()];
            }
            
            body['lots'][items[index].IDrecord]['received'] = itemValues['received'];
            body['lots'][items[index].IDrecord]["ordRef"] = itemValues['orref'];
            body['lots'][items[index].IDrecord]["lotText"] = itemValues['lttxt'];
            body['lots'][items[index].IDrecord]["lotDate"] = itemValues['ltdat']?.format('YYYY-MM-DD')
            body['lots'][items[index].IDrecord]["idWarehouse"] = form.getFieldValue('warehouse');
            body['lots'][items[index].IDrecord]["idWarehouseLocation"] = itemValues['locat'];
            
        }

        confirmValidationErrorsBag.clear();
        validationErrorsBag.clear();
        const {result, error, validationErrors} = await confirmReceiptFromChiorino(body);
        if(error) {
            if(validationErrors) {
                confirmValidationErrorsBag.setValidationErrors(validationErrors);
                validationErrorsBag.setValidationErrors(validationErrors);
            }
            message.error("Error during items Reception");
        }
        else {
            message.success("Items received sucessfully");
            confirmValidationErrorsBag.clear();
            validationErrorsBag.clear();
            await searchItems();
        }
    }

    const getPermittedDimensions = (dimensions) => {
        return dimensions.split(',').map((d) => {
            const value = d.split(':');
            return {
                code: value[0].toLowerCase(),
                label: value[1]
            };
        });
    }

    return (
        <div className="page">
            <PageActions
                title={`Receipt lots from Chiorino S.p.A,`}
            />
            <Form form={form} layout="inline">
                <Space direction="horizontal" style={{alignItems: 'flex-start'}}>
                    <Form.Item name="deliveryNote" {...validationErrorsBag.getInputErrors('deliveryNote')}>
                        <Input placeholder="Delivery Note ID..."></Input>
                    </Form.Item>
                    <Form.Item name="idLot" {...validationErrorsBag.getInputErrors('idLot')}>
                        <Input placeholder="...or single lot code"></Input>
                    </Form.Item>
                    <Button type="primary" icon={<IconSearch/>} loading={loading} onClick={() => { searchItems() } }>
                        Search
                    </Button>
                </Space>
            </Form>
            {
                found && (
                    items.length > 0 ? 
                    (
                        <>
                        <Form form={form}>
                            <div className="mt-2">
                                <Space direction="horizontal" style={{alignItems: 'flex-start'}}>
                                    <Form.Item name="warehouse" {...validationErrorsBag.getInputErrors('warehouse')}>
                                        <Select
                                            placeholder="Select destination warehouse"
                                            options={warehouses.map((w) => ({
                                                label: w.desc,
                                                value: w.IDwarehouse
                                            }))}
                                            onChange={(value) => updateLocations(value)}
                                        ></Select>
                                    </Form.Item>
                                    <Button type="primary" loading={loading} onClick={() => confirmReception()}>
                                        Confirm Reception
                                    </Button>
                                </Space>
                            </div>
                        </Form>
                        <Form form={confirmForm}>
                            <div className="mt-1">
                                {
                                    items.map((item, index) => (
                                        <ChiorinoReceiptItem 
                                            key={item.IDrecord}
                                            item={item} 
                                            index={index}
                                            locations={locations}
                                            confirmForm={confirmForm}
                                            applyLocation={applyLocation}
                                            validationErrors={confirmValidationErrorsBag}
                                        ></ChiorinoReceiptItem>
                                    ))
                                }
                            </div>
                        </Form>
                        </>
                    ):
                    (
                        <Alert type="info" message="No data found, check delivery note number or lot id ..."></Alert>
                    )
                )
            }
        </div>
    );
};

export default ReceiptChiorinoLots;
