import { Subject } from 'rx';
import React, { PropTypes } from 'react';
import { createSelector } from 'reselect';
import { connect } from 'react-redux';

import Codemirror from 'react-codemirror';
import NoSSR from 'react-no-ssr';
import PureComponent from 'react-pure-render/component';

const mapStateToProps = createSelector(
  state => state.app.windowHeight,
  state => state.app.navHeight,
  (windowHeight, navHeight) => ({ height: windowHeight - navHeight - 50 })
);

const editorDebounceTimeout = 750;

const options = {
  lint: true,
  lineNumbers: true,
  mode: 'javascript',
  theme: 'monokai',
  runnable: true,
  matchBrackets: true,
  autoCloseBrackets: true,
  scrollbarStyle: 'null',
  lineWrapping: true,
  gutters: ['CodeMirror-lint-markers']
};

export class Editor extends PureComponent {
  constructor(...args) {
    super(...args);
    this._editorContent$ = new Subject();
    this.handleChange = this.handleChange.bind(this);
  }
  static displayName = 'Editor';
  static propTypes = {
    height: PropTypes.number,
    content: PropTypes.string,
    mode: PropTypes.string,
    updateFile: PropTypes.func
  };

  static defaultProps = {
    content: '// Happy Coding!',
    mode: 'javascript'
  };

  componentDidMount() {
    const { updateFile = (() => {}) } = this.props;
    this._subscription = this._editorContent$
      .debounce(editorDebounceTimeout)
      .distinctUntilChanged()
      .subscribe(
        updateFile,
        err => { throw err; }
      );
  }

  componentWillUnmount() {
    if (this._subscription) {
      this._subscription.dispose();
      this._subscription = null;
    }
  }

  handleChange(value) {
    if (this._subscription) {
      this._editorContent$.onNext(value);
    }
  }

  render() {
    const { content, height, mode } = this.props;
    const style = {};
    if (height) {
      style.height = height + 'px';
    }
    return (
      <div
        className='challenges-editor'
        style={ style }>
        <NoSSR>
          <Codemirror
            onChange={ this.handleChange }
            options={{ ...options, mode }}
            value={ content } />
        </NoSSR>
      </div>
    );
  }
}

export default connect(mapStateToProps)(Editor);
