import React, { useEffect, useState } from 'react';
import { Select, Form, Input } from 'antd';
import { ColumnWidthOutlined, SearchOutlined } from '@ant-design/icons';

export const filterOperatorProps = (form, column, storeFilters, handleTableChange, currentFilters, hasOperators) => {
    //const [form] = Form.useForm();
    // Set operator type
    const operators = {
        "numeric": [
            {
                "value": "*",
                "label": "*"
            },
            {
                "value": "=",
                "label": "="
            },
            {
                "value": "!=",
                "label": "!="
            },
            {
              "value": ">",
              "label": ">"
            },
            {
                "value": ">=",
                "label": ">="
            },
            {
              "value": "<",
              "label": "<"
            },
            {
                "value": "<=",
                "label": "<="
            }
        ],
        "string": [
            {
                "value": "*",
                "label": "*"
            },
            {
                "value": "=",
                "label": "="
            },
            {
                "value": "!=",
                "label": "!="
            }
        ]
    }

    const handleSubmit = (_confirm, reload) => {
        _confirm();
        storeFilters({column: column.key, value: form.getFieldsValue() });
        if(reload) {
            setTimeout(() => {
                handleTableChange(); 
            }, 0);
        }
    };

    const handleReset = (_confirm, reload) => {
        form.resetFields();
        _confirm();
        storeFilters({column: column.key, value: null });
        if(reload) {
            setTimeout(() => {
                handleTableChange(); 
            }, 0);
        }
    };

    const operatorsByType = (columnType) => {
        if(columnType == 'number' || columnType == 'currency') {
            return operators['numeric'];
        }

        return operators['string'];
    }

    return {
        filterComponent: ({ confirm, clearFilters }) => (
            <Form form={form} initialValues={hasOperators ? { operator: '*', value: '' } : {}}>
                {hasOperators ? (
                    <Form.Item name="operator" className="filter-operator">
                        <Select 
                            options={operatorsByType(column?.type || 'string')} 
                            onChange={() => {
                                if(form.getFieldValue('value')?.length) {
                                    handleSubmit(confirm, true)
                                }
                            }}
                            popupClassName="filter-operator-dropdown"
                        />
                    </Form.Item>)
                    : null
                } 
                <Form.Item name="value">
                    <Input 
                        key={'filter-input-for-' + column.key}
                        placeholder={`Search by ${column.title}`} 
                        allowClear
                        onFocus={(e) => {
                            console.log(column.key);
                        }}
                        onChange={(e) => {
                            if (e.type === 'click') {
                                handleReset(confirm, true) // remove filters on click X clear icon 
                            }
                        }}      
                        onBlur={() => {
                            if(form.getFieldValue('value')?.length) {
                                handleSubmit(confirm)
                            }
                            else {
                                handleReset(confirm)
                            }
                        }}
                        onPressEnter={() => {
                            if(form.getFieldValue('value')?.length) {
                                handleSubmit(confirm, true)
                            }
                            else {
                                handleReset(confirm, true)
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
