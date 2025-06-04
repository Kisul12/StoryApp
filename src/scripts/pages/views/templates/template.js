export const createStoryItemTemplate = (story) => {
  return `
    <article class="story-item">
      <img src="${story.photoUrl}" alt="Foto oleh ${story.name}" width="100%" />
      <h3>${story.name}</h3>
      <p>${story.description}</p>
      <small>${new Date(story.createdAt).toLocaleString()}</small>
    </article>
  `;
};
