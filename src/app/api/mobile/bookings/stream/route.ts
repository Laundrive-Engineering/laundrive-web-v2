import { NextResponse } from 'next/server';
import { getBookings, bookingEvents } from '../../../../../utils/bookingsDb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json(
        { success: false, error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        // 1. Send initial customer bookings list immediately
        const sendUpdate = () => {
          try {
            const bookings = getBookings().filter((b) => b.customerId === customerId);
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(bookings)}\n\n`));
          } catch (e) {
            // handle enqueue errors if controller closed
          }
        };

        sendUpdate();

        // 2. Listen for database changes
        const changeListener = () => {
          sendUpdate();
        };

        bookingEvents.on('changed', changeListener);

        // 3. Clean up listener on cancellation
        request.signal.addEventListener('abort', () => {
          bookingEvents.off('changed', changeListener);
          try {
            controller.close();
          } catch (e) {}
        });
      },
      cancel() {
        // Fallback cleanup if cancel is called on the stream object
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
