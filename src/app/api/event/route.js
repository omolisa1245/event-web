import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";
import cloudinary from "@/lib/cloudinary";
import streamifier from "streamifier";

// GET ALL EVENTS
// GET ALL EVENTS
export async function GET() {
  try {
    console.log("GET /api/event started");

    await connectDB();
    console.log("MongoDB connected");

    const events = await Event.find().sort({ createdAt: -1 });
    console.log("Events fetched:", events.length);

    return NextResponse.json(events);
  } catch (error) {
    console.error("GET /api/event ERROR:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch events",
      },
      { status: 500 }
    );
  }
}


// CREATE EVENT
export async function POST(req) {
  try {
    await connectDB();

    const formData = await req.formData();

    const title = formData.get("title");
    const location = formData.get("location");
    const date = formData.get("date");
    const endDate = formData.get("endDate");
    const file = formData.get("image");

    if (!file) {
      return NextResponse.json(
        { message: "Image required" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(
      await file.arrayBuffer()
    );

    const uploadImage = () =>
      new Promise((resolve, reject) => {
        const stream =
          cloudinary.uploader.upload_stream(
            { folder: "events" },
            (err, result) => {
              if (err) reject(err);
              else resolve(result);
            }
          );

        streamifier
          .createReadStream(buffer)
          .pipe(stream);
      });

    const result = await uploadImage();

    const event = await Event.create({
      title,
      location,
      date,
      endDate,
      imageUrl: result.secure_url,
      public_id: result.public_id,
    });

    return NextResponse.json(
      event,
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}



// DELETE EVENT
export async function DELETE(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    const event = await Event.findById(id);

    if (!event) {
      return NextResponse.json(
        { message: "Not found" },
        { status: 404 }
      );
    }

    await cloudinary.uploader.destroy(event.public_id);

    await Event.findByIdAndDelete(id);

    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}