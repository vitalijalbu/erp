import React, { useState, useEffect, useCallback, useRef } from "react";
import {
	Row,
	Col,
	Tag,
	Button,
	Modal,
	Form,
	message,
	Typography,
	Card,
	Select,
	Input,
	Alert,
	Divider,
	InputNumber,
	Space,
	Table,
} from "antd";

const ConfigurationDetailsTable = (props) => {
	const configuration = props.configuration || [];
	const mappedData = configuration.map((feature) => ({
		feature: feature.label,
		value: feature.value.map((value) => {
			if(_.isObject(value.label)){
				return _.map(value.label, (v,k)=> v)
			}
			return value.label
		}).join(', '),
	})) 
	return (
		<Table
			columns={[
				{
					title: "Feature",
					key: "feature",
					dataIndex: "feature",
					render: (e) => <b>{e}</b>,
				},
				{ title: "Value", key: "value", dataIndex: "value", },
			]}
			showHeader={false}
			pagination={false}
			dataSource={mappedData}
		></Table>
	);
};

export default ConfigurationDetailsTable;
