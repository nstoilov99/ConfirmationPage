const user = "nstoilov99";
const repo = "MMO-CoreKit";
const apiURL = `https://api.github.com/repos/${user}/${repo}`;

fetch(apiURL)
  .then(response => response.json())
  .then(data => {
    const repoName = data.name;
    const repoDesc = data.description || "";
    const stars = data.stargazers_count;
    const forks = data.forks_count;
    const language = data.language || "";
    document.getElementById("repo-card").innerHTML = `
      <h3 style="margin: 0 0 0.5em;"><a href="${data.html_url}" target="_blank" style="color: #ff9900; text-decoration: none;">${repoName}</a></h3>
      <p style="margin: 0.5em 0; color: #ccc;">${repoDesc}</p>
      <p style="margin: 0.5em 0; font-size: 0.9em; color: #aaa;">
        ${language} — ⭐ ${stars} &middot; Forks: ${forks}
      </p>
    `;
  })
  .catch(error => {
    document.getElementById("repo-card").innerHTML = "<p style='color: red;'>Failed to load repository info.</p>";
  });
