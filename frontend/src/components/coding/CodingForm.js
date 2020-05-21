import React from 'react';
import {
    Form, Input
} from 'antd';
import { useTranslation } from 'react-i18next';


/*
    Collects data related to the following coding
    of entered data
*/

export default function CodingForm() {
    const { t, i18n } = useTranslation();

    // form style
    const layout = {
        labelCol: {
            xs: { span: 24 },
            md: { span: 8 },
            lg: { span: 6 }
        },
        wrapperCol: { 
            xs: { span: 24 },
            md: { span: 16 },
            lg: { span: 12 }
         },
    }

    return(
        <Form {...layout}>
            <Form.Item
                label={t('coding-view.input')}
            >
                <Input />
            </Form.Item>
        </Form>
    )
}