import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import UserPermissions from "@/policy/ability";
import { Row, Col, Card, Button, Avatar, Typography } from "antd";
import PageActions from "@/shared/components/page-actions";
const { Text, Title } = Typography;
const { Meta } = Card;
import navLinks from "@/shared/configurator/nav-links";

const Index = () => {
  //Set page permissions
  if (!UserPermissions.authorizePage("configurator.manage")) {
    return false;
  }
  const [loading, setLoading] = useState(false);

  return (
    <div className="page">
      <PageActions title="Integrations" />
      <div className="page-content">
        {navLinks.map((section, i) => (
          <Row gutter={[16, 16]}>
            <Col key={i} span={24}>
              <Title level={5}>{section.title}</Title>
            </Col>
            {section.items.map((item, j) => (
              <Col span={4} xl={6} lg={6} md={4} sm={24} xs={24} key={j}>
                <Card>
                  <Link href={item.url}>
                    <Meta
                      avatar={<Avatar shape="square" size="small" icon={item.icon} className="mr-1"/>}
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
