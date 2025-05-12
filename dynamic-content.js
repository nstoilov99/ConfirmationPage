
async function fetchContent(type) {
    try {
        const response = await fetch(`/content/${type}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error loading ${type}:`, error);
        return null;
    }
}

async function loadProjects() {
    const projects = await fetchContent('projects');
    const container = document.getElementById("projects-list");
    if (projects && container) {
        projects.forEach(project => {
            container.innerHTML += `
                <div class="project-card">
                    <h3>${project.title}</h3>
                    <p>${project.description}</p>
                    ${project.image ? `<img src="${project.image}" alt="${project.title}">` : ''}
                    ${project.github_link ? `<a href="${project.github_link}" target="_blank">GitHub</a>` : ''}
                    ${project.video_link ? `<iframe width="560" height="315" src="${project.video_link}" frameborder="0" allowfullscreen></iframe>` : ''}
                </div>
            `;
        });
    }
}

async function loadAbout() {
    const about = await fetchContent('about');
    const container = document.getElementById("about-content");
    if (about && container) {
        container.innerHTML = `<h1>${about.title}</h1><p>${about.content}</p>`;
    }
}

async function loadContact() {
    const contact = await fetchContent('contact');
    const container = document.getElementById("contact-content");
    if (contact && container) {
        container.innerHTML = `<h1>${contact.title}</h1><p>${contact.content}</p>`;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadProjects();
    loadAbout();
    loadContact();
});
