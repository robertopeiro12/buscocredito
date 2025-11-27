import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getFirestore, setDoc, Timestamp } from 'firebase/firestore';
import { auth } from '@/app/firebase';
import { SignupFormData, SignupErrors } from '@/types/signup';
import { validateField, validateStep } from '@/utils/validators';
import { generateInitialCreditScore } from '@/utils/creditScore';

const initialFormData: SignupFormData = {
  name: "",
  lastName: "",
  secondLastName: "",
  rfc: "",
  birthday: "",
  phone: "",
  address: {
    street: "",
    exteriorNumber: "",
    interiorNumber: "",
    colony: "",
    city: "",
    state: "",
    country: "México",
    zipCode: "",
  },
  email: "",
  password: "",
  confirmPassword: "",
};

export const useSignupForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<SignupFormData>(initialFormData);
  const [errors, setErrors] = useState<SignupErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCP, setIsLoadingCP] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    const error = validateField(name, value, formData);
    setErrors(prev => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[name] = error;
      } else {
        delete newErrors[name];
      }
      return newErrors;
    });
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value,
      },
    }));

    // Si el campo es código postal y tiene 5 dígitos, buscar información
    if (name === "zipCode" && value.length === 5 && /^\d{5}$/.test(value)) {
      fetchPostalCodeData(value);
    }

    const fieldName = `address.${name}`;
    const error = validateField(fieldName, value, formData);
    setErrors(prev => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[fieldName] = error;
      } else {
        delete newErrors[fieldName];
      }
      return newErrors;
    });
  };

  const handlePhoneChange = (phone: string) => {
    setFormData((prev) => ({
      ...prev,
      phone,
    }));
    
    const error = validateField("phone", phone, formData);
    setErrors(prev => {
      const newErrors = { ...prev };
      if (error) {
        newErrors.phone = error;
      } else {
        delete newErrors.phone;
      }
      return newErrors;
    });
  };

  const handleStateChange = (state: string) => {
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        state,
      },
    }));

    const fieldName = "address.state";
    const error = validateField(fieldName, state, formData);
    setErrors(prev => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[fieldName] = error;
      } else {
        delete newErrors[fieldName];
      }
      return newErrors;
    });
  };

  const handleNextStep = () => {
    const validation = validateStep(step, formData, errors);
    if (validation.isValid) {
      setStep((prev) => prev + 1);
    } else {
      setErrors(validation.errors);
      // Add visual feedback when validation fails
      const firstErrorField = document.querySelector('[aria-invalid="true"]');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const handlePrevStep = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step !== 4) {
      handleNextStep();
      return;
    }

    const validation = validateStep(step, formData, errors);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const db = getFirestore();
      const userRef = doc(db, "cuentas", userCredential.user.uid);

      // Generar score crediticio inicial
      const creditScore = generateInitialCreditScore();

      await setDoc(userRef, {
        name: formData.name,
        last_name: formData.lastName,
        second_last_name: formData.secondLastName,
        rfc: formData.rfc,
        birthday: Timestamp.fromDate(new Date(formData.birthday)),
        phone: formData.phone,
        address: formData.address,
        email: formData.email,
        type: "user",
        creditScore: creditScore,
        created_at: Timestamp.now(),
      });

      // El AuthContext detectará al usuario y redirigirá automáticamente
      // No necesitamos redirigir manualmente aquí
      
    } catch (err) {
      console.error("Error al registrarse:", err);
      setErrors((prev) => ({
        ...prev,
        submit:
          "Error al crear la cuenta. Por favor, verifica tus datos e intenta de nuevo.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchPostalCodeData = async (zipCode: string) => {
    if (zipCode.length === 5) {
      setIsLoadingCP(true);
      try {
        // Aquí irá la implementación con Google Maps API
        setIsLoadingCP(false);
      } catch (error) {
        console.error("Error al consultar el código postal:", error);
        setErrors((prev) => ({
          ...prev,
          "address.zipCode": "Error al verificar el código postal",
        }));
        setIsLoadingCP(false);
      }
    }
  };

  return {
    // State
    step,
    formData,
    errors,
    isSubmitting,
    isLoadingCP,
    
    // Handlers
    handleInputChange,
    handleAddressChange,
    handlePhoneChange,
    handleStateChange,
    handleNextStep,
    handlePrevStep,
    handleSubmit,
  };
};
