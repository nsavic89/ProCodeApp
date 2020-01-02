import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { UserDataContext } from '../../contexts/UserDataContext';
import {
    Form,
    Input,
    Select,
    Radio,
    message,
    Alert,
    Button,
    Icon
} from 'antd';
import axios from 'axios';

// css styling
const styling = {
    select: {
        width: "100%",
        fontSize: 16
    },
    input: {
        fontSize: 16
    },
    radio: {
        minWidth: 75
    }
}

const formItemLayout = {
    wrapperCol:
        {md: {span: 16}},
    labelCol:
        {md: {span: 4}}
}

// Coding of occupations using CNB
// select classification scheme
// enter raw data and run predictions
// will call my-coding url on api rest
function Search(props) {
    const context = useContext(UserDataContext)
    const { t, i18n } = useTranslation();
    const { getFieldDecorator } = props.form;
    const [state, setState] = useState({});

    const lng = i18n.language;

    // Submit entered data and get codes
    const handleSubmit = e => {
        e.preventDefault();
        props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                // activates spinner in results
                props.updateParent(null, true);

                axios.post(
                    `${process.env.REACT_APP_API_URL}/my-coding/`,
                    values
                ).then(
                    res => {
                        // format data and send back to parent (coding)
                        let data = [];
                        let titleLabel= null;

                        for (let i in res.data) {
                            // title label (field of model) based on current language
                            titleLabel = values.lng === 'en' ? 'title' : `title_${values.lng}`;

                            let title = state.scheme.classification.find(
                                o => o.code === res.data[i]
                            )[titleLabel]
                            data.push({ code: res.data[i], title: title });
                        }
                        // state.scheme is selected (active) scheme needed for feeback
                        props.updateParent(data, false, state.scheme, titleLabel, values);
                    }
                ).catch(
                    () => message.error(t('messages.request-failed'))
                )
            };
        });
    };


    return(
        <Form
            onSubmit={handleSubmit}
            style={styling.form}
        >   

            <Form.Item
                label={ t('general.language' )}
                {...formItemLayout}
                labelAlign="left"
            >
                { getFieldDecorator("lng", {
                    rules: [
                        {
                            required: true,
                            message: t('messages.field-obligatory')
                        }
                    ],
                    initialValue: lng === 'en-US' ? 'en' : lng
                })(
                    <Radio.Group buttonStyle="solid">
                    {[
                        {
                            label: t('langs.en'),
                            value: 'en'
                        }, {
                            label: t('langs.ge'),
                            value: 'ge'
                        }, {
                            label: t('langs.fr'),
                            value: 'fr'
                        }, {
                            label: t('langs.it'),
                            value: 'it'
                        }
                    ].map(
                        item => (
                            <Radio.Button 
                                key={item.value}
                                value={item.value}
                                style={styling.radio}
                            >
                                { item.label }
                            </Radio.Button>
                        )
                    )}
                    </Radio.Group>
                ) }
            </Form.Item>

            <Form.Item
                label={ t('coding.search.scheme' )}
                {...formItemLayout}
                labelAlign="left"
            >
                { getFieldDecorator('scheme', {
                    rules: [
                        {
                            required: true,
                            message: t('messages.field-obligatory')
                        }
                    ]
                })(
                    <Select 
                        placeholder={ t('coding.search.scheme-placeholder') }
                        style={ styling.select }
                        onChange={val => setState({
                            ...state, 
                            scheme: context.schemes.find(o => o.id === val) 
                        })}
                    >
                        { context.schemes.map(
                            item => (
                                <Select.Option value={item.id} key={item.id}>
                                    { item.name }
                                </Select.Option>)
                        ) }
                    </Select>
                )}
            </Form.Item>

            {   // only when a scheme is selected -> levels are shown
                
                <Form.Item
                    label={ t('coding.search.level') }
                    {...formItemLayout}
                    labelAlign="left"
                >
                    { getFieldDecorator('level', {
                        rules: [
                            {
                                required: true,
                                message: t('messages.field-obligatory')
                            }
                        ],
                    })(
                        state.scheme ? 
                        <Radio.Group  buttonStyle="solid">
                            { JSON.parse(state.scheme.levels).map(
                                (item, inx) => 
                                    <Radio.Button value={item} key={inx} style={styling.radio}>
                                        { item }
                                    </Radio.Button>
                            ) }
                        </Radio.Group>
                        : <Alert
                            type="info"
                            message={ t('coding.search.alert-select-scheme') }
                        />
                    ) }
                </Form.Item>
            }

            <Form.Item
                label={ t('coding.search.text' )}
                {...formItemLayout}
                labelAlign="left"
            >
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
                        onSearch={(val, e) => handleSubmit(e)}
                    />
                ) }
            </Form.Item>

            <Form.Item
                    wrapperCol={{md: {offset: 4}}}
                >
                    <Button 
                        type="primary"
                        onClick={handleSubmit}
                    >
                        <Icon type="play-circle" /> { t('coding.button-title') }
                    </Button>
            </Form.Item>
        </Form>
    )
}
export default Form.create()( Search );