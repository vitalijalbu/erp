import React, { useState } from "react";
import UserPermissions from "@/policy/ability";
import { getAllWarehouseLocationReport } from "@/api/warehouses";
import { Row, Col, Button, Tag } from "antd";
import { IconPlus } from '@tabler/icons-react';
import PageActions from "@/shared/components/page-actions";
import WarehouseAdd from "@/shared/warehouses/add";
import LocationAdd from "@/shared/warehouses/location-add";

import Datatable from "@/shared/datatable/datatable";

const Index = () => {
    //Set page permissions
    if (!UserPermissions.authorizePage("warehouses.management")) {
        return false;
    }

    const [warehouseAddDrawer, setWarehouseAddDrawer] = useState(false);
    const [locationAddDrawer, setLocationAddDrawer] = useState(false);

    const [reload, setReload] = useState(1);
    const [currentLocation, setCurrentLocation] = useState(null);


    const handleTableChange = async (params) => {
        const result = await getAllWarehouseLocationReport(params);
        return result.data;
    };

    const tableColumns = [
        {
            title: "Country",
            key: "country_description",
            sorter: false
        },
        {
            title: "Warehouse",
            key: "warehouse_description",
            sorter: false
        },
        {
            title: "Location",
            key: "location_description",
            sorter: false
        },
        {
            title: "Location Note",
            key: "location_note",
            sorter: false
        },
        {
            title: "Location Type",
            key: "location_type",
            sorter: false,
            render: ({location_type}) => <Tag>{location_type}</Tag>,
            filterOptions: ([{label: "Stock", value:"stock"}, {label: "Transit", value:"transit"}, {label: "Quality control", value:"quality"}])
        },
        /*
        {
            title: "Actions",
            key: "actions",
            align: "right",
            render: (row, value, i) => (
                <Button icon={<IconPencilMinus />} title="Edit warehouse Location" onClick={() => {
                    setCurrentLocation(row);
                    setLocationAddDrawer(true);
                }}> Edit
                </Button>
            )
        }
        */
    ]

    return (
        <div className="page">
            <PageActions
                title="Warehouses / Locations"
                extra={[
                    <Button key={0} type="primary" onClick={() => setWarehouseAddDrawer(true)}  icon={<IconPlus/>}>Add new Warehouse</Button>,
                    <Button key={1} onClick={() => setLocationAddDrawer(true)}  icon={<IconPlus/>}>Add new Location</Button>
                ]}
            />
            <Row>
                <Col span={24}>
                    <Datatable
                        fetchData={handleTableChange}
                        columns={tableColumns}
                        watchStates={[reload]}
                        rowKey={(record) => record.location_id}
                    />
                </Col>
            </Row>

            <WarehouseAdd opened={warehouseAddDrawer} onClose={() => { setWarehouseAddDrawer(false); setReload(reload + 1) }} />
            <LocationAdd id={currentLocation?.location?.id} warehouseId={currentLocation?.warehouse?.id} opened={locationAddDrawer} onClose={() => { setLocationAddDrawer(false); setReload(reload + 1); setCurrentLocation(null); }} />
        </div>
    );
};

export default Index;
