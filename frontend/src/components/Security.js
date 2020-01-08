import React from 'react';
import { Modal, Form, Input, Icon, message } from 'antd';
import { useTranslation } from 'react-i18next';
import axios from 'axios';


// change password
function Security(props) {
    const {t} = useTranslation();
    const {getFieldDecorator} = props.form;

    const handleSubmit = e => {
        e.preventDefault();
        props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                axios.post(
                    `${process.env.REACT_APP_API_URL}/pw-change/`,
                    values,
                    {headers: {
                        Pragma: "no-cache",
                        Authorization: 'JWT ' + localStorage.getItem('token')
                    }}
                ).then(
                    () => message.success(t('security.success'))
                ).catch(
                    () => message.error(t('messages.request-failed'))
                )
            }
        });     
    }

    return(
        <Modal
            visible={props.visible}
            onCancel={props.onCancel}
            title={ t('security.title') }
            okText={ t('general.submit') }
            onOk={handleSubmit}
        >
            <Form>
                <Form.Item>
                    {getFieldDecorator('old_pw', {
                        rules: [
                            {
                                required: true,
                                messages: t('general.field-obligatory')
                            }
                        ]
                    })(
                        <Input 
                            prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} 
                            type="password"
                            placeholder={ t("security.old-pw") }/>
                    )}
                </Form.Item>

                <Form.Item>
                    {getFieldDecorator('new_pw', {
                        rules: [
                            {
                                required: true,
                                messages: t('general.field-obligatory')
                            }
                        ]
                    })(
                        <Input
                            prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}  
                            type="password"
                            placeholder={ t("security.new-pw") }/>
                    )}
                </Form.Item>

                <Form.Item>
                    {getFieldDecorator('new_pw2', {
                        rules: [
                            {
                                required: true,
                                messages: t('general.field-obligatory')
                            }
                        ]
                    })(
                        <Input
                            prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} 
                            type="password"
                            placeholder={ t("security.new-pw2") }/>
                    )}
                </Form.Item>
            </Form>
        </Modal>
    )
}
export default Form.create()( Security );