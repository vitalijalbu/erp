import React, { useEffect, useState } from "react";
import { Button, Space, Tag, Typography } from "antd";
const { Text } = Typography;
import _ from "lodash";
import { IconPencilMinus } from "@tabler/icons-react";

const TagSelection = ({ data, selected, row: initialRow, callback, staticKey, displayField, extras, canEdit, onEdit }) => {
    const [row, setRow] = useState(initialRow ?? null);
    const [rowInPage, setRowInPage] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        const selectedID = _.isObject(selected) ? selected.id : selected;
        // setLoading(true)
        try {
            const response = await callback(selectedID);
            if (response?.data.recordsFiltered) {
                setRow(response?.data?.data[0]); //check index from array
            } else {
                setRow(response?.data);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            // Handle error as needed
        }
    };

    useEffect(() => {
        if (selected) {
            const selectedID = _.isObject(selected) ? selected.id : selected;
            // Check if the selectedId is in the array of objects
            if (selected !== null) {
                const isIdInPage = _.some(data, { id: selectedID });
                setRowInPage(isIdInPage);
            }

            if (staticKey === true || _.isObject(selected)) {
                setRow(selected);
            } else if (selected && !_.isArray(selected)) {
                // If staticKey is not provided or false, fetch data when selected changes
                fetchData();
            }
            setTimeout(() => setLoading(false), 1000);
        } else {
            setRow(null);
            setRowInPage(false);
            setTimeout(() => setLoading(false), 500);
        }
    }, [selected, data, staticKey]);

    return (
        <>
            {!loading && !rowInPage && row && (
                <>
                    <Space>
                        <Text>Current selection:</Text>
                        <Space size={2}>
							<Tag color="blue">{row?.[displayField]}</Tag>
                        	{canEdit && <Button title="Edit selection record" icon={<IconPencilMinus />} onClick={onEdit} type="dashed" size="small" />}
						</Space>
                    </Space>
                </>
            )}
        </>
    );
};

export default TagSelection;
