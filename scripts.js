// анімація друку тексту

function typeEffect(element, text, speed) {
  let index = 0;
  element.innerHTML = ""; // Очищаємо існуючий текст перед початком анімації

  function type() {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
      setTimeout(type, speed);
    }
  }

  type();
}

function repeatTypeEffect(element, text, speed, interval) {
  typeEffect(element, text, speed);

  // Повторюємо ефект друкування через заданий інтервал
  setInterval(() => {
    typeEffect(element, text, speed);
  }, interval);
}

// Знаходимо усі елементи з класом 'title'
const titleElements = document.querySelectorAll(".title");

// Застосовуємо ефект друкування до кожного з них
titleElements.forEach((element) => {
  repeatTypeEffect(element, element.textContent, 150, 5000); // 5 секунд між повтореннями
});

function handleLinkClick(event, url) {
  event.preventDefault(); // Попереджаємо базову поведінку посилання
  // window.location.href = url; // Переходимо за вказаною URL-адресою
  window.open(url, "_blank"); // Відкриваємо URL у новому вікні
}

// hidden sontacs

// const contactLinks = document.querySelectorAll(".contact-link");

// contactLinks.forEach((link) => {
//   link.addEventListener("click", (event) => {
//     event.preventDefault();
//     link.classList.toggle("active");
//   });
// });

//запити

document
  .querySelectorAll(
    ".skills_name, .sidebar_title_tech_subspecies, .sidebar_title_tech, .title"
  )
  .forEach((item) => {
    item.addEventListener("mouseenter", async (event) => {
      const words = event.target.textContent.trim().split(" ");
      const tooltip = document.getElementById("tooltip");

      let descriptions = [];

      // Виконання запитів до API для кожного слова
      for (const word of words) {
        let url = "https://en.wikipedia.org/w/api.php";
        let params = {
          action: "query",
          format: "json",
          titles: word,
          prop: "extracts",
          exintro: true,
          explaintext: true,
          origin: "*",
        };

        url += "?origin=*";
        Object.keys(params).forEach((key) => {
          url += "&" + key + "=" + encodeURIComponent(params[key]);
        });

        try {
          const response = await fetch(url);
          const data = await response.json();
          const pages = data.query.pages;
          const firstPage = Object.values(pages)[0];

          if (firstPage && firstPage.extract) {
            descriptions.push(firstPage.extract);
          } else {
            descriptions.push("...");
          }
        } catch (error) {
          console.error("Error getting description:", error);
          descriptions.push("Failed to get description");
        }
      }

      // Об'єднання описів у єдиний текст
      const combinedDescription = descriptions.join("\n ### \n");
      tooltip.textContent = combinedDescription;

      tooltip.style.left = `${event.pageX + 10}px`;
      tooltip.style.top = `${event.pageY + 10}px`;
      tooltip.style.display = "block";
    });

    item.addEventListener("mouseleave", () => {
      const tooltip = document.getElementById("tooltip");
      tooltip.style.display = "none";
    });
  });

// iframe with a preview
const preview = document.getElementById("preview");
const container = document.getElementById("link-container");
const iframe = preview.querySelector("iframe");

container.addEventListener("mouseover", function (event) {
  if (
    event.target.tagName === "A" &&
    event.target.classList.contains("project")
  ) {
    const rect = event.target.getBoundingClientRect();
    preview.style.top = `${window.scrollY + rect.bottom}px`;
    preview.style.left = `${
      window.scrollX + (rect.left + rect.right) / 2 - preview.offsetWidth / 2
    }px`;
    iframe.src = event.target.href;
    preview.style.display = "block";
  }
});

container.addEventListener("mouseout", function (event) {
  if (
    event.target.tagName === "A" &&
    event.target.classList.contains("project")
  ) {
    preview.style.display = "none";
  }
});

document.querySelectorAll(".preview-btn").forEach((button) => {
  button.addEventListener("click", function (event) {
    event.preventDefault();
    const url = button.getAttribute("data-href");
    iframe.src = url;
    preview.style.display = "block";
  });
});

function closePreview() {
  preview.style.display = "none";
  iframe.src = ""; // очищуємо src, щоб зупинити завантаження, якщо потрібно
}

// Опис:
// Подія 'mouseover': Додаємо обробник подій до батьківського контейнера (hover-container), який перевіряє, чи подія виникла над одним з посилань з класом project.
// Відображення попереднього перегляду: Встановлюється src для iframe в базі в href відповідного посилання.
// Приховування попереднього перегляду: Використовується mouseout для приховування div з попереднім переглядом, коли курсор забирається з посилання.
// Цей підхід допомагає ефективно керувати великою кількістю посилань, зменшуючи необхідність дублювання коду і підвищуючи продуктивність.
