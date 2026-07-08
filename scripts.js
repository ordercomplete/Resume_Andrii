/**
 * scripts.js - JavaScript functionality for resume page
 * Includes: typing animation, contact link handling, Wikipedia tooltips, project preview
 */

/**
 * Typing effect animation - simulates typing text character by character
 * @param {HTMLElement} element - The element to apply the effect to
 * @param {string} text - The text to type
 * @param {number} speed - Typing speed in milliseconds per character
 */
function typeEffect(element, text, speed) {
  let index = 0;
  element.innerHTML = "";

  function type() {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
      setTimeout(type, speed);
    }
  }

  type();
}

/**
 * Repeats the typing effect at specified intervals
 * @param {HTMLElement} element - The element to apply the effect to
 * @param {string} text - The text to type
 * @param {number} speed - Typing speed in milliseconds
 * @param {number} interval - Interval between repeats in milliseconds
 */
function repeatTypeEffect(element, text, speed, interval) {
  typeEffect(element, text, speed);
  setInterval(() => {
    typeEffect(element, text, speed);
  }, interval);
}

/* Detect browser language and fallback to English */
function detectBrowserLanguage() {
  const lang = navigator.language || navigator.userLanguage;
  if (lang && lang.toLowerCase().startsWith("uk")) {
    return "uk";
  }
  return "en";
}

// Apply typing animation to all title elements
const titleElements = document.querySelectorAll(".title");
titleElements.forEach((element) => {
  repeatTypeEffect(element, element.textContent, 150, 5000);
});

/**
 * Handles click on contact links - opens URL in new tab
 * @param {Event} event - Click event
 * @param {string} url - URL to open
 */
function handleLinkClick(event, url) {
  event.preventDefault();
  window.open(url, "_blank");
}

// Contact link active state toggle
const contactLinks = document.querySelectorAll(".contact-link");
contactLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    link.classList.toggle("active");
  });
});

/**
 * Wikipedia API tooltip - fetches descriptions for skills/technologies
 * Displays tooltip on mouseenter with Wikipedia extract for each word
 */

// Timer ID for delaying tooltip show
let tooltipTimer = null;

// Tooltip delay in milliseconds
const TOOLTIP_DELAY = 300;

// Wikipedia API timeout in milliseconds
const WIKIPEDIA_TIMEOUT = 5000;

// Load dictionary from external JSON file
let localDictionary = {};

fetch("dictionary.json")
  .then((response) => response.json())
  .then((data) => {
    localDictionary = data;
    console.log("Dictionary loaded successfully");
  })
  .catch((error) => {
    console.error("Error loading dictionary:", error);
    // Fallback to empty dictionary if fetch fails
    localDictionary = {};
  });

document
  .querySelectorAll(
    ".skills_name, .sidebar_title_tech_subspecies, .sidebar_title_tech, .title",
  )
  .forEach((item) => {
    item.addEventListener("mouseenter", async (event) => {
      // Clear any existing timer
      if (tooltipTimer !== null) {
        clearTimeout(tooltipTimer);
        tooltipTimer = null;
      }

      // Set new timer to show tooltip after delay
      tooltipTimer = setTimeout(async () => {
        const text = event.target.textContent.trim();
        if (!text) return;

        const tooltip = document.getElementById("tooltip");
        const lowerText = text.toLowerCase();

        // Check local dictionary first (case-insensitive)
        if (localDictionary[lowerText]) {
          tooltip.textContent = localDictionary[lowerText];
          positionTooltip(tooltip, event);
          tooltip.classList.add("show");
          tooltip.style.display = "block";
          return;
        }

        // Check for composite terms (e.g., "Trello (Agile, Scrum, Lean)")
        const compositeKey = lowerText
          .replace(/[()]/g, "")
          .replace(/\s+/g, " ")
          .trim();
        if (localDictionary[compositeKey]) {
          tooltip.textContent = localDictionary[compositeKey];
          positionTooltip(tooltip, event);
          tooltip.classList.add("show");
          tooltip.style.display = "block";
          return;
        }

        // If not in dictionary, try Wikipedia with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(
          () => controller.abort(),
          WIKIPEDIA_TIMEOUT,
        );

        try {
          const words = text.split(" ");
          const descriptions = [];

          for (const word of words) {
            const wordLower = word.toLowerCase();
            // Check dictionary for each word too
            if (localDictionary[wordLower]) {
              descriptions.push(localDictionary[wordLower]);
              continue;
            }

            const url = "https://en.wikipedia.org/w/api.php";
            const params = {
              action: "query",
              format: "json",
              titles: word,
              prop: "extracts",
              exintro: true,
              explaintext: true,
              origin: "*",
            };

            const queryString = new URLSearchParams(params).toString();
            const fullUrl = `${url}?${queryString}`;

            try {
              const response = await fetch(fullUrl, {
                signal: controller.signal,
              });
              if (!response.ok)
                throw new Error(`HTTP error! status: ${response.status}`);
              const data = await response.json();
              const pages = data.query.pages;
              const firstPage = Object.values(pages)[0];

              if (firstPage && firstPage.extract) {
                descriptions.push(firstPage.extract);
              } else {
                descriptions.push("...");
              }
            } catch (error) {
              if (error.name === "AbortError") {
                descriptions.push("...");
              } else {
                console.error("Error getting description:", error);
                descriptions.push("Failed to get description");
              }
            }
          }

          tooltip.textContent = descriptions.join("\n ### \n");
          positionTooltip(tooltip, event);
          tooltip.classList.add("show");
          tooltip.style.display = "block";
        } finally {
          clearTimeout(timeoutId);
        }
      }, TOOLTIP_DELAY);
    });

    item.addEventListener("mouseleave", () => {
      // Clear timer on mouse leave
      if (tooltipTimer !== null) {
        clearTimeout(tooltipTimer);
        tooltipTimer = null;
      }
      const tooltip = document.getElementById("tooltip");
      tooltip.style.display = "none";
      tooltip.classList.remove("show");
    });
  });

/**
 * Positions the tooltip relative to the mouse event, ensuring it stays within viewport
 * @param {HTMLElement} tooltip - The tooltip element
 * @param {Event} event - The mouse event
 */
function positionTooltip(tooltip, event) {
  const tooltipWidth = tooltip.offsetWidth;
  const tooltipHeight = tooltip.offsetHeight;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let left = event.pageX + 10;
  let top = event.pageY + 10;

  // Check if tooltip would go off right edge
  if (left + tooltipWidth > viewportWidth) {
    left = event.pageX - tooltipWidth - 10;
  }

  // Check if tooltip would go off bottom edge
  if (top + tooltipHeight > viewportHeight) {
    top = event.pageY - tooltipHeight - 10;
  }

  // Ensure tooltip doesn't go off top or left edge
  if (left < 0) left = 10;
  if (top < 0) top = 10;

  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
}

// Project preview modal functionality
const preview = document.getElementById("preview");
const container = document.getElementById("link-container");
const iframe = preview.querySelector("iframe");

/**
 * Shows preview iframe on mouseover of project links
 */
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

/**
 * Hides preview iframe on mouseout from project links
 */
container.addEventListener("mouseout", function (event) {
  if (
    event.target.tagName === "A" &&
    event.target.classList.contains("project")
  ) {
    preview.style.display = "none";
  }
});

// Preview button click handler
document.querySelectorAll(".preview-btn").forEach((button) => {
  button.addEventListener("click", function (event) {
    event.preventDefault();
    const url = button.getAttribute("data-href");
    iframe.src = url;
    preview.style.display = "block";
  });
});

// --- Language Switching Logic ---

let currentLanguageData = {}; // To store the currently loaded language data

// Function to fetch language data and update the UI
async function setLanguage(lang) {
  const langFile = lang === "uk" ? "uk.json" : "en.json";
  try {
    const response = await fetch(langFile);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    currentLanguageData = await response.json();
    console.log(`Language set to: ${lang}`);

    // Update HTML lang attribute
    document.documentElement.lang = lang;

    // Update text content for all translatable elements
    document.getElementById("about_text").textContent =
      currentLanguageData.about_text;
    document.getElementById("about_sidebar_text").textContent =
      currentLanguageData.about_text;
    document.getElementById("project_1_description").textContent =
      currentLanguageData.project_1_description;
    document.getElementById("project_2_description").textContent =
      currentLanguageData.project_2_description;
    document.getElementById("project_3_description").textContent =
      currentLanguageData.project_3_description;
    document.getElementById("project_4_description").textContent =
      currentLanguageData.project_4_description;

    document.getElementById("work_experience_company_1_task_1").textContent =
      currentLanguageData.work_experience_company_1_task_1;
    document.getElementById("work_experience_company_1_task_2").textContent =
      currentLanguageData.work_experience_company_1_task_2;
    document.getElementById("work_experience_company_1_task_3").textContent =
      currentLanguageData.work_experience_company_1_task_3;
    document.getElementById("work_experience_company_1_task_4").textContent =
      currentLanguageData.work_experience_company_1_task_4;

    document.getElementById("work_experience_company_2_task_1").textContent =
      currentLanguageData.work_experience_company_2_task_1;
    document.getElementById("work_experience_company_2_task_2").textContent =
      currentLanguageData.work_experience_company_2_task_2;
    document.getElementById("work_experience_company_2_task_3").textContent =
      currentLanguageData.work_experience_company_2_task_3;

    document.getElementById("work_experience_company_3_task_1").textContent =
      currentLanguageData.work_experience_company_3_task_1;
    document.getElementById("work_experience_company_3_task_2").textContent =
      currentLanguageData.work_experience_company_3_task_2;
    document.getElementById("work_experience_company_3_task_3").textContent =
      currentLanguageData.work_experience_company_3_task_3;

    document.getElementById("work_experience_company_4_task_1").textContent =
      currentLanguageData.work_experience_company_4_task_1;

    document.getElementById("education_institution_1_direction").textContent =
      currentLanguageData.education_institution_1_direction;
    document.getElementById("education_institution_2_direction").textContent =
      currentLanguageData.education_institution_2_direction;
    document.getElementById("education_institution_3_direction").textContent =
      currentLanguageData.education_institution_3_direction;

    // Save language preference to localStorage
    localStorage.setItem("preferredLanguage", lang);
    if (enBtn) enBtn.classList.toggle("active-lang", lang === "en");
    if (ukBtn) ukBtn.classList.toggle("active-lang", lang === "uk");
  } catch (error) {
    console.error(`Error loading language file ${langFile}:`, error);
    // Optionally, revert to a default language or show an error message
  }
}

// Get references to language buttons
const enBtn = document.getElementById("en-btn");
const ukBtn = document.getElementById("uk-btn");

// Add event listeners to language buttons
if (enBtn && ukBtn) {
  enBtn.addEventListener("click", () => setLanguage("en"));
  ukBtn.addEventListener("click", () => setLanguage("uk"));
}

// Initial language load on page load
document.addEventListener("DOMContentLoaded", () => {
  const savedLang = localStorage.getItem("preferredLanguage");
  const initialLang = savedLang || detectBrowserLanguage();
  setLanguage(initialLang);
});

// --- End Language Switching Logic ---

/**
 * Closes the preview modal and clears iframe src
 */
function closePreview() {
  preview.style.display = "none";
  iframe.src = "";
}
