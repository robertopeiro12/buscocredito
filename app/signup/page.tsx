"use client"
import {Input} from "@nextui-org/react";
import {Button, ButtonGroup} from "@nextui-org/react";
import { auth } from '../firebase';
import {signInWithEmailAndPassword, signOut, onAuthStateChanged, setPersistence, createUserWithEmailAndPassword} from "firebase/auth";
import React, { useEffect } from 'react';
import { doc, getFirestore, setDoc,Timestamp } from "firebase/firestore"; 
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
// Add a new document in collection "cities"


export default function LoginPage() {
    const [name, setName] = React.useState("");
    const [last_name, setLastName] = React.useState("");
    const [second_last_name, setSecondLastName] = React.useState("");
    const [rfc, setRfc] = React.useState("");
    const [birthday, setBirthday] = React.useState<Dayjs | null>(dayjs('2022-04-17'));
    const [phone, setPhone] = React.useState("");
    const [address, setAddress] = React.useState<{street:string; number:string; colony:string; city:string; state:string; country:string; zip_code:string}>({
        street: "",
        number: "",
        colony: "",
        city: "",
        state: "",
        country: "",
        zip_code: ""
    });
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

    function test(){
     // Add a new document in collection "cities"
      const db = getFirestore();
      const cityRef = doc(db, "cuentas",user);
      console.log(cityRef)
      setDoc(cityRef, {
       name: name,
        last_name: last_name,
        second_last_name: second_last_name,
        rfc: rfc,
        birthday: birthday,
        phone: phone,
        address: address,
        email: email
      });
    }
  

    function signUp() {
  createUserWithEmailAndPassword(auth,email, password)
      .then((userCredential) => {
        // Signed in 
        setUser(userCredential.user.uid.toString());
        console.log("user", user);
        const db = getFirestore();
      const cityRef = doc(db, "cuentas",user);
      console.log(cityRef);
      console.log("birthday", Timestamp.fromDate(birthday!.toDate()));
      setDoc(cityRef, {
       name: name,
        last_name: last_name,
        second_last_name: second_last_name,
        rfc: rfc,
        birthday: Timestamp.fromDate(birthday!.toDate()),
        phone: phone,
        address: address,
        email: email
      });
        // ...
      })
      .catch((error_console) => {
        var errorCode = error_console.code;
        var errorMessage = error_console.message;
          setError(true);
        console.log("error", errorCode, errorMessage)

      });
     
  }    


    const handleChange = (_data:any, type:any) => {
      let updatedValue = {};
      updatedValue = {
        [type]: _data
      };
      setAddress(adress => ({
           ...adress,
           ...updatedValue
         }));
       }
	return (
		<div>
			<h1>Login</h1>
        
    <div className="flex w-full flex-col md:flex-nowrap gap-10 mt-10 ">
      <Input type="text" label="Name" onValueChange={setName} />
      <Input type="text" label="Last Name" onValueChange={setLastName} />
      <Input type="text" label="Second Last Name" onValueChange={setSecondLastName} />
      <Input type="text" label="Rfc" onValueChange={setRfc} />
      <Input type="text" label="Phone" onValueChange={setPhone} />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker label="Fecha de Nacimiento" onChange={(newValue: Dayjs | null) => setBirthday(newValue)} />
      </LocalizationProvider>
      <Input type="text" label="Street" onValueChange={(e) => handleChange(e,"street")} />
      <Input type="text" label="Number" onValueChange={(e) => handleChange(e,"number")} />
      <Input type="text" label="Colony" onValueChange={(e) => handleChange(e,"colony")} />
      <Input type="email" label="Email" onValueChange={setEmail} />
      <Input type="password" label="Password" onValueChange={setPass}/>
      <br></br>
      <label>Output:</label>
      <pre>{JSON.stringify(address, null, 2)}</pre>
      { error? <p className="text-red-500 ">Correo o contrasena incorrecta</p>:null}
      <Button color="primary" onClick={signUp}>
      Sign In
    </Button>
    
   
      
    </div>
		</div>
	);
}
