"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getFirestore, setDoc, Timestamp } from "firebase/firestore";
import { auth } from "../firebase";
import NavBar from "@/components/navbar";
import Footer from "@/components/Footer";

export default function SignUpPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    secondLastName: "",
    rfc: "",
    birthday: "",
    phone: "",
    address: {
      street: "",
      number: "",
      colony: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
    },
    email: "",
    password: "",
  });
  const [error, setError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("Usuario conectado:", user.uid);
      } else {
        console.log("Usuario desconectado");
      }
    });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value,
      },
    }));
  };

  const signUp = (e) => {
    e.preventDefault();
    createUserWithEmailAndPassword(auth, formData.email, formData.password)
      .then((userCredential) => {
        const db = getFirestore();
        const userRef = doc(db, "cuentas", userCredential.user.uid);
        setDoc(userRef, {
          name: formData.name,
          last_name: formData.lastName,
          second_last_name: formData.secondLastName,
          rfc: formData.rfc,
          birthday: Timestamp.fromDate(new Date(formData.birthday)),
          phone: formData.phone,
          address: formData.address,
          email: formData.email,
          type: "user",
        });
        console.log("Usuario creado y datos guardados");
        router.push("/login");
      })
      .catch((err) => {
        console.error("Error al registrarse:", err);
        setError(true);
      });
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700">
              Información Personal
            </h2>
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nombre
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ingresa tu nombre"
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Apellido Paterno
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Ingresa tu apellido paterno"
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label
                  htmlFor="secondLastName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Apellido Materno
                </label>
                <input
                  id="secondLastName"
                  name="secondLastName"
                  type="text"
                  value={formData.secondLastName}
                  onChange={handleInputChange}
                  placeholder="Ingresa tu apellido materno"
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700">
              Información de Contacto
            </h2>
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="rfc"
                  className="block text-sm font-medium text-gray-700"
                >
                  RFC
                </label>
                <input
                  id="rfc"
                  name="rfc"
                  type="text"
                  value={formData.rfc}
                  onChange={handleInputChange}
                  placeholder="Ingresa tu RFC"
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Número de Teléfono
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Ingresa tu número de teléfono"
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label
                  htmlFor="birthday"
                  className="block text-sm font-medium text-gray-700"
                >
                  Fecha de Nacimiento
                </label>
                <input
                  id="birthday"
                  name="birthday"
                  type="date"
                  value={formData.birthday}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700">
              Detalles de Dirección
            </h2>
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="street"
                  className="block text-sm font-medium text-gray-700"
                >
                  Calle
                </label>
                <input
                  id="street"
                  name="street"
                  type="text"
                  value={formData.address.street}
                  onChange={handleAddressChange}
                  placeholder="Ingresa tu calle"
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="number"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Número
                  </label>
                  <input
                    id="number"
                    name="number"
                    type="text"
                    value={formData.address.number}
                    onChange={handleAddressChange}
                    placeholder="Número"
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="zipCode"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Código Postal
                  </label>
                  <input
                    id="zipCode"
                    name="zipCode"
                    type="text"
                    value={formData.address.zipCode}
                    onChange={handleAddressChange}
                    placeholder="Código Postal"
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="colony"
                  className="block text-sm font-medium text-gray-700"
                >
                  Colonia
                </label>
                <input
                  id="colony"
                  name="colony"
                  type="text"
                  value={formData.address.colony}
                  onChange={handleAddressChange}
                  placeholder="Ingresa tu colonia"
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-gray-700"
                >
                  Ciudad
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  value={formData.address.city}
                  onChange={handleAddressChange}
                  placeholder="Ingresa tu ciudad"
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label
                  htmlFor="state"
                  className="block text-sm font-medium text-gray-700"
                >
                  Estado
                </label>
                <input
                  id="state"
                  name="state"
                  type="text"
                  value={formData.address.state}
                  onChange={handleAddressChange}
                  placeholder="Ingresa tu estado"
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label
                  htmlFor="country"
                  className="block text-sm font-medium text-gray-700"
                >
                  País
                </label>
                <input
                  id="country"
                  name="country"
                  type="text"
                  value={formData.address.country}
                  onChange={handleAddressChange}
                  placeholder="Ingresa tu país"
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700">
              Información de la Cuenta
            </h2>
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Correo Electrónico
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Ingresa tu correo electrónico"
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Contraseña
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Crea una contraseña segura"
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 to-blue-50">
      <NavBar />
      <main className="flex-grow flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl bg-white shadow-2xl rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-8 px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl font-bold">Crea tu Cuenta</h1>
            <p className="mt-2 text-green-100">
              ¡Únete a BuscoCredito y comienza tu viaje financiero hoy!
            </p>
            <div className="flex justify-center mt-4">
              <div className="flex items-center space-x-4">
                {[1, 2, 3, 4].map((index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      step >= index ? "bg-white" : "bg-green-200"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="p-8">
            <form onSubmit={signUp} className="space-y-6">
              {renderStepContent()}
              {error && (
                <p className="text-red-500 text-center mt-4">
                  Error al crear la cuenta. Por favor, intenta de nuevo.
                </p>
              )}
              <div className="flex justify-between mt-8">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-300"
                  >
                    Anterior
                  </button>
                )}

                {step < 4 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className={`${
                      step === 1 ? "w-full" : ""
                    } px-6 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-300`}
                  >
                    Siguiente
                  </button>
                ) : (
                  <button
                    type="submit"
                    className={`${
                      step === 1 ? "w-full" : ""
                    } px-6 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-300`}
                  >
                    Crear Cuenta
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
