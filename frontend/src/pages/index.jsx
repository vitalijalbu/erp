import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Col, Row, Card, Avatar, Typography } from 'antd';
const { Title, Text } = Typography;


import PageActions from "@/shared/components/page-actions";
//import ActivityView from "@/shared/dashboard/activity-view";
import DashboardLinks from "@/shared/dashboard/dashobard-links";
//import FastLinks from "@/shared/dashboard/fast-links";



  
const Index = () => {

    return (
        <div className="page">
        <PageActions title="Dashboard"/>
        <div className="page-content">
        <DashboardLinks/>
        {/* <Row gutter={16}>
            <Col span={24}>
              <Title level={5}>Recent activity</Title>
              </Col>
            <Col span={24}>
            <Card title="Activity Viewer" className="p-0"> 
                <ActivityView/>
            </Card>
            </Col>  

        </Row> */}
    </div>
    </div>
    );
};

export default Index;
