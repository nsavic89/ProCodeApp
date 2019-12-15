import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Form,
    Input,
    Select,
    Slider,
    message
} from 'antd';
import axios from 'axios';
import { Loading } from '../Loading';

// css styling
const styling = {
    select: {
        width: 150
    }
}

// Coding of occupations using CNB
// select classification scheme
// enter raw data and run predictions
// will call my-coding url on api rest
function Search(props) {

    const { t } = useTranslation();
    const { getFieldDecorator } = props.form;
    const [state, setState] = useState({});

    // load classification schemes
    useEffect(() => {
        axios.get(
            `${process.env.REACT_APP_API_URL}/scheme/`
        ).then(
            res => {
                let schemes = res.data.results;
                for (let i in schemes) {
                    schemes[i].levels = JSON.parse(schemes[i].levels);
                }

                setState({
                    schemes: schemes,
                    loaded: true
                })
            }
        ).catch(
            () => message.error("Connection failed")
        )
    }, [])

    // Submit entered data and get codes
    const handleSubmit = e => {
        e.preventDefault();
        props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
              console.log('Received values of form: ', values);
            };
        });
    };

    // prevent going further if schemes not loaded yet
    if (!state.loaded) {
        return (
            <div>
                { Loading }
            </div>
        )
    }

    // Select menu with classification schemes
    const SchemeSelect = getFieldDecorator('scheme', {
        rules: [
            {
                required: true,
                message: t('messages.field-obligatory')
            }
        ]
    })(
        <Select style={ styling.select }>
            { state.schemes.map(
                item => (
                    <Select.Option value={item.id} key={item.id}>
                        { item.name }
                    </Select.Option>)
            ) }
        </Select>
    );

    return(
        <Form
            onSubmit={handleSubmit}
        >
            <Form.Item>
                { getFieldDecorator("text", {
                    rules: [
                        {
                            required: true,
                            message: t('messages.field-obligatory')
                        }
                    ]
                })(
                    <Input.Search
                        placeholder={t('coding.search.input-placeholder')} 
                        enterButton
                        addonBefore={ SchemeSelect }
                    />
                ) }
            </Form.Item>

            <Form.Item
                label={ t('coding.search.level') }
                wrapperCol={{md: {span: 14}}}
                labelCol={{md: {span: 2}}}
                labelAlign="left"
            >
                { getFieldDecorator('level', {
                    rules: [
                        {
                            required: true,
                            message: t('messages.field-obligatory')
                        }
                    ],
                    initialValue: 2
                })(
                    <Slider 
                        step={1} 
                        min={1} max={4}
                    />
                ) }
            </Form.Item>
        </Form>
    )
}
export default Form.create()( Search );