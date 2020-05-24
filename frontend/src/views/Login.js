import React, { useState } from 'react';
import {
    Form, Input, Button, Drawer
} from 'antd';
import { useTranslation } from 'react-i18next';
import '../css/login.css';

/*
    Login and registration
*/

export default function Login() {
    const { t, i18n } = useTranslation();
    const [ state, setState ] = useState({ signUpDrawer: false });

    const styling = {
        wrapperCol: {
            sm: {span: 24}
        }, 
        labelCol: {
            sm: {span: 24}
        }
    }

    // styling form
    const stylingForm = {
        input: {
            background : "black",
            color: "white",
            borderColor: "rgb(30, 30, 30)"
        }, 
        inputPw: {
            background : "black",
            borderColor: "rgb(30, 30, 30)"
        }
    }

    // login form 
    const LoginForm = (
        <Form className="my-form">
            <Form.Item
                label={<span className="my-label">
                        {t('login-view.username')}
                    </span>}
                labelAlign="left"
                {...styling}
            >
                <Input 
                    className="my-input"
                    style={stylingForm.input}
                    size="large"
                />
            </Form.Item>
            <Form.Item
                {...styling}
                labelAlign="left"
                label={<span className="my-label">
                    {t('login-view.password')}
                </span>}
            >
                <Input.Password
                    className="my-input"
                    style={stylingForm.inputPw}
                    size="large"
                />
            </Form.Item>
            <Form.Item>
                <Button 
                    type="primary" htmlType="submit"
                    style={{ width: "50%" }}
                    ghost
                >
                    {t('login')}
                </Button>
                <Button 
                    danger
                    ghost
                    style={{ width: "50%", border: 0 }}
                    onClick={() => setState({...state, signUpDrawer: true})}
                >
                    {t('login-view.open-account')}
                </Button>
            </Form.Item>
        </Form>
    )

    // sign up form
    const SignUpForm = (
        <Form {...styling} className="my-form">
            <Form.Item
                name="first_name"
                label={
                    <span className="my-label">
                        {t('login-view.first-name')}
                    </span>}
                labelAlign="left"
            >
                <Input className="my-input" style={stylingForm.input} />
            </Form.Item>

            <Form.Item
                name="last_name"
                label={
                    <span className="my-label">
                        {t('login-view.last-name')}
                    </span>}
                labelAlign="left"
            >
                <Input className="my-input" style={stylingForm.input} />
            </Form.Item>

            <Form.Item
                name="email"
                label={
                    <span className="my-label">
                        {t('login-view.email')}
                    </span>}
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
                <Input className="my-input" style={stylingForm.input} />
            </Form.Item>

            <Form.Item
                name="username"
                label={
                    <span className="my-label">
                        {t('login-view.username')}
                    </span>}
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
                <Input className="my-input" style={stylingForm.input} />
            </Form.Item>

            <Form.Item
                name="password"
                label={
                    <span className="my-label">
                        {t('login-view.password')}
                    </span>}
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
                    style={stylingForm.inputPw} 
                />
            </Form.Item>

            <Form.Item
                name="password2"
                label={
                    <span className="my-label">
                        {t('login-view.password2')}
                    </span>}
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
                    style={stylingForm.inputPw}
                />
            </Form.Item>

            <Form.Item>
                <Button 
                    danger ghost
                    htmlType="submit"
                    style={{ width: "100%" }}
                >
                    {t('login-view.sign-up-button')}
                </Button>
            </Form.Item>
        </Form>
    )

    return (
        <div className="wrapper">
            <div className="lang-div">
                {['ge', 'fr', 'it', 'en'].map(item => (
                    <Button 
                        key={item} size="sm" 
                        ghost style={{ border: "none" }}
                        onClick={() => i18n.changeLanguage(item)}
                    >{ item }
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

            <div className="logo-div unisante">
                <img 
                    src={require('../media/logoUnisante.png')}
                    height={50} alt="" 
                />
            </div>

            <Drawer
                title={<span style={{ color: "white" }}>
                        {t('login-view.sign-up')}
                    </span>}
                placement="right"
                closable={false}
                onClose={() => setState({...state, signUpDrawer: false})}
                visible={state.signUpDrawer}
                headerStyle={{
                    backgroundColor: "rgb(15, 15, 15)"
                }}
                drawerStyle={{
                    backgroundColor: "rgb(10, 10, 10)",
                    color: "rgb(220,220,220)"
                }}
                width={350}
            >
                {SignUpForm}
            </Drawer>
        </div>
    )
}