 document.addEventListener("DOMContentLoaded", async () => {
const spaceId = window.CONTENTFUL_SPACE_ID || "dcbc6hw4xwex";
const accessToken = window.CONTENTFUL_ACCESS_TOKEN || "itCC6ej9lB7xqnAGtcq81IRYvMkP-XsG2sKH0AI3TiI";


  try {
    const response = await fetch(
      `https://cdn.contentful.com/spaces/${spaceId}/environments/master/entries?access_token=${accessToken}&content_type=projectsPage&include=2&order=-sys.createdAt`
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const projects = data.items || [];
    const assets = data.includes?.Asset || [];
    
    const projectContainer = document.getElementById("projects-list");
    projectContainer.innerHTML = "";

    window.imageGallery = []; // Initialize global image gallery

    projects.forEach((project, projectIndex) => {
      const projectData = project.fields;
      const title = projectData.title || "Untitled Project";
      const description = projectData.description ? renderRichText(projectData.description) : "<p>No description available.</p>";

      // Video Content (Only if available)
      let videoContent = "";
      if (projectData.videos && projectData.videos.length > 0) {
        videoContent = projectData.videos.map(video => {
          const videoAsset = assets.find(asset => asset.sys.id === video.sys.id);
          return videoAsset ? `
            <div class="video-container">
              <video controls class="project-video">
                <source src="https:${videoAsset.fields.file.url}" type="video/mp4">
                Your browser does not support the video tag.
              </video>
            </div>
          ` : '';
        }).join("");
      }

      // Image Content (Two per Line)
      let imageContent = "";
      if (projectData.images && projectData.images.length > 0) {
        const imageArray = projectData.images.map((image, index) => {
          const asset = assets.find(asset => asset.sys.id === image.sys.id);
          if (asset) window.imageGallery.push(`https:${asset.fields.file.url}`);
          return asset ? `<img src="https:${asset.fields.file.url}" alt="${title}" class="project-image" onclick="openLightbox(${window.imageGallery.length - 1})">` : '';
        }).join("");

        imageContent = `<div class="image-grid">${imageArray}</div>`;
      } else {
        imageContent = "<p class='no-images'>No images available for this project.</p>";
      }

      // GitHub Link (If available)
      const githubLink = projectData.githubLink ? `
        <div class="github-card">
          <a href="${projectData.githubLink}" target="_blank">
            <img src="https://img.icons8.com/ios-filled/50/ff9900/github.png" alt="GitHub Logo">
            <span>View on GitHub</span>
          </a>
        </div>
      ` : "";

      // Render Project Card
      projectContainer.innerHTML += `
        <div class="project-card">
          <h3>${title}</h3>
          <div class="project-description">${description}</div>
          ${videoContent}
          ${imageContent}
          ${githubLink}
        </div>
      `;
    });
  } catch (error) {
    console.error("Error loading projects:", error);
    document.getElementById("projects-list").innerHTML = `<p style="color: red;">Failed to load projects. ${error.message}</p>`;
  }
});

// Function to render Rich Text (Enhanced with Formatting)
function renderRichText(richText) {
  if (!richText || !richText.content) return "<p>No description available.</p>";

  return richText.content.map(block => {
    switch (block.nodeType) {
      case "paragraph":
        return `<p>${renderText(block.content)}</p>`;
      case "heading-1":
        return `<h1>${renderText(block.content)}</h1>`;
      case "heading-2":
        return `<h2>${renderText(block.content)}</h2>`;
      case "unordered-list":
        return `<ul>${block.content.map(item => `<li>${renderText(item.content)}</li>`).join("")}</ul>`;
      case "ordered-list":
        return `<ol>${block.content.map(item => `<li>${renderText(block.content)}</li>`).join("")}</ol>`;
      default:
        return `<p>${renderText(block.content)}</p>`;
    }
  }).join("");
}

// Function to render Text Nodes (with Bold, Italic)
function renderText(content) {
  return content.map(text => {
    if (text.nodeType === "text") {
      let value = text.value;
      if (text.marks) {
        text.marks.forEach(mark => {
          if (mark.type === "bold") value = `<strong>${value}</strong>`;
          if (mark.type === "italic") value = `<em>${value}</em>`;
          if (mark.type === "underline") value = `<u>${value}</u>`;
        });
      }
      return value;
    }
    return "";
  }).join("");
}
// Lightbox Gallery Functions
let currentImageIndex = 0;

function openLightbox(index) {
  if (!window.imageGallery || window.imageGallery.length === 0) return;

  currentImageIndex = index;
  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightbox-image");

  // Set initial state for animation
  lightbox.style.display = "flex";
  lightboxImage.src = window.imageGallery[currentImageIndex];
  lightbox.classList.remove("zoom-out");
  lightbox.classList.add("zoom-in");
  document.body.classList.add("blurred");
  document.body.style.overflow = "hidden"; // Prevents page scrolling
}

function closeLightbox() {
  const lightbox = document.getElementById("lightbox");
  lightbox.classList.remove("zoom-in");
  lightbox.classList.add("zoom-out");
  
  setTimeout(() => {
    lightbox.style.display = "none";
    document.body.classList.remove("blurred");
    document.body.style.overflow = ""; // Allows scrolling again
  }, 300); // Matches the CSS transition duration
}

function nextImage() {
  if (window.imageGallery.length === 0) return;
  currentImageIndex = (currentImageIndex + 1) % window.imageGallery.length;
  document.getElementById("lightbox-image").src = window.imageGallery[currentImageIndex];
}

function prevImage() {
  if (window.imageGallery.length === 0) return;
  currentImageIndex = (currentImageIndex - 1 + window.imageGallery.length) % window.imageGallery.length;
  document.getElementById("lightbox-image").src = window.imageGallery[currentImageIndex];
}