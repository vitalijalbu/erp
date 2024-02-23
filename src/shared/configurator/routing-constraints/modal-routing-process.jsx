import React, { useState } from "react";
import UserPermissions from "@/policy/ability";
import { Button, Input, Modal } from "antd";
const { TextArea } = Input;
const { confirm } = Modal;
import { IconAlertCircle } from "@tabler/icons-react";
import _ from "lodash";
import BomConstraint from "@/shared/configurator/bom-constraints/bom-constraint";
import FormBodyProcess from "@/shared/processes/form-process";

const ModalRoutingProcess = ({ opened, toggle, data, onSave }) => {
	// Set page permissions
	if (!UserPermissions.authorizePage("configurator.manage")) {
		return false;
	}

	const [formChanged, setFormChanged] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [loading, setLoading] = useState(false);
	const [isDraft, setIsDraft] = useState(false);

	const handleModalClose = async () => {
		toggle();
	};

	// Close modal confirmation if form state is TRUE
	const handleExit = () => {
		if (formChanged === true) {
			confirm({
				title: "Confirm exit without saving?",
				icon: (
					<IconAlertCircle
						color={"#faad14"}
						size='24'
						className='anticon'
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
	const handleModalSave = (value) => {
		onSave(value)
	}

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
							Update Routing Process <mark>{data.id}</mark>
						</>
					) : (
						`Create new Routing Process`
					)
				}
				centered
				width="90%"
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
						form="form-constraint"
						onClick={() => {
							setIsDraft(false);
							setIsSaving(true);
						}}
						loading={loading}
					>
						Save
					</Button>,
					/* 	isDraft || !data?.id ? (
						<Button
							key={2}
							htmlType='submit'
							form='form-constraint'
							onClick={() => {
								setIsDraft(true);
							}}
							loading={loading}
						>
							Save as Draft
						</Button>
					) : (
						<></>
					), */
				]}
			>
				<FormBodyProcess
					toggle={handleModalClose}
					id={data?.id}
					isModal={true}
					isSaving={isSaving}
					setIsSaving={setIsSaving}
					onModalSave ={(val)=> handleModalSave(val) } 
				/>
			</Modal>
		</>
	);
};

export default ModalRoutingProcess;
