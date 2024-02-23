import React, { useState } from 'react';
import { Form, Input, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

export const filterDropdownProps = (form, column, storeFilters, handleTableChange, currentFilters) => {
    //const [form] = Form.useForm();

    const handleSubmit = (_confirm, reload) => {
        _confirm();
        storeFilters({column: column.key, value: form.getFieldsValue() });
        if(reload) {
            setTimeout(() => {
                handleTableChange(); 
            }, 0);
        }
    };

    const handleReset = (_confirm) => {
        form.resetFields();
        _confirm();
        storeFilters({column: column.key, value: null });
        setTimeout(() => {
            handleTableChange();
        }, 0);
    };
    
    return {
        filterComponent: ({ confirm, clearFilters }) => (
            <Form form={form}>
                <Form.Item name="value">
                    <Select
                        showSearch
                        placeholder={`Search by ${column.title}`}
                        optionFilterProp="children"
                        filterOption={(input, option) => (option?.label.toLowerCase() ?? '').includes(input.toLowerCase())}
                        // filterSort={(optionA, optionB) =>
                        //     (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
                        // }
                        options={column?.filterOptions || []}
                        onChange={() => {
                            if(form.getFieldValue('value') !== undefined && form.getFieldValue('value') !== null) {
                                handleSubmit(confirm, true)
                            }
                            else {
                                handleReset(confirm)
                            }
                        }}
                        allowClear
                        popupClassName="filter-value-dropdown"
                    />
                </Form.Item>
            </Form>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined style={{ color: currentFilters[column.key] ? '#1890ff' : undefined }} />
        ),
        onFilter: (value, record) => {
            return true;
        }
    };
};
