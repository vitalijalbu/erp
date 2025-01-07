

import React, { useState, useEffect, useCallback } from "react";
import { Alert, Button, message } from "antd";
import PageActions from "@/shared/components/page-actions";
import { getReportExportAll } from "@/api/stocks";
import UserPermissions from "@/policy/ability";
import { useExport } from "@/hooks/download";
import dayjs from "dayjs";
import { IconDownload } from "@tabler/icons-react";

const StockAll = () => {
    //Set page permissions
    if (!UserPermissions.authorizePage("items_stocks.show")) {
        return false;
    }
    const [loading, setLoading] = useState(false);

    const exportReport = async () => {
        setLoading(true);
        const { data, error } = await getReportExportAll();

        if (!error) {
            useExport(data, `CSM_stock_${dayjs().format('YYYYMMDDHHmm')}.xlsx`);
        }
        else {
            message.error("Error during stock situation export");
        }
        setLoading(false);
    }

    return (
        <div className="page">
            <PageActions
                title="Information: Export complete stock situation."
                extra={
                    <Button type="primary" onClick={exportReport} loading={loading} icon={<IconDownload/>}>Export</Button>
                }
            >
            </PageActions>
        </div>
    )

}

export default StockAll;