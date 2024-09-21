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

const contactLinks = document.querySelectorAll(".contact-link");

contactLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    link.classList.toggle("active");
  });
});

// floating window

// const tooltip = document.getElementById("tooltip");
// const universities = document.querySelectorAll(".education_university");

// universities.forEach((university) => {
//   university.addEventListener("mouseenter", function (event) {
//     const tooltipText = this.getAttribute("data-tooltip");
//     tooltip.innerText = tooltipText;
//     tooltip.style.display = "block";
//     positionTooltip(event);
//   });

//   university.addEventListener("mousemove", function (event) {
//     positionTooltip(event);
//   });

//   university.addEventListener("mouseleave", function () {
//     tooltip.style.display = "none";
//   });
// });

// function positionTooltip(event) {
//   const padding = 10; // Відстань між мишкою та верхнім краєм тултіпа
//   const offsetRight = 20; // Відстань зміщення вправо
//   tooltip.style.left = `${event.pageX + offsetRight}px`;
//   tooltip.style.top = `${event.pageY - tooltip.offsetHeight - padding}px`;
// }

document.querySelectorAll(".skills_name").forEach((item) => {
  item.addEventListener("mouseenter", async (event) => {
    const word = event.target.textContent.toLowerCase();
    const tooltip = document.getElementById("tooltip");

    // Вебзапит для отримання опису
    try {
      // const response = await fetch(
      //   `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
      // );
      const response = await fetch(`https://en.wikipedia.org/w/api.php${word}`);
      const data = await response.json();

      if (
        data &&
        data[0] &&
        data[0].meanings[0] &&
        data[0].meanings[0].definitions[0]
      ) {
        const description = data[0].meanings[0].definitions[0].definition;
        tooltip.textContent = description;
      } else {
        tooltip.textContent = "Опис недоступний";
      }

      tooltip.style.left = `${event.pageX + 10}px`;
      tooltip.style.top = `${event.pageY + 10}px`;
      tooltip.style.display = "block";
    } catch (error) {
      console.error("Error fetching description:", error);
      tooltip.textContent = "Не вдалося отримати опис";
      tooltip.style.display = "block";
    }
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
