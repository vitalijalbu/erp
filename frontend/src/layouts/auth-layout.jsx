import { Row, Col, Card } from "antd";
import Head from 'next/head';
import NonSSRWrapper from '@/helpers/no-ssr'; 


function AuthLayout({children}) {

  return (
    <NonSSRWrapper>
     <Head>
        <title>CHIORINO-ERP</title>
      </Head>
    <div className="auth-page show-fake-browser login-page">
      <Row
        type="flex"
        justify="center"
        align="middle"
        style={{ height: "100vh" }}
      >
        <Col span={8} xl={6} lg={8} md={12} sm={16} xs={18}>
          <Card className="auth-card">{children}</Card>
        </Col>
      </Row>
    </div>
    </NonSSRWrapper>
  );
}
export default AuthLayout;

