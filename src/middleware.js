import i18n from 'i18next';

export const i18nMiddleware = store => next => action => {
  let result = next(action);
  if (action.type === 'CHANGE_UI_LANGUAGE' || action.type === 'HYDRATE_STORE') {
    const uiLanguage = store.getState().uiLanguage;
    i18n.changeLanguage(uiLanguage);
  }
  return result;
}

export const loggingMiddleware = store => next => action => {
  let result = next(action);
  console.log(`Middleware: ---`);
  console.log('Middleware: STORE: ', store.getState());
  console.log('Middleware: ACTION: ', action);
  console.log(`Middleware: ---`);
  return result;
}

export const storageMiddleware = store => next => action => {
  let result = next(action);
  const currentState = store.getState();
  const currentStateJson = JSON.stringify(currentState);
  // TODO - Send message 'save-store-json' w/ message.payload = currentStateJson
  // TODO - sendResponse callback - console.debug('Middleware: Wrote store to chrome.storage.');
  return result;
}
