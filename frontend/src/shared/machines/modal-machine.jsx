import React, { useState } from "react";
import { Button, Input, Modal } from "antd";
const { TextArea } = Input;
const { confirm } = Modal;
import { IconAlertCircle } from "@tabler/icons-react";
import _ from "lodash";
import MachinesForm from "./form-body";

const ModalMachine = ({ opened, toggle, reload, data, onSave }) => {
	const [formChanged, setFormChanged] = useState(false);
	const [loading, setLoading] = useState(false);

	const handleModalClose = async () => {
		toggle();
	};

	const handleExit = () => {
		if (formChanged === true) {
			confirm({
				title: "Confirm exit without saving?",
				icon: (
					<IconAlertCircle
						color={"#faad14"}
						size="24"
						className="anticon"
					/>
				),
				transitionName: "ant-modal-slide-up",
				content: "Seems like you forgot to save your edits",
				okText: "Exit",
				okType: "danger",
				cancelText: "Cancel",
				zIndex: 3000,
				onOk() {
					setFormChanged(false);
					handleModalClose();
				},
			});
		} else {
			handleModalClose();
		}
	};

	return (
		<>
			<Modal
				className="modal-fullscreen modal-fixed-footer"
				open={opened}
				destroyOnClose={true}
				onCancel={handleExit}
				title={
					data ? (
						<>
							Update Machine <mark>{data.id}</mark>
						</>
					) : (
						`Create new Machine`
					)
				}
				centered
				width="40%"
				maskClosable={false}
				transitionName="ant-modal-slide-up"
				footer={[
					<Button
						key={0}
						onClick={handleExit}
					>
						Close
					</Button>,
					<Button
						key={1}
						type="primary"
						htmlType="submit"
						form="machine-form"
						loading={loading}
					>
						Save
					</Button>,
				]}
			>
				<MachinesForm
					onLoading={(value) => setLoading(value)}
					toggle={toggle}
					isModal
					reload={reload}
				/>
			</Modal>
		</>
	);
};

export default ModalMachine;
