class DualCaptions {
  constructor() {
    this.isOn = false;
    this.observer = new window.MutationObserver(this._onMutation.bind(this));

    // Default settings
    this.settingsAreDefault = true;
    this.secondLanguage = 'en';
    this.extraSpace = false;
    this.delayRenderingUntilTranslation = true;
    this.colorSubtitleEnabled = false;
    this.colorSubtitleBackgroundColor = '#000000';
    this.colorSubtitleTextColor = '#FFFFFF';

    this._getInitialState();

    window.chrome.runtime.onMessage.addListener(this._onMessage.bind(this));
  }
  _getInitialState() {
    // TODO - Send message -> background page - 'get-store'
    // TODO - onResponse callback - set settings
  }
  _onMessage(message, sender, sendResponse) {
    switch (message.type) {
      case 'change-language':
      this.secondLanguage = message.payload;
      sendResponse({ok: true});
      break;

      case 'change-settings':
      this.settingsAreDefault = false;
      this.extraSpace = message.payload.extraSpace;
      this.delayRenderingUntilTranslation = message.payload.delayRenderingUntilTranslation;
      this.colorSubtitleEnabled = message.payload.colorSubtitleEnabled;
      this.colorSubtitleBackgroundColor = message.payload.colorSubtitleBackgroundColor;
      this.colorSubtitleTextColor = message.payload.colorSubtitleTextColor;
      sendResponse({ok: true});
      break;

      case 'detect-site':
      sendResponse({
        ok: true,
        site: window.DC.config.site
      });
      break;

      case 'get-state':
      sendResponse({
        ok: true,
        settingsAreDefault: this.settingsAreDefault,
        isOn: this.isOn,
        secondLanguage: this.secondLanguage,
        settings: {
          colorSubtitleEnabled: this.colorSubtitleEnabled,
          colorSubtitleBackgroundColor: this.colorSubtitleBackgroundColor,
          colorSubtitleTextColor: this.colorSubtitleTextColor,
          delayRenderingUntilTranslation: this.delayRenderingUntilTranslation,
          extraSpace: this.extraSpace
        }
      });
      break;

      case 'get-language':
      sendResponse({
        ok: true,
        secondLanguage: this.secondLanguage
      });
      break;

      case 'is-on':
      sendResponse({
        ok: true,
        isOn: this.isOn
      });
      break;

      case 'popup-opened':
      const response = window.DC.config.onPopupOpened();
      sendResponse({
        ok: response.ok,
        errorType: response.errorType
      });
      break;

      case 'start-observer':
      try {
        this.observer.observe(window.DC.config.getPlayer(), {
          childList: true,
          subtree: true
        });
        this.isOn = true;
        sendResponse({
          ok: true
        });
      } catch(err) {
        sendResponse({
          ok: false,
          errorType: 'no-player'
        });
      }
      break;

      case 'stop-observer':
      this._stopObserver();
      sendResponse({
        ok: true
      });
      break;
    }
  }
  _onMutation(mutationRecords) {
    mutationRecords.forEach(mutation => {
      let captionWasAdded = window.DC.config.captionWasAdded(mutation);
      if (captionWasAdded) {
        const newCaptionOrder = window.DC.config.getNewCaptionOrder();
        let newCaption = window.DC.config.getNewCaption(mutation);
        if (newCaption) {
          this.lastCaption = newCaption.innerText;
          newCaption.classList.add('original-caption');
          if (!this.delayRenderingUntilTranslation) {
            newCaption.classList.add('translated');
          }
          window.DC.translate(this.lastCaption, {
            from: 'auto',
            to: this.secondLanguage
          }).then(translation => {
            if (!this._translationIsInDOM(translation.text)) {
              let translatedCaption = document.createElement('span');
              translatedCaption.innerText = translation.text;
              translatedCaption.setAttribute('__dc-caption__', true);
              translatedCaption = window.DC.config.styleCaptionElement(translatedCaption, mutation, newCaptionOrder);
              if (this.colorSubtitleEnabled) {
                translatedCaption.style.color = this.colorSubtitleTextColor;
                translatedCaption.style.backgroundColor = this.colorSubtitleBackgroundColor;
              }
              if (this.extraSpace) {
                let breakElement = this._createBreakElement();
                window.DC.config.appendToDOM(breakElement);
              }
              window.DC.config.appendToDOM(translatedCaption);
              newCaption.classList.add('translated');
            } else {
              newCaption.classList.add('translated');
            }
          });
        }
      }
    });
  }
  _stopObserver() {
    this.observer.disconnect();
    this.isOn = false;
  }
  _translationIsInDOM(translation) {
    const captions = Array.from(document.querySelectorAll(`[__dc-caption__]`));
    if (captions.length > 0) {
      const translationsInDOM = captions.map(caption => { return caption.innerText  });
      return translationsInDOM.includes(translation);
    } else {
      return false;
    }
  }
  _createBreakElement() {
    let breakElement = document.createElement('div');
    breakElement.style.cssText = 'height: 10px';
    breakElement.setAttribute('__dc-break__', true);
    return breakElement;
  }
}

window.DC.DUAL_CAPTIONS = new DualCaptions();
