import { NextResponse } from 'next/server';
import { getBookings, bookingEvents } from '../../../../../../utils/bookingsDb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');
    const riderCodeParam = searchParams.get('riderCode');

    if (statusParam !== 'available' && !riderCodeParam) {
      return NextResponse.json(
        { success: false, error: 'Query parameters status=available or riderCode are required' },
        { status: 400 }
      );
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        const sendUpdate = () => {
          try {
            const bookings = getBookings();
            let filtered = bookings;

            if (statusParam === 'available') {
              filtered = bookings.filter(
                (b) => (b.status === 'Pending' || b.status === 'Delivering') && !b.riderCode
              );
            } else if (riderCodeParam) {
              filtered = bookings.filter((b) => b.riderCode === riderCodeParam);
            }

            controller.enqueue(encoder.encode(`data: ${JSON.stringify(filtered)}\n\n`));
          } catch (e) {
            // handle error if controller is closed
          }
        };

        // Send initial list immediately
        sendUpdate();

        // Listen for updates
        const changeListener = () => {
          sendUpdate();
        };

        bookingEvents.on('changed', changeListener);

        // Cleanup on abort
        request.signal.addEventListener('abort', () => {
          bookingEvents.off('changed', changeListener);
          try {
            controller.close();
          } catch (e) {}
        });
      },
      cancel() {}
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
