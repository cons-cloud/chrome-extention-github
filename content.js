console.log("Content script loaded!");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received in content script:", request);

  if (request.action === "scanPosts") {
    const results = scanPosts(); // Fonction pour scanner les posts
    sendResponse({ data: results }); // Renvoie les résultats
  }
});

function scanPosts() {
  // Logique pour scanner les posts
  const posts = document.querySelectorAll('[role="article"]');
  const results = [];

  posts.forEach(post => {
    const author = post.querySelector('a[role="link"]')?.innerText || "N/A";
    const photo = post.querySelector('img')?.src || "N/A";
    const event = post.querySelector('[data-testid="event-permalink-link"]')?.innerText || "N/A";
    const imageText = post.querySelector('[data-testid="post_message"]')?.innerText || "N/A";
    const imageUrl = post.querySelector('img[src*="fbstaging"]')?.src || "N/A";
    const reelUrl = post.querySelector('a[href*="reel"]')?.href || "N/A";
    const messageContent = post.querySelector('[data-testid="post_message"]')?.innerText || "N/A";

    results.push({
      author,
      photo,
      event,
      imageText,
      imageUrl,
      reelUrl,
      messageContent
    });
  });

  return results;
}








async function parseFbFeed() {
    return new Promise((resolve) => {
        const rows = [];
        let currentIndex = 0;
        const maxIterations = 15;

        function processNextItem() {
            if (currentIndex >= maxIterations) {
                console.log('Completed processing all items:', rows.length);
                console.table(rows); // ✅ Display data in a structured table
                resolve(rows);
                return;
            }

            const containers = Array.from(document.querySelectorAll('[aria-posinset]'));
            console.log(`Found ${containers.length} containers, processing index ${currentIndex}`);

            const container = containers[currentIndex];
            if (!container) {
                console.log('No container found, stopping');
                resolve(rows);
                return;
            }

            container.scrollIntoView({ behavior: 'smooth', block: 'center' });

            setTimeout(() => {
                try {
                    const nameElement = container.querySelector('h3 strong');
                    const name = nameElement?.innerText.trim() || 'No Name Found';

                    let activity = '';
                    if (nameElement) {
                        const parentSpan = nameElement.closest('span');
                        if (parentSpan) {
                            activity = parentSpan.textContent.trim();
                            const nameParts = name.split(' ');
                            nameParts.forEach(part => {
                                const regex = new RegExp(part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
                                activity = activity.replace(regex, '').trim();
                            });
                        }
                    }

                    const messages = container.querySelector('[data-ad-preview="message"][id]')?.innerText.trim() || 'No Message';

                    let mediaUrl = container.querySelector('[href*="/reel/"]')?.getAttribute('href') || '';
                    if (mediaUrl.startsWith('/reel/')) {
                        mediaUrl = `https://facebook.com${mediaUrl}`;
                    }

                    const photoElement = container.querySelector('img[attributionsrc], [data-ad-rendering-role="image"] img');
                    const photoText = photoElement?.getAttribute('alt') || 'No Alt Text';
                    const photoURL = photoElement?.getAttribute('src') || 'No Image';

                    // ✅ Store extracted data in an array
                    if (name) {
                        console.log(`Processing item ${currentIndex + 1}:`, { name, activity, messages, mediaUrl, photoText, photoURL });
                        rows.push({ name, activity, messages, mediaUrl, photoText, photoURL });
                    }

                    currentIndex++;
                    setTimeout(processNextItem, 1500); // Adjust delay for better results
                } catch (error) {
                    console.error('Error processing item:', error);
                    currentIndex++;
                    setTimeout(processNextItem, 1500);
                }
            }, 1500);
        }

        processNextItem();
    });
}

// ✅ Run the function in the browser console when on Facebook page: https://www.facebook.com/?filter=friends&sk=h_chr
parseFbFeed();


document.getElementById('download-csv').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].id) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "downloadCSV" }, (response) => {
                if (response && response.success) {
                    console.log("CSV downloaded successfully!");
                } else {
                    console.error("Failed to download CSV:", response?.error);
                }
            });
        }
    });
});










async function parseLinkedInFeed() {
    return new Promise((resolve) => {
        const rows = [];
        let currentIndex = 0;
        const maxIterations = 15;

        function processNextItem() {
            if (currentIndex >= maxIterations) {
                console.log('Completed processing all items:', rows.length);
                console.table(rows); // ✅ Display data in a structured table
                resolve(rows);
                return;
            }

            // Sélecteur pour les posts LinkedIn
            const containers = Array.from(document.querySelectorAll('.feed-shared-update-v2'));
            console.log(`Found ${containers.length} containers, processing index ${currentIndex}`);

            const container = containers[currentIndex];
            if (!container) {
                console.log('No container found, stopping');
                resolve(rows);
                return;
            }

            container.scrollIntoView({ behavior: 'smooth', block: 'center' });

            setTimeout(() => {
                try {
                    // Extraire le nom de l'auteur
                    const nameElement = container.querySelector('.feed-shared-actor__name');
                    const name = nameElement?.innerText.trim() || 'No Name Found';

                    // Extraire le texte du post
                    const messages = container.querySelector('.feed-shared-update-v2__description')?.innerText.trim() || 'No Message';

                    // Extraire l'URL de l'image ou de la vidéo
                    const mediaElement = container.querySelector('.feed-shared-image, .feed-shared-video');
                    const mediaUrl = mediaElement?.getAttribute('src') || mediaElement?.querySelector('img')?.getAttribute('src') || 'No Media';

                    // Extraire le texte alternatif de l'image
                    const photoText = mediaElement?.querySelector('img')?.getAttribute('alt') || 'No Alt Text';

                    // Extraire l'URL du post LinkedIn
                    const postUrlElement = container.querySelector('.feed-shared-update-v2__footer a');
                    const postUrl = postUrlElement?.getAttribute('href') || 'No Post URL';
                    const fullPostUrl = postUrl.startsWith('/') ? `https://www.linkedin.com${postUrl}` : postUrl;

                    // ✅ Stocker les données extraites dans un tableau
                    if (name) {
                        console.log(`Processing item ${currentIndex + 1}:`, { name, messages, mediaUrl, photoText, postUrl: fullPostUrl });
                        rows.push({ name, messages, mediaUrl, photoText, postUrl: fullPostUrl });
                    }

                    currentIndex++;
                    setTimeout(processNextItem, 1500); // Ajustez le délai pour de meilleurs résultats
                } catch (error) {
                    console.error('Error processing item:', error);
                    currentIndex++;
                    setTimeout(processNextItem, 1500);
                }
            }, 1500);
        }

        processNextItem();
    });
}

// ✅ Exécutez cette fonction dans la console DevTools sur une page LinkedIn
parseLinkedInFeed()
    .then((rows) => {
        console.table(rows); // Afficher les données dans la console
        return rows;
    })
    .catch((error) => console.error("Error:", error));

 





document.getElementById('download-csv').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].id) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "downloadCSV" }, (response) => {
                if (response && response.success) {
                    console.log("CSV downloaded successfully!");
                } else {
                    console.error("Failed to download CSV:", response?.error);
                }
            });
        }
    });
});