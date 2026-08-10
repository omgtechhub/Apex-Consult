import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bookings } from "@/db/schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, service, date, time, level, notes } = body;

    if (!name || !email || !phone || !service || !date || !time) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const [booking] = await db
      .insert(bookings)
      .values({
        clientName: name,
        clientEmail: email,
        clientPhone: phone,
        service,
        date,
        time,
        notes: notes ? `Level: ${level || "Not specified"}\n\n${notes}` : `Level: ${level || "Not specified"}`,
        status: "pending",
        paymentStatus: "unpaid",
      })
      .returning();

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        service: booking.service,
        date: booking.date,
        time: booking.time,
      },
    });
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const allBookings = await db.select().from(bookings);
    return NextResponse.json({ bookings: allBookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}
