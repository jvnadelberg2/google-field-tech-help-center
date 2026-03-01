async function init() {
  const res = await fetch("data/kb.json", { cache: "no-store" });
  const kb = await res.json();

  const results = document.getElementById("results");
  const article = document.getElementById("article");
  const articleTitle = document.getElementById("articleTitle");

  const q = document.getElementById("q");
  const clearBtn = document.getElementById("clearBtn");
  const countPill = document.getElementById("countPill");

  const catList = document.getElementById("catList");

  let activeCategory = null; // null = All Articles

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

  function renderStepper(a) {
    let current = a.flow.start;

    function showStep() {
      article.innerHTML = "";
      const step = a.flow?.steps?.[current];

      if (!step) {
        article.textContent = "Stepper error: missing step definition.";
        return;
      }

      if (step.question) {
        const h = document.createElement("h3");
        h.textContent = step.question;
        article.appendChild(h);

        const yesBtn = document.createElement("button");
        yesBtn.textContent = "Yes";
        yesBtn.className = "step-btn";

        const noBtn = document.createElement("button");
        noBtn.textContent = "No";
        noBtn.className = "step-btn secondary";

        yesBtn.onclick = () => {
          current = step.yes;
          showStep();
        };

        noBtn.onclick = () => {
          current = step.no;
          showStep();
        };

        article.appendChild(yesBtn);
        article.appendChild(noBtn);
        return;
      }

      if (step.result) {
        const card = document.createElement("div");
        card.className = "result-card";
        card.textContent = step.result;
        article.appendChild(card);

        const restart = document.createElement("button");
        restart.textContent = "Start Over";
        restart.className = "step-btn";
        restart.onclick = () => {
          current = a.flow.start;
          showStep();
        };
        article.appendChild(restart);
        return;
      }

      article.textContent = "Stepper error: step has no question or result.";
    }

    showStep();
  }

  function renderArticle(a) {
    articleTitle.textContent = a ? a.title : "Select an article";
    article.innerHTML = "";
    if (!a) return;

    const meta = document.createElement("div");
    meta.style.color = "#5f6368";
    meta.style.fontSize = "13px";
    meta.style.marginBottom = "12px";

    const catName = (kb.categories || []).find(c => c.id === a.category)?.name || "";
    const parts = [];
    if (catName) parts.push(catName);
    if (a.minutes) parts.push("~" + a.minutes + " min");
    if (a.updated) parts.push("Updated " + a.updated);
    meta.textContent = parts.join(" • ");
    article.appendChild(meta);

    if (a.type === "stepper") {
      renderStepper(a);
      return;
    }

    (a.content || []).forEach(line => {
      const p = document.createElement("p");
      p.textContent = line;
      article.appendChild(p);
    });
  }

  function filteredArticles() {
    const query = norm(q.value);
    let list = (kb.articles || []).slice();

    if (activeCategory) {
      list = list.filter(a => a.category === activeCategory);
    }

    if (query) {
      list = list.filter(a => searchableText(a).includes(query));
    }

    return list;
  }

  function renderList() {
    const list = filteredArticles();
    results.innerHTML = "";

    if (countPill) {
      const total = (kb.articles || []).length;
      const shown = list.length;
      countPill.textContent = `${shown} of ${total}`;
    }

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
      renderArticle(null);
    }
  }

  function renderCategories() {
    if (!catList) return;
    catList.innerHTML = "";

    const counts = {};
    (kb.articles || []).forEach(a => {
      counts[a.category] = (counts[a.category] || 0) + 1;
    });

    function addCat(id, name, count) {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = activeCategory === id ? "active" : "";
      btn.innerHTML = `<span>${name}</span><span class="catcount">${count}</span>`;
      btn.onclick = () => {
        activeCategory = id;
        renderCategories();
        renderList();
        renderArticle(null);
      };
      li.appendChild(btn);
      catList.appendChild(li);
    }

    addCat(null, "All Articles", (kb.articles || []).length);

    (kb.categories || []).forEach(c => {
      addCat(c.id, c.name, counts[c.id] || 0);
    });
  }

  q?.addEventListener("input", renderList);

  clearBtn?.addEventListener("click", () => {
    q.value = "";
    q.focus();
    renderList();
  });

  renderCategories();
  renderList();
}

init();