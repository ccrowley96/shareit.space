import React, { useEffect, useRef, useState } from 'react';
import { DELETE_POST, DELETE_REPLY, EDIT_REPLY } from '../../queries/post';
import Modal from '../Modal/Modal';
import { useAppState } from '../../hooks/provideAppState';
import { useAuth } from '../../hooks/auth';
import { actionTypes, modalTypes } from '../../constants/constants';
import { AiOutlineStar, AiOutlineDelete } from 'react-icons/ai';
import { FiEdit2 } from 'react-icons/fi';
import { disableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';

import classNames from 'classnames/bind';
import { useMutation } from '@apollo/client';
import {
    formatDateTimeString,
    formatShortDateString
} from '../../services/utils';
import Reply from '../Reply/Reply';
const cx = classNames.bind(require('./PostDetails.module.scss'));

const PostDetails = ({ post }) => {
    const { appDispatch } = useAppState();
    const auth = useAuth();
    const [isConfirmOpen, setIsConfirmOpen] = useState({
        postDelete: false,
        commentDelete: false,
        data: null
    });
    const [editReplyData, setEditReplyData] = useState(null);

    const setConfirmClosedFromModal = (_) => {
        setIsConfirmOpen({
            postDelete: false,
            commentDelete: false,
            data: null
        });
    };

    const targetRef = useRef();

    // Prevent scroll while open
    useEffect(() => {
        if (targetRef.current) {
            disableBodyScroll(targetRef.current, { reserveScrollBarGap: true });
        }
        return () => clearAllBodyScrollLocks();
    }, []);

    const [deletePost] = useMutation(DELETE_POST, {
        update(cache) {
            cache.modify({
                fields: {
                    feed(currentFeed) {
                        return {
                            ...currentFeed,
                            edges: currentFeed.edges.filter((edgeRef) => {
                                return edgeRef.cursor !== post.date;
                            })
                        };
                    }
                }
            });

            // Close modal
            appDispatch({
                type: actionTypes.SET_ACTIVE_MODAL,
                payload: null,
                modalData: null
            });
        }
    });

    const [editReply] = useMutation(EDIT_REPLY);
    const [deleteReply] = useMutation(DELETE_REPLY);

    const confirmDelete = () => {
        deletePost({
            variables: { postId: post.id }
        });
    };

    const confirmDeleteReply = (commentId) => {
        deleteReply({
            variables: { postId: post.id, commentId }
        });
    };

    const onConfirmed = () => {
        if (isConfirmOpen.postDelete) {
            confirmDelete();
        } else if (isConfirmOpen.commentDelete) {
            confirmDeleteReply(isConfirmOpen.data);
        }
    };

    return (
        <Modal
            isConfirmOpen={
                isConfirmOpen.postDelete || isConfirmOpen.commentDelete
            }
            setIsConfirmOpen={setConfirmClosedFromModal}
            onConfirmed={onConfirmed}
            title={post.title}
        >
            <div className={cx('postDetailsWrapper')}>
                <div className={cx('postDetails')} ref={targetRef}>
                    <div className={cx('_modalSection')}>
                        <div className={cx('meta')}>
                            <div className={cx('author')}>
                                {post.author.given_name}
                            </div>
                            <div className={cx('date')}>
                                - {formatDateTimeString(post.date)}
                            </div>
                        </div>
                    </div>
                    {post.link && (
                        <div className={cx('_modalSection')}>
                            <a
                                href={post.link}
                                target="_blank"
                                rel="noreferrer"
                                className={cx('link')}
                            >
                                {post.link}
                            </a>
                        </div>
                    )}
                    {post.rating && (
                        <div className={cx('_modalSection')}>
                            <div className={cx('ratingWrapper')}>
                                {Array.from(Array(Math.floor(post.rating))).map(
                                    (_, idx) => {
                                        return <AiOutlineStar key={idx} />;
                                    }
                                )}
                            </div>
                        </div>
                    )}
                    {post.tags && (
                        <div className={cx('_modalSection')}>
                            <div className={cx('tagWrapper')}>
                                {post.tags.map((tag, idx) => {
                                    return (
                                        <div className={cx('tag')} key={idx}>
                                            <div className={cx('tagText')}>
                                                {tag}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    {post.body && (
                        <div className={cx('_modalSection')}>
                            <div className={cx('body')}>{post.body}</div>
                        </div>
                    )}
                    {post.comments && post.comments.length > 0 && (
                        <div className={cx('_modalSection')}>
                            <div className={cx('commentHeader')}>Replies: </div>
                            <div className={cx('commentsWrapper')}>
                                {post.comments.map((comment, idx) => {
                                    return (
                                        <div
                                            key={idx}
                                            className={cx('comment')}
                                        >
                                            <div className={cx('commentMeta')}>
                                                <div
                                                    className={cx(
                                                        'commentAuthor'
                                                    )}
                                                >
                                                    {comment.author.given_name}
                                                </div>
                                                <div
                                                    className={cx(
                                                        'commentDate'
                                                    )}
                                                >
                                                    {formatDateTimeString(
                                                        comment.date
                                                    )}
                                                </div>
                                                {comment.author.id ===
                                                    auth.session.user._id && (
                                                    <div
                                                        className={cx(
                                                            'commentAdmin'
                                                        )}
                                                    >
                                                        <div
                                                            className={cx(
                                                                'adminBtn'
                                                            )}
                                                            onClick={() => {
                                                                setEditReplyData(
                                                                    comment
                                                                );
                                                            }}
                                                        >
                                                            edit
                                                        </div>
                                                        <div
                                                            className={cx(
                                                                'adminBtn'
                                                            )}
                                                            onClick={() => {
                                                                setIsConfirmOpen(
                                                                    {
                                                                        commentDelete: true,
                                                                        postDelete: false,
                                                                        data:
                                                                            comment.id
                                                                    }
                                                                );
                                                            }}
                                                        >
                                                            delete
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className={cx('commentBody')}>
                                                {comment.body}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
                <div className={cx('footer')}>
                    {post.author.id === auth.session.user._id && (
                        <div className={cx('postControls')}>
                            <FiEdit2
                                className={cx('control', 'edit')}
                                onClick={() => {
                                    appDispatch({
                                        type: actionTypes.SET_ACTIVE_MODAL,
                                        payload: modalTypes.NEW_POST,
                                        modalData: post
                                    });
                                }}
                            />
                            <AiOutlineDelete
                                className={cx('control', 'delete')}
                                onClick={() => {
                                    setIsConfirmOpen({
                                        commentDelete: false,
                                        postDelete: true,
                                        data: null
                                    });
                                }}
                            />
                        </div>
                    )}
                    <div className={cx('replyWrapper')}>
                        <Reply
                            postId={post.id}
                            editReplyData={editReplyData}
                            clearData={() => setEditReplyData(null)}
                        />
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default PostDetails;
