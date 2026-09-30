import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

import Gallery from "@/models/Gallery";
import Booking from "@/models/Booking";
import Quote from "@/models/Quote";
import Blog from "@/models/Blog";
import Staff from "@/models/Staff";
import Client from "@/models/Client";

export async function GET() {
  try {
    await connectDB();

    const [
      gallery,
      bookings,
      quotes,
      blogs,
      staffs,
      clients,
    ] = await Promise.all([
      Gallery.countDocuments(),
      Booking.countDocuments(),
      Quote.countDocuments(),
      Blog.countDocuments(),
      Staff.countDocuments(),
      Client.countDocuments(),
    ]);

    return NextResponse.json({
      bookings,
      quotes,
      blogs,
      staffs,
      client: clients,
      gallery,
      events: gallery,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error.message,
      },
      { status: 500 }
    );
  }
}