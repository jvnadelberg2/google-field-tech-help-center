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

  const ALL = "__all__";
  let activeCategory = ALL;
  let activeArticleId = null;

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

  function setTicketFieldsVisible(visible) {
    if (!ticketFields) return;
    ticketFields.style.display = visible ? "block" : "none";
  }

  function categoryNameFor(articleObj) {
    const cat = (kb.categories || []).find(c => c.id === articleObj?.category);
    return cat ? cat.name : "";
  }

  function getTicketInfo() {
    return {
      site: (tfSite?.value || "").trim(),
      asset: (tfAsset?.value || "").trim(),
      port: (tfPort?.value || "").trim(),
      mac: (tfMac?.value || "").trim(),
      ip: (tfIp?.value || "").trim(),
    };
  }

  function loadTicketDraft() {
    try {
      const raw = localStorage.getItem("ft_ticketDraft");
      if (!raw) return;
      const d = JSON.parse(raw);
      if (tfSite && typeof d.site === "string") tfSite.value = d.site;
      if (tfAsset && typeof d.asset === "string") tfAsset.value = d.asset;
      if (tfPort && typeof d.port === "string") tfPort.value = d.port;
      if (tfMac && typeof d.mac === "string") tfMac.value = d.mac;
      if (tfIp && typeof d.ip === "string") tfIp.value = d.ip;
    } catch (_) {}
  }

  function saveTicketDraft() {
    try {
      localStorage.setItem("ft_ticketDraft", JSON.stringify(getTicketInfo()));
    } catch (_) {}
  }

  function wireTicketDraftAutosave() {
    const fields = [tfSite, tfAsset, tfPort, tfMac, tfIp].filter(Boolean);
    fields.forEach(el => el.addEventListener("input", saveTicketDraft));
  }

  function generateSummary(title, path, result, ticket) {
    let text = "";
    text += "Escalation Summary\n";
    text += "------------------\n";
    text += `Issue: ${title}\n\n`;

    const lines = [];
    if (ticket?.site) lines.push(`Site/Store: ${ticket.site}`);
    if (ticket?.asset) lines.push(`Asset/Device: ${ticket.asset}`);
    if (ticket?.port) lines.push(`Switch Port: ${ticket.port}`);
    if (ticket?.mac) lines.push(`MAC: ${ticket.mac}`);
    if (ticket?.ip) lines.push(`IP: ${ticket.ip}`);

    if (lines.length) {
      text += "Ticket Info:\n";
      lines.forEach(l => (text += `- ${l}\n`));
      text += "\n";
    }

    text += "Diagnostic Path:\n";
    path.forEach(p => {
      text += `- ${p.question} -> ${p.answer}\n`;
    });

    text += "\nResult:\n";
    text += result + "\n\n";

    text += "Recommended Data to Include:\n";
    text += "- Device MAC address\n";
    text += "- Switch port ID\n";
    text += "- VLAN (if known)\n";
    text += "- IP address\n";

    return text;
  }

  // Sidebar counts should respect SEARCH, but not the active category.
  // All Articles should ALWAYS be the total matches for the current query.
  function countsByCategoryForQuery() {
    const query = norm(q?.value || "");
    const counts = {};
    let total = 0;

    (kb.articles || []).forEach(a => {
      if (query && !searchableText(a).includes(query)) return;
      total += 1;
      const catId = a.category || "";
      counts[catId] = (counts[catId] || 0) + 1;
    });

    return { counts, total };
  }

  function filteredArticles() {
    const query = norm(q?.value || "");
    let list = (kb.articles || []).slice();

    if (activeCategory !== ALL) list = list.filter(a => a.category === activeCategory);
    if (query) list = list.filter(a => searchableText(a).includes(query));

    return list;
  }

  function renderStepper(a) {
    let current = a.flow?.start;
    const path = [];

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
          path.push({ question: step.question, answer: "Yes" });
          current = step.yes;
          showStep();
        };

        noBtn.onclick = () => {
          path.push({ question: step.question, answer: "No" });
          current = step.no;
          showStep();
        };

        const row = document.createElement("div");
        row.style.display = "flex";
        row.style.gap = "10px";
        row.style.flexWrap = "wrap";
        row.style.marginTop = "12px";
        row.appendChild(yesBtn);
        row.appendChild(noBtn);
        article.appendChild(row);

        return;
      }

      if (step.result) {
        const card = document.createElement("div");
        card.className = "result-card";
        card.textContent = step.result;
        article.appendChild(card);

        const ticket = getTicketInfo();
        const summaryText = generateSummary(a.title, path, step.result, ticket);

        const summaryBox = document.createElement("pre");
        summaryBox.className = "summary-box";
        summaryBox.textContent = summaryText;
        article.appendChild(summaryBox);

        const copyBtn = document.createElement("button");
        copyBtn.textContent = "Copy Escalation Notes";
        copyBtn.className = "step-btn";
        copyBtn.onclick = async () => {
          try {
            await navigator.clipboard.writeText(summaryText);
            copyBtn.textContent = "Copied ✓";
            setTimeout(() => (copyBtn.textContent = "Copy Escalation Notes"), 1500);
          } catch (_) {
            copyBtn.textContent = "Copy failed";
            setTimeout(() => (copyBtn.textContent = "Copy Escalation Notes"), 1500);
          }
        };
        article.appendChild(copyBtn);

        const restart = document.createElement("button");
        restart.textContent = "Start Over";
        restart.className = "step-btn secondary";
        restart.onclick = () => {
          current = a.flow?.start;
          path.length = 0;
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
    activeArticleId = a?.id || null;

    articleTitle.textContent = a ? a.title : "Select an article";
    article.innerHTML = "";

    setTicketFieldsVisible(!!a && a.type === "stepper");
    if (!a) return;

    const meta = document.createElement("div");
    meta.style.color = "#5f6368";
    meta.style.fontSize = "13px";
    meta.style.marginBottom = "12px";

    const catName = categoryNameFor(a);
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

  function renderList() {
    const list = filteredArticles();
    results.innerHTML = "";

    const query = norm(q?.value || "");
    const totalForPill = query ? countsByCategoryForQuery().total : (kb.articles || []).length;
    const shown = list.length;

    if (countPill) countPill.textContent = `${shown} of ${totalForPill}`;

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
      return;
    }

    if (activeArticleId) {
      const stillThere = list.some(a => a.id === activeArticleId);
      if (!stillThere) renderArticle(null);
    }
  }

  function renderCategories() {
    if (!catList) return;
    catList.innerHTML = "";

    const { counts, total } = countsByCategoryForQuery();

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

    // All Articles is now explicit and should NEVER show 0 unless there are 0 matches for the current search.
    addCat(ALL, "All Articles", total);

    (kb.categories || []).forEach(c => {
      addCat(c.id, c.name, counts[c.id] || 0);
    });
  }

  q?.addEventListener("input", () => {
    renderCategories();
    renderList();
  });

  clearBtn?.addEventListener("click", () => {
    if (q) q.value = "";
    q?.focus();
    renderCategories();
    renderList();
  });

  loadTicketDraft();
  wireTicketDraftAutosave();

  setTicketFieldsVisible(false);
  renderCategories();
  renderList();
}

init();