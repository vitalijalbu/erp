import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Menu } from "antd";


const Toolbar = () => {
  const router = useRouter();
  const { id } = router.query;
  const navLinks = [
    {
      key: "/inventory/[id]",
      label: <Link href={`/inventory/${id}`}>Inventory details</Link>,
    },
    {
      key: "/inventory/[id]/adjustments",
      label: <Link href={`/inventory/${id}/adjustments`}>Report adjustments</Link>,
    },
  ];


  return (
    <Menu mode="horizontal" items={navLinks} selectedKeys={[router.pathname]}/>
  );
};

export default Toolbar;
