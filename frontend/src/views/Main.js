import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Layout,
    Button
} from 'antd';
import { 
    GlobalOutlined,
    LockOutlined,
    LogoutOutlined,
    FireOutlined,
    RetweetOutlined,
    FolderOpenOutlined,
    PropertySafetyFilled
} from '@ant-design/icons';
import Coding from '../components/Coding';


/*
    Main view 
    containing all user components
    - coding
    - transcoding
    - files
*/
export default function Main(props) {
    const { t } = useTranslation();
    const [view, setView] = useState('coding');

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
        'coding': <Coding />
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
                                color: view == 'coding' ? "#1890ff" : ""
                            }}
                        />
                        <div>{ t('coding') }</div>
                    </Button>
                    <Button style={styling.siderButton} onClick={() => setView('recoding')}>
                        <RetweetOutlined 
                            style={{
                                ...styling.siderIcon,
                                color: view == 'recoding' ? "#1890ff" : ""
                            }}
                        />
                        <div>{ t('recoding') }</div>
                    </Button>
                    <Button style={styling.siderButton} onClick={() => setView('myFile')}>
                        <FolderOpenOutlined
                            style={{
                                ...styling.siderIcon,
                                color: view == 'myFile' ? "#1890ff" : ""
                            }}/>
                        <div>{ t('my-files') }</div>
                    </Button>
                </div>
            </Layout.Sider>

            <Layout>
                <Layout.Header style={{ background: "white", textAlign: "right" }}>
                    <div>
                        <Button style={{ margin: 5, border: 0 }}>
                            <GlobalOutlined /> { t('language') }
                        </Button>
                        <Button style={{ margin: 5, border: 0 }}>
                            <LockOutlined /> { t('security') }
                        </Button>
                        <Button danger style={{ margin: 5 }}>
                            <LogoutOutlined />{ t('logout') }
                        </Button>
                    </div>
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