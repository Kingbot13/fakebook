import React from "react";
import { SignInForm } from "./SignInForm";
import styles from '../styles/SignInPage.module.css';

export const SignInPage = () => {
  return (
    <main className={styles.main}>
      <div>
        <h1 className={styles.h1}>fakebook</h1>
        <h2 className={styles.h2}>Connect with friends and the world around you on Fakebook.</h2>
      </div>
      <SignInForm />
    </main>
  );
};
