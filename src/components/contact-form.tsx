"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";

interface BuyFormData {
  fullName: string;
  email: string;
  phone: string;
  preferredLocations: string;
  propertyType: string;
  specificFeatures: string;
  budget: string[];
  propertySize: string;
}

interface SellFormData {
  fullName: string;
  email: string;
  phone: string;
  propertyLocation: string;
  propertyType: string[];
  propertyFeatures: string;
  propertySize: string;
  expectedPrice: string;
  agreeToBrokerage: boolean;
}

export default function ContactForm() {
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  // Buy form state
  const [buyFormData, setBuyFormData] = useState<BuyFormData>({
    fullName: "",
    email: "",
    phone: "",
    preferredLocations: "",
    propertyType: "",
    specificFeatures: "",
    budget: [],
    propertySize: "",
  });

  // Sell form state
  const [sellFormData, setSellFormData] = useState<SellFormData>({
    fullName: "",
    email: "",
    phone: "",
    propertyLocation: "",
    propertyType: [],
    propertyFeatures: "",
    propertySize: "",
    expectedPrice: "",
    agreeToBrokerage: false,
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const propertyTypes = [
    { value: "holiday-home-villa", label: "Holiday Home - Villa" },
    { value: "holiday-home-apartment", label: "Holiday Home - Apartment" },
    { value: "residential-land", label: "Residential Plot" },
    { value: "farmlands-farmhouse", label: "Managed Farmlands / Farmhouse" },
    { value: "plot", label: "Plot" },
    { value: "other", label: "Other" },
  ];

  const sellPropertyTypes = [
    { value: "residential-plot", label: "Residential Plot" },
    { value: "holiday-home", label: "Holiday Home" },
    { value: "farmland", label: "Managed Farmland" },
    { value: "villa", label: "Villa" },
    { value: "apartment", label: "Apartment" },
    { value: "fractional-share", label: "Fractional Share" },
    { value: "other", label: "Other" },
  ];

  const budgetOptions = [
    "Upto INR 1 Crore",
    "INR 1 Crore to INR 2 Crore",
    "INR 2 Crore to INR 3 Crore",
    "INR 3 Crore to INR 5 Crore",
    "Above INR 5 Crore",
    "Other",
  ];

  const validateBuyForm = () => {
    const errors: { [key: string]: string } = {};

    if (!buyFormData.fullName.trim()) errors.fullName = "Full name is required";
    if (!buyFormData.email.trim()) errors.email = "Email is required";
    if (!/\S+@\S+\.\S+/.test(buyFormData.email))
      errors.email = "Valid email is required";
    if (!buyFormData.phone.trim()) errors.phone = "Phone number is required";
    if (!/^\d{10}$/.test(buyFormData.phone.replace(/\D/g, "")))
      errors.phone = "Valid 10-digit phone number is required";
    if (!buyFormData.preferredLocations.trim())
      errors.preferredLocations = "Preferred location is required";
    if (!buyFormData.propertyType)
      errors.propertyType = "Property type selection is required";
    if (!buyFormData.specificFeatures.trim())
      errors.specificFeatures = "Specific features are required";
    if (buyFormData.budget.length === 0)
      errors.budget = "Budget selection is required";
    if (!buyFormData.propertySize.trim())
      errors.propertySize = "Property size is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateSellForm = () => {
    const errors: { [key: string]: string } = {};

    if (!sellFormData.fullName.trim())
      errors.fullName = "Full name is required";
    if (!sellFormData.email.trim()) errors.email = "Email is required";
    if (!/\S+@\S+\.\S+/.test(sellFormData.email))
      errors.email = "Valid email is required";
    if (!sellFormData.phone.trim()) errors.phone = "Phone number is required";
    if (!/^\d{10}$/.test(sellFormData.phone.replace(/\D/g, "")))
      errors.phone = "Valid 10-digit phone number is required";
    if (!sellFormData.propertyLocation.trim())
      errors.propertyLocation = "Property location is required";
    if (sellFormData.propertyType.length === 0)
      errors.propertyType = "Property type selection is required";
    if (!sellFormData.propertyFeatures.trim())
      errors.propertyFeatures = "Property features are required";
    if (!sellFormData.propertySize.trim())
      errors.propertySize = "Property size is required";
    if (!sellFormData.expectedPrice.trim())
      errors.expectedPrice = "Expected sale price is required";
    if (!sellFormData.agreeToBrokerage)
      errors.agreeToBrokerage = "You must agree to the brokerage terms";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBuySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateBuyForm()) return;

    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: buyFormData.fullName,
          email: buyFormData.email,
          phone: buyFormData.phone,
          subject: `Property Inquiry - ${buyFormData.propertyType}`,
          message: `Preferred Locations: ${
            buyFormData.preferredLocations
          }\nProperty Type: ${
            buyFormData.propertyType
          }\nBudget: ${buyFormData.budget.join(", ")}\nSize: ${
            buyFormData.propertySize
          }\nSpecific Features: ${buyFormData.specificFeatures}`,
          type: "SALES",
          source: "buy_form",
          propertyInterest: buyFormData.propertyType,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitMessage(
          "Thank you! We'll get back to you soon with matching properties."
        );
        setBuyFormData({
          fullName: "",
          email: "",
          phone: "",
          preferredLocations: "",
          propertyType: "",
          specificFeatures: "",
          budget: [],
          propertySize: "",
        });
        setFormErrors({});
      } else {
        setSubmitMessage("Something went wrong. Please try again.");
      }
    } catch (error) {
      setSubmitMessage("Network error. Please try again.");
    }

    setIsSubmitting(false);
  };

  const handleSellSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateSellForm()) return;

    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: sellFormData.fullName,
          email: sellFormData.email,
          phone: sellFormData.phone,
          subject: `Property Listing - ${sellFormData.propertyType.join(", ")}`,
          message: `Property Location: ${
            sellFormData.propertyLocation
          }\nProperty Type: ${sellFormData.propertyType.join(", ")}\nSize: ${
            sellFormData.propertySize
          }\nExpected Price: ${sellFormData.expectedPrice}\nFeatures: ${
            sellFormData.propertyFeatures
          }\nBrokerage Agreement: Agreed`,
          type: "SALES",
          source: "sell_form",
          propertyInterest: sellFormData.propertyType.join(", "),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitMessage(
          "Thank you! Our team will contact you for property valuation."
        );
        setSellFormData({
          fullName: "",
          email: "",
          phone: "",
          propertyLocation: "",
          propertyType: [],
          propertyFeatures: "",
          propertySize: "",
          expectedPrice: "",
          agreeToBrokerage: false,
        });
        setFormErrors({});
      } else {
        setSubmitMessage("Something went wrong. Please try again.");
      }
    } catch (error) {
      setSubmitMessage("Network error. Please try again.");
    }

    setIsSubmitting(false);
  };

  const handleBudgetChange = (budget: string) => {
    const updatedBudgets = buyFormData.budget.includes(budget)
      ? buyFormData.budget.filter((b) => b !== budget)
      : [...buyFormData.budget, budget];
    setBuyFormData({ ...buyFormData, budget: updatedBudgets });
  };

  const handleSellPropertyTypeChange = (type: string) => {
    const updatedTypes = sellFormData.propertyType.includes(type)
      ? sellFormData.propertyType.filter((t) => t !== type)
      : [...sellFormData.propertyType, type];
    setSellFormData({ ...sellFormData, propertyType: updatedTypes });
  };

  return (
    <div>
      {/* Buy/Sell Toggle */}
      <div className="flex bg-gray-100 rounded-full p-1 mb-8 w-fit mx-auto lg:mx-0">
        <button
          className={`px-8 py-3 rounded-full font-medium transition-all duration-300 ${
            activeTab === "buy"
              ? "bg-orange-500 text-white shadow-md"
              : "text-gray-600 hover:text-gray-800"
          }`}
          data-tab="buy"
          onClick={() => {
            setActiveTab("buy");
            setSubmitMessage("");
            setFormErrors({});
          }}
        >
          Buy
        </button>
        <button
          className={`px-8 py-3 rounded-full font-medium transition-all duration-300 ${
            activeTab === "sell"
              ? "bg-orange-500 text-white shadow-md"
              : "text-gray-600 hover:text-gray-800"
          }`}
          data-tab="sell"
          onClick={() => {
            setActiveTab("sell");
            setSubmitMessage("");
            setFormErrors({});
          }}
        >
          Sell
        </button>
      </div>

      {/* Success/Error Message */}
      {submitMessage && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            submitMessage.includes("Thank you")
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {submitMessage}
        </div>
      )}

      {/* Forms */}
      {activeTab === "buy" ? (
        /* Buy Form */
        <form onSubmit={handleBuySubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Full name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={buyFormData.fullName}
              onChange={(e) =>
                setBuyFormData({ ...buyFormData, fullName: e.target.value })
              }
              placeholder="Enter your full name"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none ${
                formErrors.fullName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {formErrors.fullName && (
              <p className="text-red-500 text-sm mt-1">{formErrors.fullName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={buyFormData.email}
              onChange={(e) =>
                setBuyFormData({ ...buyFormData, email: e.target.value })
              }
              placeholder="Enter your email"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none ${
                formErrors.email ? "border-red-500" : "border-gray-300"
              }`}
            />
            {formErrors.email && (
              <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Phone <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
                <Phone className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-gray-600">+91</span>
              </div>
              <input
                type="tel"
                value={buyFormData.phone}
                onChange={(e) =>
                  setBuyFormData({ ...buyFormData, phone: e.target.value })
                }
                placeholder="Enter your phone number"
                className={`w-full pl-20 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none ${
                  formErrors.phone ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>
            {formErrors.phone && (
              <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Tell us your preferred location (s){" "}
              <span className="text-red-500">*</span>
            </label>
            <textarea
              value={buyFormData.preferredLocations}
              onChange={(e) =>
                setBuyFormData({
                  ...buyFormData,
                  preferredLocations: e.target.value,
                })
              }
              placeholder="Enter multiple locations separated by comma"
              rows={3}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none ${
                formErrors.preferredLocations
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            {formErrors.preferredLocations && (
              <p className="text-red-500 text-sm mt-1">
                {formErrors.preferredLocations}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-4">
              Preferred Property Type <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              {propertyTypes.map((type) => (
                <label key={type.value} className="flex items-center">
                  <input
                    type="radio"
                    name="propertyType"
                    value={type.value}
                    checked={buyFormData.propertyType === type.value}
                    onChange={(e) =>
                      setBuyFormData({
                        ...buyFormData,
                        propertyType: e.target.value,
                      })
                    }
                    className="mr-3 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-gray-700">{type.label}</span>
                </label>
              ))}
            </div>
            {formErrors.propertyType && (
              <p className="text-red-500 text-sm mt-1">
                {formErrors.propertyType}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Specific Features <span className="text-red-500">*</span>
            </label>
            <textarea
              value={buyFormData.specificFeatures}
              onChange={(e) =>
                setBuyFormData({
                  ...buyFormData,
                  specificFeatures: e.target.value,
                })
              }
              placeholder="Any specific requirement such as location, view etc"
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none ${
                formErrors.specificFeatures
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            {formErrors.specificFeatures && (
              <p className="text-red-500 text-sm mt-1">
                {formErrors.specificFeatures}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-4">
              Budget <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              {budgetOptions.map((budget) => (
                <label key={budget} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={buyFormData.budget.includes(budget)}
                    onChange={() => handleBudgetChange(budget)}
                    className="mr-3 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-gray-700">{budget}</span>
                </label>
              ))}
            </div>
            {formErrors.budget && (
              <p className="text-red-500 text-sm mt-1">{formErrors.budget}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Size (in Sqft / BHK) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={buyFormData.propertySize}
              onChange={(e) =>
                setBuyFormData({ ...buyFormData, propertySize: e.target.value })
              }
              placeholder="Enter size of the Property"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none ${
                formErrors.propertySize ? "border-red-500" : "border-gray-300"
              }`}
            />
            {formErrors.propertySize && (
              <p className="text-red-500 text-sm mt-1">
                {formErrors.propertySize}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-black hover:bg-gray-800 text-white py-3 text-lg"
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </form>
      ) : (
        /* Sell Form */
        <form onSubmit={handleSellSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Full name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={sellFormData.fullName}
                onChange={(e) =>
                  setSellFormData({ ...sellFormData, fullName: e.target.value })
                }
                placeholder="Enter your full name"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none ${
                  formErrors.fullName ? "border-red-500" : "border-gray-300"
                }`}
              />
              {formErrors.fullName && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.fullName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Phone <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
                  <Phone className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">+91</span>
                </div>
                <input
                  type="tel"
                  value={sellFormData.phone}
                  onChange={(e) =>
                    setSellFormData({ ...sellFormData, phone: e.target.value })
                  }
                  placeholder="Enter your phone number"
                  className={`w-full pl-20 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none ${
                    formErrors.phone ? "border-red-500" : "border-gray-300"
                  }`}
                />
              </div>
              {formErrors.phone && (
                <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={sellFormData.email}
              onChange={(e) =>
                setSellFormData({ ...sellFormData, email: e.target.value })
              }
              placeholder="Enter your email"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none ${
                formErrors.email ? "border-red-500" : "border-gray-300"
              }`}
            />
            {formErrors.email && (
              <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
            )}
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Property Details
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Property Location/Address{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={sellFormData.propertyLocation}
                onChange={(e) =>
                  setSellFormData({
                    ...sellFormData,
                    propertyLocation: e.target.value,
                  })
                }
                placeholder="Enter Address"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none ${
                  formErrors.propertyLocation
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              {formErrors.propertyLocation && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.propertyLocation}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-4">
              Property Type <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              {sellPropertyTypes.map((type) => (
                <label key={type.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={sellFormData.propertyType.includes(type.value)}
                    onChange={() => handleSellPropertyTypeChange(type.value)}
                    className="mr-3 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-gray-700">{type.label}</span>
                </label>
              ))}
            </div>
            {formErrors.propertyType && (
              <p className="text-red-500 text-sm mt-1">
                {formErrors.propertyType}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Property Features <span className="text-red-500">*</span>
            </label>
            <textarea
              value={sellFormData.propertyFeatures}
              onChange={(e) =>
                setSellFormData({
                  ...sellFormData,
                  propertyFeatures: e.target.value,
                })
              }
              placeholder="Special Features, Gated/Non gated, etc"
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none ${
                formErrors.propertyFeatures
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            {formErrors.propertyFeatures && (
              <p className="text-red-500 text-sm mt-1">
                {formErrors.propertyFeatures}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Property Size (in Sqft or BHK){" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={sellFormData.propertySize}
                onChange={(e) =>
                  setSellFormData({
                    ...sellFormData,
                    propertySize: e.target.value,
                  })
                }
                placeholder="Enter what is relevant"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none ${
                  formErrors.propertySize ? "border-red-500" : "border-gray-300"
                }`}
              />
              {formErrors.propertySize && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.propertySize}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Expected Sale Price <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={sellFormData.expectedPrice}
                onChange={(e) =>
                  setSellFormData({
                    ...sellFormData,
                    expectedPrice: e.target.value,
                  })
                }
                placeholder="Enter number"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none ${
                  formErrors.expectedPrice
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              {formErrors.expectedPrice && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.expectedPrice}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="flex items-start">
              <input
                type="checkbox"
                checked={sellFormData.agreeToBrokerage}
                onChange={(e) =>
                  setSellFormData({
                    ...sellFormData,
                    agreeToBrokerage: e.target.checked,
                  })
                }
                className="mr-3 mt-1 text-orange-500 focus:ring-orange-500"
              />
              <span className="text-gray-700 text-sm">
                I agree to pay a brokerage fee of 2% of the final settlement
                price to Avacasa upon the successful work done.{" "}
                <span className="text-red-500">*</span>
              </span>
            </label>
            {formErrors.agreeToBrokerage && (
              <p className="text-red-500 text-sm mt-1">
                {formErrors.agreeToBrokerage}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-black hover:bg-gray-800 text-white py-3 text-lg"
          >
            {isSubmitting ? "Submitting..." : "List Your Property"}
          </Button>
        </form>
      )}
    </div>
  );
}
