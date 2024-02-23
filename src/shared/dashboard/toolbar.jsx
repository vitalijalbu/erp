"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Menu, Row, Col } from "antd";
import { getSession } from "@/lib/api";

const navLinks = [
  {
    key: "account",
    label: <Link href="#">Generale</Link>,
  },
  {
    key: "security",
    label: <Link href="#demo">Stock</Link>,
  },
  {
    key: "users",
    label: <Link href="/settings/users">Demo</Link>,
  },
];

const Toolbar = () => {


  return (
    <section className="mb-3">
      <Row>
        <Col span={24}>
          <Menu mode="horizontal" className="transparent" items={navLinks} />
        </Col>
      </Row>
    </section>
  );
};

export default Toolbar;
