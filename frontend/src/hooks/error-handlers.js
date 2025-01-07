import { Typography } from "antd";

const { Text } = Typography;

export const cleanMessage = (message) => {
	const regex = /\w+\.\d\./gi;
	return message.replace(regex, "").replaceAll("_id", "").replaceAll("_", " ");
};

// format error message in a human friendly way
export const errorMessage = (row, field, index) => {
	if (row?.errors?.[field]) {
		let message = cleanMessage(row.errors?.[field]);
		return (
			<Text
				type='danger'
				style={{ fontSize: "12px" }}
				// key={field + index}
			>
				{message}
			</Text>
		);
	} else {
		return <></>;
	}
};

export const setErrorsFunction = (errors, rows) => {
	let clonedRows = _.cloneDeep(_.map(rows, (o) => _.omit(o, "errors")));
	// let restOfRows = [];
	// if (rowsSelected.length > 0 && rowsSelected.length !== rows.length) {
	// 	restOfRows = _.filter(clonedRows, (el) => !_.includes(rowsSelected, el.position));
	// 	clonedRows = _.filter(clonedRows, (el) => rowsSelected.includes(el.position));
	// 	clonedRows = _.concat(clonedRows, restOfRows);
	// }
	_.forIn(errors, (v, k) => {
		let splitted = k.split(".");
		if (_.has(clonedRows, splitted[1])) {
			clonedRows[splitted[1]]["errors"] = {
				...clonedRows[splitted[1]]["errors"],
				[splitted[2]]: v[0],
			};
		}
	});

	return clonedRows.sort((a, b) => parseInt(a.position) - parseInt(b.position));
};
