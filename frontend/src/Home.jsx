import React, { useEffect, useState } from "react";
import axios from "axios";
const BACKEND_URL = "http://localhost:4000";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

function Home() {
  const [limit, setlimit] = useState(500);
  const [amount, setAmount] = useState(10);

  const remaining=limit-amount;

  const data = {
    labels: ["Spent", "Remaining"],
    datasets: [
      {
        label: "total",
        data: [amount,remaining],
        backgroundColor: [
            "rgb(255, 99, 132)", 
            "rgb(54, 162, 235)"
        ]
      },
    ],
  };

  return (
    <div className=" flex flex-col text-center">
      <div className=" text-center text-[#0092CA] text-4xl py-2  border-b-[#393E46] border-b-2">
        Roast My Spend
      </div>

      <div className="pt-8 flex flex-col gap-2 ">
        <p className=" text-3xl">
          Daily Limit:
          <span className="text-[#0092CA] text-4xl font-bold">{limit}</span>
        </p>
        <p className=" text-3xl">
          Spent:
          <span className="text-[#0092CA] text-4xl font-bold">{amount}</span>
        </p>
      </div>

      <div className="w-full flex justify-center">
        <div className=" md:w-[60%] sm:w-[80%] lg:w-[36%] ">
          <Doughnut data={data} />
        </div>
      </div>
    </div>
  );
}

export default Home;
