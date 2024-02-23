import React, { useState, useEffect, useCallback } from "react";
import { getGraphStock } from "@/api/reports/stocks";
import UserPermissions from "@/policy/ability";
import {
    Form,
    Row,
    Col,
    Card,
    Button,
    DatePicker,
    Input,
    Typography,
    Empty,
    Alert,
    message,
    Select,
    Space,
    Tag
} from "antd";
const { Text } = Typography;
import PageActions from "@/shared/components/page-actions";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from "recharts";
import { IconPrinter } from "@tabler/icons-react";
import ItemSearch from "@/shared/form-fields/items/item-search";
import { useValidationErrors } from "@/hooks/validation-errors";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { dateTZFormatter, numberFormatter } from "@/hooks/formatter";

const StockDate = () => {
    //Set page permissions
    if (!UserPermissions.authorizePage("report.show")) {
        return false;
    }
    const [loading, setLoading] = useState(false);
    const [graphData, setGraphData] = useState([]);
    const [form] = Form.useForm();
    const [items, setItems] = useState([]);
    const [options, setOptions] = useState([]);
    const validationErrorsBag = useValidationErrors();

    const selectItem = (item) => {

    }

    const printGraph = () => {
        html2canvas(document.getElementById('graphs')).then(canvas => {
            var pdf = new jsPDF('p', 'pt', 'A4');  //A4	
            pdf.addImage(canvas, 'JPEG', 0, 0, 600, canvas.height / (canvas.width / 600));		// image, format, x, y, width, height
            pdf.save('CSM_line_graph_stock_at_date.pdf');
        });
    }


    const handleSubmit = async (values) => {

        const filters = {
            idItem: values?.idItem,
            dateFrom: values?.dateFrom?.format("YYYY-MM-DD"),
            dateTo: values?.dateTo?.format("YYYY-MM-DD")
        }
        validationErrorsBag.clear();
        setLoading(true);
        const { data, error, validationErrors } = await getGraphStock(filters)
        if (error) {
            if (validationErrors) {
                validationErrorsBag.setValidationErrors(validationErrors);
            }
            message.error(error?.response?.data?.message || "Error during data fetching");
        }
        else {
            //add min e max to data
            for (let point in data.stockLimits) {
                data.stockLimits[point]['date'] = dateTZFormatter(data.stockLimits[point]['date']);
                data.stockLimits[point]['qty'] = numberFormatter(data.stockLimits[point]['qty']);
                data.stockLimits[point]['qty_min'] = data.minMaxStockLimits?.qty_min ? numberFormatter(data.minMaxStockLimits?.qty_min) : null;
                data.stockLimits[point]['qty_max'] = data.minMaxStockLimits?.qty_max ? numberFormatter(data.minMaxStockLimits?.qty_max) : null;

            }
            const currentData = graphData;

            currentData.push({
                ...data,
                dateFrom: values.dateFrom.format("YYYY-MM-DD"),
                dateTo: values.dateTo.format("YYYY-MM-DD")
            })

            setGraphData(currentData);
        }

        setLoading(false);
    };


    return (
        <div className="page">
            <PageActions
                title="Stock a date report"
                extra={[<Button icon={<IconPrinter />} disabled={graphData.length == 0} key={1} onClick={printGraph}>Print</Button>
                ]}
            >
                <Form form={form} onFinish={handleSubmit}>
                    <Row gutter={16}>
                        <Col flex="auto">
                            <Form.Item name="idItem" label="Item" {...validationErrorsBag.getInputErrors('idItem')}>
                                <ItemSearch
                                    onChange={selectItem}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="dateFrom" label="Date from" {...validationErrorsBag.getInputErrors('dateFrom')}>
                                <DatePicker allowClear format="YYYY-MM-DD" />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="dateTo" label="Date to" {...validationErrorsBag.getInputErrors('dateTo')}>
                                <DatePicker allowClear format="YYYY-MM-DD" />
                            </Form.Item>
                        </Col>
                        <Col>
                            <Form.Item>
                                <Space>
                                <Button type="primary" htmlType="submit" loading={loading}>
                                    Apply filters
                                </Button>
                                <Button disabled={graphData.length == 0} danger onClick={() => setGraphData([])}>
                                    Reset
                                </Button>
                                </Space>
                               
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </PageActions>
            <Row>
                <Col span={24}>
                    <Space id="graphs" direction="vertical" style={{ display: 'flex' }}>
                        {graphData.map((data) => (
                            <Card
                                key={'graph-' + Math.random()}
                                title={`${data.item.item} ${data.item.item_desc} (${data.dateFrom} - ${data.dateTo})`}
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={data.stockLimits}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" interval={2} />
                                        <YAxis type="number" domain={[0, "dataMax + 30"]} />
                                        <Tooltip />
                                        <Area
                                            type="monotone"
                                            dataKey="qty"
                                            stroke="#33855c"
                                            fill="#33855c"
                                            legendType="rect"
                                            label={`${data.item.item} ${data.item.item_desc}`}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="qty_min"
                                            stroke="#ff0000"
                                            fill="#ff0000"
                                            legendType="rect"
                                            label="Min"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="qty_max"
                                            stroke="#f0ad4e"
                                            fill="#f0ad4e"
                                            legendType="rect"
                                            label="Max"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                                <Space direction="horizontal" align="center" style={{ display: 'flex', justifyContent: 'center' }}>
                                    <Tag color="#33855c">{`${data.item.item} ${data.item.item_desc}`}</Tag>
                                    <Tag color="#ff0000">Min</Tag>
                                    <Tag color="#f0ad4e">Max</Tag>
                                </Space>
                            </Card>
                        ))}
                    </Space>
                </Col>
            </Row>
        </div>
    );
};

export default StockDate;
