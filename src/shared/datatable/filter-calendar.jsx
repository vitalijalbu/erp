import React, { useState } from 'react';
import { Select, Form, DatePicker } from 'antd';
import { SearchOutlined } from '@ant-design/icons';


export const filterCalendarProps = (form, column, storeFilters, handleTableChange, currentFilters, hasOperators) => {
    //const [form] = Form.useForm();
    // Set operator type
    const operators = [
        {
            "value": "=",
            "label": "="
        },
        {
            "value": ">",
            "label": ">"
        },
        {
            "value": "=>",
            "label": "=>"
        },
        {
            "value": "<",
            "label": "<"
        },
        {
            "value": "<=",
            "label": "<="
        }
    ];

    const handleSubmit = (_confirm, reload) => {
        _confirm();
        var values = form.getFieldsValue();
        values['value'] = values['value'] ? values['value'].format('YYYY-MM-DD') : null;
        storeFilters({column: column.key, value: values });
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
            <Form form={form} initialValues={hasOperators ? { operator: '=', value: '' } : {}}>
                {hasOperators ? (
                    <Form.Item name="operator" className="filter-operator">
                        <Select 
                                options={operators} 
                                onChange={() => {
                                    if (form.getFieldValue('value') !== undefined && form.getFieldValue('value') !== null && form.getFieldValue('value') !== "") {
                                        handleSubmit(confirm, true);
                                    } else if (form.getFieldValue('value') === null) {
                                        handleReset(confirm)
                                    }
                                }}
                            />
                    </Form.Item>)
                    : null
                } 
                <Form.Item name="value">
                    <DatePicker 
                        placeholder={`Search ${column.title}`} 
                        allowClear
                        onChange={() => {
                            if(form.getFieldValue('value')) {
                                handleSubmit(confirm, true)
                            }
                            else {
                                handleReset(confirm)
                            }
                        }}
                    />
                </Form.Item>
            </Form>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined style={{ color: currentFilters[column.key] ? '#1890ff' : undefined }} />
        ),
        onFilter: (value, record) => {
            // Implement your filter logic here
            return true;
        }
    };
};
