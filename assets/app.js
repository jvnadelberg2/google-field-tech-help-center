async function init() {
  const res = await fetch("data/kb.json");
  const data = await res.json();

  const results = document.getElementById("results");
  const article = document.getElementById("article");
  const articleTitle = document.getElementById("articleTitle");

  data.articles.forEach(a => {
    const div = document.createElement("div");
    div.className = "article-link";
    div.textContent = a.title;

    div.onclick = () => {
      articleTitle.textContent = a.title;
      article.innerHTML = "";
      a.content.forEach(p => {
        const para = document.createElement("p");
        para.textContent = p;
        article.appendChild(para);
      });
    };

    results.appendChild(div);
  });
}

init();
