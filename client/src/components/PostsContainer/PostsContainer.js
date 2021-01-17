import React, { useEffect, useState } from 'react';
import PostPreview from '../PostPreview/PostPreview';
import Search from '../Search/Search';
import { FEED_QUERY } from '../../queries/post';
import { useLazyQuery, useQuery, useReactiveVar } from '@apollo/client';
import { activeRoomIdVar, activeCommunityIdVar } from '../../cache';
import { useParams } from 'react-router-dom';
import { actionTypes, POSTS_PER_PAGE } from '../../constants/constants';
import { Waypoint } from 'react-waypoint';

import classNames from 'classnames/bind';
import { getFeedQueryVariables } from '../../services/utils';
import { useAppState } from '../../hooks/provideAppState';
const cx = classNames.bind(require('./PostsContainer.module.scss'));

const PostsContainer = () => {
    const [searchFilter, setSearchFilter] = useState('');
    const activeCommunityId = useReactiveVar(activeCommunityIdVar);
    const activeRoomId = useReactiveVar(activeRoomIdVar);
    const {
        appState: { page },
        appDispatch
    } = useAppState();

    const { loading, data, error, fetchMore } = useQuery(FEED_QUERY, {
        variables: getFeedQueryVariables(activeCommunityId)
    });

    // const fetchFeed = () => {
    //     executeFeed({
    //         variables: {
    //             filter: searchFilter,
    //             communityId: activeCommunityId,
    //             ...(activeRoomId && { roomId: activeRoomId })
    //         }
    //     });
    // };

    // Fetch on initial load
    // useEffect(() => {
    //     fetchFeed();
    // }, []);

    useEffect(() => {
        if (data) {
            console.log(
                'New Data:',
                data.feed.edges.map((e) => e.cursor.slice(e.cursor.length - 3)),
                '\n\n'
            );
        }
    }, [data]);

    return (
        <div className={cx('filterAndPosts')}>
            <div className={cx('filterContainer')}>
                <Search
                    searchFilter={searchFilter}
                    setSearchFilter={setSearchFilter}
                    // fetchFeed={fetchFeed}
                />
            </div>
            <div className={cx('postsContainer')}>
                <PostPreviews
                    loading={loading}
                    data={data}
                    activeCommunityId={activeCommunityId}
                    fetchMore={fetchMore}
                />
            </div>
        </div>
    );
};

const PostPreviews = ({ loading, data, activeCommunityId, fetchMore }) => {
    const posts = data?.feed?.edges;
    if (loading) {
        return <div className={cx('noPosts')}>Loading...</div>;
    }
    if (!posts || posts?.length === 0) {
        return <div className={cx('noPosts')}>No posts found.</div>;
    }
    return posts.map((post, i) => {
        return (
            <React.Fragment key={post.node.id}>
                {i === data.feed.edges.length - 3 &&
                    data.feed.pageInfo.hasNextPage && (
                        <Waypoint
                            onEnter={() => {
                                console.log(
                                    `Hit waypoint ${i}, trying to fetch more`
                                );
                                fetchMore({
                                    variables: getFeedQueryVariables(
                                        activeCommunityId,
                                        data.feed.edges[
                                            data.feed.edges.length - 1
                                        ].cursor
                                    )
                                });
                            }}
                        />
                    )}
                <PostPreview post={post.node} />
            </React.Fragment>
        );
    });
};

export default PostsContainer;
