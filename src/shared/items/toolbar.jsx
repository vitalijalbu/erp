import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Menu, Row, Col } from "antd";


const Toolbar = () => {
  const router = useRouter();
  const { id } = router.query;

  const navLinks = [
    {
      key: "/items/[id]/edit",
      label: <Link href={`/items/${id}/edit`}>Item details</Link>,
    },
    {
      key: "/items/[id]/stock-limits",
      label: <Link href={`/items/${id}/stock-limits`}>Item Stock limits</Link>,
    },
  ];


  return (

      <Menu mode="horizontal" className="transparent mb-1" selectedKeys={[router.pathname]}items={navLinks}/>

  );
};

export default Toolbar;
