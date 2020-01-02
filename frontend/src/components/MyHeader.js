import React, { useState } from 'react';
import { Icon, Button, Dropdown, Menu, Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import MyFileUpload from './MyFileUpload';
import CodingFileForm from './files/CodingFileForm';
import Language from './Language';
import Security from './Security';
import { withRouter } from 'react-router-dom';

const styling = {
    userButton: {
        fontSize: 20,
        marginRight: 10,
        background: "#f5f5f5"
    }
}

// header includes a search bar
// to search for a file to code/transcode
// and user menu with settings logout options
function MyHeader (props) {

    const { t } = useTranslation();
    const [state, setState] = useState({
        file: false
    });

    // logout | delete localstorage
    const handleLogout = () => {
        localStorage.removeItem('token');
        props.history.push('/login');
    }

    // overlay menu for dropdown user icon
    const menu = (
        <Menu>
            <Menu.Item
                onClick={() => setState({
                    ...state,
                    languageVisible: true
                })}
            >
                <Icon 
                    type="global"
                /> {t("header.language")}
            </Menu.Item>

            <Menu.Item
                onClick={() => setState({
                    ...state,
                    securityVisible: true
                })}
            >
                <Icon type="lock" /> {t("header.security")}
            </Menu.Item>

            <Menu.Item onClick={() => handleLogout()}>
                <Icon 
                    type="logout" 
                /> {t("header.logout")}
            </Menu.Item>
        </Menu>
    )
    
    return(
        <div>
            <Row type="flex" justify="space-between">
                <Col md={{ span: 20 }}>
                    {/* Upload new Excel file -> modal -> form */}
                    <MyFileUpload 
                        onChange={val => setState({
                            file: val
                        })}
                    />
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

            {/* modal for coding/transcoding */}
            <CodingFileForm
                file={state.file}
                onCancel={() => setState({ file: false })}
            />

            {/* language settings */}
            <Language
                onCancel={ () => setState({ ...state, languageVisible: false }) }
                visible={ state.languageVisible }
            />

            {/* security / password change */}
            <Security 
                onCancel={ () => setState({ ...state, securityVisible: false })}
                visible={ state.securityVisible }
            />
        </div>
    )
}
export default withRouter(MyHeader);