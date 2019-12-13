import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    Form,
    Input
} from 'antd';


function CodingForm(props) {

    const { t } = useTranslation();
    return(
        <Form>
            <Form.Item>
                <Input placeholder={t('test')} />
            </Form.Item>
        </Form>
    )
}
export default Form.create()(CodingForm);