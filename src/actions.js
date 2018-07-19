import { getActiveTabId, sendMessageToActiveTab } from './utils/chrome.js';

export function updateStoreFromStorage() {
  return function (dispatch) {
    return new Promise((resolve, _) => {
      window.chrome.storage.local.get('__DC_store__', result => {
        if (result.__DC_store__) {
          const savedStore = JSON.parse(result.__DC_store__);
          dispatch({
            type: 'CHANGE_UI_LANGUAGE',
            payload: savedStore.uiLanguage
          })
        }
        resolve();
      });
    });
  }
}

export function popupOpened() {
  return function (dispatch) {
    return new Promise((resolve, _) => {
      sendMessageToActiveTab({
        type: 'popup-opened'
      })
      .then(response => {
        if (!response.ok && response.errorType) {
          dispatch({
            type: 'CHANGE_ERROR',
            payload: {
              hasError: true,
              errorType: response.errorType
            }
          });
        }
        resolve();
      })
      .catch(err => {
        console.log(err);
        resolve();
      });
    });
  }
}

export function changeDCLanguage(language) {
  return function (dispatch) {
    return new Promise((resolve, _) => {
      sendMessageToActiveTab({
        type: 'change-language',
        payload: language
      })
      .then(response => {
        // TODO - Check for response.ok?
        dispatch({
          type: 'CHANGE_SECOND_LANGUAGE',
          payload: language
        });
        resolve();
      })
      .catch(err => {
        console.log(err);
        resolve();
      });
    });
  }
}

// TODO - Combine? changeDCOn(isOn)?
export function turnDCOff(){
  return function (dispatch) {
    return new Promise((resolve, _) => {
      getActiveTabId()
        .then(tabId => {
          return new Promise(_resolve => {
            window.chrome.tabs.sendMessage(tabId, {
              type: 'stop-observer'
            }, _resolve);
          });
        })
        .then(response => {
          console.log('turnDCOff: response: ', response);
          if (!response) {
            dispatch({
              type: 'CHANGE_ERROR',
              payload: {
                hasError: true,
                errorType: 'no-dc'
              }
            });
            resolve();
          }
          if (response.ok) {
            dispatch({
              type: 'CHANGE_DC_ON',
              payload: false
            });
            resolve();
          } else {
            if (response.errorType) {
              dispatch({
                type: 'CHANGE_ERROR',
                payload: {
                  hasError: true,
                  errorType: response.errorType
                }
              });
            }
            resolve();
          }
        })
        .catch(() => {
          console.log(`actions: Can't get active tab ID, am I running locally?`);
          resolve();
          // TODO - Dispatch 'error' action
          // Unable to get active tab ID
        });
    });
  }
}

export function turnDCOn(){
  return function (dispatch) {
    return new Promise((resolve, _) => {
      getActiveTabId()
        .then(tabId => {
          return new Promise(_resolve => {
            window.chrome.tabs.sendMessage(tabId, {
              type: 'start-observer'
            }, _resolve);
          });
        })
        .then(response => {
          console.log('turnDCOn: response: ', response);
          if (!response) {
            dispatch({
              type: 'CHANGE_ERROR',
              payload: {
                hasError: true,
                errorType: 'no-dc'
              }
            });
            resolve();
          }
          if (response.ok) {
            dispatch({
              type: 'CHANGE_DC_ON',
              payload: true
            });
            resolve();
          } else {
            if (response.errorType) {
              dispatch({
                type: 'CHANGE_ERROR',
                payload: {
                  hasError: true,
                  errorType: response.errorType
                }
              });
            }
            resolve();
          }
        })
        .catch(() => {
          console.log(`actions: Can't get active tab ID, am I running locally?`);
          resolve();
          // TODO - Dispatch 'error' action
          // Unable to get active tab ID
        });
    });
  }
}

export function applyDCSettings() {
  return function (dispatch, getState) {
    return new Promise((resolve, _) => {
      const { settings } = getState();
      getActiveTabId()
        .then(tabId => {
          return new Promise(_resolve => {
            window.chrome.tabs.sendMessage(tabId, {
              type: 'change-settings',
              payload: settings
            }, _resolve);
          });
        })
        .then(resolve)
        .catch(() => {
          console.log(`actions: Can't get active tab ID, am I running locally?`);
          // TODO - Dispatch 'error' action
          // Unable to get active tab ID
          resolve();
        });
    });
  }
}

export function updateStoreFromDC() {
  console.log(`actions: Dispatching updateStoreFromDC()`);
  return function (dispatch) {
    return new Promise((resolve, _) => {
      getActiveTabId()
        .then(tabId => {
          return new Promise(_resolve => {
            window.chrome.tabs.sendMessage(tabId, {
              type: 'get-state',
            }, _resolve);
          });
        })
        .then(dcState => {
          if (dcState) {
            // TODO - This would be better as one action... lol
            dispatch({
              type: 'CHANGE_DC_ON',
              payload: dcState.isOn
            });
            dispatch({
              type: 'CHANGE_SECOND_LANGUAGE',
              payload: dcState.secondLanguage
            });
            dispatch({
              type: 'CHANGE_SETTINGS',
              payload: dcState.settings
            });
          } else {
            dispatch({
              type: 'CHANGE_DC_ON',
              payload: false
            });
          }
          resolve();
        })
        .catch(() => {
          console.log(`actions: Can't get active tab ID, am I running locally?`);
          // TODO - Dispatch 'error' action
          // Unable to get active tab ID
          resolve();
        });
    });
  }
}

// TODO - This isn't an action, move out of here.
export function isDCOn() {
  return new Promise((resolve, _) => {
    getActiveTabId()
      .then(tabId => {
        window.chrome.tabs.sendMessage(tabId, {
          type: 'is-on'
        }, resolve);
      })
      .catch(() => {
        resolve();
        // TODO - Need reject()?
      });
  });
}
