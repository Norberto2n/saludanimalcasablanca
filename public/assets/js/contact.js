document.addEventListener("DOMContentLoaded", function () {

  const form = document.getElementById("contactForm");
  const responseBox = document.getElementById("form-response");
  const timeField = document.getElementById("form_time");
  const submitBtn = form ? form.querySelector('button[type="submit"]') : null;

  if (!form || !responseBox) return;

  if (timeField) {
    timeField.value = Math.floor(Date.now() / 1000);
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.dataset.originalText = submitBtn.textContent;
      submitBtn.textContent = "Enviando...";
    }

    responseBox.textContent = "Enviando...";
    responseBox.className = "form-response show";

    const formData = new FormData(form);

    try {
      const res = await fetch(form.action, {
        method: "POST",
        body: formData
      });

      let data;

      try {
        data = await res.json();
      } catch {
        throw new Error("Respuesta no válida del servidor");
      }

      if (res.ok && data.ok) {
        responseBox.textContent = "✔ Mensaje enviado correctamente";
        responseBox.className = "form-response show success";

        form.reset();

        if (timeField) {
          timeField.value = Math.floor(Date.now() / 1000);
        }
      } else {
        responseBox.textContent = data.message || "Error al enviar el mensaje";
        responseBox.className = "form-response show error";
      }

    } catch (error) {
      responseBox.textContent = "Error de conexión. Inténtalo de nuevo.";
      responseBox.className = "form-response show error";
    }

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = submitBtn.dataset.originalText || "Enviar mensaje";
    }

    setTimeout(() => {
      responseBox.className = "form-response";
      responseBox.textContent = "";
    }, 5000);
  });

});