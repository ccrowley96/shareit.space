import React from 'react';
import { useAuth } from '../../hooks/auth';
import { Link } from 'react-router-dom';
import { useReactiveVar, useQuery } from '@apollo/client';
import { useAppState } from '../../hooks/provideAppState';
import { actionTypes, modalTypes } from '../../constants/constants';
import { activeCommunityIdVar, activeRoomIdVar, cache } from '../../cache';
import { GET_ACTIVE_COMMUNITY } from '../../queries/community';
import { BsPlus } from 'react-icons/bs';
import { MdRefresh } from 'react-icons/md';
import { BiAddToQueue } from 'react-icons/bi';

import classNames from 'classnames/bind';
const cx = classNames.bind(require('./TopBar.module.scss'));

const TopBar = () => {
    const {
        session: {
            user: { picture }
        }
    } = useAuth();
    const { appState, appDispatch } = useAppState();

    const activeRoomId = useReactiveVar(activeRoomIdVar);
    const activeCommunityId = useReactiveVar(activeCommunityIdVar);

    const { data: activeCommunityData } = useQuery(GET_ACTIVE_COMMUNITY, {
        variables: { communityId: activeCommunityId },
        skip: !activeCommunityId
    });

    const activeCommunity = activeCommunityData?.community;

    return (
        <div className={cx('topBar')}>
            <div className={cx('communityBurger', 'navItem')}>
                <div
                    className={cx('hamburgerWrapper')}
                    onClick={() =>
                        appDispatch({
                            type: actionTypes.SET_ACTIVE_MODAL,
                            payload: modalTypes.COMMUNITY_SELECTOR
                        })
                    }
                >
                    <div className={cx('burger')}></div>
                    <div className={cx('burger')}></div>
                    <div className={cx('burger')}></div>
                </div>
            </div>
            <div className={cx('title', 'navItem')}>
                {activeCommunity && (
                    <>
                        <div
                            className={cx('communityName')}
                            onClick={() =>
                                appDispatch({
                                    type: actionTypes.SET_ACTIVE_MODAL,
                                    payload: modalTypes.COMMUNITY_DETAILS
                                })
                            }
                        >
                            {activeCommunity.name}
                        </div>
                        <div
                            className={cx('roomName')}
                            onClick={() =>
                                appDispatch({
                                    type: actionTypes.SET_ACTIVE_MODAL,
                                    payload: modalTypes.ROOM_DETAILS
                                })
                            }
                        >
                            <div className={cx('roomDeetz')}>
                                {activeRoomId
                                    ? activeCommunity.rooms.find(
                                          (room) => room.id === activeRoomId
                                      ).name
                                    : 'All'}
                                <div className={cx('addRoomIcon')}>
                                    <BiAddToQueue />
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
            <div className={cx('action', 'navItem')}>
                {activeCommunity && (
                    <MdRefresh
                        className={cx(
                            'actionIcon',
                            'refreshIcon',
                            appState.triggerRefresh ? '_refresh-start' : ''
                        )}
                        onClick={() => {
                            appDispatch({
                                type: actionTypes.TRIGGER_REFRESH,
                                payload: true
                            });
                            cache.modify({
                                fields: {
                                    feed(existingFeedRef, { DELETE }) {
                                        return DELETE;
                                    },
                                    feedSearch(
                                        existingFeedSearchRef,
                                        { DELETE }
                                    ) {
                                        return DELETE;
                                    }
                                }
                            });
                        }}
                    />
                )}
            </div>
            <div className={cx('action', 'navItem')}>
                {activeCommunity && (
                    <BsPlus
                        className={cx('actionIcon')}
                        onClick={() =>
                            appDispatch({
                                type: actionTypes.SET_ACTIVE_MODAL,
                                payload: modalTypes.NEW_POST
                            })
                        }
                    />
                )}
            </div>

            <div className={cx('profile', 'navItem')}>
                <Link className={cx('imgWrapper')} to={'/profile'}>
                    <img
                        src={picture}
                        className={cx('userImg')}
                        alt="profile"
                    />
                </Link>
            </div>
        </div>
    );
};

export default TopBar;
