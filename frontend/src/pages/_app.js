// pages/_app.js

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import theme from "@/assets/styles/theme.json";
import "@/assets/styles/index.scss";
import AdminLayout from "@/layouts/admin-layout";
import PageLayout from "@/layouts/page-layout";
import { ConfigProvider } from "antd";
import { setCsrfCookie } from "@/api/cookie";
import { RecoilRoot } from "recoil";
import { updateSession, removeSession } from "@/lib/api";
import LoadingBar from 'react-top-loading-bar';
import dayjs from "dayjs";
import 'dayjs/locale/en';
import en_GB from 'antd/locale/en_GB';


const MyApp = ({ Component, pageProps }) => {
    const router = useRouter();
    const [userChecked, setUserChecked] = useState(false);
    const loadingBar = useRef(null);
    const [forceRefresh, setForceRefresh] = useState(false);



    useEffect(() => {
        (async() => { 
            router.events.on("routeChangeStart", () => {
                if(loadingBar.current) {
                    loadingBar.current.continuousStart();
                }
            });
            router.events.on("routeChangeComplete", () => {
                if(loadingBar.current) {
                    loadingBar.current.complete();
                }
            })
            setCsrfCookie();
            try {
                await updateSession();
                setUserChecked(true);
                setForceRefresh(!forceRefresh);
            }
            catch (error) {
                //console.log(error);
                if (error.response) {
                    if(!router.pathname.startsWith("/login")) {
                        removeSession();
                        router.push("/login");
                    }
                    else {
                        setUserChecked(true);
                    }
                }
            }
            
        })();
        
    }, []);

    let Layout = AdminLayout; // Default layout is AdminLayout
    if (pageProps.layout === "page") {
        Layout = PageLayout;
    }

  return (
    <main id="main-app">
      <LoadingBar color='#006633' ref={loadingBar} />
      <RecoilRoot>
        <ConfigProvider theme={theme} locale={en_GB}>
          {userChecked && (
            <Layout>
              <Component {...pageProps} />
            </Layout>
          )}
        </ConfigProvider>
      </RecoilRoot>
    </main>
  );
};

export default MyApp;
