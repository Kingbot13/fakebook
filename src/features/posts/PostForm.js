import React from "react";
import { UserPhoto } from "../users/UserPhoto";
import { auth } from "../../firebase";
import { SubmitBtn } from "../../components/Button";
import styles from "../../styles/PostForm.module.css";

export const PostForm = ({ toggle, content, handleSubmit, handleChange, title }) => {
  return (
    <form className={styles.form}>
      <div className={styles.headerContainer}>
        <h2>{title}</h2>
        <button type="button" onClick={toggle}>
          X
        </button>
      </div>
      <div className={styles.userContainer}>
        <div className={styles.userPhotoContainer}>
          <UserPhoto />
        </div>
        <div className={styles.username}>{auth.currentUser.displayName}</div>
      </div>
      <input
        type="text"
        placeholder="What's on your mind?"
        onChange={(e) => handleChange(e)}
        value={content}
      ></input>
      <div></div>
      <div className={styles.addToPostContainer}>
        <div>Add to your post</div>
        <div className={styles.iconsContainer}>icons</div>
      </div>
      <div className={styles.btnContainer}>
        <SubmitBtn
          name="post-submit"
          type="button"
          onClick={(e) => handleSubmit(e)}
        >
          Post
        </SubmitBtn>
      </div>
    </form>
  );
};
