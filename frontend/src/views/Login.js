import React from 'react';
import { Form, Button, Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import Logo from '../media/logo_light.png';



const styling = {
    wrapper: {
        background: "rgb(30,30,30)",
        height: "100vh",
        textAlign: "center",
        color: "white"
    },
    header: {
        width: "100%",
        minHeight: 50,
        paddingTop: 10,
        paddingLeft: 25,
        paddingRight: 25,
        background: "#333"
    },
    lngBtn: {
        margin: 2,
        border: "none"
    },
    logoDiv: {
        textAlign: "center",
        marginTop: 50
    },
    logo: {
        height: 75
    },
    loginBtn: {
        fontSize: 16,
        margin: 5,
        marginTop: 75
    },
    welcomeText: {
        marginTop: 75,
        fontSize: 18,
        padding: 50
    }
}

function Login() {
    const { t } = useTranslation();

    return(
        <div style={styling.wrapper}>
            <Row style={styling.header} type="flex" justify="space-between">
                <Col>
                {
                    [ "de", "fr", "en", "it" ].map(
                        item => (
                            <Button
                                style={styling.lngBtn}
                                size="small"
                                key={item}
                                ghost
                            >{item}</Button>
                        )
                    )
                }
                </Col>

                <Col>
                    text
                </Col>
            </Row>

            <div style={styling.logoDiv}>
                <img src={Logo} alt="" style={styling.logo} />
            </div>

            <div>
                <Button
                    style={styling.loginBtn}
                    type="primary"
         
                >
                    { t('login.login') }
                </Button>

                <Button
                    style={styling.loginBtn}
                    type="danger"
              
                >
                    { t('login.register') }
                </Button>
            </div>

            <div style={styling.welcomeText}>
                { t('login.welcome-text') }
            </div>
        </div>
    )
}

export default Form.create()( Login );