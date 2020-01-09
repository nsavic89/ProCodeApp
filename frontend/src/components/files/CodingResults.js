import React, { useContext, useState } from 'react';
import { UserDataContext } from '../../contexts/UserDataContext';
import { Loading } from '../Loading';
import { Table, Icon, Button, Modal, Tag, message } from 'antd';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import Feedback from '../coding/Feedback';
import SchemeTree from '../coding/SchemeTree';


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
    resultsHeader: {
        marginBottom: 5,
        fontWeight: 500
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
    schemeTree: {
        marginTop: 25
    },
    schemeTreeLabel: {
        marginBottom: 5
    }
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

    // handleSubmit
    const handleSubmit = code => {
        const BASE_URL = process.env.REACT_APP_API_URL;
        let myCoding = {...state.myCoding};

        let output_id = context.schemes
                        .find(o => o.id === myCoding.scheme)
                        .classification
                        .find(o => o.code === code)
                        .id;

        let level = context.schemes
                        .find(o => o.id === myCoding.scheme)
                        .classification
                        .find(o => o.code === code)
                        .level;

        // update my coding
        const promise1 = axios.put(
            `${BASE_URL}/my-coding/${state.myCoding.id}/`,
            {output: [output_id]},
            {headers: {
                Pragma: "no-cache",
                Authorization: 'JWT ' + localStorage.getItem('token')
            }}
        );

        // add data for machine learning
        let obj = {
            scheme: myCoding.scheme,
            lng: myCoding.lng,
            text: myCoding.text,
            code: output_id,
            level: level,
            "code_str": "x"
        }

        const promise2 = axios.post(
            `${BASE_URL}/data/`,
            obj,
            {headers: {
                Pragma: "no-cache",
                Authorization: 'JWT ' + localStorage.getItem('token')
            }}
        );

        Promise.all([promise1, promise2])
            .then(
                () => {
                    setState({
                        ...state,
                        myCoding: null,
                        visible: false
                    })
                    message.success(t('coding.results.feedback-sent-msg'));
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
                    title={t('files.results.modal-title')}
                    onOk={() => handleSubmit(state.correctedCode)}
                >
                    <div>
                        {t('files.results.column-input')}: <strong>
                            { state.myCoding.text }
                        </strong>
                    </div>
                    <br />
                    <div style={styling.resultsHeader}>
                        { t('files.results.modal-obtained-results') }:
                    </div>

                    <Tag color="#52c41a">
                        { state.myCoding.output[0].code }
                    </Tag> <span 
                                style={styling.title}
                            >{
                                state.myCoding.lng === 'en' ? 
                                state.myCoding.output[0].title 
                                : state.myCoding.output[0][`title_${state.myCoding.lng}`]
                            }
                            </span>
                    
                    {/* feedback */}
                    <Feedback
                        visible={true}
                        offset={0}
                        span={24}
                        handleFeedbackYes={() => handleSubmit(state.myCoding.output[0].code)}
                        handleFeedbackNo={() => setState({...state, schemeTreeVisible: true})}
                    />

                    {/* tree if schemeTreeVisible */}
                    {
                        state.schemeTreeVisible && state.myCoding ? 
                            <div style={styling.schemeTree}>
                                <div style={styling.schemeTreeLabel}>
                                    { t('coding.file.scheme-tree-label') }
                                </div>
                                <SchemeTree
                                    titleLabel={state.myCoding.lng === "en" ? "title" : `title_${state.myCoding.lng}`}
                                    scheme={state.myCoding.scheme}
                                    onChange={value => setState({...state, correctedCode: value})}
                                />
                            </div> : <div />
                    }
                </Modal> : <div />
            }
        </div>
    )
}
export default CodingResults;