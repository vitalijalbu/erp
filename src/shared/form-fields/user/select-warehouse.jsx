import React, { useState, useEffect, useCallback } from "react";
import { Select } from "antd";
import { getAllCompanyWarehouses } from "@/api/companies";
// import { getSession } from "@/lib/api";

const SelectWarehouse = (props) => {
    const { name, value, onChange, disabled, withShared, companyId } = props;
    // const user = getSession();
    // const defaultValue = user?.company?.language;

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);

    useEffect(() => {
        if(companyId !== undefined){
            setLoading(true);
            getAllCompanyWarehouses(companyId).then(({ data, error }) => {
                if (!error) {
                    setData(
                        data?.map((item) => ({
                            label: item.IDcompany + " - " + item.IDcountry + " - " + item.desc,
                            value: item.IDwarehouse.toString(),
                        })) || [],
                    );
                    setLoading(false);
                } else {
                    console.log("An error occurred while fetching API");
                    setLoading(false);
                }
            });
    }
    }, [companyId]);

    // useEffect(() => {
    //     if (value === undefined && !disabled) {
    //         onChange(defaultValue);
    //     }
    // }, []);

    return (
        <Select
            name={name}
            options={data}
            value={value}
            onChange={onChange}
            //defaultValue={user?.company?.language ?? null}
            loading={loading}
            placeholder="Select warehouse"
            optionFilterProp="label"
            filterOption={(input, option) => (option?.label.toLowerCase() ?? "").includes(input.toLowerCase())}
            allowClear
            showSearch
        />
    );
};

export default SelectWarehouse;
