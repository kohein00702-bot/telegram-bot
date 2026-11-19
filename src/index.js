
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      return new Response("Ko Hein Telegram AI Bot is running!");
    }

    if (url.pathname === "/webhook" && request.method === "POST") {
      const update = await request.json();
      const message = update.message;

      if (!message || !message.text) {
        return new Response("OK");
      }

      const chatId = message.chat.id;
      const text = message.text;

      const ai = await env.AI.run(
        "@cf/meta/llama-3.1-8b-instruct",
        {
          messages: [
            {
              role: "system",
              content: "You are a helpful AI assistant. Reply naturally in the user's language."
            },
            {
              role: "user",
              content: text
            }
          ]
        }
      );

      const reply = ai.response || "Sorry, please try again.";

      await fetch(
        `https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: reply
          })
        }
      );

      return new Response("OK");
    }

    return new Response("Not found", { status: 404 });
  }
};
