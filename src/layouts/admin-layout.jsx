import React, { useEffect, useState } from "react";
import Head from "next/head";
import { Drawer, FloatButton, Layout } from "antd";
const { Content, Sider, Header } = Layout;
import SideNav from "@/shared/partials/side-nav";
import TopNav from "@/shared/partials/top-nav";
import { IconTerminal } from "@tabler/icons-react";
import NonSSRWrapper from "@/helpers/no-ssr";
import ModalDebug from "@/shared/widgets/modal-debug";
import _ from "lodash";
import useOpenConsoleWindow from "@/shared/widgets/open-console-window";

function AdminLayout(props) {
	const [collapsed, setCollapsed] = useState(false);

	const onCollapse = () => {
		setCollapsed(!collapsed);
	};


	const openResizableWindow = () => {
		useOpenConsoleWindow();
	};

	return (
		<>
			{/* {popupDebug && <ModalDebug opened={popupDebug} toggle={() => setPopupDebug(!popupDebug)} />} */}
			<NonSSRWrapper>
				<Layout className="main-layout">
					<Head>
						<title>CHIORINO-ERP</title>
					</Head>
					<Header
						theme="light"
						style={{
							background: "#fff",
							height: "40px",
							lineHeight: "40px",
							padding: "0",
							position: "fixed",
							top: 0,
							zIndex: 100,
							width: "100%",
						}}
					>
						<TopNav collapse={onCollapse} />
					</Header>
					<Layout>
						<Sider
							style={{
								overflow: "auto",
								height: "100vh",
								position: "fixed",
								left: 0,
								top: "40px",
								bottom: "40px",
							}}
							breakpoint="md"
							width={"260px"}
							theme="light"
							collapsible
							collapsed={collapsed}
							onCollapse={onCollapse}
							collapsedWidth={0}
						>
							<SideNav />
						</Sider>
						<Layout
							className="site-layout"
							style={{
								marginLeft: collapsed ? 0 : 260,
								marginTop: "20px",
								transition: "margin-left 0.2s",
							}}
						>
							<Content
								style={{
									padding: "25px",
									maxWidth: "100%",
									overflow: "initial",
									paddingBottom: "20px",
								}}
							>
								<div className="main-container">{props.children}</div>
								<div>
									<FloatButton
										id="debug-btn"
										shape="square"
										tooltip={"Open console popup"}
										onClick={() => openResizableWindow()}
										icon={<IconTerminal size="20" color="#3f8af3"/>}
										style={{
											right: 10,
											bottom: 10,
										}}
									/>
								</div>
							</Content>
						</Layout>
					</Layout>
				</Layout>
			</NonSSRWrapper>
		</>
	);
}

export default AdminLayout;
