import React, { useContext } from 'react';
import {
    TreeSelect
} from 'antd';
import { UserContext } from '../contexts/UserContext';
import { useTranslation } from 'react-i18next';


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
    const context = useContext(UserContext);
    const codes = context.data.codes[props.reference];
    const { t } = useTranslation();
    
    // start from top-level codes
    const topLevelCodes = codes.filter(o => o.level === Math.max(props.levels));
    let nodes = topLevelCodes.map(item => (
        <TreeNode 
            key={item.code}
            value={item.code}
            title={`${item.code}: ${item[props.title]}`} 
        />
    ))

    // go lower-level direction
    let levels = props.levels;
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

    return(
        <TreeSelect
            allowClear
            onChange={props.handleChange}
            placeholder={t('please-select')}
        >
            { nodes.map(item => item) }
        </TreeSelect>
    )
}