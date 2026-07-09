

exports.handler = async function (event, context) {
  // Configurar cabeceras CORS para evitar bloqueos de seguridad
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    // 1. Validar que la petición sea POST
    if (event.httpMethod !== "POST") {
      return { 
        statusCode: 405, 
        headers, 
        body: JSON.stringify({ error: "Método no permitido" }) 
      };
    }

    // 2. Extraer el historial enviado por el index.html
    const { historialChat } = JSON.parse(event.body);

    // 3. Llamar a OpenRouter usando Llama 3.1 (Más estable)
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://tu-sitio-escape.netlify.app", // Opcional para OpenRouter
      },
      body: JSON.stringify({
       model: "google/gemma-2-9b-it:free",
        messages: historialChat,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error en OpenRouter: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // 4. Devolver la respuesta exitosa al juego
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data),
    };

  } catch (error) {
    console.error("Error en la función serverless:", error);
    
    // Cambiamos el mensaje de error para que no rompa la magia si algo falla
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        choices: [{
          message: {
            content: "🤖 *Interferencia temporal en el Templo...* La conexión con el Profesor se ha pixelado debido al campo magnético. ¡Vuelve a intentarlo en unos segundos!"
          }
        }]
      }),
    };
  }
};
