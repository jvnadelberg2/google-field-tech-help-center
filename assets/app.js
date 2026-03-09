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

  function norm(value) {
    return (value || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function searchableText(item) {
    return norm([item.title, item.summary, ...(item.tags || [])].join(" "));
  }

  function createEl(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (typeof text === "string") el.textContent = text;
    return el;
  }

  function setTicketFieldsVisible(visible) {
    if (!ticketFields) return;
    ticketFields.style.display = visible ? "block" : "none";
  }

  function categoryNameFor(articleObj) {
    const cat = (kb.categories || []).find((c) => c.id === articleObj?.category);
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
      const draft = JSON.parse(raw);
      if (tfSite && typeof draft.site === "string") tfSite.value = draft.site;
      if (tfAsset && typeof draft.asset === "string") tfAsset.value = draft.asset;
      if (tfPort && typeof draft.port === "string") tfPort.value = draft.port;
      if (tfMac && typeof draft.mac === "string") tfMac.value = draft.mac;
      if (tfIp && typeof draft.ip === "string") tfIp.value = draft.ip;
    } catch (_) {}
  }

  function saveTicketDraft() {
    try {
      localStorage.setItem("ft_ticketDraft", JSON.stringify(getTicketInfo()));
    } catch (_) {}
  }

  function wireTicketDraftAutosave() {
    [tfSite, tfAsset, tfPort, tfMac, tfIp]
      .filter(Boolean)
      .forEach((el) => el.addEventListener("input", saveTicketDraft));
  }

  function generateSummary(title, path, result, ticket) {
    const lines = [];
    lines.push("Escalation Summary");
    lines.push("------------------");
    lines.push(`Issue: ${title}`);
    lines.push("");

    const ticketLines = [];
    if (ticket?.site) ticketLines.push(`Site/Store: ${ticket.site}`);
    if (ticket?.asset) ticketLines.push(`Asset/Device: ${ticket.asset}`);
    if (ticket?.port) ticketLines.push(`Switch Port: ${ticket.port}`);
    if (ticket?.mac) ticketLines.push(`MAC: ${ticket.mac}`);
    if (ticket?.ip) ticketLines.push(`IP: ${ticket.ip}`);

    if (ticketLines.length) {
      lines.push("Ticket Info:");
      ticketLines.forEach((line) => lines.push(`- ${line}`));
      lines.push("");
    }

    lines.push("Diagnostic Path:");
    if (path.length) {
      path.forEach((step) => lines.push(`- ${step.question} -> ${step.answer}`));
    } else {
      lines.push("- No questions answered");
    }

    lines.push("");
    lines.push("Result:");
    lines.push(result);
    lines.push("");
    lines.push("Recommended Data to Include:");
    lines.push("- Device MAC address");
    lines.push("- Switch port ID");
    lines.push("- VLAN (if known)");
    lines.push("- IP address");

    return lines.join("\n");
  }

  function countsByCategoryForQuery() {
    const query = norm(q?.value || "");
    const counts = {};
    let total = 0;

    (kb.articles || []).forEach((item) => {
      if (query && !searchableText(item).includes(query)) return;
      total += 1;
      const catId = item.category || "";
      counts[catId] = (counts[catId] || 0) + 1;
    });

    return { counts, total };
  }

  function filteredArticles() {
    const query = norm(q?.value || "");
    let list = (kb.articles || []).slice();

    if (activeCategory !== ALL) {
      list = list.filter((item) => item.category === activeCategory);
    }

    if (query) {
      list = list.filter((item) => searchableText(item).includes(query));
    }

    return list;
  }

  function renderEmptyState() {
    article.innerHTML = "";
    const wrapper = createEl("div", "empty-state");
    const heading = createEl("h3", "", "Choose an article or workflow");
    const copy = createEl(
      "p",
      "",
      "Select a help article to view instructions, or open a guided troubleshooting workflow to generate escalation notes."
    );
    wrapper.appendChild(heading);
    wrapper.appendChild(copy);
    article.appendChild(wrapper);
  }

  function renderStepper(item) {
    let current = item.flow?.start;
    const path = [];

    function rebuildCurrentFromPath() {
      current = item.flow?.start;
      for (const entry of path) {
        const step = item.flow?.steps?.[current];
        if (!step) break;
        current = entry.answer === "Yes" ? step.yes : step.no;
      }
    }

    function showStep() {
      article.innerHTML = "";
      const step = item.flow?.steps?.[current];

      if (!step) {
        article.textContent = "Stepper error: missing step definition.";
        return;
      }

      const progress = createEl("div", "article-meta", `Troubleshooting step ${path.length + 1}`);
      article.appendChild(progress);

      if (path.length) {
        const historyBox = createEl("div", "summary-box");
        const historyTitle = createEl("div", "", "Path so far:");
        historyTitle.style.fontWeight = "600";
        historyBox.appendChild(historyTitle);

        const list = createEl("ul", "");
        list.style.margin = "8px 0 0 18px";
        path.forEach((entry) => {
          const li = createEl("li", "", `${entry.question} -> ${entry.answer}`);
          list.appendChild(li);
        });
        historyBox.appendChild(list);
        article.appendChild(historyBox);
      }

      if (step.question) {
        const heading = createEl("h3", "", step.question);
        article.appendChild(heading);

        const help = createEl(
          "p",
          "article-meta",
          "Choose the answer that best matches what you observe on-site."
        );
        article.appendChild(help);

        const row = createEl("div", "step-actions");

        const yesBtn = createEl("button", "step-btn", "Yes");
        yesBtn.type = "button";
        yesBtn.onclick = () => {
          path.push({ question: step.question, answer: "Yes" });
          current = step.yes;
          showStep();
        };

        const noBtn = createEl("button", "step-btn secondary", "No");
        noBtn.type = "button";
        noBtn.onclick = () => {
          path.push({ question: step.question, answer: "No" });
          current = step.no;
          showStep();
        };

        row.appendChild(yesBtn);
        row.appendChild(noBtn);

        if (path.length) {
          const backBtn = createEl("button", "step-btn secondary", "Back");
          backBtn.type = "button";
          backBtn.onclick = () => {
            path.pop();
            rebuildCurrentFromPath();
            showStep();
          };
          row.appendChild(backBtn);
        }

        article.appendChild(row);
        return;
      }

      if (step.result) {
        const card = createEl("div", "result-card", step.result);
        article.appendChild(card);

        const summaryText = generateSummary(item.title, path, step.result, getTicketInfo());
        const summaryBox = createEl("pre", "summary-box", summaryText);
        article.appendChild(summaryBox);

        const actions = createEl("div", "step-actions");

        const copyBtn = createEl("button", "step-btn", "Copy Escalation Notes");
        copyBtn.type = "button";
        copyBtn.onclick = async () => {
          try {
            await navigator.clipboard.writeText(summaryText);
            copyBtn.textContent = "Copied ✓";
            setTimeout(() => {
              copyBtn.textContent = "Copy Escalation Notes";
            }, 1500);
          } catch (_) {
            copyBtn.textContent = "Copy failed";
            setTimeout(() => {
              copyBtn.textContent = "Copy Escalation Notes";
            }, 1500);
          }
        };

        const restartBtn = createEl("button", "step-btn secondary", "Start Over");
        restartBtn.type = "button";
        restartBtn.onclick = () => {
          current = item.flow?.start;
          path.length = 0;
          showStep();
        };

        actions.appendChild(copyBtn);
        actions.appendChild(restartBtn);
        article.appendChild(actions);
        return;
      }

      article.textContent = "Stepper error: step has no question or result.";
    }

    showStep();
  }

  function renderArticle(item) {
    activeArticleId = item?.id || null;
    articleTitle.textContent = item ? item.title : "Select an article";
    article.innerHTML = "";

    setTicketFieldsVisible(Boolean(item && item.type === "stepper"));
    if (!item) {
      renderEmptyState();
      return;
    }

    const catName = categoryNameFor(item);
    const parts = [];
    if (catName) parts.push(catName);
    if (item.minutes) parts.push(`~${item.minutes} min`);
    if (item.updated) parts.push(`Updated ${item.updated}`);

    if (parts.length) {
      const meta = createEl("div", "article-meta", parts.join(" • "));
      article.appendChild(meta);
    }

    if (item.type === "stepper") {
      renderStepper(item);
      return;
    }

    (item.content || []).forEach((line) => {
      const p = createEl("p", "", line);
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

    list.forEach((item) => {
      const card = createEl("button", "article-link");
      card.type = "button";
      card.style.width = "100%";
      card.style.textAlign = "left";

      if (item.id === activeArticleId) {
        card.classList.add("active");
      }

      const title = createEl("div", "", item.title);
      title.style.fontWeight = "600";

      const summary = createEl("div", "article-meta", item.summary || "");
      summary.style.marginTop = "4px";
      summary.style.marginBottom = "0";

      card.appendChild(title);
      card.appendChild(summary);
      card.onclick = () => renderArticle(item);
      results.appendChild(card);
    });

    if (!list.length) {
      const empty = createEl("div", "article-meta", "No matches.");
      results.appendChild(empty);
      renderArticle(null);
      return;
    }

    if (activeArticleId) {
      const stillVisible = list.some((item) => item.id === activeArticleId);
      if (!stillVisible) renderArticle(null);
    }
  }

  function renderCategories() {
    if (!catList) return;
    catList.innerHTML = "";

    const { counts, total } = countsByCategoryForQuery();

    function addCategory(id, name, count) {
      const li = createEl("li");
      const btn = createEl("button", activeCategory === id ? "active" : "");
      btn.type = "button";
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

    addCategory(ALL, "All Articles", total);
    (kb.categories || []).forEach((cat) => {
      addCategory(cat.id, cat.name, counts[cat.id] || 0);
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
  renderEmptyState();
}

init();