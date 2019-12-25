import React, { useState } from 'react';
import { Form, Input, Button } from 'antd';
import { useTranslation } from 'react-i18next';


const styling = {
    form: {
        marginTop: 50
    },
    input: {
        background: "none",
        color: "white"
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

    return (
        <Form style={styling.form}>
            <Form.Item>
                { getFieldDecorator('username', {
                    rules: [
                        {
                            required: true,
                            message: t('messages.field-obligatory')
                        }
                    ]
                }) (
                    <Input placeholder={ t('login.username') } style={styling.input} />
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
                    <Input placeholder={ t('login.password') } style={styling.input} />
                ) }
            </Form.Item>
            <Button type="primary" style={styling.submit}>
                {t('general.submit')}
            </Button>
        </Form>
    )
}
export default Form.create()( LoginForm );