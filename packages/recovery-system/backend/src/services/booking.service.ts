import Booking, { IBooking } from '../models/Booking';
import { CounselorService } from './counselor.service';
import User from '../models/User';

export class BookingService {
  private static getBookingPopulate() {
    return [
      {
        path: 'counselorId',
        select: 'bio rating totalSessions hourlyRate profileImage specializations',
        populate: {
          path: 'userId',
          select: 'name email image',
        },
      },
      {
        path: 'userId',
        select: 'name email',
      },
    ];
  }

  /**
   * Create a new booking
   */
  static async createBooking(data: {
    userId: string;
    counselorId: string;
    slotStart: Date;
    slotEnd: Date;
    fee: number;
    contactEmail?: string;
    notes?: string;
  }): Promise<IBooking> {
    // Validate slot is available
    const isAvailable = await CounselorService.isSlotAvailable(
      data.counselorId,
      data.slotStart,
      data.slotEnd
    );

    if (!isAvailable) {
      throw { status: 409, message: 'Selected slot is not available' };
    }

    // Check slot is in the future
    if (new Date() > data.slotStart) {
      throw { status: 400, message: 'Cannot book a slot in the past' };
    }

    // Verify user exists
    const user = await User.findById(data.userId);
    if (!user) {
      throw { status: 404, message: 'User not found' };
    }

    // Mark slot as booked
    await CounselorService.markSlotAsBooked(
      data.counselorId,
      data.slotStart,
      data.slotEnd
    );

    // Create booking
    const booking = new Booking({
      userId: data.userId,
      counselorId: data.counselorId,
      slotStart: data.slotStart,
      slotEnd: data.slotEnd,
      fee: data.fee,
      contactEmail: data.contactEmail,
      notes: data.notes,
      status: 'confirmed',
    });

    await booking.save();
    const populated = await Booking.findById(booking._id).populate(this.getBookingPopulate());
    return populated || booking;
  }

  /**
   * Get all bookings for a user
   */
  static async getUserBookings(userId: string) {
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      throw { status: 400, message: 'Invalid user ID format' };
    }

    const bookings = await Booking.find({ userId })
      .sort({ createdAt: -1 })
      .populate(this.getBookingPopulate());

    return bookings;
  }

  /**
   * Get a single booking by ID
   */
  static async getBookingById(bookingId: string, userId?: string) {
    if (!bookingId.match(/^[0-9a-fA-F]{24}$/)) {
      throw { status: 400, message: 'Invalid booking ID format' };
    }

    // First, find the booking regardless of ownership
    const booking = await Booking.findOne({ _id: bookingId })
      .populate(this.getBookingPopulate());

    if (!booking) {
      throw { status: 404, message: 'Booking not found' };
    }

    // Then check ownership if userId is provided
    if (userId && booking.userId._id.toString() !== userId) {
      throw { status: 403, message: 'You can only view your own bookings' };
    }

    return booking;
  }

  /**
   * Cancel a booking
   */
  static async cancelBooking(
    bookingId: string,
    userId: string,
    cancellationReason?: string
  ): Promise<IBooking> {
    if (!bookingId.match(/^[0-9a-fA-F]{24}$/)) {
      throw { status: 400, message: 'Invalid booking ID format' };
    }

    // First find the booking regardless of ownership (without populating)
    const booking = await Booking.findOne({ _id: bookingId });

    if (!booking) {
      throw { status: 404, message: 'Booking not found' };
    }

    // Check ownership
    if (booking.userId.toString() !== userId) {
      throw { status: 403, message: 'You can only cancel your own bookings' };
    }

    if (booking.status === 'cancelled') {
      throw { status: 400, message: 'Booking is already cancelled' };
    }

    // Free up the slot using the raw counselorId
    await CounselorService.markSlotAsAvailable(
      booking.counselorId.toString(),
      booking.slotStart,
      booking.slotEnd
    );

    // Update booking status
    booking.status = 'cancelled';
    booking.cancellationReason = cancellationReason;
    await booking.save();

    // Return populated version for response
    const populatedBooking = await Booking.findById(bookingId)
      .populate(this.getBookingPopulate());

    return populatedBooking!;
  }

  /**
   * Reschedule a booking to another free slot
   */
  static async rescheduleBooking(
    bookingId: string,
    userId: string,
    slotStart: Date,
    slotEnd: Date
  ): Promise<IBooking> {
    if (!bookingId.match(/^[0-9a-fA-F]{24}$/)) {
      throw { status: 400, message: 'Invalid booking ID format' };
    }

    const booking = await Booking.findOne({ _id: bookingId });
    if (!booking) {
      throw { status: 404, message: 'Booking not found' };
    }

    if (booking.userId.toString() !== userId) {
      throw { status: 403, message: 'You can only reschedule your own bookings' };
    }

    if (booking.status !== 'confirmed') {
      throw { status: 400, message: 'Only confirmed bookings can be rescheduled' };
    }

    if (new Date() > slotStart) {
      throw { status: 400, message: 'Cannot reschedule to a past slot' };
    }

    const isDifferentSlot =
      booking.slotStart.getTime() !== slotStart.getTime() ||
      booking.slotEnd.getTime() !== slotEnd.getTime();
    if (!isDifferentSlot) {
      throw { status: 400, message: 'New slot must be different from the current slot' };
    }

    const isAvailable = await CounselorService.isSlotAvailable(
      booking.counselorId.toString(),
      slotStart,
      slotEnd
    );
    if (!isAvailable) {
      throw { status: 409, message: 'Selected slot is not available' };
    }

    await CounselorService.markSlotAsBooked(
      booking.counselorId.toString(),
      slotStart,
      slotEnd
    );

    await CounselorService.markSlotAsAvailable(
      booking.counselorId.toString(),
      booking.slotStart,
      booking.slotEnd
    );

    booking.slotStart = slotStart;
    booking.slotEnd = slotEnd;
    await booking.save();

    const populatedBooking = await Booking.findById(bookingId)
      .populate(this.getBookingPopulate());

    return populatedBooking!;
  }

  /**
   * Get counselor's bookings
   */
  static async getCounselorBookings(
    counselorId: string,
    status?: string
  ) {
    if (!counselorId.match(/^[0-9a-fA-F]{24}$/)) {
      throw { status: 400, message: 'Invalid counselor ID format' };
    }

    const query: any = { counselorId };
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .sort({ slotStart: 1 })
      .populate('userId', 'name email');

    return bookings;
  }
}
