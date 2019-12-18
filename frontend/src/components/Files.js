import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { message, Row, Col, Popconfirm, Icon, Card, Alert, Tag } from 'antd';
import { Loading } from './Loading';
import { UserDataContext } from '../contexts/UserDataContext';

const styling = {
    pageHeader: {
        marginBottom: 25
    },
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
    },
    tag: {
        fontSize: 18
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
    const context = useContext(UserDataContext);

    // delete file when requested
    const handleDelete = id => {
        axios.delete(
            `${process.env.REACT_APP_API_URL}/my-file/${id}/`
        ).then(
            () => {
                message.warning( t('messages.data-deleted') );
                context.refreshData();
            }
        ).catch(
            () => message.error( t('messages.request-failed') )
        )
    }


    if (!context.loaded) {
        return (
            <div>{ Loading }</div>
        )
    }

    if (context.files.length === 0) {
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
            <h2 style={styling.pageHeader}>
                { t('files.page-title') }
            </h2>

            {/* files list */}
            <Row gutter={16} type="flex" justify="start">
                {
                    context.files.map(
                        item => (
                            <Col key={item.id} {...scaling}>
                                <Card 
                                    style={styling.card}
                                    actions={[
                                        <Popconfirm 
                                            title={t('messages.are-you-sure')}
                                            onConfirm={() => handleDelete(item.id)}
                                            okText={ t('messages.yes') }
                                            cancelText={ t('messages.no') }
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
                                    <div>{ t('general.created-date') }: {item.date}</div>
                                    <div style={styling.dscr}>{item.dscr}</div>          

                                    <div>{
                                        item['my_data'].length === 0 ?
                                            <Tag color="#f5222d">
                                                { t('files.no-data.tag') }
                                            </Tag> 
                                            : <Tag color="#52c41a" style={styling.tag}>
                                                { t('files.file-size') } {item['my_data'].length}
                                            </Tag> 
                                    }</div>          
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