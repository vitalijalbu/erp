import React from "react";
import { Button, Result } from "antd";
import { IconAlertCircle } from "@tabler/icons-react";


const NotFoundPage = () => {
  return (
    <div className="page">
      <Result
        icon={<IconAlertCircle color="rgba(0, 0, 0, 0.45)"/>}
        subTitle="404 - Page not found"
        extra={<a href="/"><Button>Back to dashboard</Button></a>}
      />
    </div>
  );
};

export default NotFoundPage;
