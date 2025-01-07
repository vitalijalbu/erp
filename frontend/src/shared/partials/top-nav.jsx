import React, { useEffect, useState } from "react";
import Link from "next/link";
import { logoutAction } from "@/api/me";
import { getSession } from "@/lib/api";
import { Menu, Avatar, Space, Button, message, Modal, Tooltip, Typography, FloatButton } from "antd";
import {
    IconMenu2,
    IconLogout,
    IconAlertCircle,
    IconUser,
    IconClock,
    IconTerminal,
    IconBuildingFactory2,
    IconChevronDown
} from "@tabler/icons-react";
import LatestTransactions from "@/shared/transactions/latest";
import { useRouter } from "next/router";
import ModalDebug from "../widgets/modal-debug";
const { confirm } = Modal;
const { Text } = Typography;


const TopNav = ({ collapse }) => {

    const user = getSession();
    const [openLatestTransactions, setOpenLatestTransactions] = useState(false);
    const router = useRouter();

    //console.log('user', user);
    /* Logout Action */
    const confirmLogout = () => {
        confirm({
            title: "Are you sure you want to log out?",
            icon: <IconAlertCircle color={'#faad14'} size="24" className="anticon" />,
            transitionName: "ant-modal-slide-up",
            content: "Click Confirm to proceed with logging out or Cancel to continue using your account.",
            okText: 'Logout',
            okType: 'danger',
            cancelText: 'Close',
            onOk() {
                logoutAction()
                    .then((data) => {
                        message.success("Logged out successfully.");
                        router.push("/login");
                    })
                    .catch((error) => {
                        console.log(error);
                        message.error("Error logging out. Please try again.");
                    });
            }
        });
    };


    const mainMenu = [
        {
            key: "transactions",
            label: (
                <Tooltip title="Show latest transactions">
                    <Button type="text" onClick={() => setOpenLatestTransactions(true)} icon={<IconClock/>}/>
                </Tooltip>
            )
        },
        {
            key: "whdesc",
            label: (<><Tooltip title="Operating with company"><Space><Avatar size="small" style={{
                backgroundColor: '#d5e3dc',
                color: '#1f5e41',
            }}><IconBuildingFactory2 size="18"/></Avatar >{user?.company?.desc}</Space></Tooltip></>),
            //label: <div><Text style={{display: "block"}} strong>{user?.company.IDcompany}</Text> <Text style={{display: "block"}} strong>{user?.company.desc}</Text></div>,
        },
        {
            key: "account",
            label: <Space><Avatar size="small">{user?.username[0].toUpperCase()}</Avatar>{user?.username}<IconChevronDown size="18"/></Space>,
            children: [
                {
                    key: "/account",
                    icon: <IconUser />,
                    label: <Link href="/account">My account</Link>,
                },
                {
                    type: "divider"
                },
                {
                    key: "logout",
                    danger: true,
                    icon: <IconLogout />,
                    label: <Link href="#" onClick={confirmLogout}>Logout</Link>,
                },
            ],
        }
    ];



    return (
        <>
            {openLatestTransactions && <LatestTransactions
                open={openLatestTransactions}
                close={() => setOpenLatestTransactions(false)}
            />}            
            <div id="top-header">
                <div className="navbar">
                    <div className="left">
                        <div style={{ display: 'flex' }}>
                            <Button type="text" icon={<IconMenu2 />} onClick={collapse} />
                            <Button type="link"><Link href="/"><img src="/images/logo.svg" className="site-logo" /></Link></Button>
                        </div>
                    </div>
                    <div className="right menu-items">
                        <Menu triggerSubMenuAction="click" mode="horizontal" theme="light" items={mainMenu} style={{
                            background: "#fff",
                            height: "39px",
                            border: "none"
                        }} />
                    </div>
                </div>
            </div>
          
        </>
    );
};
export default TopNav;
