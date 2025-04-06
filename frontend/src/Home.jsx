import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import {Chart as ChartJS,ArcElement,Tooltip,Legend,CategoryScale,LinearScale,BarElement} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import {saveData,loadData,getAllTransactions,clearAllTransactions} from "./utils/db.js";

ChartJS.register(ArcElement,Tooltip,Legend,CategoryScale,LinearScale,BarElement);

const BACKEND_URL = "https://roast-my-spend-backend.vercel.app";

const socket = io(`${BACKEND_URL}`);

function Home() {
  const [limit, setLimit] = useState(500);
  const [amount, setAmount] = useState(0);
  
  const [transactions, setTransactions] = useState([]);
  
  const donutChartRef = useRef(null);
  const barChartRef = useRef(null);
  
  const [categoryMap, setCategoryMap] = useState(new Map());

  const remaining = limit - amount;

  useEffect(() => {
    Notification.requestPermission();

    if (navigator.storage?.persist) {
      navigator.storage.persist().then((granted) => {
        console.log("Persistent storage granted:", granted);
      });
    }

    const loadInitialData = async () => {
      try {
        const [savedLimit, savedAmount, savedTransactions] = await Promise.all([
          loadData("limit"),
          loadData("amount"),
          getAllTransactions(),
        ]);

        if (savedLimit !== null) setLimit(savedLimit);
        if (savedAmount !== null) setAmount(savedAmount);
        if (savedTransactions) setTransactions(savedTransactions);
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };

    loadInitialData();

    socket.on("updateUI", handleTransaction);
      
    return () => {
      socket.off("updateUI", handleTransaction);
    };
  }, []);

  

  const handleTransaction = async (data) => {
    try {
      
      const newAmount = amount + data.money;

      const newTransaction = {
        amount: data.money,
        category: data.category,
        date: new Date().toISOString(),
      };

      setAmount(prev => prev + data.money);
      setTransactions((prev) => [...prev, newTransaction]);

      await Promise.all([
        saveData("amount", newAmount),
        saveData(`tx_${Date.now()}`, newTransaction),
      ]);

      setCategoryMap(prev => {
        const newMap = new Map(prev);
        const currentCount = newMap.get(data.category) || 0;
        newMap.set(data.category, currentCount + 1); 
        return newMap;
      });

      checkLimit();
    } catch (error) {
      console.error("Transaction error:", error);
    }
  };


  useEffect(() => {
    if (Notification.permission === "granted") {
      if(amount>=limit){
        alert(`🚨 Limit blown! Online Money Spending addict detected!`);
      }
    } 

    const saveAllData = async () => {
      try {
        await Promise.all([
          saveData("limit", limit),
          saveData("amount", amount),
        ]);
      } catch (error) {
        console.error("Save error:", error);
      }
    };
    saveAllData();

    if (donutChartRef.current) {
      donutChartRef.current.update();
    }
    if (barChartRef.current) {
      barChartRef.current.update();
    }
  }, [amount]);

  const donutData = {
    labels: ["Spent", "Remaining"],
    datasets: [
      {
        label: "total",
        data: [amount, remaining],
        backgroundColor: ["rgb(255, 99, 132)", "rgb(54, 162, 235)"],
      },
    ],
  };

  const barData = {
    labels:   ["Blinkit", "Zomato", "Netflix"],
    datasets: [
      {
        label: "Amount Spent On",
        data: [21, 50,149],
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)"
        ],
        borderColor: [
          "rgb(255, 99, 132)"
        ],
        borderWidth: 1,
      },
    ],
  };

  const handleResetTransactions = async () => {
    try {
      await clearAllTransactions();
      setTransactions([]);
      setAmount(0);
      alert("All transactions cleared!");
    } catch (err) {
      console.error("Reset failed:", err);
    }
  };

  const checkLimit=()=>{
    if(amount>=limit){
      new Notification("💰 Limit Exhausted!", { 
        body: `You glutton! Spent mostly on Zomato.` 
      });
    }
  }

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
      <button
        onClick={handleResetTransactions}
        className="bg-red-500   text-white p-2 rounded "
      >
        Reset All Data
      </button>
      </div>

      <div className="w-full flex flex-col justify-center items-center gap-30">
        <div className=" md:w-[60%] sm:w-[80%] lg:w-[36%] ">
          <Doughnut
            data={donutData}
            ref={donutChartRef}
            options={{ responsive: true }}
          />
        </div>
        <div className=" pb-36 md:w-[60%] sm:w-[80%] lg:w-[36%]  ">
          <p className=" sm:text-2xl lg:text-4xl pb-20">
            Your spending based on Categories
          </p>
          <Bar
            data={barData}
            ref={barChartRef}
            options={{ responsive: true }}
          />
        </div>
      </div>
      
    </div>
  );
}

export default Home;
