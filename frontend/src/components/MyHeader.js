import React from 'react';
import { Icon, Button, Dropdown, Menu, Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import MyFileUpload from './MyFileUpload';
import { Link } from 'react-router-dom';

const styling = {
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
                <Link to="/login">
                    <Icon type="logout" /> {t("header.logout")}
                </Link>
            </Menu.Item>
        </Menu>
    )
    
    return(
        <Row type="flex" justify="space-between">
            <Col md={{ span: 20 }}>
                {/* Upload new Excel file -> modal -> form */}
                <MyFileUpload />
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