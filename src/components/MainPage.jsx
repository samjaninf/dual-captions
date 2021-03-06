import React, { Component } from 'react';
import Toggle from 'react-toggle';
import { changeDCLanguage, turnDCOff, turnDCOn } from '../actions';
import config from '../config';
import Hint from './Hint.jsx';
import { translate } from 'react-i18next';

class MainPage extends Component {
  _onToggleChanged(e) {
    if (e.target.checked) {
      this.props.dispatch(turnDCOn());
    } else {
      this.props.dispatch(turnDCOff());
    }
  }

  _onSecondLanguageSelectChanged(e) {
    this.props.dispatch(changeDCLanguage(e.target.value));
  }

  render() {
    const secondLanguagesKeys = Object.keys(config.secondLanguages);
    const secondLanguages = secondLanguagesKeys.map(language => (
      <option
        key={language}
        value={language}>
        {config.secondLanguages[language]}
      </option>
    ));
    return (
      <div className='page'>
        <div className='container'>
          <div className='step-container'>
            <div className='step-number'>
              <span>1</span>
            </div>
            <div className='step-content step-1'>
              <Hint detectedSite={this.props.detectedSite}/>
            </div>
          </div>
        </div>
        <div className='container'>
          <div className='step-container'>
            <div className='step-number'>
              <span>2</span>
            </div>
            <div className='step-content step-2'>
              <label>
                <Toggle
                  checked={this.props.isOn}
                  icons={false}
                  onChange={this._onToggleChanged.bind(this)} />
                <div>{ this.props.isOn ? this.props.t('on') : this.props.t('off') }</div>
              </label>
              <label>
                <select
                  value={this.props.secondLanguage}
                  onChange={this._onSecondLanguageSelectChanged.bind(this)}>
                  { secondLanguages }
                </select>
                <div>{this.props.t('second-subtitle-language')}</div>
              </label>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export { MainPage };
export default translate()(MainPage);
