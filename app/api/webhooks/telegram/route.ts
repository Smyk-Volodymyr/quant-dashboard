import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    // 💡 ПЕРЕНЕСЕНО СЮДИ: Тепер клієнт створюється лише під час реального запиту
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    const body = await req.json();

    if (!body.message || !body.message.text) {
      return NextResponse.json({ status: 'ignored' });
    }

    const { text, chat } = body.message;
    const chatId = chat.id.toString();

    if (text.startsWith('/start ')) {
      const userId = text.split(' ')[1];
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      if (uuidRegex.test(userId)) {
        const { error } = await supabaseAdmin
          .from('user_profiles')
          .update({ telegram_chat_id: chatId })
          .eq('user_id', userId);

        if (error) {
          console.error('Помилка оновлення БД:', error);
          await sendTelegramMessage(chatId, "❌ Помилка прив'язки акаунта. Зверніться до підтримки.");
        } else {
          await sendTelegramMessage(chatId, "✅ Акаунт успішно прив'язано! Тепер ви будете отримувати сповіщення про свої угоди сюди.");
        }
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

async function sendTelegramMessage(chatId: string, text: string) {
  const token = process.env.TELEGRAM_TOKEN;
  if (!token) return;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}