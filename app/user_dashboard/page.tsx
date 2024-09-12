'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation';
import { auth } from '../firebase'
import { onAuthStateChanged ,signOut} from "firebase/auth"
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Avatar, Card, CardBody, CardFooter, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Textarea } from "@nextui-org/react"
import { Menu, CreditCard, HelpCircle, LogOut, User, PlusCircle, Router } from 'lucide-react'
import CreditForm from "@/components/CreditForm";
import { AnimatePresence, motion } from "framer-motion";
import { doc, getFirestore, setDoc,getDoc, Timestamp, updateDoc, arrayUnion, addDoc, collection, query, where, getDocs, deleteDoc} from "firebase/firestore"
export default function DashboardPage() {
  const [user, setUser] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("loans")

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user.uid)
        console.log("uid", user.uid)
        fetchSolicitudes(user.uid);
      } else {
        console.log("user is logged out")
      }
    })

    return () => unsubscribe()
  }, [])


  const [showForm, setShowForm] = useState(false);
  const [showForm1, setShowForm1] = useState(false);
  const [solicitudes, setSolicitudes] = useState([]);
  const router = useRouter();

// query viejo
  // const fetchSolicitudes = async (userId) => {
  //   const db = getFirestore();
  //   const cityRef = doc(db, "cuentas", userId);
  //   const cityDoc = await getDoc(cityRef);

  //   if (cityDoc.exists()) {
  //     const data = cityDoc.data();
  //     if (data.solicitudes) {
  //       setSolicitudes(data.solicitudes);
  //     }
  //   } else {
  //     console.log("No such document!");
  //   }
  // };
  const fetchSolicitudes = async (userId) => {
    const db = getFirestore();
    const solicitudesRef = collection(db, "solicitudes");
    const q = query(solicitudesRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
  
    const fetchedSolicitudes = [];
    querySnapshot.forEach((doc) => {
      const temp = doc.data();
      temp['id']=doc.id;
      fetchedSolicitudes.push(temp);
    });
  
    setSolicitudes(fetchedSolicitudes);
    resetForm1();
  };

 const deleteSolicitud = async (solicitud) => {
  console.log(solicitud);
    const db = getFirestore();
    const cityRef = doc(db, "solicitudes", solicitud);
    await deleteDoc(cityRef);
    fetchSolicitudes(user);
    resetForm1();
  }

  const addSolicitud = (solicitud) => {
    solicitud['userId'] = user;
    console.log(solicitud);
    const db = getFirestore()
    console.log(user);
    const cityRef = collection(db, "solicitudes")
    addDoc(cityRef, solicitud)
    fetchSolicitudes(user);
    setShowForm(false);
  };

  const resetForm = () => {
    setShowForm(false);
  };
  const resetForm1 = () => {
    setShowForm1(false);
  };

  function sign_out() {
    signOut(auth).then(() => {
        console.log("user is logged out")
        setUser("");
        router.push('/login')
      }).catch((error) => {
        console.log("error", error)
      });
  
}
  return (
    <div className="min-h-screen bg-background">
      <Navbar isBordered>
        <NavbarBrand>
          <img src="/placeholder.svg?height=32&width=32" alt="BuscoCredito Logo" className="h-8 w-8 mr-2" />
          <p className="font-bold text-inherit">BuscoCredito</p>
        </NavbarBrand>
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarItem>
            <Link color="foreground" href="#">
              Acerca de
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link color="foreground" href="#">
              ¿Eres prestamista?
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link color="foreground" href="#">
              ¿Necesitas un préstamo?
            </Link>
          </NavbarItem>
        </NavbarContent>
        <NavbarContent justify="end">
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                isBordered
                as="button"
                className="transition-transform"
                color="secondary"
                name="Jane Doe"
                size="sm"
                src="https://i.pravatar.cc/150?u=a04258114e29026702d"
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile Actions" variant="flat">
              <DropdownItem key="profile" className="h-14 gap-2">
                <p className="font-semibold">Signed in as</p>
                <p className="font-semibold">jane.doe@example.com</p>
              </DropdownItem>
              <DropdownItem key="settings" startContent={<User size={20} />}>Perfil</DropdownItem>
              <DropdownItem key="loans" startContent={<CreditCard size={20} />}>Préstamos</DropdownItem>
              <DropdownItem key="help" startContent={<HelpCircle size={20} />}>Ayuda</DropdownItem>
              <DropdownItem key="logout" color="danger" startContent={<LogOut size={20} />} onClick={()=>sign_out()}>
                Cerrar sesión
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarContent>
      </Navbar>

      <main className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4">
            <Button
              color={activeTab === "loans" ? "primary" : "default"}
              onClick={() => setActiveTab("loans")}
            >
              Préstamos
            </Button>
            <Button
              color={activeTab === "settings" ? "primary" : "default"}
              onClick={() => setActiveTab("settings")}
            >
              Configuración
            </Button>
            <Button
              color={activeTab === "help" ? "primary" : "default"}
              onClick={() => setActiveTab("help")}
            >
              Ayuda
            </Button>
          </div>
          <Button color="primary" endContent={<PlusCircle size={20} />} onPress={() => setShowForm(true)}>
            Solicitar Préstamo
          </Button>
        </div>

        {activeTab === "loans" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Préstamos Disponibles</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {solicitudes.map((solicitud,index) => (
                <Card key={index} className="max-w-[400px]">
                  <CardBody className="p-0">
                    <div className="p-4">
                    <h3 className="text-xl font-bold mb-2">
                  Solicitud {index + 1}
                </h3>
                <p>
                  <strong>Propósito:</strong> {solicitud.purpose}
                </p>
                <p>
                  <strong>Tipo:</strong> {solicitud.type}
                </p>
                <p>
                  <strong>Monto:</strong> ${solicitud.amount.toLocaleString()}
                </p>
                <p>
                  <strong>Plazo:</strong> {solicitud.term}
                </p>
                <p>
                  <strong>Forma de Pago:</strong> {solicitud.payment}
                </p>
                <p>
                  <strong>Ingresos:</strong> $
                  {solicitud.income.toLocaleString()}
                </p>
                    </div>
                  </CardBody>
                  <CardFooter>
                    <Button color="default" className='py-1 text-[rgb(200,200,200)]' variant="light" onPress={() => setShowForm1(true)}>Eliminar</Button>
                    {/* () => deleteSolicitud(solicitud.id) */}
                    <AnimatePresence>
                    {showForm1 && (
                    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={resetForm1}
></div>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="relative bg-white p-6 rounded-lg shadow-lg w-full max-w-lg mx-auto"
      >
        <h1 className="text-2xl font-bold mb-4 text-center">
          ¿Estas seguro de eliminar la solicitud?
        </h1>
        <div className='flex justify-center items-center align-middle'>
        <Button color="primary" className='self-center mr-5'  onPress={ () => deleteSolicitud(solicitud.id)}>Continuar</Button>
        <Button color="default" className='py-1 text-[rgb(200,200,200)]' variant="light"  onClick={resetForm1}>Cancelar</Button>
        </div>
        </motion.div>
    </div>
    )}
    </AnimatePresence>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <Card>
            <CardBody className="space-y-4">
              <h2 className="text-2xl font-bold">Configuración de la cuenta</h2>
              <Input label="Nombre" defaultValue="Jane Doe" />
              <Input label="Correo electrónico" type="email" defaultValue="jane.doe@example.com" />
              <Button color="primary">Guardar cambios</Button>
            </CardBody>
          </Card>
        )}

        {activeTab === "help" && (
          <Card>
            <CardBody>
              <h2 className="text-2xl font-bold mb-4">Centro de Ayuda</h2>
              <p>Si necesita asistencia, por favor contacte a nuestro equipo de soporte:</p>
              <p className="mt-2">
                <strong>Email:</strong> soporte@buscocredito.com
              </p>
              <p>
                <strong>Teléfono:</strong> +1 (555) 123-4567
              </p>
            </CardBody>
          </Card>
        )}

<AnimatePresence>
          {showForm && (
            <CreditForm addSolicitud={addSolicitud} resetForm={resetForm} />
          )}
        </AnimatePresence>
        
      </main>
    </div>
  )
}