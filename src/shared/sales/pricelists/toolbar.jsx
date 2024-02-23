import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Menu, Row, Col } from "antd";


const Toolbar = () => {
  const router = useRouter();
	const { id } = router.query;

  const navLinks = [
    {
      key: "/sales/sales-pricelist/[id]",
      label: <Link href={`/sales/sales-pricelist/${id}`}>Details</Link>,
    }, 
    {
      key: "/sales/sales-pricelist/[id]/rows",
      label: <Link href={`/sales/sales-pricelist/${id}/rows`}>Item Rows</Link>,
    }
  ];


  return (

      <Menu mode="horizontal" className="transparent" items={navLinks} selectedKeys={[router.pathname]}/>

  );
};

export default Toolbar;
