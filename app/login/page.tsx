"use client"
import {Input} from "@nextui-org/react";
import {Button, ButtonGroup} from "@nextui-org/react";
import { auth } from '../firebase';
import {signInWithEmailAndPassword, signOut, onAuthStateChanged, setPersistence} from "firebase/auth";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, getFirestore } from "firebase/firestore";

export default function LoginPage() {

    const [email, setEmail] = React.useState("");
    const [password, setPass] = React.useState("");
    const [error, setError] = React.useState(false);
    const [user, setUser] = React.useState("");
    const router = useRouter();
    // function persistence(){

    //     setPersistence(auth, auth.Persistence.LOCAL)
    //         .then(() => {
    //             // Existing and future Auth states are now persisted in the current
    //             // session only. Closing the window would clear any existing state even
    //             // if a user forgets to sign out.
    //             // ...
    //             console.log("persistence")
    //         })
    //         .catch((error) => {
    //             // An error happened.
    //             console.log("error", error)
    //         });
    
    // }

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
        .then(async (userCredential) => {
          // Signed in 
          setUser(userCredential.user.uid);
          const db = getFirestore();
          const userDocRef = doc(db, "cuentas", userCredential.user.uid);
          
          // Fetch the document data
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
              const userData = userDocSnap.data();
              const accountType = userData.type;
              console.log("account_type", accountType);
              if(accountType === "b_admin"){
                router.push('/admin_dashboard')
              }
              else if(accountType === "user"){
                router.push('/user_dashboard')
              }
              else if(accountType === "b_sale"){
                router.push('/lender')
              }
          } else {
              console.log("No such document!");
          }
          // router.push('/user_dashboard')
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
			<h1>Login</h1>
         
    <div className="flex w-full flex-col md:flex-nowrap gap-10 mt-10 ">
      <Input type="email" label="Email" onValueChange={setEmail} />
      <Input type="password" label="Password" onValueChange={setPass}/>
      { error? <p className="text-red-500 ">Correo o contrasena incorrecta</p>:null}
      <Button color="primary" onClick={signIn}>
      Sign In
    </Button>
    {/* {user?<Button color="primary" onClick={sign_out}>
      Logout
    </Button>:null} */}
   
      
    </div>
		</div>
	);
}
