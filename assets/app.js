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

  const ticketFields = document.getElementById("ticketFields");
  const tfSite = document.getElementById("tfSite");
  const tfAsset = document.getElementById("tfAsset");
  const tfPort = document.getElementById("tfPort");
  const tfMac = document.getElementById("tfMac");
  const tfIp = document.getElementById("tfIp");

  let activeCategory = null;

  function getTicketInfo() {
    return {
      site: tfSite?.value?.trim(),
      asset: tfAsset?.value?.trim(),
      port: tfPort?.value?.trim(),
      mac: tfMac?.value?.trim(),
      ip: tfIp?.value?.trim()
    };
  }

  function renderStepper(a) {
    let current = a.flow.start;
    const path = [];

    function showStep() {
      article.innerHTML = "";
      const step = a.flow?.steps?.[current];
      if (!step) return;

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
          path.push({ question: step.question, answer: "Yes" });
          current = step.yes;
          showStep();
        };

        noBtn.onclick = () => {
          path.push({ question: step.question, answer: "No" });
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

        return;
      }
    }

    showStep();
  }

  function renderArticle(a) {
    articleTitle.textContent = a ? a.title : "Select an article";
    article.innerHTML = "";

    if (ticketFields) {
      ticketFields.style.display =
        a && a.type === "stepper" ? "block" : "none";
    }

    if (!a) return;

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

  function renderCategories() {
    catList.innerHTML = "";

    const counts = {};
    kb.articles.forEach(a => {
      counts[a.category] = (counts[a.category] || 0) + 1;
    });

    function addCat(id, name) {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.textContent = name + " (" + (counts[id] || 0) + ")";
      btn.onclick = () => {
        activeCategory = id;
        renderList();
      };
      li.appendChild(btn);
      catList.appendChild(li);
    }

    addCat(null, "All Articles");
    kb.categories.forEach(c => addCat(c.id, c.name));
  }

  function renderList() {
    results.innerHTML = "";

    let list = kb.articles;

    if (activeCategory) {
      list = list.filter(a => a.category === activeCategory);
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

    if (countPill) {
      countPill.textContent = list.length + " of " + kb.articles.length;
    }
  }

  renderCategories();
  renderList();
}

init();