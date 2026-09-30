import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Gallery from "@/models/Gallery";
import cloudinary from "@/lib/cloudinary";
import streamifier from "streamifier";

// ======================
// GET ALL EVENTS
// ======================

export async function GET() {
  try {
    await connectDB();

    const events = await Gallery.find()
      .sort({ createdAt: -1 });

    return NextResponse.json(events);

  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

// ======================
// CREATE EVENT
// ======================

export async function POST(req) {
  try {
    await connectDB();

    const formData = await req.formData();

    const title = formData.get("title");
    const category = formData.get("category");

    const coverImage = formData.get("coverImage");

    const images = formData.getAll("images");

    if (!title || !category) {
      return NextResponse.json(
        {
          message: "Title and category required",
        },
        { status: 400 }
      );
    }

    if (!coverImage) {
      return NextResponse.json(
        {
          message: "Cover image required",
        },
        { status: 400 }
      );
    }

    if (!images.length) {
      return NextResponse.json(
        {
          message: "Gallery images required",
        },
        { status: 400 }
      );
    }

    // ======================
    // UPLOAD COVER IMAGE
    // ======================

    const coverBuffer = Buffer.from(
      await coverImage.arrayBuffer()
    );

    const uploadedCover =
      await new Promise((resolve, reject) => {

        const uploadStream =
          cloudinary.uploader.upload_stream(
            {
              folder: "gallery-cover",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

        streamifier
          .createReadStream(coverBuffer)
          .pipe(uploadStream);

      });

    // ======================
    // UPLOAD EVENT IMAGES
    // ======================

    const uploadedImages = [];

    for (const file of images) {

      const buffer = Buffer.from(
        await file.arrayBuffer()
      );

      const uploaded =
        await new Promise((resolve, reject) => {

          const uploadStream =
            cloudinary.uploader.upload_stream(
              {
                folder: "gallery-events",
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            );

          streamifier
            .createReadStream(buffer)
            .pipe(uploadStream);

        });

      uploadedImages.push({
        url: uploaded.secure_url,
        public_id: uploaded.public_id,
      });
    }

    // ======================
    // SAVE EVENT
    // ======================

    const event = await Gallery.create({
      title,
      category,

      coverImage: {
        url: uploadedCover.secure_url,
        public_id: uploadedCover.public_id,
      },

      images: uploadedImages,
    });

    return NextResponse.json(
      event,
      { status: 201 }
    );

  } catch (error) {

    return NextResponse.json(
      {
        message: error.message,
      },
      { status: 500 }
    );

  }
}

// ======================
// DELETE EVENT
// ======================

export async function DELETE(req) {
  try {
    await connectDB();

    const { searchParams } =
      new URL(req.url);

    const id =
      searchParams.get("id");

    const event =
      await Gallery.findById(id);

    if (!event) {
      return NextResponse.json(
        {
          message: "Event not found",
        },
        { status: 404 }
      );
    }

    // DELETE COVER IMAGE

    if (
      event.coverImage &&
      event.coverImage.public_id
    ) {
      await cloudinary.uploader.destroy(
        event.coverImage.public_id
      );
    }

    // DELETE EVENT IMAGES

    for (const image of event.images) {

      if (image.public_id) {

        await cloudinary.uploader.destroy(
          image.public_id
        );

      }
    }

    await Gallery.findByIdAndDelete(id);

    return NextResponse.json({
      message: "Event deleted successfully",
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