import React from 'react';
import { Modal, Form, Input, Icon } from 'antd';
import { useTranslation } from 'react-i18next';


// change password
function Security(props) {
    const {t} = useTranslation();
    const {getFieldDecorator} = props.form;

    return(
        <Modal
            visible={props.visible}
            onCancel={props.onCancel}
            title={ t('security.title') }
            okText={ t('general.submit') }
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