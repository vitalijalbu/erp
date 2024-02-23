import React from "react";
import { Button, Result } from "antd";
import Link from "next/link";

const Offline = () => {
  return (
    <div className="page">
      <Result
        status="warning"
        title="Error 503 - Offline"
        subTitle="Pleasae check your API endpoint working correctly."
        extra={[
          <Link href="/">
            <Button key="admin">
              Go to dashboard
            </Button>
          </Link>,
           <Link href="/login">
            <Button type="primary" key="login">
              Go to login page
            </Button>
          </Link>
        ]}
      />
    </div>
  );
};

export default Offline;
