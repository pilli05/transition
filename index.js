const express = require("express");
const app = express();
const axios = require("axios");
const path = require("path");

const PORT = 4000;
app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));

const rules = [
  {
    name: "Valuation Fee Paid",
    description: "isValuationFeePaid should be true",
    validate: (data) => data.isValuationFeePaid === true,
  },
  {
    name: "UK Resident",
    description: "isUkResident should be true",
    validate: (data) => data.isUkResident === true,
  },
  {
    name: "Risk Rating Medium",
    description: 'riskRating should be "Medium"',
    validate: (data) => data.riskRating === "Medium",
  },
  {
    name: "LTV Below 60%",
    description: "Loan-to-Value should be below 60%",
    validate: (data) => {
      const loanRequired = parseFloat(
        data.mortgage.loanRequired.replace(/[^0-9.]/g, "")
      );
      const purchasePrice = parseFloat(
        data.mortgage.purchasePrice.replace(/[^0-9.]/g, "")
      );
      const ltv = (loanRequired / purchasePrice) * 100;
      return ltv < 60;
    },
  },
];

const fetchApplicationData = async () => {
  try {
    const response = await axios.get(
      "http://qa-gb.api.dynamatix.com:3100/api/applications/getApplicationById/67339ae56d5231c1a2c63639"
    );
    const data = response.data;

    const results = rules.map((rule) => ({
      rule: rule.name,
      description: rule.description,
      status: rule.validate(data) ? "Passed" : "Failed",
    }));

    return { data, results };
  } catch (error) {
    console.error(error);
  }
};

app.get("/", async (req, res) => {
  try {
    const { results } = await fetchApplicationData();
    res.render("dashboard", { results });
  } catch (error) {
    console.log(error);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
