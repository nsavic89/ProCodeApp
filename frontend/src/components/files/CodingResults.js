import React, { useContext, useState } from 'react';
import { UserDataContext } from '../../contexts/UserDataContext';
import { Loading } from '../Loading';
import { Table, Icon, Button, Modal, Tag, Radio, Alert, message } from 'antd';
import { useTranslation } from 'react-i18next';
import SchemeTree from '../coding/SchemeTree';
import axios from 'axios';


const styling = {
    action: {
        textAlign: "right"
    },
    downloadBtn: {
        borderRadius: 0
    },
    table: {
        marginTop: 25
    },
    editBtn: {
        border: "none",
        boxShadow: "none"
    },
    radioGroupHeader: {
        color: "#cf1322",
        marginBottom: 5,
        fontWeight: 700
    },
    radioGroup: {
        padding: 10,
        border: "1px solid #cf1322",
        borderRadius: 5,
        width: "100%"
    },
    radio: {
        display: 'block',
        height: '50px',
        lineHeight: '25px'
    },
    title: {
        width: 100,
        wordWrap: "break-word",
        whiteSpace: "normal"
    },
    radioNone: {
        color: "#f5222d"
    },
    alert: {
        marginBottom: 15
    },
    feedback: {
        padding: 10,
        border: "1px solid #1890ff",
        borderRadius: 5,
        marginTop: 25
    },
}



// shows results of coding of a file
function CodingResults(props) {
    const context = useContext(UserDataContext);
    const { t } = useTranslation();
    const [ state, setState ] = useState({ myCoding: null });

    if (!context.loaded){
        return(
            <div>
                { Loading }
            </div>
        )
    }

    let fileID = parseInt(props.match.params.id);
    let file = context.files.find(o => o.id === fileID);
    let myCoding = context.myCoding.filter(o => o['my_file'] === fileID)

    // columns for table below
    const columns = [
        {
            title: t('files.results.column-input'),
            dataIndex: 'text',
            key: 'text'
        }, {
            title: t('files.results.column-scheme'),
            dataIndex: 'scheme',
            key: 'scheme'
        }, {
            title: t('files.results.column-code'),
            dataIndex: 'code',
            key: 'code'
        }, {
            title: t('files.results.column-title'),
            dataIndex: 'title',
            key: 'title'
        }, {
            title: t('files.results.column-edit'),
            dataIndex: 'action',
            key: 'action'
        }
    ]

    // dataSource for table below
    let dataSource = [];
    let labelTitle = file.lng === 'en' ? 'title' : 'title_' + file.lng;

    for (let i in myCoding) {
        let schemeID = myCoding[i].scheme;

        let obj = {
            key: i.toString(),
            text: myCoding[i].text,
            scheme: context.schemes.find(o => o.id === schemeID).name
        }

        let output =  myCoding[i].output;
        let codes = [];
        let titles = [];

        for (let o in output) {
            codes.push(<div key={i.toString()}>{output[o].code}</div>);
            titles.push(<div key={i.toString()}>{output[o][labelTitle]}</div>);
        }

        obj.code = codes;
        obj.title = titles;

        // add action buttons
        obj.action = (
            <div>
                <Button
                    style={styling.editBtn}
                    type="danger"
                    size="small"
                    ghost
                    onClick={() => setState({
                        visible: true,
                        myCoding: myCoding[i]
                    })}
                ><Icon type="edit" /></Button>
            </div>
        )

        dataSource.push(obj);
    }

    // handle scheme tree in modal change
    // find classification object from context corresponding to the selected code
    // and update myCoding outputs in state
    const handleSchemeTreeChange = code => {
        let myCoding = { ...state.myCoding };
        let scheme = context.schemes.find(o => o.id === myCoding.scheme);
        let clsf = scheme.classification.find(o => o.code === code);

        // remove if already contained
        myCoding.output = myCoding.output.filter(o => o.id !== clsf.id);
        myCoding.output = [clsf];
        setState({
            ...state,
            myCoding: myCoding,
            radio: clsf.id
        });
    }
    
    // handleSubmit
    const handleSubmit = () => {
        const BASE_URL = process.env.REACT_APP_API_URL;
        let myCoding = {...state.myCoding};

        // update my coding
        const promise1 = axios.put(
            `${BASE_URL}/my-coding/${state.myCoding.id}/`,
            {output: state.myCoding.output.map(o => o.id)}
        );

        // add data for machine learning
        let obj = {
            scheme: myCoding.scheme,
            lng: myCoding.lng,
            text: myCoding.text,
            code: myCoding.output[0].id
        }

        const promise2 = axios.post(
            `${BASE_URL}/data/`,
            obj
        );

        Promise.all([promise1, promise2])
            .then(
                () => {
                    setState({
                        ...state,
                        myCoding: null,
                        visible: false
                    })
                    message.success(t('messages.request-success'));
                    context.refreshData();
                }
            )
            .catch(
                () => message.error(t('messages.request-failed'))
            )
        
    }

    // url for download of excel file   
    const url = `${process.env.REACT_APP_API_URL}/download-coding/${fileID}/`;
    return(
        <div>
            <h2>
                { t('files.results.page-title') }
            </h2>

            <div style={styling.action}>
                <button
                    className="success-btn"
                    style={styling.downloadBtn}
                    onClick={() => window.open(url)}
                >
                    <Icon type="download"/> {t('general.download')}
                </button>
            </div>

            <Table
                style={styling.table}
                columns={columns}
                dataSource={dataSource}
            />

            {/* modal for editing of my codings */}
            {
                state.myCoding !== null ?
                <Modal
                    visible={state.visible}
                    onCancel={() => setState({ visible: false, myCoding: null })}
                    okText={t('general.submit')}
                    title={t('files.results.modal-title')}
                    onOk={handleSubmit}
                >
                    <div>
                        {t('files.results.column-input')}: <strong>
                            { state.myCoding.text }
                        </strong>
                    </div>
                    <br />
                    <div style={styling.radioGroupHeader}>
                        { t('files.results.modal-obtained-results') }:
                    </div>

                    <Radio.Group 
                        style={styling.radioGroup}
                        onChange={e => setState({...state, radio:e.target.value})}
                    >
                        {
                            state.myCoding.output.map(
                                item => (
                                    <Radio 
                                        key={item.id}
                                        value={item.id}
                                        checked={state.radio === item.id}
                                        style={styling.radio}
                                    >
                                        <Tag color="#52c41a">
                                            { item.code }
                                        </Tag> <span style={styling.title}>{
                                            state.myCoding.lng === 'en' ? 
                                                item.title 
                                                : item[`title_${state.myCoding.lng}`]
                                            }</span>
                                    </Radio>
                                )
                            )
                        }
                        <Radio value="none" style={styling.radioNone}>
                            {t('coding.results.dont-agree')}
                        </Radio>
                    </Radio.Group>

                    {
                        state.radio === "none" ?
                        <div style={styling.feedback}>
                            <Alert
                                style={styling.alert}
                                type="info"
                                message={t('coding.results.feedback-text')}
                            />

                            <SchemeTree 
                                scheme={context.schemes.find(o => o.id === state.myCoding.scheme)}
                                titleLabel={state.myCoding.lng === "en" ? "title": `title_${state.myCoding.lng}`}
                                onChange={val => handleSchemeTreeChange(val)}
                            />
                        </div> : <div />
                    }
                </Modal> : <div />
            }
        </div>
    )
}
export default CodingResults;