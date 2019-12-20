import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { UserDataContext } from '../contexts/UserDataContext';
import { Loading } from './Loading';
import { Alert, Card, Icon, Col, Row, Tag } from 'antd';
import { withRouter } from 'react-router-dom';

// scaling of cards
const scaling = {
    xs: { span: 24 },
    sm: { span: 12},
    md: { span: 8 },
    lg: { span: 6 }
}

const styling = {
    deleteIcon: { color: "#f5222d" },
    codedIn: { marginTop: 15 },
    codedFile: { paddingLeft: 15, marginTop: 5 },
    codedSchemes: { paddingLeft: 15, marginTop: 5 }
}



function History(props) {
    const { t } = useTranslation();
    const context = useContext(UserDataContext);

    if (!context.loaded) {
        return(
            <div>
                { Loading }
            </div>
        )
    }

    // codings with file !== null
    const codings = context.myCoding.filter(o => o['my_file'] !== null);

    // sort files -> those codings belonging to the same file
    // because we render one card per file
    const files = [];
    
    for (let i in codings) {
        let fileID = codings[i]['my_file'];
        let isContained = files.filter(o => o.fileID === fileID).length > 0;

        if (isContained) {
            let obj = files.find(o => o.fileID === fileID);
            let inx = files.indexOf(obj);
            
            if (obj.schemes.indexOf(codings[i].scheme) === -1) {
                obj.schemes.push(codings[i].scheme);
            }

            files[inx] = obj;

        } else {
            let obj = {
                fileID: fileID,
                schemes: [codings[i].scheme]
            };
            files.push(obj);
        }
    }

    return (
        <div>
            <h2>
                { t('history.page-title') }
            </h2>

            {
                files.length === 0 ?
                <Alert
                    type="warning"
                    message={ t('messages.no-data-alert') }
                    showIcon
                />
                : <Row gutter={16} type="flex" justify="start">
                    {
                        files.map(
                            item => (
                                <Col key={item.fileID.toString()} {...scaling}>
                                    <Card
                                        actions={[
                                            <Icon 
                                                type="search"
                                                onClick={() => props.history.push(`/coding-results/file=${item.fileID}`)} 
                                            />,
                                            <Icon type="delete" style={ styling.deleteIcon } />
                                        ]}
                                    >
                                        <span>{ t('history.file') }: </span>
                                        <div style={styling.codedFile}>
                                            <Tag>
                                                { context.files.find(o => o.id === item.fileID).name }
                                            </Tag>
                                        </div>

                                        {/* file coded for following schemes */}
                                        <div style={styling.codedIn}>
                                            { t('history.coded-in') }:
                                        </div>
                                        {
                                            item.schemes.map(
                                                scheme => 
                                                    <div key={scheme.toString()} style={styling.codedSchemes}>
                                                        <Tag>
                                                            { context.schemes.find(o => o.id === scheme).name }
                                                        </Tag>
                                                    </div>
                                            )
                                        }
                                    </Card>
                                </Col>
                                )
                            )
                    }
                </Row>
            }
        </div>
    )
}
export default withRouter( History );