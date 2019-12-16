import React from 'react';
import { Input, Icon, Button, Dropdown, Menu, Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import MyFileUpload from './MyFileUpload';


const styling = {
    search: {
        width: "100%"
    },
    userButton: {
        fontSize: 20,
        marginRight: 10
    }
}

// header includes a search bar
// to search for a file to code/transcode
// and user menu with settings logout options
function MyHeader () {

    const { t } = useTranslation();

    // overlay menu for dropdown user icon
    const menu = (
        <Menu>
            <Menu.Item>
                <Icon type="global" /> {t("header.language")}
            </Menu.Item>

            <Menu.Item>
                <Icon type="lock" /> {t("header.security")}
            </Menu.Item>

            <Menu.Item>
                <Icon type="logout" /> {t("header.logout")}
            </Menu.Item>
        </Menu>
    )
    
    return(
        <Row type="flex" justify="space-between">
            <Col md={{ span: 20 }}>
                <Row gutter={16} type="flex" justify="start"> 
                    <Col lg={{ span: 16 }} md={{ span: 12 }} xs={{ span: 0 }}>
                        <Input.Search
                            style={styling.search}
                            size="large"
                            placeholder={ t('header.search-placeholder') }
                        />
                    </Col>

                    <Col>                      
                        {/* Upload new Excel file -> modal -> form */}
                        <MyFileUpload />
                    </Col>
                </Row>
            </Col>
            
            <Col>
                <Dropdown overlay={menu}>
                    <Button
                        style={styling.userButton}
                        shape="circle"
                        size="large"
                    >
                        <Icon type="user" />
                    </Button>
                </Dropdown>
            </Col>
        </Row>
    )
}
export default MyHeader;