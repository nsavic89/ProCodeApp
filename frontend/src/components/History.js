import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { UserDataContext } from '../contexts/UserDataContext';
import { Loading } from './Loading';
import { Alert, Card, Icon, Col, Row } from 'antd';

// scaling of cards
const scaling = {
    xs: { span: 24 },
    sm: { span: 12},
    md: { span: 8 },
    lg: { span: 6 }
}

const styling = {
    deleteIcon: { color: "#f5222d" }
}



function History() {
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
    const files = () => {
        let fileObj = {};
        for (let i in codings) {
            let fileKey = codings[i]['my_file'].toString();
            let isContained = fileObj[fileKey] !== undefined;

            // if not contained create an array for the key
            if (!isContained){
                fileObj[fileKey] = [];
            } 
            
            // otherwise just add it
            fileObj[fileKey].push( codings[i] );
        }
        return fileObj;
    }

    console.log(files())

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
                            <Col key={item.id.toString()} {...scaling}>
                                <Card
                                    actions={[
                                        <Icon type="search" />,
                                        <Icon type="delete" style={ styling.deleteIcon } />
                                    ]}
                                >
                                    { item['my_file'] }
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
export default History;