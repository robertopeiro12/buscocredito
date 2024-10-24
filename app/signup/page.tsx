"use client"

import React, { useEffect } from 'react'
import { Input, Button, Card, CardBody, CardHeader } from "@nextui-org/react"
import { auth } from '../firebase'
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, onAuthStateChanged, signOut} from "firebase/auth"
import { doc, getFirestore, setDoc, Timestamp } from "firebase/firestore"
import dayjs from 'dayjs'

export default function LoginPage() {
  const [name, setName] = React.useState("")
  const [lastName, setLastName] = React.useState("")
  const [secondLastName, setSecondLastName] = React.useState("")
  const [rfc, setRfc] = React.useState("")
  const [birthday, setBirthday] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [address, setAddress] = React.useState({
    street: "",
    number: "",
    colony: "",
    city: "",
    state: "",
    country: "",
    zipCode: ""
  })
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState(false)
  const [user, setUser] = React.useState("")
  const router = useRouter(); 
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user.uid)
        console.log("uid", user.uid)
      } else {
        console.log("user is logged out")
      }
    })
  }, [])

  function signUp() {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        setUser(userCredential.user.uid.toString())
        console.log("user", user)
        const db = getFirestore()
        const cityRef = doc(db, "cuentas", userCredential.user.uid.toString())
        console.log(cityRef)
        console.log("birthday", Timestamp.fromDate(new Date(birthday)))
        setDoc(cityRef, {
          name: name,
          last_name: lastName,
          second_last_name: secondLastName,
          rfc: rfc,
          birthday: Timestamp.fromDate(new Date(birthday)),
          phone: phone,
          address: address,
          email: email,
          type: "user", 
        })
        console.log("user created")
        sign_out()
        router.push('/login')

      })
      .catch((error_console) => {
        var errorCode = error_console.code
        var errorMessage = error_console.message
        setError(true)
        console.log("error", errorCode, errorMessage)
      })
  }

  function sign_out() {
    signOut(auth).then(() => {
        console.log("user is logged out")
        setUser("");
      }).catch((error) => {
        console.log("error", error)
      });
  
}
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setAddress(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="flex justify-center">
          <h1 className="text-2xl font-bold">Sign Up</h1>
        </CardHeader>
        <CardBody>
          <form onSubmit={(e) => { e.preventDefault(); signUp(); }} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
              <Input label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              <Input label="Second Last Name" value={secondLastName} onChange={(e) => setSecondLastName(e.target.value)} />
              <Input label="RFC" value={rfc} onChange={(e) => setRfc(e.target.value)} />
              <Input label="Phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <Input
                label="Fecha de Nacimiento"
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Street" name="street" onChange={handleAddressChange} />
                <Input label="Number" name="number" onChange={handleAddressChange} />
                <Input label="Colony" name="colony" onChange={handleAddressChange} />
                <Input label="City" name="city" onChange={handleAddressChange} />
                <Input label="State" name="state" onChange={handleAddressChange} />
                <Input label="Country" name="country" onChange={handleAddressChange} />
                <Input label="Zip Code" name="zipCode" onChange={handleAddressChange} />
              </div>
            </div>
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            {error && <p className="text-red-500">Incorrect email or password</p>}
            <Button color="primary" type="submit" className="w-full">
              Sign Up
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}