import React, { useState, useEffect } from "react";
import {
    Card, Col, Input, Row, Table, Typography,
} from "antd";
import { getAllTimezones } from "@/api/globals";
import _ from "lodash";
import { useRouter } from "next/router";
import PageActions from "@/shared/components/page-actions";


const TableTimeZone = (selectable = false, onSelect) => {
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState(null);
    const [localData, setLocalData] = useState(null);
    const [filteredData, setFilteredData] = useState([])
    const [searchValue, setSearchValue] = useState('')
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { data, error } = await getAllTimezones();
            if (!error) {
                const formattedData = Object.entries(data).map(([tz, tzLabel]) => ({
                    timezone: tzLabel,
                    id: tz,
                }));
                setLocalData(formattedData);
                setFilteredData(formattedData);
            }
            setLoading(false);
        };

        if (router.isReady) {
            fetchData();
        }
    }, [router.isReady]);

    useEffect(() => {
        const handleFiltering = _.debounce((value) => {
            if (value.trim() === '') {
                setFilteredData(localData);
            } else {
                setFilteredData(
                    localData.filter((o) =>
                        o.timezone.toLowerCase().includes(value.toLowerCase())
                    )
                );
            }
        }, 300);

        handleFiltering(searchValue);
    }, [searchValue, localData]);

    const tableColumns = [
        {
            title: "Timezone",
            key: 'timezone',
            render: ({ timezone }) => {
                return <td className="p-05">{timezone}</td>
            }
        }
    ]

    return (
        <div className="page-content overflow-x-hidden">
            <PageActions
                title="Time Zones"
            />
            <Row gutter={8}>
                <Col span={24} className="pb-1">
                    <Typography.Text className="text-muted">
                        Found: {filteredData ? filteredData.length : 0} elements
                    </Typography.Text>
                </Col>
                <Col span={24}>
                    <Card className="p-0">
                        <Row gutter={16}>
                            <Col span={8}>
                                <Input
                                    placeholder="Search Time Zone"
                                    onChange={({ target }) => setSearchValue(target.value)}
                                    value={searchValue}
                                    allowClear
                                    className="m-1"
                                />
                            </Col>
                            <Col span={24}>
                                <Table
                                    columns={tableColumns}
                                    dataSource={filteredData || []}
                                    rowKey={(record) => record.id}
                                    loading={loading}
                                    pagination={{ position: ['bottomCenter'] }}
                                    className="erp-datatable"
                                />
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>
        </div>
    )
}

export default TableTimeZone;