import React from 'react';
import { Form, Button, Row, Col, Alert } from 'antd';
import { useTranslation } from 'react-i18next';
import Logo from '../media/logo_dark.png';
import ProfessionsImgs from '../media/login_imgs.png';
import LoginForm from '../components/login/LoginForm';
import RegisterForm from '../components/login/RegisterForm';
import Animation from '../media/animation.gif';
import withAuth from '../hoc/withAuth';
import LogoUnisante from '../media/logo_unisante.png';


const styling = {
    wrapper: {
        background: "#f5f5f5" ,
        height: "88vh",
        textAlign: "center",
        color: "#333",
        minHeight: 650
    },
    header: {
        width: "100%",
        minHeight: 50,
        paddingTop: 12,
        paddingLeft: 25,
        paddingRight: 25,
        background: "rgb(30,30,40)",
        borderBottom: "1px solid silver",
        color: "white"
    },
    lngBtn: {
        margin: 2,
        color: "white",
        boxShadow: "none",
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
        opacity: 0.7
    },
    animation: {
        height: 300,
        marginTop: 50
    },
    welcomeText: {
<<<<<<< HEAD
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
=======
        padding: "15vh 100px",
        textAlign: "center",
        fontSize: 20,
        fontWeight: 500,
        background: "#f5f5f5",
        color: "#333"
    },
    logoUni: {
        height: 50
    },
    footer: {
        padding: 25,
        textAlign: "center",
        height: "12vh",
        paddingTop: 25,
        minHeight: 100
>>>>>>> b733b4f19e1d8d6c219b0f87189708b7c0863b2e
    }
}


function Login(props) {
    const { t, i18n } = useTranslation();

    if (props.isAuth) {
        props.history.push('/');
    }

    return(
        <div>
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
            </div>

<<<<<<< HEAD
            <div style={styling.underTestingAlert}>
                <Alert
                    type="error"
                    showIcon
                    message="Procode is under testing...This will be finished by the January 10th or before..."
                />
            </div>
=======
            <footer style={styling.footer}>
                <img src={LogoUnisante} alt="" style={styling.logoUni} />
            </footer>
>>>>>>> b733b4f19e1d8d6c219b0f87189708b7c0863b2e
        </div>
    )
}

export default withAuth( Form.create()( Login ) );