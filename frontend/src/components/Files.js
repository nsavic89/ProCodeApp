import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { message, Row, Col, Popconfirm, Icon, Card, Alert, Tag, Statistic } from 'antd';
import { Loading } from './Loading';
import { UserDataContext } from '../contexts/UserDataContext';

const styling = {
    pageHeader: {
        marginBottom: 25
    },
    card: {
        marginBottom: 20
    },
    headStyle: {
        background: "#fafafa",
        color: "#595959"
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
    noDscr:  {
        height: 50,
        marginTop: 10,
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
function Files(props) {
    const { t } = useTranslation();
    const context = useContext(UserDataContext);

    // delete file when requested
    const handleDelete = id => {
        axios.delete(
            `${process.env.REACT_APP_API_URL}/my-file/${id}/`,
            {headers: {
                Pragma: "no-cache",
                Authorization: 'JWT ' + localStorage.getItem('token')
            }}
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
                                    headStyle={styling.headStyle}
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
                                        </Popconfirm>,
                                        <Icon 
                                            type="search"
                                            key="data" 
                                            onClick={() => props.history.push(`my-files/file=${item.id}`)}/>
                                    ]}
                                    title={<div><Icon 
                                        style={styling.iconFolder}
                                        type="file-excel" 
                                        twoToneColor="#73d13d"
                                        theme="twoTone"
                                    /> <span>{item.name}</span>
                                    </div>}
                                >
                                    <div>{ t('general.created-date') }: {item.date}</div>
                                    
                                    {item.dscr ? 
                                    <div style={styling.dscr}>
                                        {item.dscr}
                                    </div> 
                                    : <div style={styling.noDscr}>
                                        { t('files.no-dscr') }
                                    </div>}         

                                    <div>{
                                        item['my_data'].length === 0 ?
                                            <Tag color="#f5222d">
                                                { t('files.no-data.tag') }
                                            </Tag> 
                                            : <Statistic 
                                                title={t('files.file-size')}
                                                value={item['my_data'].length}
                                                prefix={<Icon type="dashboard" />} 
                                            />
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