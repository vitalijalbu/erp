import { useRouter } from "next/router";
import Link from "next/link";
import { IconChevronLeft } from "@tabler/icons-react";
import { Button, Space } from "antd";

const PopupLayout = ({ backLink, title, children }) => {
  const router = useRouter();

  const onClose = () => {
    router.push(urlClose);
  };
  return (
    <div id="popup-layout" onClose={onClose}>
      <div className="popup_header">
        <Space>
        <Link href={backLink ?? '/'}>
          <Button icon={<IconChevronLeft />}>
            Back
          </Button>
        </Link>
        {title}
        </Space>
      </div>
      <div className="popup_body">
        <div className="container">
          {children}
          </div>
        </div>
    </div>
  );
};

export default PopupLayout;
