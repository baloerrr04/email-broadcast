export const stripImageContent = (content: string) => {
    const match = content.match(/<img[^>]+src="([^">]+)"/);
    return match ? match[1] : null; 
};
