import React from 'react';
import Modal from '../../Modal';
import { useMutation } from '@apollo/client';
import { actionTypes } from '../../../../constants/constants';
import { useAppState } from '../../../../hooks/provideAppState';
import { DELETE_COMMUNITY, GET_ACTIVE_COMMUNITY, MY_COMMUNITIES } from '../../../../queries/community';
import AreYouSure from '../AreYouSure/AreYouSure';

import classNames from 'classnames/bind';
const cx = classNames.bind(require('./CommunityDetailsModal.module.scss'));

const CommunityDetailsModal = ({activeCommunity}) => {

    const { appDispatch } = useAppState();

    const [ deleteCommunity ] = useMutation(DELETE_COMMUNITY, {
        update(cache, data){
            const communityId = activeCommunity.id;
            const queryVars = { communityId };

            // Delete active community from cache
            cache.writeQuery({
                query: GET_ACTIVE_COMMUNITY,
                variables: queryVars,
                data: {community: null}
            })

            // Close modal
            appDispatch({type: actionTypes.SET_ACTIVE_MODAL, payload: null});

            // Read my communities
            let communitiesData = cache.readQuery({
                query: MY_COMMUNITIES,
                variables: queryVars
            })

            // Filter out deleted community
            const newCommunities = communitiesData.myCommunities.filter(community => community.id !== communityId);

            cache.writeQuery({
                query: MY_COMMUNITIES, 
                variables: queryVars,
                data: { myCommunities: newCommunities }
            })
        }
    });
    
    return(
        <Modal title={activeCommunity.name}>
            <div className={cx('m_odalSection')}>
                <div className={cx('_sectionLabel')}>Community code</div>
                <div className={cx('_sectionValue')}>{activeCommunity.code}</div>
            </div>
            {
                activeCommunity.members.length > 0 &&
                <div className={cx('_modalSection')}>
                    <div className={cx('_sectionLabel')}>Members</div>
                    {activeCommunity.members.map((member, idx) => {
                        return <div key={idx} className={cx('sectionValue')}>{member.name}</div>
                    })}
                </div>
            }
            <div className={cx('_modalSection')}>
                <div className={cx('_sectionLabel')}>Admins</div>
                {activeCommunity.admins.map((admin, idx) => {
                    return <div key={idx} className={cx('sectionValue')}>{admin.name}</div>
                })}
            </div>
            <div className={cx('_modalSection')}>
                <div className={cx('_sectionLabel')}>Created</div>
                <div className={cx('_sectionValue')}>{new Date(Number(activeCommunity.createdAt)).toDateString()}</div>
            </div>
            
            <AreYouSure 
                mutation={() => deleteCommunity({variables: {communityId: activeCommunity.id}})}
                activeCommunity={activeCommunity}
                dataKey={'deleteCommunity'}
                successMessage={'Community deleted'}
                failedMessage={'Community could not be deleted'}
                buttonText={'Delete community'}
                placeholder={'Enter community name to confirm'}
                confirmText={activeCommunity.name}
                dangerText={<span>Deleting <b>{activeCommunity.name}</b> will also delete all rooms and posts created within <b>{activeCommunity.name}</b>.  This cannot be undone.</span>}
            />
        </Modal>
    )
}

export default CommunityDetailsModal;
