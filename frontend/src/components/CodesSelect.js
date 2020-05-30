import React, { useContext, useEffect, useState } from 'react';
import {
    TreeSelect, Spin, Alert
} from 'antd';
import { UserContext } from '../contexts/UserContext';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

/*
    cascader of ant that structures
    codes of a classification by 
    hierarchy from lower to upper level

    * requires reference name of classification
    to extract codes from context
    
    * title label of Code instance (title_fr for example)
    depending on which language is active in parent component
*/

const { TreeNode } = TreeSelect;

export default function CodesSelect(props) {

    const [state, setState] = useState({});
    const context = useContext(UserContext);
    const { t } = useTranslation();

    // if codes/titles not loaded
    useEffect(() => {
        if (props.reference in context.data.codes) {
            return;
        }
        if (!props.reference) {
            return;
        }
        // if not loaded then
        setState({ loading: true });

        axios.get(
            `${context.API}/app/codes/ref=${props.reference}/`,
            {headers: {
                Pragma: "no-cache",
                Authorization: 'JWT ' + localStorage.getItem('token')
            }}
        ).then(
            res => {
                let codes = {...context.data.codes};
                codes[props.reference] = res.data;
                context.fun.updateData('codes', codes);
                setState({ loading: false });
            }
        ).catch(
            e => {
                console.log(e);
                if (e.response) {
                    setState({ loading: false, error: e.response.status });
                }
            }
        )
    }, [props])

    if (!props.reference) {
        return(
            <Alert 
                type="warning"
                showIcon
                banner={true}
                message={t('messages.no-codes-before-clsf-selected')}
            />
        )
    }

    // if loading -> spin
    if (state.loading) {
        return(
            <div>
                <Spin />
            </div>
        )
    }

    // get unique values from a list
    const setUnique = myList => {
        let mySet = [];
        for ( let i in myList ) {
            if (mySet.indexOf(myList[i]) === -1) {
                mySet.push(myList[i]);
            }
        }
        mySet.sort();
        return mySet;
    }
    
    let nodes = [];
    if (props.reference in context.data.codes) {
        // start from top-level codes
        const codes = context.data.codes[props.reference];
        const topLevelCodes = codes.filter(o => o.level === Math.max(props.levels));
        nodes = topLevelCodes.map(item => (
            <TreeNode 
                key={item.code}
                value={item.code}
                title={`${item.code}: ${item[props.title]}`} 
            />
        ))

        // go lower-level direction
        let levels = props.levels;
        if (!levels) {
            let levelsList = context.data.codes[props.reference];
            levelsList = levelsList.map(item => item.level);
            levels = setUnique(levelsList);
        }
        let inx = levels[levels.length-2];

        while (inx > -1) {
            let cLevel = levels[inx];
            let branches = codes.filter(o => o.level === cLevel);

            for (let i in branches) {
                let childOf = branches[i].code;
                let childrenCodes = codes.filter(
                    o => o.child_of === childOf).map(item => item.code);
            
                let children = nodes.filter(o => childrenCodes.indexOf(o.key) !== -1);
                branches[i] = (
                    <TreeNode
                        key={childOf}
                        value={childOf}
                        title={`${childOf}: ${branches[i][props.title]}`}
                    >{children.map(item => item)}
                    </TreeNode>
                )
            }
            nodes = branches;
            inx--;
        }
    }

    return(
        <TreeSelect
            allowClear
            onChange={props.handleChange}
            placeholder={t('please-select')}
            value={props.value ? props.value : ""}
        >
            { nodes.map(item => item) }
        </TreeSelect>
    )
}