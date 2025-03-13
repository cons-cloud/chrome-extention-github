// background.js
console.log("Background script loaded!");

// Écoute les messages envoyés par la popup ou le script de contenu
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received in background script:", request);

  if (request.action === "scanPosts") {
    // Envoie un message au script de contenu pour scanner les posts
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "scanPosts" }, (response) => {
          console.log("Response from content script:", response);
          sendResponse(response); // Renvoie la réponse à la popup
        });
      }
    });

    // Retourne true pour indiquer que la réponse sera envoyée de manière asynchrone
    return true;
  }
});