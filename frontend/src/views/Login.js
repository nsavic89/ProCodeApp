import React from 'react';
import { Form, Button, Row, Col, Alert } from 'antd';
import { useTranslation } from 'react-i18next';
import Logo from '../media/logo_dark.png';
import ProfessionsImgs from '../media/login_imgs.png';
import LoginForm from '../components/login/LoginForm';
import RegisterForm from '../components/login/RegisterForm';
import Animation from '../media/animation.gif';
import withAuth from '../hoc/withAuth';


const styling = {
    wrapper: {
        background: "rgb(240,240,240)",
        height: "100vh",
        textAlign: "center",
        color: "#333"
    },
    header: {
        width: "100%",
        minHeight: 50,
        paddingTop: 12,
        paddingLeft: 25,
        paddingRight: 25,
        background: "white",
        borderBottom: "1px solid silver"
    },
    lngBtn: {
        margin: 2,
        color: "#333",
        boxShadow: "none"
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
        opacity: 0.8
    },
    animation: {
        height: 300,
        marginTop: 50
    },
    welcomeText: {
        marginTop: 75,
        fontSize: 18,
        padding: 50
    },
    underTestingAlert: {
        position: "absolute",
        top: 0,
        width: "50%",
        marginLeft: "25%",
        paddingTop: 5
    }
}


function Login(props) {
    const { t, i18n } = useTranslation();

    if (props.isAuth) {
        props.history.push('/');
    }

    return(
        <div style={styling.wrapper}>
            <Row style={styling.header} type="flex" justify="space-between">
                <Col>
                {
                    [ "ge", "fr", "en", "it" ].map(
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
                    <img src={Animation} alt="" style={styling.animation} />
                </Col>
            </Row>

            <div style={styling.welcomeText}>
                { t('login.welcome-text') }
            </div>

            <div style={styling.underTestingAlert}>
                <Alert
                    type="error"
                    showIcon
                    message="Procode is under testing...This will be finished by the January 10th or before..."
                />
            </div>
        </div>
    )
}

export default withAuth( Form.create()( Login ) );