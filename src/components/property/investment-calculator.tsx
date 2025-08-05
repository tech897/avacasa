"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calculator,
  TrendingUp,
  PiggyBank,
  Calendar,
  IndianRupee,
} from "lucide-react";

interface InvestmentCalculatorProps {
  propertyPrice: number;
  propertyType: string;
  location: string;
  className?: string;
}

export function InvestmentCalculator({
  propertyPrice,
  propertyType,
  location,
  className = "",
}: InvestmentCalculatorProps) {
  // EMI Calculator States
  const [loanAmount, setLoanAmount] = useState(propertyPrice * 0.8); // 80% of property value
  const [downPayment, setDownPayment] = useState(propertyPrice * 0.2); // 20% down payment
  const [interestRate, setInterestRate] = useState(8.5); // Default interest rate
  const [loanTenure, setLoanTenure] = useState(20); // Default 20 years
  const [emi, setEmi] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);

  // ROI Calculator States
  const [currentRentalYield, setCurrentRentalYield] = useState(3.5); // 3.5% typical for holiday homes
  const [appreciationRate, setAppreciationRate] = useState(8); // 8% annual appreciation
  const [investmentPeriod, setInvestmentPeriod] = useState(10); // 10 years
  const [projectedValue, setProjectedValue] = useState(0);
  const [totalRentalIncome, setTotalRentalIncome] = useState(0);
  const [totalReturns, setTotalReturns] = useState(0);

  // Calculate EMI
  useEffect(() => {
    if (loanAmount > 0 && interestRate > 0 && loanTenure > 0) {
      const monthlyRate = interestRate / 100 / 12;
      const numberOfPayments = loanTenure * 12;

      const emiAmount =
        (loanAmount *
          monthlyRate *
          Math.pow(1 + monthlyRate, numberOfPayments)) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

      const totalPaymentAmount = emiAmount * numberOfPayments;
      const totalInterestAmount = totalPaymentAmount - loanAmount;

      setEmi(emiAmount);
      setTotalPayment(totalPaymentAmount);
      setTotalInterest(totalInterestAmount);
    }
  }, [loanAmount, interestRate, loanTenure]);

  // Calculate ROI Projections
  useEffect(() => {
    if (propertyPrice > 0 && investmentPeriod > 0) {
      // Future property value with compound appreciation
      const futureValue =
        propertyPrice * Math.pow(1 + appreciationRate / 100, investmentPeriod);

      // Annual rental income
      const annualRental = (propertyPrice * currentRentalYield) / 100;
      const totalRental = annualRental * investmentPeriod;

      // Total returns (appreciation + rental income)
      const capitalGains = futureValue - propertyPrice;
      const totalReturn = capitalGains + totalRental;

      setProjectedValue(futureValue);
      setTotalRentalIncome(totalRental);
      setTotalReturns(totalReturn);
    }
  }, [propertyPrice, currentRentalYield, appreciationRate, investmentPeriod]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-IN").format(Math.round(num));
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          Investment Calculator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="emi" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="emi">EMI Calculator</TabsTrigger>
            <TabsTrigger value="roi">ROI Projections</TabsTrigger>
            <TabsTrigger value="summary">Investment Summary</TabsTrigger>
          </TabsList>

          {/* EMI Calculator Tab */}
          <TabsContent value="emi" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="propertyValue">Property Value</Label>
                  <Input
                    id="propertyValue"
                    type="text"
                    value={formatCurrency(propertyPrice)}
                    disabled
                    className="bg-gray-50"
                  />
                </div>

                <div>
                  <Label htmlFor="downPayment">Down Payment (20%)</Label>
                  <Input
                    id="downPayment"
                    type="number"
                    value={downPayment}
                    onChange={(e) => {
                      const dp = Number(e.target.value);
                      setDownPayment(dp);
                      setLoanAmount(propertyPrice - dp);
                    }}
                  />
                </div>

                <div>
                  <Label htmlFor="loanAmount">Loan Amount</Label>
                  <Input
                    id="loanAmount"
                    type="number"
                    value={loanAmount}
                    onChange={(e) => {
                      const la = Number(e.target.value);
                      setLoanAmount(la);
                      setDownPayment(propertyPrice - la);
                    }}
                  />
                </div>

                <div>
                  <Label htmlFor="interestRate">Interest Rate (%)</Label>
                  <Input
                    id="interestRate"
                    type="number"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="loanTenure">Loan Tenure (Years)</Label>
                  <Input
                    id="loanTenure"
                    type="number"
                    value={loanTenure}
                    onChange={(e) => setLoanTenure(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-primary/5 p-4 rounded-lg">
                  <h4 className="font-semibold text-primary mb-3">
                    EMI Breakdown
                  </h4>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly EMI:</span>
                      <span className="font-semibold text-lg">
                        {formatCurrency(emi)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Interest:</span>
                      <span className="font-medium">
                        {formatCurrency(totalInterest)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Payment:</span>
                      <span className="font-medium">
                        {formatCurrency(totalPayment)}
                      </span>
                    </div>

                    <div className="pt-3 border-t">
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Interest vs Principal:
                        </span>
                        <span className="text-sm">
                          {((totalInterest / totalPayment) * 100).toFixed(1)}% :{" "}
                          {((loanAmount / totalPayment) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h5 className="font-medium text-green-800 mb-2">
                    Popular Banks Interest Rates
                  </h5>
                  <div className="text-sm space-y-1 text-green-700">
                    <div>SBI: 8.40% - 9.15%</div>
                    <div>HDFC: 8.60% - 9.50%</div>
                    <div>ICICI: 8.75% - 9.50%</div>
                    <div>Axis: 8.75% - 9.25%</div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ROI Projections Tab */}
          <TabsContent value="roi" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="rentalYield">
                    Expected Rental Yield (%/year)
                  </Label>
                  <Input
                    id="rentalYield"
                    type="number"
                    step="0.1"
                    value={currentRentalYield}
                    onChange={(e) =>
                      setCurrentRentalYield(Number(e.target.value))
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Holiday homes typically yield 3-6% annually
                  </p>
                </div>

                <div>
                  <Label htmlFor="appreciationRate">
                    Property Appreciation (%/year)
                  </Label>
                  <Input
                    id="appreciationRate"
                    type="number"
                    step="0.1"
                    value={appreciationRate}
                    onChange={(e) =>
                      setAppreciationRate(Number(e.target.value))
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {location} properties appreciate 6-12% annually
                  </p>
                </div>

                <div>
                  <Label htmlFor="investmentPeriod">
                    Investment Period (Years)
                  </Label>
                  <Input
                    id="investmentPeriod"
                    type="number"
                    value={investmentPeriod}
                    onChange={(e) =>
                      setInvestmentPeriod(Number(e.target.value))
                    }
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Investment Projections
                  </h4>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current Value:</span>
                      <span className="font-medium">
                        {formatCurrency(propertyPrice)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Projected Value ({investmentPeriod}Y):
                      </span>
                      <span className="font-semibold text-lg text-green-600">
                        {formatCurrency(projectedValue)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Capital Appreciation:
                      </span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(projectedValue - propertyPrice)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Total Rental Income:
                      </span>
                      <span className="font-medium text-blue-600">
                        {formatCurrency(totalRentalIncome)}
                      </span>
                    </div>

                    <div className="pt-3 border-t">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Returns:</span>
                        <span className="font-bold text-lg text-green-600">
                          {formatCurrency(totalReturns)}
                        </span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-gray-600">ROI:</span>
                        <span className="font-medium text-green-600">
                          {((totalReturns / propertyPrice) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h5 className="font-medium text-yellow-800 mb-2">
                    Annual Breakdown
                  </h5>
                  <div className="text-sm space-y-1 text-yellow-700">
                    <div>
                      Annual Rental:{" "}
                      {formatCurrency(
                        (propertyPrice * currentRentalYield) / 100
                      )}
                    </div>
                    <div>
                      Monthly Rental:{" "}
                      {formatCurrency(
                        (propertyPrice * currentRentalYield) / 100 / 12
                      )}
                    </div>
                    <div>Annual Appreciation: {appreciationRate}%</div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Investment Summary Tab */}
          <TabsContent value="summary" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <IndianRupee className="w-4 h-4 text-primary" />
                    <h4 className="font-semibold">Monthly Investment</h4>
                  </div>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(emi)}
                  </p>
                  <p className="text-sm text-gray-600">
                    EMI for {loanTenure} years
                  </p>
                </CardContent>
              </Card>

              <Card className="border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <h4 className="font-semibold">Total Returns</h4>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(totalReturns)}
                  </p>
                  <p className="text-sm text-gray-600">
                    In {investmentPeriod} years
                  </p>
                </CardContent>
              </Card>

              <Card className="border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <PiggyBank className="w-4 h-4 text-blue-600" />
                    <h4 className="font-semibold">Monthly Rental</h4>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(
                      (propertyPrice * currentRentalYield) / 100 / 12
                    )}
                  </p>
                  <p className="text-sm text-gray-600">Potential income</p>
                </CardContent>
              </Card>
            </div>

            <div className="bg-gradient-to-r from-primary/10 to-blue-50 p-6 rounded-lg">
              <h4 className="font-semibold mb-4">Investment Highlights</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>✓ Capital Appreciation:</strong> {appreciationRate}%
                  annually
                </div>
                <div>
                  <strong>✓ Rental Income:</strong> {currentRentalYield}% yield
                </div>
                <div>
                  <strong>✓ Tax Benefits:</strong> Interest deduction up to ₹2L
                </div>
                <div>
                  <strong>✓ Loan Eligibility:</strong> Up to 80% of property
                  value
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button className="flex-1">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Site Visit
              </Button>
              <Button variant="outline" className="flex-1">
                Download Investment Report
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
