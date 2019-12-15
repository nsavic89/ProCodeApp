import React from 'react';
import { Modal, Form } from 'antd';
import { useTranslation } from 'react-i18next';


function MyFileUpload(props) {
    const { t } = useTranslation();

    // save new file to the server
    const handleSubmit = () => {

    }

    return(
        <Modal
            title={ t('file-upload.title') }
            visible={props.visible}
            onCancel={props.onCancel}
            onOk={handleSubmit}
            okText={ t('general.submit') }
            cancelText={ t('general.cancel') }
        >
            <Form>

            </Form>
        </Modal>
    )
}
export default MyFileUpload;