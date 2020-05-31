import React, { useContext, useState } from 'react';
import { 
    Drawer,
    Input,
    Form,
    Button,
    Spin,
    Result
} from 'antd';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../contexts/UserContext';
import axios from 'axios';
import { UserOutlined } from '@ant-design/icons';



/*
    Drawer containing inputs
    to change the current password
*/
export default function SecurityDrawer(props) {
    const { t } = useTranslation();
    const context = useContext(UserContext);
    const [state, setState] = useState({});


    const handleSubmit = values => {
        setState({ loading: true });

        axios.post(
            `${context.API}/app/pw-change/`,
            values,
            { headers: {
                Pragma: "no-cache",
                Authorization: 'JWT ' + localStorage.getItem('token')
            }}
        ).then(
            res => {
                if (res.status === 200) {
                    setState({
                        loading: false,
                        result: true
                    })
                }
            }
        ).catch(
            e => {
                if (e.response) {
                    setState({
                        loading: false,
                        result: true,
                        error: e.response.status
                    })
                }
            }
        )
    }

    // If error occurs while request
    const ResultDiv = (
            state.error ? 
            <Result
                status="500"
                title={state.error}
                subTitle={t('messages.sth-went-wrong')}
                extra={
                    <Button type="primary" onClick={() => setState({})}>
                        {t('back')}
                    </Button>
                }
            />
            :   <Result
                    status="success"
                    title={t('messages.password-changed-successfully')}
                />
        );

    // password change form
    const PwForm = (
        <Form onFinish={handleSubmit}>
            <Form.Item
                name="pw"
                label={t('security-drawer.old-password')}
                labelCol={{ span: 24 }}
                labelAlign="left"
                rules={[{ required: true, message: t('messages.form.required') }]}
            >
                <Input.Password />
            </Form.Item>
            <Form.Item
                name="pw_new"
                label={t('security-drawer.new-password')}
                labelCol={{ span: 24 }}
                labelAlign="left"
                rules={[{ required: true, message: t('messages.form.required') }]}
            >
                <Input.Password />
            </Form.Item>
            <Form.Item
                name="pw_confirm"
                label={t('security-drawer.new-password-confirm')}
                labelCol={{ span: 24 }}
                labelAlign="left"
                rules={[
                    {
                        required: true,
                        message: t('messages.form.required')
                    }, 
                    ({getFieldValue}) => ({
                        validator(rule, value) {
                            if (!value || getFieldValue('pw_new') === value) {
                                return Promise.resolve();
                            }
                            return Promise.reject(t('messages.form.passwords-not-match'));
                        }
                    })
                ]}
            >
                <Input.Password />
            </Form.Item>
            <Form.Item>
                <Button type="primary" danger
                    htmlType="submit"
                >
                    { t('submit') }
                </Button>
            </Form.Item>
        </Form>
    )
    
    return(
        <Drawer
            placement="right"
            title={t('security-drawer.title')}
            visible={props.visible}
            onClose={() => {setState({}); props.onClose()}}
            width={350}
        >
            <div style={{ marginBottom: 25, color: 'red', fontSize: 16 }}>
                <UserOutlined /> <span>
                    {
                        context.state.user ? 
                        context.data.user.username
                        : "401"
                    }
                </span>
            </div>
            {
                !state.loading ? 
                <div>
                    { state.result ? ResultDiv : PwForm }
                </div>
                : <Spin tip={t('loading')} style={{ marginTop: 50 }} />
            }
        </Drawer>
    )
}