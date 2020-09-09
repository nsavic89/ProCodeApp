import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Layout,
    Button,
    Col,
    Row,
    Spin
} from 'antd';
import { 
    GlobalOutlined,
    LockOutlined,
    LogoutOutlined,
    FireOutlined,
    RetweetOutlined,
    FolderOpenOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';
import Coding from '../components/Coding';
import Recoding from '../components/Recoding';
import MyFiles from '../components/MyFiles';
import '../css/main.css';
import axios from 'axios';
import { UserContext } from '../contexts/UserContext';
import SecurityDrawer from '../components/SecurityDrawer';
import About from '../components/About';



/*
    Main view 
    containing all user components
    - coding
    - transcoding
    - files
*/
export default function Main() {
    const { t, i18n } = useTranslation();
    const [security, setSecurity] = useState(false);
    const [about, setAbout] = useState(false);
    const [view, setView] = useState('coding');
    const [token, setToken] = useState(false);
    const context = useContext(UserContext);


    // API end-points
    const verifyURL = `${context.API}/app/api-token-verify/`
    const refreshURL = `${context.API}/app/api-token-refresh/`


    // on load check if token is verified
    // if cannot be verified redirect to login page
    // each time view is changed token is refreshed
    useEffect(() => {
        let jwtToken = localStorage.getItem('token');

        // verify token
        axios
            .post(verifyURL, {token:jwtToken})
            .then(() => setToken(true))
            .catch(
                () => {
                    // refresh token
                    axios
                        .post(refreshURL, {token:jwtToken})
                        .then(res => {
                            localStorage.setItem('token', res.data.token);
                            setToken(true);
                        })
                        .catch(() => window.location.href = '/login')
                }
            )

    },[view])

    // if !token then do not render main
    // while waiting then spin
    if (!token) {
        return (
            <div style={{ marginTop: "40vh", textAlign: "center" }}>
                <Spin tip={t('please-wait')} />
            </div>
        )
    }


    const styling = {
        siderButton: {
            height: 150,
            width: "100%",
            background: 0,
            border: 0,
            marginTop: 10,
            color: "rgb(180,180,180)"
        },
        siderIcon: {
            fontSize: 55
        }
    }

    // based on the value of state.view
    // determines which component is rendered
    const currentView = {
        'coding': <Coding />,
        'recoding': <Recoding />,
        'myFiles': <MyFiles />
    }

    // logout current user
    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = "/login";
    }

    return (
        <Layout>
            <Layout.Sider className="my-sider">
                <div style={{ textAlign: "center", padding:10 }}>
                    <img 
                        width={180}
                        src={require('../media/logoLight.png')}
                        alt="" />
                </div>

                <div>
                    <Button style={styling.siderButton} onClick={() => setView('coding')}>
                        <FireOutlined 
                            style={{
                                ...styling.siderIcon,
                                color: view === 'coding' ? "#1890ff" : ""
                            }}
                        />
                        <div>{ t('coding') }</div>
                    </Button>
                    <Button style={styling.siderButton} onClick={() => setView('recoding')}>
                        <RetweetOutlined 
                            style={{
                                ...styling.siderIcon,
                                color: view === 'recoding' ? "#1890ff" : ""
                            }}
                        />
                        <div>{ t('recoding') }</div>
                    </Button>
                    <Button style={styling.siderButton} onClick={() => setView('myFiles')}>
                        <FolderOpenOutlined
                            style={{
                                ...styling.siderIcon,
                                color: view === 'myFiles' ? "#1890ff" : ""
                            }}/>
                        <div>{ t('my-files') }</div>
                    </Button>
                </div>
            </Layout.Sider>

            <Layout>
                <Layout.Header style={{ background: "white" }}>
                    <Row>
                        <Col sm={{span: 8}}>
                            <GlobalOutlined />
                            {['ge', 'fr', 'it', 'en'].map(item => (
                                <Button
                                    key={item}
                                    style={{border: "none", fontSize: 16, marginLeft: 2, boxShadow: "none" }}
                                    onClick={() => i18n.changeLanguage(item)}
                                    size="small"
                                >{ item }
                                </Button>
                            ))}
                        </Col>
                        <Col sm={{span: 16}} style={{ textAlign: "right" }}>
                            <Button 
                                style={{ margin: 5, border: 0, boxShadow: "none" }}
                                onClick={() => setAbout(true)}
                            >
                                <InfoCircleOutlined /> { t('about') }
                            </Button>

                            <Button 
                                style={{ margin: 5, border: 0, boxShadow: "none" }}
                                onClick={() => setSecurity(true)}
                            >
                                <LockOutlined /> { t('security') }
                            </Button>

                            <Button 
                                style={{ margin: 5, border: 0, boxShadow: "none" }}
                                onClick={handleLogout}
                            >
                                <LogoutOutlined />{ t('logout') }
                            </Button>
                        </Col>
                    </Row>

                    {/* security drawer */}
                    <SecurityDrawer
                        visible={security}
                        onClose={() => setSecurity(false)}
                    />

                    {/* about modal */}
                    <About
                        visible={about}
                        onClose={() => setAbout(false)}
                    />
                </Layout.Header>

                <Layout>
                    <Layout.Content className="my-content">
                        { currentView[view] }
                    </Layout.Content>
                </Layout>
            </Layout>
        </Layout>
    )
}