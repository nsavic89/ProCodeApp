import React, { useState } from 'react';
import { Drawer, Form, Button, Input } from 'antd';
import { useTranslation } from 'react-i18next';


const styling = {
    wrapper: {
        display: "inline-block",
        marginTop: 75
    },
    header: {
        background: "rgb(40,40,45)"
    },
    title: { 
        color: "rgb(220,220,220)"
    },
    drawer: {
        background: "rgb(30,30,35)",
        color: "white"
    },
    input: {
        background: "none",
        color: "white"
    },
    button: {
        margin: 3
    }
}

// register new user
function RegisterForm (props) {
    const [state, setState] = useState({});
    const { getFieldDecorator } = props.form;
    const { t } = useTranslation();

    return(
        <div style={styling.wrapper}>
            <Button
                type="danger"
                onClick={() => setState({ visible: true })}
                style={styling.button}
            >
                { t('login.register') }
            </Button>

            <Drawer
                placement="right"
                visible={state.visible}
                title={ <span style={styling.title}>{t('login.sign-up.title')}</span> }
                drawerStyle={styling.drawer}
                headerStyle={styling.header}
                width={350}
                onClose={() => setState({visible: false})}
                closable={false}
            >
                <Form>
                    <Form.Item
                        label={<span style={styling.title}> {t('login.username')}</span>}
                    >
                        { getFieldDecorator('username', {
                            rules: [
                                {
                                    required: true,
                                    message: t('messages.field-obligatory')
                                }
                            ]
                        })(
                            <Input style={styling.input} />
                        ) }
                    </Form.Item>

                    <Form.Item
                        label={<span style={styling.title}> {t('login.sign-up.email')}</span>}
                    >
                        { getFieldDecorator('email', {
                            rules: [
                                {
                                    required: true,
                                    message: t('messages.field-obligatory')
                                }
                            ]
                        })(
                            <Input style={styling.input} />
                        ) }
                    </Form.Item>

                    <Form.Item
                        label={<span style={styling.title}> {t('login.sign-up.password')}</span>}
                    >
                        { getFieldDecorator('password', {
                            rules: [
                                {
                                    required: true,
                                    message: t('messages.field-obligatory')
                                }
                            ]
                        })(
                            <Input style={styling.input} />
                        ) }
                    </Form.Item>

                    <Form.Item
                        label={<span style={styling.title}> {t('login.sign-up.password2')}</span>}
                    >
                        { getFieldDecorator('password2', {
                            rules: [
                                {
                                    required: true,
                                    message: t('messages.field-obligatory')
                                }
                            ]
                        })(
                            <Input style={styling.input} />
                        ) }
                    </Form.Item>
                </Form>
            </Drawer>
        </div>
    )
}
export default Form.create() ( RegisterForm );