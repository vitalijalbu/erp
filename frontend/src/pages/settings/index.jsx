import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Row, Col, Card, Button, Form, Avatar, Typography, Layout } from "antd";
import PageActions from "@/shared/components/page-actions";
const { Text, Title } = Typography;
const { Meta } = Card;
const { Sider } = Layout;
import Toolbar from "@/shared/settings/users/toolbar";
import navLinks from "@/shared/settings/nav-links";


const Index = () => {
  const [loading, setLoading] = useState(false);



  return (
    <div className="page">
       <PageActions
        title="Settings"
      />
    <div className="page-content">
     {navLinks.map((section, i) => (
          <Row gutter={[16, 16]} className="mb-3">
            <Col key={i} span={24}>
              <Title level={5}>{section.title}</Title>
            </Col>
            {section.items.map((item, j) => (
              <Col span={4} xl={6} lg={6} md={4} sm={24} xs={24} key={j}>
                <Card>
                  <Link href={item.url}>
                    <Meta
                      avatar={<Avatar shape="square" size="small">{item.icon}</Avatar>}
                      title={item.label}
                      description={item.description}
                    />
                  </Link>
                </Card>
              </Col>
            ))}
          </Row>
        ))}
    </div>
    </div>
  );
};

export default Index;
