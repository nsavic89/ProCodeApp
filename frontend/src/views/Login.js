import React, { useState, useContext } from 'react';
import {
    Form, Input, Button, Drawer, message
} from 'antd';
import { useTranslation } from 'react-i18next';
import '../css/login.css';
import axios from 'axios';
import { UserContext } from '../contexts/UserContext';
import background from '../media/background.png';
import { GlobalOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';

/*
    Login and registration
*/

export default function Login() {
    const { t, i18n } = useTranslation();
    const [ state, setState ] = useState({ signUpDrawer: false });
    const context = useContext(UserContext);

    const styling = {
        wrapperCol: {
            sm: {span: 24}
        }, 
        labelCol: {
            sm: {span: 24}
        }
    }

    // login
    const handleLogin = values => {
        axios.post(
            `${context.API}/app/api-token-auth/`,
            values
        ).then(res => {
                let token = res.data.token;
                localStorage.setItem("token", token);
                window.location.href="/";
            }
        ).catch(
            () => message.error(t('messages.login-failed'))
        )
    }

    // login form 
    const LoginForm = (
        <Form className="my-form" onFinish={handleLogin}>
            <Form.Item
                name="username"
                label={<span className="my-label">
                        {t('login-view.username')}
                    </span>}
                labelAlign="left"
                colon={false}
                {...styling}
            >
                <Input 
                    className="my-input"
                    size="large"
                />
            </Form.Item>
            <Form.Item
                {...styling}
                colon={false}
                name="password"
                labelAlign="left"
                label={<span className="my-label">
                    {t('login-view.password')}
                </span>}
            >
                <Input.Password
                    className="my-input"
                    size="large"
                />
            </Form.Item>
            <Form.Item>
                <Button 
                    type="primary" htmlType="submit"
                    style={{ width: "100%" }}
                    size="large"
                >
                    {t('login')}
                </Button>
            </Form.Item>
        </Form>
    )

    const handleSignUp = values => {
        axios.post(`${context.API}/app/sign-up/`, values)
            .then(() => message.success(t('messages.sign-up-successful')))
            .catch(() => message.error(t('messages.sign-up-failed')))
    }

    // sign up form
    const SignUpForm = (
        <Form {...styling} className="my-form" onFinish={handleSignUp}>
            <Form.Item
                name="first_name"
                label={t('login-view.first-name')}
                labelAlign="left"
            >
                <Input className="my-input" />
            </Form.Item>

            <Form.Item
                name="last_name"
                label={t('login-view.last-name')}
                labelAlign="left"
            >
                <Input className="my-input" />
            </Form.Item>

            <Form.Item
                name="email"
                label={t('login-view.email')}
                labelAlign="left"
                rules={[
                    {
                        type: "email",
                        message: t('messages.form.not-email')
                    }, {
                        required: true,
                        message: t('messages.form.required')
                    }
                ]}
            >
                <Input className="my-input" />
            </Form.Item>

            <Form.Item
                name="username"
                label={t('login-view.username')}
                labelAlign="left"
                rules={[
                    {
                        required: true,
                        message: t('messages.form.required')
                    },
                    {
                        min: 5,
                        message: t('messages.form.too-short')
                    }
                ]}
            >
                <Input className="my-input" />
            </Form.Item>

            <Form.Item
                name="password"
                label={t('login-view.password')}
                labelAlign="left"
                rules={[
                    {
                        required: true,
                        message: t('messages.form.required')
                    },
                    {
                        min: 8,
                        message: t('messages.form.too-short')
                    }
                ]}
            >
                <Input.Password 
                    className="my-input"
                />
            </Form.Item>

            <Form.Item
                name="password2"
                label={t('login-view.password2')}
                labelAlign="left"
                rules={[
                    {
                        required: true,
                        message: t('messages.form.required')
                    }, 
                    ({getFieldValue}) => ({
                        validator(rule, value) {
                            if (!value || getFieldValue('password') === value) {
                                return Promise.resolve();
                            }
                            return Promise.reject(t('messages.form.passwords-not-match'));
                        }
                    })
                ]}
            >
                <Input.Password
                    className="my-input"
                />
            </Form.Item>

            <Form.Item>
                <Button 
                    type="primary"
                    danger
                    htmlType="submit"
                    style={{ width: "100%" }}
                >
                    {t('login-view.sign-up-button')}
                </Button>
            </Form.Item>
        </Form>
    )

    return (
        <div>
            <section className="wrapper"
                style={{
                    backgroundImage: `url(${background})`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "cover"
                }}>
                    <div className="lang-div">
                        <GlobalOutlined style={{ marginRight: 10 }}/> 
                        {['ge', 'fr', 'it', 'en'].map(item => (
                            <Button 
                                key={item} size="sm" 
                                ghost style={{ border: "none" }}
                                onClick={() => i18n.changeLanguage(item)}
                            >{ t(`languages.${item}`) }
                            </Button>
                        ))}
                    </div>

                    <div className="logo-div">
                        <img 
                            src={require('../media/logoLight.png')}
                            height={50} alt="" 
                        />
                    </div>
                    <div className="my-div-form">
                        { LoginForm }
                    </div>
                    
                    <div 
                        style={{ marginTop: 25, textAlign: "center" }}
                    >
                        <Button 
                            type="primary"
                            danger
                            onClick={() => setState({...state, signUpDrawer: true})}     
                            size="large"
                        >
                            {t('login-view.open-account')}
                        </Button>
                    </div>
            </section>

            <footer>
                <div className="unisante">
                    <div style={{ textAlign: "center" }}>
                        <img 
                            src={require('../media/logoUnisante.png')}
                            height={50} alt="" 
                        />
                    </div>
                    
                    <div style={{ marginTop: 25 }}>
                        Centre universitaire de médecin général et santé publique
                    </div>

                    <div>
                        <MailOutlined /> <a href="mailto: nenad.savic@unisante.ch">
                            nenad.savic@unisante.ch
                        </a>
                    </div>
                    <div>
                        <PhoneOutlined /> <span>
                            +41 21 314 37 82
                        </span>
                    </div>
                </div>
            </footer>

            <Drawer
                title={t('login-view.sign-up')}
                placement="right"
                closable={false}
                onClose={() => setState({...state, signUpDrawer: false})}
                visible={state.signUpDrawer}
                width={350}
            >
                {SignUpForm}
            </Drawer>
        </div>
    )
}