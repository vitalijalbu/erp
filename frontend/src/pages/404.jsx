import React from "react";
import Link from "next/link";
import { Button, Result } from "antd";
import { IconAlertCircle, IconArrowLeft } from "@tabler/icons-react";


const NotFoundPage = () => {
  return (
    <div className="page">
      <Result
        icon={<IconAlertCircle/>}
        title="404"
        subTitle="Page not found"
        extra={<Link href="/"><Button type="primary" icon={<IconArrowLeft/>}>Back to homepage</Button></Link>}
      />
    </div>
  );
};

export default NotFoundPage;
