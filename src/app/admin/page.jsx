"use client";

import { useEffect, useState } from "react";
import DashboardStats from "@/components/admin/DashboardStats";
import DashboardCharts from "@/components/admin/DashboardCharts";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    bookings: 0,
    quotes: 0,
    blogs: 0,
    staffs: 0,
    client: 0,
    gallery: 0,
    events: 0,
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/dashboard");

      const data = await res.json();

      console.log("API DATA:", data);

      setStats(data);
    } catch (error) {
      console.error(error);
    }
  };

  console.log("CURRENT STATS:", stats);

  return (
    <>
      <DashboardStats stats={stats} />
      <DashboardCharts stats={stats} />
    </>
  );
}