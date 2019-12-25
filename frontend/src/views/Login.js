import React from 'react';
import { Form, Button, Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import Logo from '../media/logo_light.png';
import ProfessionsImgs from '../media/login_imgs.png';
import LoginForm from '../components/login/LoginForm';
import RegisterForm from '../components/login/RegisterForm';


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
    profImgs: {
        height: 300,
        paddingTop: 50,
        opacity: 0.5
    },
    welcomeText: {
        marginTop: 75,
        fontSize: 18,
        padding: 50
    }
}


function Login() {
    const { t, i18n } = useTranslation();

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
                                onClick={() => i18n.changeLanguage(item)}
                            >{item}</Button>
                        )
                    )
                }
                </Col>

                <Col>
                    { t('login.title') }
                </Col>
            </Row>

            <Row type="flex" justify="space-around">
                <Col md={{ span: 8 }} xs={{span: 0}}>
                    <img src={ProfessionsImgs} alt="" style={styling.profImgs} />
                </Col>

                <Col md={{ span: 8 }} xs={{span: 24}}>
                    <div style={styling.logoDiv}>
                        <img src={Logo} alt="" style={styling.logo} />
                    </div>

                    <div>
                        <LoginForm />
                        <RegisterForm />
                    </div>
                </Col>

                <Col md={{ span: 8 }} xs={{span: 0}}>
                </Col>
            </Row>

            <div style={styling.welcomeText}>
                { t('login.welcome-text') }
            </div>
        </div>
    )
}

export default Form.create()( Login );