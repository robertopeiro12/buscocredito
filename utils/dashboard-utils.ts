import { Timestamp } from "firebase/firestore";

/**
 * Formats a Firebase Timestamp to a localized date string
 */
export const formatDate = (timestamp: Timestamp | null): string => {
  if (!timestamp) return "";
  const date = timestamp.toDate();
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

/**
 * Formats a number as currency in Mexican pesos
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(amount);
};

/**
 * Formats a number with thousands separators
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

/**
 * Safely gets accepted offers from localStorage
 */
export const getAcceptedOffersFromStorage = (): Record<string, string> => {
  try {
    return JSON.parse(localStorage.getItem("acceptedOffers") || "{}");
  } catch (err) {
    console.error("Error reading from localStorage", err);
    return {};
  }
};

/**
 * Safely saves accepted offers to localStorage
 */
export const saveAcceptedOfferToStorage = (loanId: string, offerId: string): void => {
  try {
    const acceptedOffers = getAcceptedOffersFromStorage();
    acceptedOffers[loanId] = offerId;
    localStorage.setItem("acceptedOffers", JSON.stringify(acceptedOffers));
  } catch (err) {
    console.error("Error saving to localStorage", err);
  }
};

/**
 * Validates if an offer status is valid
 */
export const isValidOfferStatus = (status: string): status is "accepted" | "rejected" | "pending" => {
  return ["accepted", "rejected", "pending"].includes(status);
};
