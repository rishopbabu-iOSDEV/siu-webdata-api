// js/resume.js — Course 5, Modules 2–3
// Renders data/resume.json on resume.html.
//
// Module 3: every request goes through getJSON (js/api.js), each section has
// a status line (aria-live), and the awards can be filtered from the page's
// own URL: resume.html?category=Industry.
//
// The JSON keys (team_size, start_date, ...) are the resume.json contract.
//
// innerHTML is used for the resume because the data is the site owner's own
// file (Course 2 Module 7's rule); status text always uses textContent.
// Module 9, which renders data from a live API, switches to textContent and
// created elements throughout.

// "2021-06-01" -> "Jun 2021". null (no end date) -> "Present".
// "T00:00:00" makes new Date() read the date as local midnight; without it
// the date is read as UTC midnight and can show the previous day.
const formatMonth = (iso) =>
  iso ? new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { month: "short", year: "numeric" })
      : "Present";

// Set a section's status line. "" clears it.
function setStatus(id, text) {
  const line = document.querySelector(`#${id}`);
  if (line) line.textContent = text;
}

async function loadResume() {
  setStatus("resume-status", "Loading the resume…");
  try {
    const resume = await getJSON("data/resume.json");
    setStatus("resume-status", "");
    renderProfile(resume.profile);
    renderExperience(resume.experience);
    renderAwards(resume.awards);
  } catch (error) {
    setStatus("resume-status", `The resume could not be loaded. ${messageFor(error)}`);
    console.error(error);
  }
}

function renderProfile(profile) {
  document.querySelector("#profile").innerHTML = `
    <p class="resume-profile__name">${profile.full_name}</p>
    <p class="resume-profile__headline">${profile.headline}</p>
    <p class="resume-profile__location">${profile.location}</p>
    <p>${profile.summary}</p>`;
}

// Newest first. [...roles] sorts a copy and leaves the original alone.
// ISO dates sort correctly as text.
function renderExperience(roles) {
  const sorted = [...roles].sort((a, b) => b.start_date.localeCompare(a.start_date));
  document.querySelector("#experience").innerHTML = sorted.map((r) => `
    <li>
      <strong>${r.role}</strong>, ${r.company}
      <span>${formatMonth(r.start_date)} – ${formatMonth(r.end_date)}</span>
      ${r.team_size !== null ? `<span>Team of ${r.team_size}</span>` : ""}
    </li>`).join("");
}

// Newest first; filtered by ?category= from the page's URL when present
// (like WHERE award_category = ...). No match -> the empty state.
function renderAwards(awards) {
  const category = new URLSearchParams(window.location.search).get("category");
  const chosen = category ? awards.filter((a) => a.category === category) : awards;
  const sorted = [...chosen].sort((a, b) => b.year - a.year);

  document.querySelector("#awards").innerHTML = sorted.map((a) => `
    <li>
      <strong>${a.award}</strong>, ${a.awarded_by}
      <span>${a.year} · ${a.category}</span>
    </li>`).join("");

  markCurrentFilter(category);
  setStatus("awards-status", sorted.length === 0 ? "No awards in this category yet." : "");
}

// aria-current on the filter link that matches the page's URL.
function markCurrentFilter(category) {
  document.querySelectorAll(".awards-filter a").forEach((link) => {
    const linkCategory = new URL(link.href).searchParams.get("category");
    if (linkCategory === category) {
      link.setAttribute("aria-current", "true");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

document.addEventListener("DOMContentLoaded", loadResume);
