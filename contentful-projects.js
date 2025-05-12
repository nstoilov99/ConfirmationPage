 document.addEventListener("DOMContentLoaded", async () => {
const spaceId = process.env.CONTENTFUL_SPACE_ID;
const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;

    try {
      const response = await fetch(
        `https://cdn.contentful.com/spaces/${spaceId}/environments/master/entries?access_token=${accessToken}&content_type=projectsPage&include=2`
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Full API Response:", data); // Debug line

      const projects = data.items || [];
      const assets = data.includes?.Asset || [];

      if (projects.length === 0) {
        document.getElementById("projects-list").innerHTML = "<p>No projects found.</p>";
        return;
      }

      const projectContainer = document.getElementById("projects-list");
      projectContainer.innerHTML = "";

      projects.forEach(project => {
        const projectData = project.fields;
        const images = projectData.images?.map(image => {
          const asset = assets.find(asset => asset.sys.id === image.sys.id);
          return asset ? `https:${asset.fields.file.url}` : null;
        }).filter(image => image);

        const video = assets.find(asset => asset.sys.id === projectData.video?.sys?.id)?.fields?.file?.url;
        const description = renderRichText(projectData.description);

        projectContainer.innerHTML += `
          <div class="project-card">
            <h3>${projectData.title}</h3>
            <div class="project-description">${description}</div>
            ${images.length > 0 ? images.map(img => `<img src="${img}" alt="Project Image">`).join("") : ''}
            ${projectData.githubLink ? `<a href="${projectData.githubLink}" target="_blank">View on GitHub</a>` : ''}
            ${video ? `<video controls><source src="https:${video}" type="video/mp4">Your browser does not support the video tag.</video>` : ''}
          </div>
        `;
      });
    } catch (error) {
      console.error("Error loading projects:", error);
      document.getElementById("projects-list").innerHTML = `<p style="color: red;">Failed to load projects. ${error.message}</p>`;
    }
  });

  // Function to render Rich Text (Basic Implementation)
  function renderRichText(richText) {
    if (!richText) return "";
    const content = richText.content || [];
    return content.map(block => {
      switch (block.nodeType) {
        case "paragraph":
          return `<p>${block.content.map(text => text.value).join("")}</p>`;
        case "heading-1":
          return `<h1>${block.content.map(text => text.value).join("")}</h1>`;
        case "heading-2":
          return `<h2>${block.content.map(text => text.value).join("")}</h2>`;
        case "unordered-list":
          return `<ul>${block.content.map(item => `<li>${item.content[0]?.content[0]?.value}</li>`).join("")}</ul>`;
        case "ordered-list":
          return `<ol>${block.content.map(item => `<li>${item.content[0]?.content[0]?.value}</li>`).join("")}</ol>`;
        default:
          return `<p>${block.content.map(text => text.value).join("")}</p>`;
      }
    }).join("");
  }