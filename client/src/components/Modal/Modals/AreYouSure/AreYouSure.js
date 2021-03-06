import React, { useState } from 'react';
import { USER_QUERY } from '../../../../queries/profile';
import { useQuery } from '@apollo/client';

import classNames from 'classnames/bind';
const cx = classNames.bind(require('./AreYouSure.module.scss'));

const AreYouSure = ({
    mutation,
    buttonText,
    placeholder,
    confirmText,
    dangerText,
    activeCommunity,
    titleText
}) => {
    const [loading, setLoading] = useState(false);
    const { data: userData } = useQuery(USER_QUERY);
    const [areYouSureInput, setAreYouSureInput] = useState('');

    if (
        userData &&
        userData.me &&
        activeCommunity.admins.find((admin) => admin.id === userData.me.id)
    ) {
        return (
            <div className={cx('_modalSection')}>
                <div className={cx('_sectionLabel')}>{titleText}</div>
                <div className={cx('deleteContainer')}>
                    <div className={cx('_sectionValue', '_danger')}>
                        {dangerText}
                    </div>
                    <input
                        placeholder={placeholder}
                        value={areYouSureInput}
                        onChange={(e) => setAreYouSureInput(e.target.value)}
                        className={cx('_input', 'confirmInput')}
                    />
                    <button
                        className={cx('_btn-danger', 'deleteBtn')}
                        onClick={async () => {
                            setLoading(true);
                            await mutation();
                            setLoading(false);
                        }}
                        disabled={areYouSureInput !== confirmText || loading}
                    >
                        {buttonText}
                    </button>
                </div>
            </div>
        );
    } else {
        return null;
    }
};

export default AreYouSure;
