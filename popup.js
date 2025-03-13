document.getElementById('scan').addEventListener('click', () => {
  console.log("Scan button clicked!");

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].id) {
      // Injecter le script de contenu dynamiquement
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        files: ['content.js']
      }, () => {
        if (chrome.runtime.lastError) {
          console.error("Error injecting content script:", chrome.runtime.lastError);
        } else {
          console.log("Content script injected successfully!");
          // Envoyer un message au script de contenu
          chrome.tabs.sendMessage(tabs[0].id, { action: "scanPosts" }, (response) => {
            if (chrome.runtime.lastError) {
              console.error("Error sending message:", chrome.runtime.lastError);
            } else {
              console.log("Response received in popup:", response);
              // Traitez la réponse ici
            }
          });
        }
      });
    }
  });
});



document.getElementById('scan').addEventListener('click', () => {
  console.log("Scan button clicked!");

  // Envoie un message au script d'arrière-plan pour scanner les posts
  chrome.runtime.sendMessage({ action: "scanPosts" }, (response) => {
      if (response && response.data) {
          console.log("Posts scanned:", response.data);
          // Affichez les résultats dans la popup ou traitez-les comme nécessaire
      } else if (response && response.error) {
          console.error("Error scanning posts:", response.error);
      }
  });
});






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