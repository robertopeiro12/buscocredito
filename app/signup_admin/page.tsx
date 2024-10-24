'use client'

import { useState } from 'react'
import { Card, CardBody, CardHeader, Input, Button, Spacer } from "@nextui-org/react"
import { createUserWithEmailAndPassword, onAuthStateChanged, signOut} from "firebase/auth"
import { auth } from '../firebase'
import { useRouter } from 'next/navigation';
import { doc, getFirestore, setDoc, Timestamp } from "firebase/firestore"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function SignUpAdmin() {
  const [accessToken, setAccessToken] = useState('')
  const [isVerified, setIsVerified] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [user, setUser] = useState("")
  const router = useRouter(); 
  
  const verifyAccessToken = () => {
    // In a real application, you would verify the access token against your backend
    if (accessToken === 'valid_token') {
      setIsVerified(true)
      setError(false)
    } else {
      setError(true)
    }
  }

//   function signUp() {
//     console.log(email, password)
//     createUserWithEmailAndPassword(auth, email, password)
//       .then((userCredential) => {
//         setUser(userCredential.user.uid.toString())
//         console.log("user", user)
//         const db = getFirestore()
//         const cityRef = doc(db, "cuentas", userCredential.user.uid.toString())
//         console.log(cityRef)
//         setDoc(cityRef, {
//           Empresa: "",
//           type: "b_admin",
//           email: email
//         })
        
//         console.log("user created")
//         sign_out()
//         // router.push('/login')

//       })
//       .catch((error_console) => {
//         var errorCode = error_console.code
//         var errorMessage = error_console.message
//         setError(true)
//         console.log("error", errorCode, errorMessage)
//       })
//   }

function signUp() {
    console.log(email, password)
    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const userId = userCredential.user.uid
        console.log("user", userId)
        const db = getFirestore()
        const cityRef = doc(db, "cuentas", userId)
        console.log(cityRef)
        
        await setDoc(cityRef, {
          Empresa: "",
          type: "b_admin",
          email: email
        })
        
        console.log("user created")
        sign_out()  // Esto cerrará la sesión del usuario
        router.push('/login') // O bien, puedes redirigir a otra página antes de cerrar la sesión
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

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the email and password to your backend
    signUp()

    // Reset form
    setEmail('')
    setPassword('')
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-col items-start px-4 pt-4">
        <h4 className="text-2xl font-bold">Sign Up</h4>
        <p className="text-sm text-gray-500">
          {isVerified 
            ? "Create your account" 
            : "Enter your access token to proceed"}
        </p>
      </CardHeader>
      <CardBody className="px-4 py-4">
        {!isVerified ? (
          <div className="space-y-4">
            <Input
              label="Access Token"
              placeholder="Enter your access token"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              className="w-full"
            />
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
            <Button color="primary" onClick={verifyAccessToken} className="w-full">
              Verify Access Token
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSignUp} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full"
            />
            <Spacer y={2} />
            <Button color="primary" type="submit" className="w-full">
              Sign Up
            </Button>
          </form>
        )}
      </CardBody>
    </Card>
  )
}