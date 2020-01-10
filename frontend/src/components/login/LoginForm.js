import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { withRouter } from 'react-router-dom';

const styling = {
    form: {
        marginTop: 50
    },
    input: {
    },
    submit: {
        width: "100%"
    },
    button: {
        margin: 3,
        marginTop: 75,
        display: "inline-block"
    }
}


// on login button click shows login form
function LoginForm(props) {
    const [ state, setState ] = useState({});
    const { getFieldDecorator } = props.form;
    const { t } = useTranslation();

    if (!state.visible) {
        return(
            <Button
                onClick={() => setState({visible: true})}
                type="primary"
                style={styling.button}
            >{ t("login.login") }
            </Button>
        )
    }

    // login
    const handleLogin = e => {
        e.preventDefault();
        props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                axios.post(
                    `${process.env.REACT_APP_API_URL}/api-token-auth/`,
                    values
                ).then(
                    res => {
                        localStorage.setItem('token', res.data.token);
                        props.history.push('/');
                    }
                ).catch(
                    () => message.error(t('login.message-login-failed'))
                )
            }
        })
    }

    return (
        <Form
            style={styling.form}
            onSubmit={handleLogin}
            onKeyDown={e => { if (e.key === "Enter") { handleLogin(e) } } }
        >
            <Form.Item>
                { getFieldDecorator('username', {
                    rules: [
                        {
                            required: true,
                            message: t('messages.field-obligatory')
                        }
                    ]
                }) (
                    <Input size="large" placeholder={ t('login.username') } style={styling.input} />
                ) }
            </Form.Item>
            <Form.Item>
                { getFieldDecorator('password', {
                    rules: [
                        {
                            required: true,
                            message: t('messages.field-obligatory')
                        }
                    ]
                }) (
                    <Input
                        size="large"
                        placeholder={ t('login.password') }
                        style={styling.input}
                        type="password"
                    />
                ) }
            </Form.Item>
            <Button
                type="primary"
                style={styling.submit}
                onClick={handleLogin}
            >
                {t('login.login')}
            </Button>
        </Form>
    )
}
export default withRouter(Form.create()( LoginForm ));