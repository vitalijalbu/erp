import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Col, Row, Card, Statistic, Space, Divider, Button, Dropdown } from 'antd';
import PageLayout from "@/layouts/page-layout";
import Toolbar from "@/shared/dashboard/toolbar";
import PageActions from "@/shared/components/page-actions";

const Create = () => {
    const [loading, setLoading] = useState(false);


    return (
        <div className="page">
            <PageActions
                backUrl="/configurator/functions"
                title="Create new function"
            />
        </div>
    );
};

export default Create;
