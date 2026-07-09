export default async (request, context) => {
  try {
    // 1. Validar que sea una petición POST válida
    if (request.method !== "POST") {
      return new Response("Método no permitido", { status: 405 });
    }

    // 2. Extraer el historial enviado desde el HTML
    const { historialChat } = await request.json();

    // 3. Tomar la API Key de las variables de entorno de Netlify
    const API_KEY = process.env.OPENROUTER_API_KEY;

    // 4. Hacer la llamada real y segura hacia OpenRouter
    const respuestaOpenRouter = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "meta-llama/llama-3-8b-instruct:free", // Mismo modelo gratuito que usabas
        "messages": historialChat
      })
    });

    const data = await respuestaOpenRouter.json();
    
    // 5. Retornar la respuesta al navegador del alumno de forma transparente
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 
        "Content-Type": "application/json" 
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};