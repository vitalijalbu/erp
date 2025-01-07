import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { IconAlertCircle } from "@tabler/icons-react";
import { Button, Form, Input, message, Divider, Card } from "antd";
import { getUserSession, loginAction } from "@/api/me";
import AuthLayout from "@/layouts/auth-layout";
import { getSession } from "@/lib/api";
//import { useDispatch } from 'react-redux';

const Login = () => {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [form] = Form.useForm();

	const checkUser = async () => {
		const user = await getSession();
		if (user) {
			router.push("/");
		}
	};
	checkUser();

	const handleSubmit = (values) => {
		setLoading(true);
		loginAction(values)
			.then(({ res }) => {
				message.success("Login success");
				router.push("/");
			})
			.catch((error) => {
				message.error("Invalid email or password");
				setLoading(false);
			});
	};

	return (
		<>
			{!getSession() && (
				<AuthLayout>
					<div className="page-content">
						<div className="text-center">
							<div className="site-logo">
								<img
									src="/images/logo.svg"
									className="system-logo"
								/>
							</div>
							<h2 className="m-0">Login - CHIORINO ERP</h2>
						</div>
						<Divider />
						<Form
							form={form}
							layout="vertical"
							onFinish={handleSubmit}
						>
							<Form.Item
								label="Username"
								name="username"
								rules={[
									{
										required: true,
										message: "Please input your username",
									},
								]}
							>
								<Input placeholder="Username" autoFocus/>
							</Form.Item>
							<Form.Item
								label="Password"
								name="password"
								tooltip={{
									title: "Input your Chiorino password",
									icon: <IconAlertCircle size="16" />,
								}}
								rules={[
									{
										required: true,
										message: "Please input your password",
									},
								]}
							>
								<Input.Password
									type="password"
									autoComplete="off"
									placeholder="Password"
								/>
							</Form.Item>
							<Form.Item className="m-0">
								<Button
									type="primary"
									htmlType="submit"
									block={true}
									loading={loading}
								>
									Login
								</Button>
							</Form.Item>
						</Form>
					</div>
				</AuthLayout>
			)}
		</>
	);
};

Login.getInitialProps = () => {
	return { layout: "page" }; // Set the layout prop to 'admin'
};
export default Login;
