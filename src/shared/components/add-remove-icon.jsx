import { IconPlus, IconMinus } from "@tabler/icons-react";
import { Button } from "antd";

const AddRemoveIcon = ({ index, field, add, remove, multiple = true }) => {
	return multiple ? (
		index > 0 ? (
			<Button
				icon={<IconMinus />}
				onClick={() => remove(field.name)}
				tabIndex={0}
			/>
		) : (
			<Button
				icon={<IconPlus />}
				tabIndex={0}
				onClick={() => add()}
			/>
		)
	) : null;
};

export default AddRemoveIcon;
