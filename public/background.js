function getSavedStore() {
  return new Promise((resolve, _) => {
    window.chrome.storage.local.get('__DC_store__', result => {
      if (result.__DC_store__) {
        const savedStore = JSON.parse(result.__DC_store__);
        resolve(savedStore);
      } else {
        resolve();
      }
    });
  });
}

function onMessage(message, sender, sendResponse) {
  switch (message.type) {
    case 'save-store-json':
    // TODO? - Check for message.payload
    window.chrome.storage.local.set({
      '__DC_store__': message.payload
    });
    // TODO - ^ Is sync?
    sendResponse({ok: true});
    break;

    case 'get-store':
    getSavedStore().then(savedStore => {
      if (savedStore) {
        sendResponse({
          ok: true,
          savedStore: savedStore
        });
      } else {
        // Unable to get saved store from chrome.storage
        sendResponse({
          ok: false
        });
      }
    });
    break;
  }
}

window.chrome.runtime.onMessage.addListener(onMessage);
