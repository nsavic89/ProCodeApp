import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import CodingForm from './coding/CodingForm';
import { Tooltip, Icon, message, Modal, Alert, Col, Row } from 'antd';
import CodingResults from './coding/CodingResults';
import axios from 'axios';
import { Loading } from './Loading';
import Feedback from './coding/Feedback';
import SchemeTree from './coding/SchemeTree';
import { UserDataContext } from '../contexts/UserDataContext';


// Coding view
const styling = {
    codingForm: {
        marginTop: 50
    },
    noResultAlert: {
        marginTop: 5
    }
}


function Coding() {
    const context = useContext(UserDataContext);
    const { t } = useTranslation();
    const [state, setState] = useState({
        values: {}
    });

    // get predictions
    const handleSubmit = (values) => {
        setState({
            ...state,
            running: true
        })

        if (!values.dict) {
            values.dict = false;
        }

        axios.post(
            `${process.env.REACT_APP_API_URL}/my-coding/`,
            values,
            {headers: {
                Pragma: "no-cache",
                Authorization: 'JWT ' + localStorage.getItem('token')
            }}
        ).then(
            res => {
                if (res.status === 204) {
                    setState({
                        ...state,
                        noLangAlert: true,
                        results: null,
                        feedbackSent: false,
                        feedbackVisible: false
                    })
                } else {
                    setState({
                        running: false,
                        values: values,
                        results: res.data,
                        feedbackVisible: res.data[0] !== "-",
                        feedbackSent: false,
                        noResultAlert: res.data[0] === "-",
                        noLangAlert: false
                    })
                }
            }
        ).catch(
            () => {
                message.error( t('messages.request-failed') );
                setState({
                    running: false,
                    values: {},
                    results: null,
                    noLangAlert: false
                })
            }
        )
    }

    // send feedback to server
    const handleFeedback = code => {

        let obj = {
            scheme: state.values.scheme,
            lng: state.values.lng,
            text: state.values.text,
            level: state.values.level,
            "code_str": "x",
            code: context.schemes
                        .find(o => o.id === state.values.scheme)
                        .classification
                        .find(o => o.code === code).id
        }

        axios.post(
            `${process.env.REACT_APP_API_URL}/data/`,
            obj,
            { headers: {
                Pragma: "no-cache",
                Authorization: 'JWT ' + localStorage.getItem('token')
            }}
        ).then(
            () => {
                message.success(t('coding.results.feedback-sent-msg'));
                setState({
                    ...state,
                    feedbackSent: true,
                    correctCode: null,
                    feedback: true
                })
            }
        ).catch(
            () => message.error(t('messages.request-failed'))
        )
    }

    return (
        <div>
            <h2>
                {t('coding.page-title')}
            </h2>

            <div className="help">
                <Tooltip title={ t('coding.help-text' )} placement="left">
                    <Icon type="question-circle"  /> { t('general.help' )}
                </Tooltip>
            </div>

            <div style={styling.codingForm}>
                <CodingForm
                    getValues={ values => handleSubmit(values) }
                />
            </div>

            {/* spinner if state.running */}
            {
                state.running ?
                <div>
                    { Loading }
                </div> 
                : <CodingResults
                    results={ state.results }
                    scheme={ state.values.scheme }
                    titleLabel={ 
                        state.values.lng === 'en' ? 
                        'title' : `title_${state.values.lng}`}
                />
            }

            {/* feedback if result is not None */}
            <div>
                <Feedback
                    disabled={state.feedbackSent}
                    visible={state.feedbackVisible}
                    handleFeedbackYes={ () => handleFeedback(state.results[0]) }
                    handleFeedbackNo={ () => setState({...state, feedback: false}) }
                />
            </div>

            {/* scheme-tree when the result from feedback incorrect */}
            <Modal
                visible={state.feedback === false}
                title={t('coding.results.feedback-modal-title')}
                okText={t('general.submit')}
                cancelText={t('general.cancel')}
                onCancel={() => setState({...state, feedback: true})}
                onOk={() => handleFeedback(state.correctCode)}
            >
                <SchemeTree
                    scheme={ state.values.scheme }
                    titleLabel={ 
                        state.values.lng === 'en' ? 
                        'title' : `title_${state.values.lng}`}
                    onChange={value => setState({ ...state, correctCode: value })}
                />
            </Modal>

            {/* if coding for not supported language for selected scheme */}
            {
                state.noLangAlert ?
                <Row>
                    <Col md={{ offset: 4, span: 16 }}>
                        <Alert
                            type="error"
                            message={ t('coding.results.error-no-lang') }
                            showIcon
                        />
                    </Col>
                </Row> : <div />
            }

            {/* algorithm 2 -> if None is result */}
            {
                state.noResultAlert ?
                <Row style={styling.noResultAlert}>
                    <Col md={{ offset: 4, span: 16 }}>
                        <Alert
                            type="warning"
                            showIcon
                            message={t('coding.results.no-result-alert')}
                        />
                    </Col>
                </Row>
                : <div />
            }
        </div>
    )
}


export default Coding;