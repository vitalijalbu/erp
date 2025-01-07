import React, { useEffect, useRef, useState } from "react";
import MailModal from "../widgets/mail-modal";
import { getBPContacts } from "@/api/bp";
import { getMailTemplate } from "@/api/sales/quotations";
import { sendMailSale } from "@/api/orders";

const SalesMailModal = ({ open, id, bpId, from, cc, onClose, type }) => {
	const [contactOptions, setContactOptions] = useState([]);
	const [template, setTemplate] = useState('');
	const [subject, setSubject] = useState('');
	const [loading, setLoading] = useState(true);

	const callback = sendMailSale;

	const fetchContacts = async () => {
		const response = await getBPContacts(bpId, type);
		setContactOptions(
			_.map(
				_.filter(response.data.data, (i) => i.email),
				(o) => {
					return { label: o.name + " - " + o.email, value: o.email };
				}
			)
		);
	};

	const getTemplate = async () => {
		const response = await getMailTemplate(id);
		// console.log(response.data.template, response.data.subject);
		setTemplate(response.data.template);
		setSubject(response.data.subject);
	};

	useEffect(() => {
		if (open) {
			
			(async () => {
				setLoading(true);
				await fetchContacts();
				await getTemplate();
				setLoading(false);
			})();
		}
	}, [open]);

	return (
		<>
			{template && (
				<MailModal
					open={open}
					id={id}
					from={from}
					to={contactOptions}
					cc={cc}
					body={template}
					subject={subject}
					onClose={() => onClose()}
					submitFunction={callback}
				/>
			)}
		</>
	);
};
export default SalesMailModal;
