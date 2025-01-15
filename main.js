const GRID_ROWS = 100;
const GRID_COLUMNS = 100;

// 隐藏/显示诗词信息
document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('toggle-poem-info');
  const poemContainer = document.getElementById('poem-info-container');

  if (!toggleBtn) {
    console.error('未找到切换按钮元素');
    return;
  }
  if (!poemContainer) {
    console.error('未找到诗词容器元素');
    return;
  }

  // 设置极简风格按钮样式
  Object.assign(toggleBtn.style, {
    position: 'fixed',
    top: '24px',
    right: '24px',
    zIndex: '1000',
    padding: '8px',
    backgroundColor: 'transparent',
    color: '#333',
    border: '1px solid rgba(0,0,0,0.1)',
    borderRadius: '50%',
    cursor: 'pointer',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    transition: 'all 0.2s ease',
    fontSize: '18px',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  });

  // 添加悬停效果
  toggleBtn.addEventListener('mouseenter', () => {
    toggleBtn.style.backgroundColor = 'rgba(0,0,0,0.03)';
    toggleBtn.style.boxShadow = '0 3px 6px rgba(0,0,0,0.1)';
  });
  
  toggleBtn.addEventListener('mouseleave', () => {
    toggleBtn.style.backgroundColor = 'transparent';
    toggleBtn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
  });

  // 初始化状态
  toggleBtn.textContent = '▲';
  poemContainer.classList.remove('hidden'); // 默认显示

  // 添加点击事件
  toggleBtn.addEventListener('click', () => {
    const isHidden = poemContainer.classList.toggle('hidden');
    toggleBtn.textContent = isHidden ? '▼' : '▲';
    
    // 添加动画效果
    if (isHidden) {
      poemContainer.style.transition = 'opacity 0.3s ease';
      poemContainer.style.opacity = '0';
    } else {
      poemContainer.style.transition = 'opacity 0.3s ease';
      poemContainer.style.opacity = '1';
    }
  });

  // 确保按钮在最上层
  document.body.appendChild(toggleBtn);
});

// 去除标点符号
function removePunctuation(text) {
  return text.replace(/[，。！？；：、]/g, '');
}

// 创建不可编辑网格
function createStaticGrid() {
  const grid = document.getElementById('poem-grid');
  if (!grid) return;

  const SELECTED_COLOR = '#f0f0f0'; // 选中颜色
  const DEFAULT_COLOR = ''; // 默认颜色
  let selectedCells = [];
  
  // 添加输入按钮
  const inputBtn = document.createElement('button');
  inputBtn.textContent = '输入';
  inputBtn.style.position = 'fixed';
  inputBtn.style.bottom = '20px';
  inputBtn.style.left = '50%';
  inputBtn.style.transform = 'translateX(-50%)';
  inputBtn.style.width = '200px';
  inputBtn.style.padding = '10px 20px';
  inputBtn.style.backgroundColor = '#4CAF50';
  inputBtn.style.color = 'white';
  inputBtn.style.border = 'none';
  inputBtn.style.borderRadius = '5px';
  inputBtn.style.cursor = 'pointer';
  document.body.appendChild(inputBtn);

  let isDragging = false;
  let startCell = null;

  // 单元格鼠标按下事件
  function handleMouseDown(td) {
    // 清除之前所有选中单元格的颜色
    selectedCells.forEach(cell => {
      cell.style.backgroundColor = DEFAULT_COLOR;
    });
    selectedCells = [];
    
    // 如果点击已选中的单元格，则直接返回
    if (selectedCells.includes(td)) {
      return;
    }
    
    isDragging = true;
    startCell = td;
    selectedCells = [td];
    td.style.backgroundColor = SELECTED_COLOR;
  }

  // 单元格鼠标移动事件
  function handleMouseMove(td) {
    if (!isDragging) return;
    
    // 获取当前单元格位置
    const currentRow = td.parentElement.rowIndex;
    const currentCol = td.cellIndex;
    const startRow = startCell.parentElement.rowIndex;
    const startCol = startCell.cellIndex;

    // 计算选择区域
    const minRow = Math.min(startRow, currentRow);
    const maxRow = Math.max(startRow, currentRow);
    const minCol = Math.min(startCol, currentCol);
    const maxCol = Math.max(startCol, currentCol);

    // 保留之前已选中的单元格
    const previousSelection = selectedCells.filter(cell => 
      !grid.contains(cell) || 
      (cell.parentElement.rowIndex < minRow || 
       cell.parentElement.rowIndex > maxRow ||
       cell.cellIndex < minCol ||
       cell.cellIndex > maxCol)
    );

    // 清空当前选择区域
    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        const cell = grid.rows[row].cells[col];
        cell.style.backgroundColor = '';
      }
    }

    // 选择区域内的所有单元格
    selectedCells = []; // 重置选择
    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        const cell = grid.rows[row].cells[col];
        cell.style.backgroundColor = '#f0f0f0';
        if (!selectedCells.includes(cell)) {
          selectedCells.push(cell);
        }
      }
    }
  }

  // 单元格鼠标松开事件
  function handleMouseUp() {
    isDragging = false;
    startCell = null;
    
    // 保持选中状态，不清除颜色
    if (selectedCells.length > 0) {
      selectedCells.forEach(cell => {
        cell.style.backgroundColor = SELECTED_COLOR;
      });
    }
  }

  // 添加撤销按钮
  const undoBtn = document.createElement('button');
  undoBtn.textContent = '撤销';
  undoBtn.style.position = 'fixed';
  undoBtn.style.bottom = '20px';
  undoBtn.style.left = '400px';
  undoBtn.style.width = '100px';
  undoBtn.style.padding = '10px 20px';
  undoBtn.style.backgroundColor = '#f44336';
  undoBtn.style.color = 'white';
  undoBtn.style.border = 'none';
  undoBtn.style.borderRadius = '5px';
  undoBtn.style.cursor = 'pointer';
  document.body.appendChild(undoBtn);

  // 历史记录
  let history = [];
  let historyIndex = -1;

  // 撤销按钮点击事件
  undoBtn.addEventListener('click', () => {
    if (history.length === 0) {
      alert('没有可撤销的操作');
      return;
    }

    // 获取最近一次操作
    const lastState = history.pop();
    
    // 恢复之前的内容
    lastState.operations.forEach(op => {
      op.element.textContent = op.prevContent;
    });

    // 更新历史索引
    historyIndex = history.length - 1;
  });

  // 输入按钮点击事件
  inputBtn.addEventListener('click', () => {
    if (selectedCells.length === 0) {
      alert('请先选择单元格');
      return;
    }

    // 创建输入框
    const inputContainer = document.createElement('div');
    inputContainer.style.position = 'fixed';
    inputContainer.style.top = '50%';
    inputContainer.style.left = '50%';
    inputContainer.style.transform = 'translate(-50%, -50%)';
    inputContainer.style.backgroundColor = 'white';
    inputContainer.style.padding = '20px';
    inputContainer.style.borderRadius = '8px';
    inputContainer.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    inputContainer.style.zIndex = '1000';

    // 添加提示信息
    const hintText = document.createElement('div');
    hintText.textContent = `需要输入${selectedCells.length}个字`;
    hintText.style.marginBottom = '10px';
    hintText.style.color = '#666';
    inputContainer.appendChild(hintText);

    // 添加关闭按钮
    const closeBtn = document.createElement('div');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '10px';
    closeBtn.style.right = '15px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.fontSize = '24px';
    closeBtn.style.color = '#666';
    closeBtn.addEventListener('click', () => {
      inputContainer.remove();
      overlay.remove();
    });
    inputContainer.appendChild(closeBtn);

    // 点击外部关闭
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.zIndex = '999';
    overlay.addEventListener('click', () => {
      inputContainer.remove();
      overlay.remove();
    });

    const input = document.createElement('input');
    input.type = 'text';
    input.style.width = '300px';
    input.style.padding = '8px';
    input.style.marginRight = '10px';

    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = '确定';
    confirmBtn.style.padding = '8px 16px';
    confirmBtn.style.backgroundColor = '#4CAF50';
    confirmBtn.style.color = 'white';
    confirmBtn.style.border = 'none';
    confirmBtn.style.borderRadius = '4px';
    confirmBtn.style.cursor = 'pointer';

    // 确认按钮点击事件
    confirmBtn.addEventListener('click', () => {
      const text = input.value.trim();
      if (!text) {
        alert('请输入诗句');
        return;
      }

      if (text.length !== selectedCells.length) {
        alert(`选择的单元格数量（${selectedCells.length}）与输入的文字数量（${text.length}）不匹配`);
        return;
      }

      // 记录每个单元格的独立状态
      const operations = selectedCells.map((cell, index) => ({
        element: cell,
        prevContent: cell.textContent,
        newContent: text[index]
      }));

      // 填充文字
      operations.forEach(op => {
        op.element.textContent = op.newContent;
        op.element.style.backgroundColor = '';
      });

      // 添加新操作到历史记录
      history.push({
        operations,
        timestamp: Date.now()
      });
      historyIndex = history.length - 1;

      // 清空选择
      selectedCells = [];
      inputContainer.remove();
    });

    inputContainer.appendChild(input);
    inputContainer.appendChild(confirmBtn);
    document.body.appendChild(inputContainer);
    input.focus();
  });

  for (let row = 0; row < GRID_ROWS; row++) {
    const tr = document.createElement('tr');
    for (let col = 0; col < GRID_COLUMNS; col++) {
      const td = document.createElement('td');
      td.textContent = '';
      td.style.border = '1px solid #ddd';
      td.style.width = '20px';
      td.style.height = '20px';
      td.style.textAlign = 'center';
      td.style.cursor = 'pointer';
      
      // 添加鼠标事件监听
      td.addEventListener('mousedown', () => handleMouseDown(td));
      td.addEventListener('mouseenter', () => handleMouseMove(td));
      td.addEventListener('mouseup', handleMouseUp);

      // 添加滚动效果
      td.addEventListener('click', function() {
        const rect = td.getBoundingClientRect();
        const container = document.getElementById('poem-container');
        if (container) {
          const scrollX = rect.left + rect.width/2 - window.innerWidth/2;
          const scrollY = rect.top + rect.height/2 - window.innerHeight/2;
          container.scrollTo({
            left: scrollX,
            top: scrollY,
            behavior: 'smooth'
          });
        }
      });
      
      tr.appendChild(td);
    }
    grid.appendChild(tr);
  }
}

// 创建弹窗显示搜索结果
function showSearchResults(results) {
  const modal = document.createElement('div');
  modal.style.position = 'fixed';
  modal.style.top = '20px';
  modal.style.left = '50%';
  modal.style.transform = 'translateX(-50%)';
  modal.style.backgroundColor = 'white';
  modal.style.padding = '15px';
  modal.style.borderRadius = '8px';
  modal.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
  modal.style.zIndex = '1000';
  modal.style.width = '80%';
  modal.style.maxWidth = '600px';
  modal.style.maxHeight = '80vh';
  modal.style.overflowY = 'auto';
  
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '关闭';
  closeBtn.style.float = 'right';
  closeBtn.addEventListener('click', () => modal.remove());
  
  const content = document.createElement('div');
  content.innerHTML = results;
  
  modal.appendChild(closeBtn);
  modal.appendChild(content);
  document.body.appendChild(modal);
}

// 添加提示按钮
const hintBtn = document.createElement('button');
hintBtn.textContent = '提示';
hintBtn.style.position = 'fixed';
hintBtn.style.bottom = '20px';
hintBtn.style.right = '400px';
hintBtn.style.width = '100px';
hintBtn.style.padding = '10px 20px';
hintBtn.style.backgroundColor = '#4CAF50';
hintBtn.style.color = 'white';
hintBtn.style.border = 'none';
hintBtn.style.borderRadius = '5px';
hintBtn.style.cursor = 'pointer';
document.body.appendChild(hintBtn);

// 提示按钮点击事件
hintBtn.addEventListener('click', async () => {
  try {
    // 获取选中文本
    const selectedText = getSelectedText();
    if (!selectedText) {
      showSearchResults('<p>请先选择一个字</p>');
      return;
    }

    // 加载本地诗词数据库
    let tangData = [], songData = [];
    try {
      const [tangRes, songRes] = await Promise.all([
        fetch('ts.json'),
        fetch('sc.json')
      ]);
      
      if (!tangRes.ok) throw new Error('唐诗数据加载失败');
      if (!songRes.ok) throw new Error('宋词数据加载失败');
      
      tangData = await tangRes.json();
      songData = await songRes.json();      
     
      if (!Array.isArray(tangData) || !Array.isArray(songData)) {
        throw new Error('数据格式错误：应为数组');
      }
    } catch (error) {
      console.error('数据加载错误:', error);
      showSearchResults(`<p>数据加载失败：${error.message}</p>`);
      return;
    }
    
    // 合并唐诗宋词数据
    const allPoems = [...tangData, ...songData];
    
    // 搜索包含选中文本的诗句
    console.log('搜索关键词:', selectedText);
    console.log('总数据量:', allPoems.length);
    
    // 获取所有匹配的诗句
    const allMatches = allPoems
      .filter(poem => {
        if (!poem || !poem.paragraphs || !Array.isArray(poem.paragraphs)) {
          return false;
        }
        try {
          const cleanContent = poem.paragraphs
            .filter(p => typeof p === 'string')
            .join('');
          return removePunctuation(cleanContent).includes(selectedText);
        } catch (error) {
          console.error('处理诗词数据出错:', error);
          return false;
        }
      })
      .flatMap(poem => {
        return poem.paragraphs
          .filter(line => typeof line === 'string' && removePunctuation(line).includes(selectedText))
          .map(line => ({
            line,
            poem,
            dynasty: tangData.includes(poem) ? '唐朝' : '宋朝'
          }));
      })
      .slice(0, 100); // 最多返回100条结果

    // 随机选择5条结果
    const matchedPoems = [];
    while (matchedPoems.length < 5 && allMatches.length > 0) {
      const randomIndex = Math.floor(Math.random() * allMatches.length);
      matchedPoems.push(allMatches.splice(randomIndex, 1)[0]);
    }

    if (matchedPoems.length > 0) {
      // 格式化结果显示
      let resultHtml = '<h3>相关诗句：</h3>';
      matchedPoems.forEach(match => {
        resultHtml += `<p>${match.line}</p>`;
        const title = match.poem.title || '无题';
        resultHtml += `<p>【${match.dynasty}】${match.poem.author}《${title}》</p><hr>`;
      });
      showSearchResults(resultHtml);
    } else {
      showSearchResults('<p>未找到相关诗句</p>');
    }
  } catch (error) {
    console.error('搜索失败，错误信息：', error.message);
    showSearchResults(`<p>搜索失败：${error.message}</p>`);
  }
});

// 获取选中文本
function getSelectedText() {
  const selection = window.getSelection();
  if (selection && selection.toString().trim()) {
    return selection.toString().trim();
  }
  
  return null;
}

// 初始化隐藏诗词内容
const showFullPoemBtn = document.getElementById('show-full-poem');
const fullPoemContent = document.getElementById('full-poem-content');
const fullPoem = document.getElementById('full_poem');
const poemExplanation = document.getElementById('poem_explanation');

if (showFullPoemBtn && fullPoemContent) {
  fullPoemContent.classList.add('hidden');
  showFullPoemBtn.textContent = '显示全文';

  showFullPoemBtn.addEventListener('click', () => {
    fullPoemContent.classList.toggle('hidden');
    showFullPoemBtn.textContent = fullPoemContent.classList.contains('hidden') ? '显示全文' : '隐藏全文';
    fullPoemContent.style.maxHeight = fullPoemContent.classList.contains('hidden') ? '0' : fullPoemContent.scrollHeight + 'px';
  });
}

// 使用金诗词语API
window.jinrishici.load(function(result) {
  if (fullPoem) {
    fullPoem.textContent = result.data.origin.content.join('\n');
  }
  createStaticGrid();
  
  const originalPoem = result.data.content.replace(/《.*》/, '');
  const cleanPoem = removePunctuation(originalPoem);
  const cells = document.querySelectorAll('#poem-grid td');
  const startRow = Math.floor(GRID_ROWS / 2);
  const startCol = Math.floor((GRID_COLUMNS - cleanPoem.length) / 2);
  
  for (let i = 0; i < cleanPoem.length; i++) {
    const index = (startRow * GRID_COLUMNS) + startCol + i;
    if (index < cells.length) {
      cells[index].textContent = cleanPoem[i];
    }
  }

  const sentence = document.querySelector("#poem_sentence");
  const info = document.querySelector("#poem_info");
  const translation = document.querySelector("#poem_translation");
  
  if (sentence) sentence.innerHTML = result.data.content;
  if (info) info.innerHTML = '【' + result.data.origin.dynasty + '】' + 
                  result.data.origin.author + '《' + 
                  result.data.origin.title + '》';
  if (translation) {
    if (result.data.origin.translate) {
      translation.innerHTML = result.data.origin.translate.join('<br>');
      translation.style.display = 'block';
    } else {
      translation.style.display = 'none';
    }
  }
});

