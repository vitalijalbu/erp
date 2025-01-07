import { Input } from "antd"
import React, { useEffect, useState } from "react"


export const TextInput = (props) => {
	

	const [localValue , setlocalValue] = useState(null)


	useEffect(() => {

		setlocalValue(props.value)

	}, [props.value])

	const handleBlur = (value) => {
		props.onBlur(value)
	}
	const handleEnter = (value) => {
		props.onEnter(value)
	}
	
	return (
		<>
			<Input
				value={localValue}
				status={props.status}
				allowClear
				onChange={(event) => {
					setlocalValue(event.target.value);
				}}
				disabled={props.disable}
				onBlur={({ target }) => handleBlur(target.value)}
				onKeyDown={(event) => {
					if (event.code === "Enter" || event.code === "NumpadEnter") {
						event.preventDefault();
						event.stopPropagation();
						handleEnter(event.target.value);
					}
				}}
			/>
		</>
	);
}