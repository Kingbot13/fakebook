import { formatDistanceToNow } from "date-fns";
import React, { useEffect, useState } from "react";
import { StyledImg } from "../../components/Image";
import styles from "../../styles/Post.module.css";
import {
  useAddCommentMutation,
  useAddReactionMutation,
  useDeletePostMutation,
  useEditPostMutation,
  useRemoveReactionMutation,
  useGetCommentsQuery,
  useEditCommentMutation
} from "../api/apiSlice";
import Proptypes from "prop-types";
import { auth } from "../../firebase";
import { CommentInput } from "./CommentInput";
import { CommentList } from "./CommentList";
import { PostOptionsCard } from "./PostOptionsCard";
import { PostForm } from "./PostForm";

const Post = ({ name, content, photo, date, id, reactions, user }) => {
  const { data: comments } = useGetCommentsQuery();
  
  let filteredComments;
  if (comments) {
    filteredComments = comments.filter((item) => item.data.postId === id);
  }
  const formattedDate = formatDistanceToNow(new Date(date));
  const [addReaction] = useAddReactionMutation();
  const [removeReaction] = useRemoveReactionMutation();
  const [addComment] = useAddCommentMutation();
  const [editComment] = useEditCommentMutation();
  const [editPost] = useEditPostMutation();
  const [deletePost] = useDeletePostMutation();
  const [value, setValue] = useState("");
  const [contentData, setContentData] = useState(content);
  const [showOptions, setShowOptions] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [cardPosition, setCardPosition] = useState({ x: 0, y: 0 });
  // set commentId to use when editing comments
  const [commentId, setCommentId] = useState('');
  const userId = auth.currentUser.uid;
  // toggle comment options card
  const toggleCard = (id) => {
    // set commentId as soon as commentOptionsCard is toggled
    setCommentId(id);
    const optionsBtn = document.querySelector(
      `div[name='comment-options-btn'][data-id='${id}']`
    );
    // main comment container
    const mainContainer = document.querySelector(
      `div[name='main-comment-container'][data-id=${id}]`
    );
    const mainRect = mainContainer.getBoundingClientRect();

    const rect = optionsBtn.getBoundingClientRect();
    setCardPosition({
      x: rect.left - mainRect.left,
      y: rect.top - mainRect.top,
    });
    setShowCard(!showCard ? true : false);
  };

  const toggleInput = () => {
    setShowInput(!showInput ? true: false);
    setShowCard(false);
  }

  const toggleReaction = async (e) => {
    try {
      const thumbsUp = document.querySelector(
        `i[name='like-icon'][data-id='${id}']`
      );
      const reactionName = document.querySelector(
        `div[name='reaction-name'][data-id='${id}']`
      );
      if (!reactions || !reactions.find((item) => item.id === userId)) {
        await addReaction({ id, reaction: "like", userId }).unwrap();
        thumbsUp.classList.remove("like-btn");
        thumbsUp.classList.add("blue-filter", "solid-like-btn");
        reactionName.classList.add("blue-filter");
      } else if (reactions.find((item) => item.id === userId)) {
        await removeReaction({ id, userId, reaction: "like" }).unwrap();
        thumbsUp.classList.remove("blue-filter", "solid-like-btn");
        thumbsUp.classList.add("like-btn");
        reactionName.classList.remove("blue-filter");
      } else {
        throw new Error("could not update reaction");
      }
    } catch (err) {
      console.error(err);
    }
  };
  const handleChange = (e) => {
    setValue(e.target.value);
  };
  const keyEvent = async (e, action, content) => {
    try {
      if (e.code === "Enter") {
        if (action === 'add') {
          await addComment({
            userId,
            content: value,
            postId: id,
            date: Date(),
          }).unwrap();
        } else if (action === 'edit') {
          await editComment({id: commentId, content}).unwrap();
        } else {
          throw new Error('action in keyEvent function not set');
        }
        e.target.removeEventListener("keydown", keyEvent);
        setShowCard(false);
        setShowInput(false);
        setValue('');
      }

    } catch(err) {
      console.error('issue with keyEvent function: ', err);
    }
  };

  const handleCommentEdit = (e, content) => {
    e.target.addEventListener('keydown', keyEvent(e, 'edit', content));
  }

  const handleSubmit = (e) => {
      e.target.addEventListener('keydown', keyEvent(e, 'add'));
  };
  const toggleOptionsCard = () => {
    setShowOptions(!showOptions ? true : false);
  };
  const togglePostForm = () => {
    setShowForm(!showForm ? true : false);
    setShowOptions(false);
  };
  const handleEditPostSubmit = async () => {
    try {
      await editPost({ postId: id, content: contentData }).unwrap();
      togglePostForm();
    } catch (err) {
      console.error("problem submitting post edit: ", err);
    }
  };
  const handleContentChange = (e) => {
    setContentData(e.target.value);
  };

  const handleDeletePost = async () => {
    try {
      await deletePost({ postId: id }).unwrap();
    } catch (err) {
      console.error("problem handling post deletion: ", err);
    }
  };
  // if userId is contained in reactions array, render like button with blue filter and solid thumb image
  useEffect(() => {
    if (reactions && reactions.filter(item => item.id === userId)) {
      const thumbsUp = document.querySelector(
        `i[name='like-icon'][data-id='${id}']`
      );
      const reactionName = document.querySelector(
        `div[name='reaction-name'][data-id='${id}']`
      );
      thumbsUp.classList.remove("like-btn");
      thumbsUp.classList.add("blue-filter", "solid-like-btn");
      reactionName.classList.add("blue-filter");

    }
  },[]);

  return (
    <div className={styles.container}>
      {showOptions && (
        <PostOptionsCard
          toggleForm={togglePostForm}
          deletePost={handleDeletePost}
        />
      )}
      {showForm && (
        <PostForm
          title="Edit post"
          content={contentData}
          handleChange={handleContentChange}
          handleSubmit={handleEditPostSubmit}
          toggle={togglePostForm}
        />
      )}
      <div className={styles.user}>
        <div>
          <StyledImg src={photo} alt="" />
        </div>
        <div className={styles.nameContainer}>
          <strong>{name}</strong>
          <div className={styles.time}>{formattedDate}</div>
        </div>
        <div
          role="button"
          onClick={toggleOptionsCard}
          className={styles.options}
        >
          ...
        </div>
      </div>
      <p className={styles.content}>{content}</p>
      <div>
        <div
          role="presentation"
          name="reactions"
          className={styles.displayedReactions}
        >
          {(reactions && reactions.length) || 0}
        </div>
        <div className={styles.reactionContainer}>
          <div
            className={styles.secondaryContainer}
            onClick={toggleReaction}
            data-id={id}
            role="button"
            name="like-button"
          >
            <div className={styles.likeContainer}>
              <i name="like-icon" data-id={id} className="like-btn"></i>
            </div>
            <div
              name="reaction-name"
              data-id={id}
              className={styles.likeContainer}
            >
              Like
            </div>
          </div>
          <div className={styles.secondaryContainer}>
            <div className={styles.likeContainer}>
              <i className={styles.commentIcon}></i>
            </div>
            <div className={styles.likeContainer}>Comment</div>
          </div>
          <div className={styles.secondaryContainer}>Share</div>
        </div>
      </div>
      {comments && <CommentList commentId={commentId} toggleEdit={toggleInput} onFocus={handleCommentEdit} onChange={handleChange} value={value} comments={filteredComments} showCard={showCard} position={cardPosition} toggleCard={toggleCard} show={showInput} />}
      <CommentInput
        value={value}
        onChange={handleChange}
        onFocus={handleSubmit}
      />
    </div>
  );
};

Post.propTypes = {
  name: Proptypes.string,
  content: Proptypes.string,
  photo: Proptypes.string,
  date: Proptypes.string,
  id: Proptypes.string,
  reactions: Proptypes.array,
};

export { Post };
