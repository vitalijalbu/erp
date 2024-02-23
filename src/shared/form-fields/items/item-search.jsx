import React, { useState, useEffect, useCallback, useRef } from "react";
import { searchItemsAutocomplete } from "@/api/items";
import {
    Form,
    message,
    Select,
    Spin
} from "antd";

const ItemSearch = (props) => {
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState([]);
    const [options, setOptions] = useState([]);
    const fetchRef = useRef(0);

    const searchItems = async (text) => {
        fetchRef.current += 1;
        const fetchId = fetchRef.current;
        setOptions([]);
        setLoading(true);
        const { data, error } = await searchItemsAutocomplete(text);
        if (!error) {
            if (fetchId !== fetchRef.current) {
                return;
            }
            setOptions(data.map(i => ({
                label: i[1].item + ' ' + i[1].item_desc,
                value: i[1].id
            })));
            setLoading(false);
        }
        else {
            console.log(error);
            message.error("Error while searching items");
        }
    }

    return (
        <Select
            showSearch
            defaultActiveFirstOption={false}
            allowClear
            filterOption={false}
            options={options}
            onSearch={(text) => searchItems(text)}
            placeholder="Search item"
            notFoundContent={loading ? <Spin size="small" /> : "Nothing found"}
            {...props}
        />
    );
};

export default ItemSearch;
