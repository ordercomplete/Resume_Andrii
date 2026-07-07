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
document
  .querySelectorAll(
    ".skills_name, .sidebar_title_tech_subspecies, .sidebar_title_tech, .title",
  )
  .forEach((item) => {
    item.addEventListener("mouseenter", async (event) => {
      const words = event.target.textContent.trim().split(" ");
      const tooltip = document.getElementById("tooltip");

      const descriptions = [];

      // Fetch Wikipedia description for each word
      for (const word of words) {
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
          const response = await fetch(fullUrl);
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

      // Display combined descriptions in tooltip
      tooltip.textContent = descriptions.join("\n ### \n");
      tooltip.style.left = `${event.pageX + 10}px`;
      tooltip.style.top = `${event.pageY + 10}px`;
      tooltip.style.display = "block";
    });

    item.addEventListener("mouseleave", () => {
      const tooltip = document.getElementById("tooltip");
      tooltip.style.display = "none";
    });
  });

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

/**
 * Closes the preview modal and clears iframe src
 */
function closePreview() {
  preview.style.display = "none";
  iframe.src = "";
}
