import React, { Component } from 'react';
import { Icon } from 'antd';
import './SearchBox.css';

// 模拟帮助文档标题数据
const helpDocuments = [
  '如何使用搜索功能',
  '产品分类说明',
  '购物车使用指南',
  '订单查询帮助',
  '支付方式介绍',
  '退换货政策',
  '会员权益说明',
  '物流配送信息',
  '常见问题解答',
  '联系客服指南'
];

class SearchBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      keyword: '',
      showDropdown: false,
      suggestions: [],
      selectedIndex: -1,
      searchHistory: []
    };
    this.dropdownRef = null;
    this.inputRef = null;
    this.setDropdownRef = (element) => {
      this.dropdownRef = element;
    };
    this.setInputRef = (element) => {
      this.inputRef = element;
    };
  }



  componentDidMount() {
    // 加载搜索历史记录
    if (this.props.enableHistory) {
      const history = localStorage.getItem('searchHistory');
      const searchHistory = history ? JSON.parse(history) : [];
      this.setState({ searchHistory });
    }

    // 处理点击外部关闭下拉面板
    this.handleClickOutside = this.handleClickOutside.bind(this);
    document.addEventListener('mousedown', this.handleClickOutside);

    // 处理移动端键盘适配
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside);
    window.removeEventListener('resize', this.handleResize);
  }

  // 处理点击外部关闭下拉面板
  handleClickOutside(event) {
    if (this.dropdownRef.current && !this.dropdownRef.current.contains(event.target)) {
      this.setState({ showDropdown: false });
    }
  }

  // 处理移动端键盘适配
  handleResize() {
    if (this.state.showDropdown && this.inputRef.current) {
      // 调起手机键盘时，输入框固定在屏幕顶部
      if (window.innerHeight < 500) {
        this.inputRef.current.style.position = 'fixed';
        this.inputRef.current.style.top = '0';
        this.inputRef.current.style.left = '0';
        this.inputRef.current.style.width = '100%';
        this.inputRef.current.style.zIndex = '9999';
      } else {
        this.inputRef.current.style.position = 'relative';
        this.inputRef.current.style.top = 'auto';
        this.inputRef.current.style.left = 'auto';
        this.inputRef.current.style.width = 'auto';
      }
    }
  }

  // 处理输入变化
  handleInputChange = (e) => {
    const value = e.target.value;
    this.setState({ keyword: value, selectedIndex: -1 });

    if (value.trim() === '') {
      // 输入为空时显示热门关键词和历史记录
      const { hotKeywords, enableHistory } = this.props;
      const { searchHistory } = this.state;
      const suggestions = [...hotKeywords, ...(enableHistory ? searchHistory : [])].slice(0, 8);
      this.setState({ suggestions });
    } else {
      // 实时联想匹配帮助文档标题
        const filtered = helpDocuments.filter(doc =>
          doc.toLowerCase().includes(value.toLowerCase())
        );
      this.setState({ suggestions: filtered.slice(0, 8) });
    }
  };

  // 处理搜索
  handleSearch = (searchKeyword = this.state.keyword) => {
    if (searchKeyword.trim() === '') return;

    // 更新搜索历史
    if (this.props.enableHistory) {
      let { searchHistory } = this.state;
      // 如果关键词已存在于历史记录中，移至首位
      const existingIndex = searchHistory.indexOf(searchKeyword);
      if (existingIndex !== -1) {
        searchHistory.splice(existingIndex, 1);
      }
      searchHistory.unshift(searchKeyword);
      // 最多保留8条历史记录
      searchHistory = searchHistory.slice(0, 8);
      this.setState({ searchHistory });
      localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    }

    // 调用搜索回调
    this.props.onSearch(searchKeyword);
    this.setState({ showDropdown: false });
  };

  // 处理键盘事件
  handleKeyDown = (e) => {
    const { key } = e;
    const { suggestions, selectedIndex } = this.state;

    if (key === 'ArrowUp') {
      e.preventDefault();
      const newIndex = selectedIndex > 0 ? selectedIndex - 1 : suggestions.length - 1;
      this.setState({ selectedIndex: newIndex });
    } else if (key === 'ArrowDown') {
      e.preventDefault();
      const newIndex = selectedIndex < suggestions.length - 1 ? selectedIndex + 1 : 0;
      this.setState({ selectedIndex: newIndex });
    } else if (key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        this.handleSearch(suggestions[selectedIndex]);
      } else {
        this.handleSearch();
      }
    }
  };

  // 处理历史记录删除
  handleDeleteHistory = (index) => {
    const { hotKeywords } = this.props;
    let { searchHistory } = this.state;
    searchHistory.splice(index, 1);
    this.setState({ searchHistory });
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    // 更新当前显示的建议列表
    if (this.state.keyword.trim() === '') {
      const suggestions = [...hotKeywords, ...searchHistory].slice(0, 8);
      this.setState({ suggestions });
    }
  };

  render() {
    const { keyword, showDropdown, suggestions, selectedIndex, searchHistory } = this.state;
    const { enableHistory } = this.props;

    return (
      <div className="search-box-container" ref={this.setDropdownRef}>
        <form className="search-bar" onSubmit={(e) => e.preventDefault()}>
          <input
            ref={this.setInputRef}
            type="text"
            value={keyword}
            onChange={this.handleInputChange}
            onKeyDown={this.handleKeyDown}
            onFocus={() => this.setState({ showDropdown: true })}
            placeholder="搜索商品或帮助文档"
          />
          <button
            className="search-btn"
            onClick={() => this.handleSearch()}
          >
            <Icon type="search" style={{ fontSize: 18 }} />
          </button>
        </form>

        {/* 下拉面板 */}
        {showDropdown && (
          <div className="search-dropdown">
            {suggestions.length > 0 ? (
              <ul className="suggestion-list">
                {suggestions.map((item, index) => (
                  <li
                    key={index}
                    className={`suggestion-item ${index === selectedIndex ? 'active' : ''}`}
                    onClick={() => this.handleSearch(item)}
                  >
                    {item}
                    {/* 历史记录项显示删除按钮 */}
                    {enableHistory && searchHistory.includes(item) && (
                      <span
                        className="delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          const historyIndex = searchHistory.indexOf(item);
                          this.handleDeleteHistory(historyIndex);
                        }}
                      >
                        <Icon type="close-circle-o" />
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="no-results">
                <Icon type="info-circle-o" style={{ fontSize: 24, color: '#ccc' }} />
                <p>没有找到合适的结果，换个关键词试试？</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}

SearchBox.defaultProps = {
  hotKeywords: [],
  enableHistory: true
};

export default SearchBox;