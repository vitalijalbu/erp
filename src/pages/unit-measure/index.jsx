import React, { useState, useEffect } from "react";
import { getAllUM } from "@/api/globals/index";
import {
    Row,
    Col,
    Tag,
    Table,
    message
} from "antd";
import PageActions from "@/shared/components/page-actions";


const Index = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);


      // API Call
  useEffect(() => {
    setLoading(true);
    getAllUM()
      .then(({ data, error }) => {
        if (!error) {
            setData(data || []);
        } else {
          message.error("An error occurred while fetching API");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const tableColumns = [
    {
        title: "UM",
        key: "IDdim",
        render: ({ IDdim }) => <Tag color="blue">{IDdim}</Tag>,
    },
    {
        title: "Um desc",
        dataIndex: "desc",
        key: "desc",
    },
    {
        title: "Request dimension",
        dataIndex: "um_dimensions",
        key: "um_dimensions",
        render: (umDimensions) => (
            <span>{umDimensions.length > 0 ? umDimensions[0].umdesc : ""}</span>
        ),
    },
    {
        title: "Um dimension",
        dataIndex: "um_dimensions",
        key: "um_dimensions",
        render: (umDimensions) => (
            <span>{umDimensions.length > 0 ? umDimensions[0].um : ""}</span>
        ),
    },
];


  return (
    <div className="page">
        <PageActions
            backUrl="/items"
            title="Units of Measure"
        />
      
        <div className="page-content">
            <Row>
                <Col span={24} className="mb-3">
                    <Table
                        dataSource={data}
                        loading={loading}
                        columns={tableColumns}
                        rowKey={(record) => record.IDdim}
                        pagination={false}
                    />
                </Col>
            </Row>
        </div>
    </div>
  );
};

export default Index;
