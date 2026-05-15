const express = require('express');
const router = express.Router();

router.post('/calculate', (req, res) => {
  try {
    const { vehicle_price, deposit_percent, interest_rate, tenor_months } = req.body;

    const price = parseFloat(vehicle_price);
    const deposit = price * (parseFloat(deposit_percent) / 100);
    const loan = price - deposit;
    const monthlyRate = parseFloat(interest_rate) / 100 / 12;
    const n = parseInt(tenor_months);

    let monthly;
    if (monthlyRate === 0) {
      monthly = loan / n;
    } else {
      monthly = loan * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
    }

    const totalRepayment = monthly * n + deposit;
    const totalInterest = totalRepayment - price;

    res.json({
      success: true,
      data: {
        vehicle_price: price,
        deposit_amount: Math.round(deposit),
        loan_amount: Math.round(loan),
        monthly_payment: Math.round(monthly),
        total_repayment: Math.round(totalRepayment),
        total_interest: Math.round(totalInterest),
        interest_rate: parseFloat(interest_rate),
        tenor_months: n
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;
