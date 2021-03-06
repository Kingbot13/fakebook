import React, { useEffect, useState } from "react";
import {
  useGetUsersQuery,
  useRemoveCommentMutation,
} from "../api/apiSlice";
import { UserPhoto } from "../users/UserPhoto";
import Proptypes from "prop-types";
import { formatDistanceToNow } from "date-fns";
import styles from "../../styles/Comment.module.css";
import { CommentOptionsCard } from "./CommentOptionsCard";
import { StyledReactions } from "../../components/ReactionsContainer";
import { useAddCommentReactionMutation, useRemoveCommentReactionMutation } from "../api/apiSlice";


const Comment = ({
  userId,
  content,
  id,
  date,
  showCard,
  position,
  toggleCard,
  toggleEdit,
  reactions
}) => {
  // get the name of who posted comment
  const { data: users } = useGetUsersQuery();
  let foundUser;
  if (users) {
    foundUser = users.find((user) => user.id === userId);
  }

  const formattedDate = formatDistanceToNow(new Date(date));

  const [removeComment] = useRemoveCommentMutation();
  const [addReaction] = useAddCommentReactionMutation();
  const [removeReaction] = useRemoveCommentReactionMutation();

  const deleteComment = async () => {
    try {
      await removeComment({ commentId: id }).unwrap();
    } catch (err) {
      console.error("could not delete comment at Comment.js: ", err);
    }
  };
  const toggleReaction = async () => {
    try {
      const reactionName = document.querySelector(
        `div[name='comment-reaction-name'][data-id='${id}']`
      );
      if (!reactions || !reactions.find((item) => item.id === userId)) {
        await addReaction({ commentId: id, reaction: "like", userId }).unwrap();
        reactionName.classList.add("blue-filter");
      } else if (reactions.find((item) => item.id === userId)) {
        await removeReaction({ commentId: id, userId }).unwrap();
        reactionName.classList.remove("blue-filter");
      } else {
        throw new Error("could not update reaction");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      className={styles.mainContainer}
      name="main-comment-container"
      data-id={id}
    >
      {showCard && (
        <CommentOptionsCard deleteComment={deleteComment} toggleEdit={toggleEdit} position={position} />
      )}
      <div className={styles.profileContainer}>
        <UserPhoto />
      </div>
      <div className={styles.secondaryContainer}>
        <div className={styles.commentCard}>
          <div>
            <div>
              <div className={styles.userName}>
                {users && foundUser.data.name}
              </div>
              <p className={styles.contentContainer}>{content}</p>
            </div>
          </div>
          {reactions && <StyledReactions reactions={reactions} />}
        </div>
        <div
          role="button"
          className={styles.optionsBtn}
          onClick={() => toggleCard(id)}
          name="comment-options-btn"
          data-id={id}
        >
          <div className={styles.iconContainer}>
            <i></i>
          </div>
        </div>
        <div className={styles.likeReplyContainer}>
          <div name="comment-reaction-name" className={styles.actions} onClick={toggleReaction} role="button" data-id={id}>
            Like
          </div>
          <div className={styles.actions} role="button">
            Reply
          </div>
          <div className={styles.date}>{formattedDate}</div>
        </div>
        <div></div>
      </div>
    </div>
  );
};

Comment.propTypes = {
  userId: Proptypes.string,
  content: Proptypes.string,
  id: Proptypes.string,
  date: Proptypes.string,
  showCard: Proptypes.bool,
  position: Proptypes.object,
  toggleCard: Proptypes.func,
};

export { Comment };
