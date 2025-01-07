import Link from "next/link";
import React, { useState } from "react";
import { Card, Row, Col, Flex, Avatar, Typography } from "antd";
import { IconLink } from "@tabler/icons-react";
const { Title, Text } = Typography;

const quickLinks = [
	{
		label: "Business Partners",
		style: { backgroundColor: "#f3f8fc" },
		icon: "icon-bp.svg",
		url: "/business-partners",
	},
	{
		label: "Contacts",
		style: { backgroundColor: "#e5daf8" },
		icon: "icon-contact.svg",
		url: "/contacts",
	},
	{
		label: "Addresses",
		style: { backgroundColor: "#f1f1f2" },
		icon: "icon-address.svg",
		url: "/addresses",
	},
	{
		label: "Quotations",
		style: { backgroundColor: "#d3eded" },
		icon: "icon-sale.svg",
		url: "/sales/quotations",
	},
	{
		label: "Sales Orders",
		style: { backgroundColor: "#d7e6bf" },
		icon: "icon-order.svg",
		url: "/sales/orders",
	},
	{
		label: "Stock Viewer",
		style: { backgroundColor: "#F0F5F9" },
		icon: "icon-stock.svg",
		url: "/stocks",
	},
];

const hotLinks = [
	{
		label: "New BP",
		style: { backgroundColor: "#f3f8fc" },
		icon: "icon-bp-plus.svg",
		url: "/business-partners/create",
	},
	{
		label: "New Quote",
		style: { backgroundColor: "#d3eded" },
		icon: "icon-sale-plus.svg",
		url: "/sales/quotations/create",
	},
	{
		label: "New Sales Order",
		style: { backgroundColor: "#d7e6bf" },
		icon: "icon-order-plus.svg",
		url: "/sales/orders/create",
	},
];

const externalLinks = [
	{
		url: "https://www.chiorino.com",
		icon: "icon-website.svg",
		label: "Chiorino Website",
	},
	{
		url: "https://intranet.chiorino.com",
		icon: "icon-intranet.svg",
		label: "Chiorino Intranet",
	},
	{
		url: "https://webapp.chiorino.com/webstockln/",
		icon: "icon-stock-2.svg",
		label: "Chiorino Biella Stock",
	},
	{
		url: "https://webmail.chiorino.com/",
		icon: "icon-mail.svg",
		label: "Chiorino Webmail",
	},
	{
		url: "https://helpdesk.chiorino.com",
		icon: "icon-helpdesk.svg",
		label: "Chiorino Helpdesk",
	},
	{
		url: "https://cloud.chiorino.com",
		icon: "icon-cloud.svg",
		label: "Chiorino Cloud",
	},
	{
		url: "https://www.safaribelting.com/",
		full: true,
		icon: "icon-safaribelting.png",
		label: "Safari Belting",
	},
];

const DashboardLinks = () => {
	return (
		<>
			<Row
				gutter={[8, 8]}
				className="mb-3"
			>
				<Col span={24}>
					<Title level={5}>Hot links</Title>
				</Col>
				{hotLinks.map((item, i) => (
					<Col
						xl={6}
						lg={6}
						md={6}
						sm={12}
						xs={12}
						key={i}
					>
						<Link href={item.url}>
							<Card hoverable>
								<Flex
									gap="small"
									align="center"
								>
									<Avatar
										shape="square"
										style={item.style}
										size="large"
										src={`/images/icons/${item.icon}`}
										alt={item.label}
									/>
									<Text
										strong
										style={{ margin: 0 }}
									>
										{item.label}
									</Text>
								</Flex>
							</Card>
						</Link>
					</Col>
				))}
			</Row>

			<Row
				gutter={[8, 8]}
				className="mb-3"
			>
				<Col span={24}>
					<Title level={5}>Quick links</Title>
				</Col>
				{quickLinks.map((item, i) => (
					<Col
						xl={3}
						lg={4}
						md={6}
						sm={12}
						xs={12}
						key={i}
					>
						<Link href={item.url}>
							<Card
								hoverable
								style={{ textAlign: "center" }}
							>
								<Avatar
									shape="square"
									style={item.style}
									src={`/images/icons/${item.icon}`}
									alt={item.label}
								/>
								<Text
									strong
									style={{ margin: 0, display: "block" }}
								>
									{item.label}
								</Text>
							</Card>
						</Link>
					</Col>
				))}
			</Row>

			<Row
				gutter={[8, 8]}
				className="mb-3"
			>
				<Col span={24}>
					<Title level={5}>External links</Title>
				</Col>
				{externalLinks.map((item, i) => (
					<Col
						xl={3}
						lg={4}
						md={6}
						sm={12}
						xs={12}
						key={i}
					>
						<Link
							href={item.url}
							target="_blank"
							key={i}
						>
							<Card
								hoverable
								style={{ textAlign: "center" }}
							>
								<Avatar
									shape="square"
									className={item?.full === true ? 'img-contain' : null}
									style={{ backgroundColor: "#f4f4f4" }}

									src={
										item?.icon ? (
											`/images/icons/${item.icon}`
										) : (
											<IconLink color="#33855c" />
										)
									}
								/>
								<Text
									strong
									style={{ margin: 0, display: "block" }}
								>
									{item.label}
								</Text>
							</Card>
						</Link>
					</Col>
				))}
			</Row>
		</>
	);
};

export default DashboardLinks;
