import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { message, Row, Col, Popconfirm, Icon, Card, Alert } from 'antd';
import { Loading } from './Loading';

const styling = {
    card: {
        marginBottom: 20
    },
    actionDelete: {
        color: "#f5222d"
    },
    iconFolder: {
        color: "#d9d9d9"
    },
    dscr: {
        marginTop: 10,
        height: 50,
        overflow: "auto",
        color: "#bfbfbf"
    }
}

const scaling = {
    xs: { span: 24 },
    sm: { span: 12 },
    md: { span: 8 },
    lg: { span: 6 }
}

// My files page lists all uploaded files
// It allows to delete and modify data in files
function Files() {
    const { t } = useTranslation();
    const [state, setState] = useState({});

    useEffect(() => {
        axios.get(
            `${process.env.REACT_APP_API_URL}/my-file/`
        ).then(
            res => setState({
                loaded: true,
                files: res.data.results
            })
        ).catch(
            () => message.error( t('messages.request-failed') )
        )
    }, [state.update, t])


    // delete file when requested
    const handleDelete = id => {
        axios.delete(
            `${process.env.REACT_APP_API_URL}/my-file/${id}/`
        ).then(
            () => {
                message.warning( t('messages.data-deleted') );
                setState({ ...state, update: state.update + 1 })
            }
        ).catch(
            () => message.error( t('messages.request-failed') )
        )
    }


    if (!state.loaded) {
        return (
            <div>{ Loading }</div>
        )
    }

    if (state.files.length === 0) {
        return(
            <div>
                <Alert
                    type="warning"
                    message={ t('messages.no-data-alert') }
                    showIcon
                />
            </div>
        )
    }

    return(
        <div>
            <h2>
                { t('files.page-title') }
            </h2>

            {/* files list */}
            <Row gutter={16} type="flex" justify="start">
                {
                    state.files.map(
                        item => (
                            <Col key={item.id} {...scaling}>
                                <Card 
                                    style={styling.card}
                                    actions={[
                                        <Popconfirm 
                                            title={t('messages.are-you-sure')}
                                            onConfirm={() => handleDelete(item.id)}
                                        >
                                            <Icon 
                                                style={styling.actionDelete }
                                                type="delete"
                                                key="delete"
                                            />
                                        </Popconfirm> ,
                                        <Icon type="edit" key="edit" />,
                                        <Icon type="search" key="data" />
                                    ]}
                                    title={<div><Icon 
                                        style={styling.iconFolder}
                                        type="folder" 
                                    /> <span>{item.name}</span>
                                    </div>}
                                >
                                    <div>{item.date}</div>
                                    <div style={styling.dscr}>{item.dscr}</div>                                 
                                </Card>
                            </Col>
                        )
                    )
                }
            </Row>
        </div>
    )
}
export default Files;