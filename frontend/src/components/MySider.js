import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, Icon, Layout } from 'antd';
import Logo from '../media/logo_light.png';
import LogoSm from '../media/logo_light_small.png';
import { Link, withRouter } from 'react-router-dom';


// sider of the main view
// buttons for coding / transcoding / my files
function MySider (props) {

    const { t } = useTranslation();
    const [collapsed, setCollapsed] = useState(
        window.innerWidth < 768
    );

    const styling = {
        sider: {
            minHeight: 850,
            background: "#32363c"
        },
        trigger: {
            color: "white",
            background: "#32363c"
        },
        logo: {
            height: 35,
            margin: 10,
            marginTop: 20,
            marginLeft: collapsed ? 20 : 10
        },
        menu: {
            background: "none",
            border: "none",
            marginTop: 33,
            borderBottom: collapsed ? "" : "1px solid #262626"
        },
        menuItem: {
            borderTop: collapsed ? "" : "1px solid #262626",
            height: 60,
            paddingTop: 10,
            margin: 0,
            fontSize: 18
        }
    }

    // sider elements details
    const elements = [
        {
            label: t('sider.coding'),
            value: 'coding',
            icon: <Icon type='fire' />,
            link: "/"
        }, {
            label: t('sider.transcoding'),
            value: 'transcoding',
            icon: <Icon type='sync' />,
            link: "/transcoding"
        }, {
            label: t('sider.my-files'),
            value: 'my-files',
            icon: <Icon type='folder-open' />,
            link: "/my-files"
        }, {
            label: t('sider.history'),
            value: 'history',
            icon: <Icon type='clock-circle' />,
            link: "/history"
        }
    ]
    
    return (
        <Layout.Sider
            breakpoint="md"
            collapsible
            style={styling.sider}
            onCollapse={ val => setCollapsed(val) }
            trigger={
                <div style={styling.trigger}>
                    <Icon type="menu" />
                </div>
            }
        >
            <img 
                src={ collapsed ? LogoSm : Logo } 
                alt="" 
                style={ styling.logo }
            />

            <Menu
                theme="dark"
                style={ styling.menu }
                selectedKeys={[props.location.pathname]}
            >
                {
                    elements.map(
                        item => (
                            <Menu.Item
                                key={item.link}
                                style={styling.menuItem}
                            >
                                <Link to={item.link}>
                                    { item.icon } <span>{ item.label }</span>
                                </Link>
                            </Menu.Item>
                        )
                    )
                }
            </Menu>
        </Layout.Sider>
    )
}
export default withRouter( MySider );