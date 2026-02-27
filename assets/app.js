
async function init() {
  const res = await fetch("data/kb.json", { cache: "no-store" });
  const data = await res.json();

  const results = document.getElementById("results");
  const article = document.getElementById("article");
  const articleTitle = document.getElementById("articleTitle");
  const q = document.getElementById("q");
  const clearBtn = document.getElementById("clearBtn");
  const countPill = document.getElementById("countPill");

  function norm(s) {
    return (s || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function searchableText(a) {
    return norm([a.title, a.summary, ...(a.tags || [])].join(" "));
  }

  function renderArticle(a) {
    articleTitle.textContent = a ? a.title : "Select an article";
    article.innerHTML = "";

    if (!a) return;

    // Your kb.json uses "content": [ ... ] (strings). Render as paragraphs.
    if (Array.isArray(a.content)) {
      a.content.forEach(line => {
        const p = document.createElement("p");
        p.textContent = line;
        article.appendChild(p);
      });
      return;
    }

    // Fallback if later you switch to "blocks"
    if (Array.isArray(a.blocks)) {
      a.blocks.forEach(b => {
        if (b.type === "list" && Array.isArray(b.items)) {
          const ul = document.createElement("ul");
          b.items.forEach(it => {
            const li = document.createElement("li");
            li.textContent = it;
            ul.appendChild(li);
          });
          article.appendChild(ul);
        }
      });
    }
  }

  function renderList() {
    const query = norm(q.value);
    results.innerHTML = "";

    const list = (data.articles || []).filter(a => {
      if (!query) return true;
      return searchableText(a).includes(query);
    });

    if (countPill) countPill.textContent = String(list.length);

    list.forEach(a => {
      const div = document.createElement("div");
      div.className = "article-link";
      div.innerHTML = `
        <div style="font-weight:600">${a.title}</div>
        <div style="color:#5f6368;font-size:13px;margin-top:4px">${a.summary || ""}</div>
      `;

      div.onclick = () => renderArticle(a);
      results.appendChild(div);
    });

    if (!list.length) {
      const empty = document.createElement("div");
      empty.style.color = "#5f6368";
      empty.style.padding = "8px";
      empty.textContent = "No matches.";
      results.appendChild(empty);
    }

    // If current article is filtered out, clear the article pane
    if (query) renderArticle(null);
  }

  q?.addEventListener("input", renderList);

  clearBtn?.addEventListener("click", () => {
    q.value = "";
    q.focus();
    renderList();
  });

  renderList();
}

init();
