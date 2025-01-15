// 初始化表格
const grid = document.getElementById('poem-grid');
let selectedCells = [];
let selectionStart = null;
let selectionDirection = null;

// 创建100x100表格
function createGrid() {
  const rows = 100;
  const cols = 100;
  
  // 清空现有表格
  grid.innerHTML = '';
  
  // 创建表格行和单元格
  for (let i = 0; i < rows; i++) {
    const row = document.createElement('tr');
    for (let j = 0; j < cols; j++) {
      const cell = document.createElement('td');
      row.appendChild(cell);
    }
    grid.appendChild(row);
  }
}

// 将诗句居中显示
function displayPoemInCenter(poem) {
  const rows = grid.rows;
  const cols = rows[0].cells.length;
  
  // 计算中心位置
  const centerRow = Math.floor(rows.length / 2);
  const centerCol = Math.floor(cols / 2);
  
  // 计算诗句起始位置
  const startRow = centerRow - Math.floor(poem.length / 2);
  const startCol = centerCol - Math.floor(poem[0].length / 2);
  
  // 将诗句写入表格
  for (let i = 0; i < poem.length; i++) {
    for (let j = 0; j < poem[i].length; j++) {
      const row = startRow + i;
      const col = startCol + j;
      if (row >= 0 && row < rows.length && col >= 0 && col < cols) {
        rows[row].cells[col].textContent = poem[i][j];
      }
    }
  }
}

// 获取单元格坐标
function getCellPosition(cell) {
  const row = cell.parentElement.rowIndex;
  const col = cell.cellIndex;
  return { row, col };
}

// 清除所有选中状态
function clearSelection() {
  selectedCells.forEach(cell => cell.classList.remove('selected'));
  selectedCells = [];
  selectionStart = null;
  selectionDirection = null;
}

// 初始化放大镜
const magnifier = document.getElementById('magnifier');
const magnifierContent = magnifier.querySelector('.magnifier-content');

// 更新放大镜显示
function updateMagnifier(text) {
  if (!text) {
    magnifierContent.textContent = '当前单元格为空';
    magnifierContent.classList.add('magnifier-empty');
  } else {
    magnifierContent.textContent = text;
    magnifierContent.classList.remove('magnifier-empty');
  }
}

// 监听单元格点击事件
grid.addEventListener('mousedown', function(e) {
  const cell = e.target;
  if (cell.tagName === 'TD') {
    // 按住Ctrl键可以多选
    if (!e.ctrlKey) {
      clearSelection();
    }
    selectionStart = getCellPosition(cell);
    cell.classList.add('selected');
    selectedCells.push(cell);
  }
});

grid.addEventListener('mouseover', function(e) {
  const cell = e.target;
  if (cell.tagName === 'TD' && selectionStart && e.buttons === 1) {
    const currentPos = getCellPosition(cell);
    
    // 判断选择方向
    if (!selectionDirection) {
      if (currentPos.row !== selectionStart.row) {
        selectionDirection = 'vertical';
      } else if (currentPos.col !== selectionStart.col) {
        selectionDirection = 'horizontal';
      }
    }
    
    // 清除之前的选中状态
    if (!e.ctrlKey) {
      clearSelection();
    }
    
    // 根据方向选择连续单元格
    if (selectionDirection === 'horizontal') {
      const startCol = Math.min(selectionStart.col, currentPos.col);
      const endCol = Math.max(selectionStart.col, currentPos.col);
      const row = selectionStart.row;
      
      for (let col = startCol; col <= endCol; col++) {
        const cell = grid.rows[row].cells[col];
        if (!cell.classList.contains('selected')) {
          cell.classList.add('selected');
          selectedCells.push(cell);
        }
      }
    } else if (selectionDirection === 'vertical') {
      const startRow = Math.min(selectionStart.row, currentPos.row);
      const endRow = Math.max(selectionStart.row, currentPos.row);
      const col = selectionStart.col;
      
      for (let row = startRow; row <= endRow; row++) {
        const cell = grid.rows[row].cells[col];
        if (!cell.classList.contains('selected')) {
          cell.classList.add('selected');
          selectedCells.push(cell);
        }
      }
    }
  }
});

// 创建提示按钮
const createHintButton = () => {
    const hintButton = document.createElement('button');
    hintButton.id = 'hint-button';
    hintButton.textContent = '提示';
    hintButton.className = 'hint-button';
    document.body.appendChild(hintButton);
    
    // 添加点击事件
    hintButton.addEventListener('click', handleHintClick);
};

// 处理提示按钮点击
async function handleHintClick() {
    const selectedText = magnifierContent.textContent;
    if (!selectedText || selectedText === '当前单元格为空') {
        showMessage('请先选择一个格子');
        return;
    }

    // 从本地数据搜索
    const poems = searchLocalPoems(selectedText);
    if (poems.length > 0) {
        showPoemHints(poems);
    } else {
        showMessage('未找到相关诗句');
    }
}

// 搜索包含指定文字的诗句
function searchPoems(keyword) {
    return searchLocalPoems(keyword);
}

// 显示诗句提示弹窗
function showPoemHints(poems) {
    // 创建弹窗元素
    const modal = document.createElement('div');
    modal.className = 'hint-modal';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'hint-modal-content';
    
    // 添加标题
    const title = document.createElement('h3');
    title.textContent = '相关诗句提示';
    modalContent.appendChild(title);
    
    // 添加诗句列表
    const list = document.createElement('ul');
    poems.forEach(poem => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="poem-line">${poem.content}</div>
            <div class="poem-source">${poem.origin.title} - ${poem.origin.author}</div>
        `;
        list.appendChild(li);
    });
    modalContent.appendChild(list);
    
    // 添加关闭按钮
    const closeButton = document.createElement('button');
    closeButton.className = 'close-button';
    closeButton.textContent = '关闭';
    closeButton.onclick = () => modal.remove();
    modalContent.appendChild(closeButton);
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

// 显示提示消息
function showMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 2000);
}

let localPoems = [];

// 异步加载诗句数据
async function loadPoemData() {
    try {
        const [tsResponse, scResponse] = await Promise.all([
            fetch('ts.json'),
            fetch('sc.json')
        ]);
        
        const tsData = await tsResponse.json();
        const scData = await scResponse.json();
        
        // 合并两个数据源
        localPoems = [...tsData, ...scData];
    } catch (error) {
        console.error('加载诗句数据失败:', error);
    }
}

// 从本地数据搜索诗句
function searchLocalPoems(keyword) {
    if (!localPoems.length) {
        console.warn('诗句数据尚未加载完成');
        return [];
    }
    return localPoems.filter(poem => 
        poem.content.includes(keyword)
    ).slice(0, 5); // 最多返回5条结果
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', async function() {
    // 显示加载提示
    showMessage('正在加载诗句数据...');
    
    try {
        // 创建100x100表格
        createGrid();
        // 预加载诗句数据
        await loadPoemData();
        // 创建提示按钮
        createHintButton();
        showMessage('诗句数据加载完成');
    } catch (error) {
        console.error('初始化失败:', error);
        showMessage('诗句数据加载失败');
    }
});
