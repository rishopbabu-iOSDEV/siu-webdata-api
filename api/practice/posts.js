// api/practice/posts.js — Module 3, Exercise 3: a pager over JSONPlaceholder.
// The page number is kept in the page's own URL (?page=3), so a refresh or a
// shared link returns to the same page.

const LIMIT = 10;
let page = Number(new URLSearchParams(window.location.search).get("page")) || 1;

function setStatus(text) {
  document.querySelector("#posts-status").textContent = text;
}

async function loadPosts() {
  setStatus("Loading…");
  try {
    const params = new URLSearchParams({ _page: page, _limit: LIMIT });
    const response = await getResponse(`https://jsonplaceholder.typicode.com/posts?${params}`);
    const posts = await response.json();
    const totalPages = Math.ceil(Number(response.headers.get("X-Total-Count")) / LIMIT);
    renderPosts(posts);
    document.querySelector("#page-info").textContent = `Page ${page} of ${totalPages}`;
    document.querySelector("#prev").disabled = page === 1;
    document.querySelector("#next").disabled = page === totalPages;
    setStatus(posts.length === 0 ? "No posts on this page." : "");
  } catch (error) {
    setStatus(messageFor(error));
    console.error(error);
  }
}

// Someone else's data: created elements and textContent, not innerHTML.
function renderPosts(posts) {
  const list = document.querySelector("#posts");
  list.replaceChildren(...posts.map((post) => {
    const item = document.createElement("li");
    item.textContent = `${post.id}. ${post.title}`;
    return item;
  }));
}

function goTo(newPage) {
  page = newPage;
  history.replaceState(null, "", `?page=${page}`);
  loadPosts();
}

document.querySelector("#prev").addEventListener("click", () => goTo(page - 1));
document.querySelector("#next").addEventListener("click", () => goTo(page + 1));
document.addEventListener("DOMContentLoaded", loadPosts);
