import React from "react";
import { CheckCircle, AlertCircle } from "lucide-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Select, SelectItem } from "@heroui/react";
import InputField from "./InputField";
import { SignupFormData, SignupErrors } from "@/types/signup";

interface StepContentProps {
  step: number;
  formData: SignupFormData;
  errors: SignupErrors;
  isLoadingCP: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddressChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePhoneChange: (phone: string) => void;
  handleStateChange?: (state: string) => void;
}

// Lista completa de estados de México
const MEXICAN_STATES = [
  "Aguascalientes",
  "Baja California",
  "Baja California Sur",
  "Campeche",
  "Chiapas",
  "Chihuahua",
  "Ciudad de México",
  "Coahuila",
  "Colima",
  "Durango",
  "Estado de México",
  "Guanajuato",
  "Guerrero",
  "Hidalgo",
  "Jalisco",
  "Michoacán",
  "Morelos",
  "Nayarit",
  "Nuevo León",
  "Oaxaca",
  "Puebla",
  "Querétaro",
  "Quintana Roo",
  "San Luis Potosí",
  "Sinaloa",
  "Sonora",
  "Tabasco",
  "Tamaulipas",
  "Tlaxcala",
  "Veracruz",
  "Yucatán",
  "Zacatecas",
];

const StepContent = ({
  step,
  formData,
  errors,
  isLoadingCP,
  handleInputChange,
  handleAddressChange,
  handlePhoneChange,
  handleStateChange,
}: StepContentProps) => {
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="mt-6">
            <div className="space-y-4">
              <InputField
                id="name"
                label="Nombre"
                value={formData.name}
                onChange={handleInputChange}
                error={errors.name}
                placeholder="Juan"
              />
              <InputField
                id="lastName"
                label="Apellido Paterno"
                value={formData.lastName}
                onChange={handleInputChange}
                error={errors.lastName}
                placeholder="Pérez"
              />
              <InputField
                id="secondLastName"
                label="Apellido Materno"
                value={formData.secondLastName}
                onChange={handleInputChange}
                error={errors.secondLastName}
                placeholder="García"
                optional={true}
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="mt-6">
            <div className="space-y-4">
              <InputField
                id="rfc"
                label="RFC"
                value={formData.rfc}
                onChange={handleInputChange}
                error={errors.rfc}
                placeholder="PECJ880101XXX"
              />
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Teléfono <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <PhoneInput
                    country={"mx"}
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    inputProps={{
                      id: "phone",
                      name: "phone",
                      required: true,
                      "aria-invalid": errors.phone ? "true" : "false",
                    }}
                    containerClass="phone-input-container"
                    inputClass={`block w-full px-4 py-3 rounded-md border ${
                      errors.phone
                        ? "border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500"
                        : formData.phone &&
                          (!formData.phone.startsWith("52") ||
                            formData.phone.length === 12)
                        ? "border-green-300 text-green-900 focus:ring-green-500 focus:border-green-500"
                        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    } shadow-sm`}
                    buttonClass={
                      errors.phone ? "phone-input-flag-button-error" : ""
                    }
                  />
                  {errors.phone ? (
                    <div className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4 inline" />
                      <span>{errors.phone}</span>
                    </div>
                  ) : formData.phone &&
                    (!formData.phone.startsWith("52") ||
                      formData.phone.length === 12) ? (
                    <div className="mt-1 text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 inline" />
                      <span>Campo válido</span>
                    </div>
                  ) : null}
                </div>
              </div>
              <InputField
                id="birthday"
                label="Fecha de Nacimiento"
                type="date"
                value={formData.birthday}
                onChange={handleInputChange}
                error={errors.birthday}
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="mt-6">
            <div className="space-y-4">
              <InputField
                id="street"
                name="street"
                label="Calle"
                value={formData.address.street}
                onChange={handleAddressChange}
                error={errors["address.street"]}
                placeholder="Av. Insurgentes"
              />
              <div className="grid grid-cols-3 gap-4">
                <InputField
                  id="exteriorNumber"
                  name="exteriorNumber"
                  label="Número Exterior"
                  value={formData.address.exteriorNumber}
                  onChange={handleAddressChange}
                  error={errors["address.exteriorNumber"]}
                  placeholder="123"
                />
                <InputField
                  id="interiorNumber"
                  name="interiorNumber"
                  label="Número Interior"
                  value={formData.address.interiorNumber}
                  onChange={handleAddressChange}
                  error={errors["address.interiorNumber"]}
                  placeholder="A, 2, etc."
                  optional={true}
                />
                <InputField
                  id="zipCode"
                  name="zipCode"
                  label="Código Postal"
                  value={formData.address.zipCode}
                  onChange={handleAddressChange}
                  error={errors["address.zipCode"]}
                  placeholder="06100"
                />
              </div>
              {isLoadingCP && (
                <div className="mt-1 text-sm text-blue-600 flex items-center gap-1">
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Verificando código postal...</span>
                </div>
              )}
              <InputField
                id="colony"
                name="colony"
                label="Colonia"
                value={formData.address.colony}
                onChange={handleAddressChange}
                error={errors["address.colony"]}
                placeholder="Condesa"
              />
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  id="city"
                  name="city"
                  label="Ciudad"
                  value={formData.address.city}
                  onChange={handleAddressChange}
                  error={errors["address.city"]}
                  placeholder="Ciudad de México"
                />
                <div className="relative">
                  <label
                    htmlFor="state"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Estado <span className="text-red-500">*</span>
                  </label>
                  <Select
                    id="state"
                    name="state"
                    selectedKeys={
                      formData.address.state ? [formData.address.state] : []
                    }
                    onSelectionChange={(keys) => {
                      const selectedState = Array.from(keys)[0] as string;
                      handleStateChange?.(selectedState);
                    }}
                    placeholder="Selecciona un estado"
                    className="w-full"
                    classNames={{
                      trigger: `border ${
                        errors["address.state"]
                          ? "border-red-300 bg-red-50"
                          : formData.address.state
                          ? "border-green-300 bg-green-50"
                          : "border-gray-300"
                      } shadow-sm rounded-md`,
                      value: errors["address.state"]
                        ? "text-red-900"
                        : formData.address.state
                        ? "text-green-900"
                        : "text-gray-900",
                    }}
                  >
                    {MEXICAN_STATES.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </Select>
                  {/* Flechita personalizada más visible */}
                  <div className="absolute right-3 top-9 transform pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-800 font-bold"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                  {errors["address.state"] && (
                    <div className="mt-1 flex items-center text-sm text-red-600">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors["address.state"]}
                    </div>
                  )}
                  {formData.address.state && !errors["address.state"] && (
                    <div className="mt-1 flex items-center text-sm text-green-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Estado válido
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="mt-6">
            <div className="space-y-4">
              <InputField
                id="email"
                label="Correo Electrónico"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                error={errors.email}
                placeholder="juan.perez@ejemplo.com"
              />
              <InputField
                id="password"
                label="Contraseña"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                error={errors.password}
                placeholder="••••••••"
              />
              <InputField
                id="confirmPassword"
                label="Confirmar Contraseña"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                error={errors.confirmPassword}
                placeholder="••••••••"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return renderStepContent();
};

export default StepContent;
