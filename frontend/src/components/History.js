import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { UserDataContext } from '../contexts/UserDataContext';
import { Loading } from './Loading';
import { Alert } from 'antd';



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

    // coded files
    const files = context.myCoding.filter(o => o['my_file'] !== null);

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
                : files.map(
                    item => item['my_file']
                )
            }
        </div>
    )
}
export default History;