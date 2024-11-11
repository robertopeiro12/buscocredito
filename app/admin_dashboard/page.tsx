"use client"

import { useState } from "react"
import { useEffect } from "react"
import { SearchIcon } from '@/components/SearchIcon'
import { AddIcon } from '@/components/AddIcon'
import { LogoutIcon } from '@/components/LogoutIcon'
import { ViewIcon } from '@/components/ViewIcon'
import { EditIcon } from '@/components/EditIcon'
import {DeleteIcon} from "@/components/DeleteIcon";
import { useRouter } from 'next/navigation';
import { auth } from '../firebase'
import { createUserWithEmailAndPassword, onAuthStateChanged, signOut} from "firebase/auth"
import { doc, getFirestore, setDoc, Timestamp, collection, query, where, getDocs} from "firebase/firestore"
import { TemplateContext } from "next/dist/shared/lib/app-router-context.shared-runtime"

type Subaccount = {
  id: number
  name: string
  email: string
  password: string
  userId: string
}

export default function AdminDashboard() {
  const [subaccounts, setSubaccounts] = useState<Subaccount[]>([])
  const [user, setUser] = useState("")
  const [newSubaccount, setNewSubaccount] = useState<Omit<Subaccount, "id">>({
    name: "",
    email: "",
    password: "",
    userId:""
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter();
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user.uid)
        console.log("uid", user.uid)
        fetchUsers(user.uid)
        

      } else {
        console.log("user is logged out")
      }
    })
  }, [])
  const fetchUsers = async (userId) => {
    const db = getFirestore();
    const solicitudesRef = collection(db, "cuentas");
    console.log("useridtest", userId)
    const q = query(solicitudesRef, where("Empresa_id", "==", userId));
    const querySnapshot = await getDocs(q);
    console.log("querySnapshot", querySnapshot)
    const newSubaccounts = [];
    querySnapshot.forEach((doc) => {
      const temp = doc.data();
      const newSubaccountData = { name: temp['Nombre'], email: temp['email'], password: "", userId: String(doc.id) };
      newSubaccounts.push({ ...newSubaccountData, id: newSubaccounts.length + 1 });
      setSubaccounts(newSubaccounts);
    });
  };

  function UserAdd() {
    createUserWithEmailAndPassword(auth, newSubaccount.email, newSubaccount.password)
      .then(async (userCredential) => {
        const userId = userCredential.user.uid
        console.log("user", userId)
        const db = getFirestore()
        const cityRef = doc(db, "cuentas", userId)
        console.log(cityRef)
        await setDoc(cityRef, {
          Nombre: newSubaccount.name,
          Empresa: "",
          Empresa_id: user,
          type: "b_sale",
          email: newSubaccount.email
        })
        setNewSubaccount({ name: newSubaccount.name, email:newSubaccount.email ,password: "", userId:userCredential.user.uid})
        console.log("user created")
        sign_out()
      })
      .catch((error_console) => {
        var errorCode = error_console.code
        var errorMessage = error_console.message
        console.log("error", errorCode, errorMessage)
      })
  }

  const handleCreateSubaccount = () => {

    UserAdd();

    setSubaccounts([
      ...subaccounts,
      { ...newSubaccount, id: subaccounts.length + 1 },
    ])
    
    setNewSubaccount({ name: "", email: "" ,password: "", userId:""})
    setIsModalOpen(false)
  }

  const handleLogout = () => {
    // Implement logout functionality here
    console.log("Logging out...")
  }
  function sign_out() {
    signOut(auth).then(() => {
        console.log("user is logged out")
        router.push('/login')
      }).catch((error) => {
        console.log("error", error)
      });
  
}
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="font-bold text-xl text-gray-800">Admin Dashboard</span>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <img
                  className="h-8 w-8 rounded-full"
                  src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
                  alt="Admin user"
                />
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">Admin User</div>
                <div className="text-sm font-medium text-gray-500">admin@example.com</div>
              </div>
              <button
                onClick={sign_out}
                className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <LogoutIcon className="h-5 w-5" />
                <span className="sr-only">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-semibold text-gray-900">Manage Subaccounts</h1>
          
          {/* Search and Create */}
          <div className="mt-4 flex justify-between items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Search subaccounts..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <AddIcon className="h-5 w-5 mr-2" />
              Create Subaccount
            </button>
          </div>

          {/* Subaccounts Table */}
          <div className="mt-8 flex flex-col">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {subaccounts.map((subaccount) => (
                        <tr key={subaccount.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {subaccount.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {subaccount.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {subaccount.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-indigo-600 hover:text-indigo-900 mr-2">
                              <ViewIcon className="h-5 w-5" />
                              <span className="sr-only">View</span>
                            </button>
                            <button className="text-indigo-600 hover:text-indigo-900 mr-2">
                              <EditIcon className="h-5 w-5" />
                              <span className="sr-only">Edit</span>
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <DeleteIcon className="h-5 w-5" />
                              <span className="sr-only">Delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Create Subaccount
                    </h3>
                    <div className="mt-2">
                      <input
                        type="text"
                        placeholder="Name"
                        value={newSubaccount.name}
                        onChange={(e) => setNewSubaccount({ ...newSubaccount, name: e.target.value })}
                        className="mt-2 p-2 block w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        value={newSubaccount.email}
                        onChange={(e) => setNewSubaccount({ ...newSubaccount, email: e.target.value })}
                        className="mt-2 p-2 block w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <input
                        type="password"
                        placeholder="Password"
                        value={newSubaccount.password}
                        onChange={(e) => setNewSubaccount({ ...newSubaccount, password: e.target.value })}
                        className="mt-2 p-2 block w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleCreateSubaccount}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}