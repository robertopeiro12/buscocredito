"use client"
import { title } from "@/components/primitives";
import {Input} from "@nextui-org/react";
import {Button, ButtonGroup} from "@nextui-org/react";
import { auth } from '../firebase';
import {signInWithEmailAndPassword } from "firebase/auth";
import {signOut } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect } from 'react';

export default function PricingPage() {

    const [email, setEmail] = React.useState("");
    const [password, setPass] = React.useState("");
    const [error, setError] = React.useState(false);
    const [user, setUser] = React.useState("");
    
    useEffect(()=>{
        onAuthStateChanged(auth, (user) => {
            if (user) {
              // User is signed in, see docs for a list of available properties
              // https://firebase.google.com/docs/reference/js/firebase.User
              setUser(user.uid);
              // ...
              console.log("uid", user.uid)
            } else {
              // User is signed out
              // ...
              console.log("user is logged out")
            }
          });
         
    }, [])

    function signIn() {
        signInWithEmailAndPassword(auth,email, password)
        .then((userCredential) => {
          // Signed in 
          setUser(userCredential.user.uid);
          console.log("user", user)
          // ...
        })
        .catch((error_console) => {
          var errorCode = error_console.code;
          var errorMessage = error_console.message;
            setError(true);
          console.log("error", errorCode, errorMessage)

        });
       
    }      

    function sign_out() {
        signOut(auth).then(() => {
            console.log("user is logged out")
            setUser("");
          }).catch((error) => {
            console.log("error", error)
          });
      
    }

	return (
		<div>
			<h1 className={title()}>TEST PAGE</h1>
        
    <div className="flex w-full flex-col md:flex-nowrap gap-10 mt-10 ">
      <Input type="email" label="Email" onValueChange={setEmail} />
      <Input type="password" label="Password" onValueChange={setPass}/>
      { error? <p className="text-red-500 ">Correo o contrasena incorrecta</p>:null}
      <Button color="primary" onClick={signIn}>
      Sign In
    </Button>
    {user?<Button color="primary" onClick={sign_out}>
      Logout
    </Button>:null}
   
      
    </div>
		</div>
	);
}
