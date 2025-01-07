import React, { useState, useEffect } from "react";
import { DatePicker } from "antd";
import { checkWorkingDays } from "@/api/globals/working-days";
import dayjs from "dayjs";

const SelectDateCheck = (props) => {
	const [loading, setLoading] = useState(false);
	const [start, setStart] = useState(dayjs().startOf("month").format("YYYY-MM-DD"));
	const [end, setEnd] = useState(dayjs().endOf("month").format("YYYY-MM-DD"));
	const [data, setData] = useState([]);

	// Api get data
	useEffect(() => {
		setLoading(true);
		// call api here
		checkWorkingDays({ start, end, type: 0 })
			.then(({ data }) => {
				setData(data || []);
			})
			.finally(() => {
				setLoading(false);
			});
	}, [start, end]);

	// Convert API response to an array of dayjs objects
	const disabledDatesFromApi = data.map((dateString) => dayjs(dateString));

	// disable dates here
	const disabledDate = (current) => {
		const todayStart = dayjs().startOf("day");
		const isDisabledByApi = disabledDatesFromApi.some((day) => current.isSame(day, "day"));

		return current.isBefore(todayStart, "day") || isDisabledByApi;
	};

	return (
		<DatePicker
			name="date-picker"
			popupClassName="custom-datepicker"
			disabled={props.disabled}
			status={props.status}
			value={props.value}
			onChange={props?.onChange}
			onPanelChange={(value) => {
				// Update start and end when the panel changes
				setStart(dayjs(value).startOf("month").format("YYYY-MM-DD"));
				setEnd(dayjs(value).endOf("month").format("YYYY-MM-DD"));
			}}
			loading={loading}
			allowClear
			disabledDate={disabledDate}
			format={["YYYY-MM-DD", "DD-MM-YYYY", "YYYY/MM/DD", "DD/MM/YYYY"]}
			changeOnBlur={true}
		/>
	);
};

export default SelectDateCheck;
