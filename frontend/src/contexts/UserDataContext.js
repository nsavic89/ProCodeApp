import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { message } from 'antd';
import { useTranslation } from 'react-i18next';


// this context provides end-users with scheme and files data

export const UserDataContext = createContext({});

function UserDataContextProvider (props) {
    const [state, setState] = useState({ });
    const [refresh, runRefresh] = useState(0);
    const { t } = useTranslation();

    useEffect(() => {
        const promise1 = axios.get(`${process.env.REACT_APP_API_URL}/scheme/`);
        const promise2 = axios.get(`${process.env.REACT_APP_API_URL}/my-file/`);
        const promise3 = axios.get(`${process.env.REACT_APP_API_URL}/my-coding/`);

        Promise.all([promise1, promise2, promise3])
            .then(
                res => setState({
                    schemes: res[0].data,
                    files: res[1].data,
                    myCoding: res[2].data,
                    loaded: true
                })
            )
            .catch(
                () => message.error(t('messages.request-failed'))
            )
    }, [t, refresh])

    const refreshData = () => {
        runRefresh(refresh+1);
    }
    
    return (
        <UserDataContext.Provider value={{...state, refreshData: refreshData}}>
            { props.children }
        </UserDataContext.Provider>
    )
}
export default UserDataContextProvider;