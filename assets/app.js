async function init() {
  const res = await fetch("data/kb.json");
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

  function matches(a, query) {
    if (!query) return true;
    const hay = norm([a.title, a.summary, ...(a.tags || [])].join(" "));
    return hay.includes(query);
  }

  function renderList() {
    const query = norm(q.value);
    results.innerHTML = "";

    const list = data.articles.filter(a => matches(a, query));
    countPill.textContent = String(list.length);

    list.forEach(a => {
      const div = document.createElement("div");
      div.className = "article-link";
      div.innerHTML = `<strong>${a.title}</strong><div style="color:#5f6368;font-size:13px;margin-top:4px;">${a.summary || ""}</div>`;

      div.onclick = () => {
        articleTitle.textContent = a.title;
        article.innerHTML = "";
        (a.content || a.blocks?.flatMap(b => (b.type === "list" ? b.items : [])) || []).forEach(p => {
          const para = document.createElement("p");
          para.textContent = p;
          article.appendChild(para);
        });
      };

      results.appendChild(div);
    });
  }

  q.addEventListener("input", renderList);

  clearBtn.addEventListener("click", () => {
    q.value = "";
    q.focus();
    renderList();
  });

  renderList();
}

init();
