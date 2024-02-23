import React, { useEffect, useState, useRef } from "react";
import { Modal, Form, Button, Typography } from "antd";
const { Title } = Typography;
import SellConfigurator from "@/pages/seller-configurator/configurator";
import SelectWithModal from "@/shared/components/select-with-modal";
import ModalFeatureTable from "@/shared/configurator/configuration/modal-feature-table-select-bp";
import { getAllBP, getBPById } from "@/api/bp";
import FocusLock from "react-focus-lock";

const ModalConfigurator = ({
	visible,
	toggleModal,
	product,
	productName,
	children,
	form,
	title,
	...props
}) => {
	const [businessPartners, setBusinessPartners] = useState(-1);

	const callback = getAllBP;
	const [loading, setLoading] = useState(false);
	const [modalTableBP, setModalTableBP] = useState(false);
	const [bp, setBP] = useState("");
	const [bpDesc, setBpDesc] = useState("");
	const [isValidBP, setIsValidBP] = useState(false);
	const [sendData, setSendData] = useState(false);
	const fetchBpById = async (id) => {
		setLoading(true);
		const res = await getBPById(id);
		setBpDesc(res.data ? res.data.desc : "");
		setLoading(false);
	};

	const rootRef = useRef(null);

	return (
		<div ref={rootRef}>
			{businessPartners && (
				<Modal
					mask={true}
					zIndex={1000}
					key={46546465464}
					open={visible}
					maskClosable={false}
					root={rootRef.current}
					title={
						!bp ? (
							"Business Partner"
						) : (
							<>
								Configuration <mark>{productName}</mark> for BP:{" "}
								<mark> {bpDesc} </mark>{" "}
							</>
						)
					}
					toggleModal={toggleModal}
					transitionName='ant-modal-slide-up'
					destroyOnClose={true}
					width={bp ? "50%" : "40%"}
					onCancel={() => {
						toggleModal();
						setBP("");
						form.setFieldsValue({ bp: "" });
					}}
					footer={[
						<Button
							key={0}
							onClick={() => {
								toggleModal();
								setBP("");
								form.setFieldsValue({ bp: "" });
							}}
						>
							Close
						</Button>,
						<Button
							key={1}
							loading={loading}
							autoFocus
							type='primary'
							onClick={() => {
								setBP(form.getFieldValue("bp"));
								fetchBpById(form.getFieldValue("bp"));
								form.validateFields();

								// if (bp) setSendData(true)
							}}
						>
							Continue
						</Button>,
					]}
				>
					<div>
						<Title level={4}>
							{!bp ? "Select Business Partner" : "Configuration:"}
						</Title>
						{!bp ? (
							<Form.Item
								name='bp'
								rules={[{ required: true }]}
							>
								<SelectWithModal
									style={{ marginTop: 30 }}
									callBack={callback}
									optionLabel={"desc"}
									placeHolder='Search Business Partner'
									filter={{ start: 0, length: 20 }}
									extras={
										<ModalFeatureTable
											selectable={true}
											onSelect={(val) => {
												form.setFieldsValue({ bp: val });
											}}
											opened={modalTableBP}
											toggle={() => setModalTableBP(!modalTableBP)}
											value={form.getFieldValue("bp")}
											callBack={callback}
										/>
									}
									onTogglePopUp={() => setModalTableBP(true)}
								/>
							</Form.Item>
						) : (
							<SellConfigurator
								productSelected={product}
								businessPartners={bp}
								sendData={sendData}
							/>
						)}
					</div>
				</Modal>
			)}
		</div>
	);
};

export default ModalConfigurator;
