let suggestionData = [];

function loadTagCSV() {
  return fetch('tags.csv?cache_bust=' + Date.now())
    .then(response => response.text())
    .then(text => {
      const textWithoutBOM = text.replace(/^\uFEFF/, '');
      const rows = textWithoutBOM.trim().split(/\r?\n/).slice(1);
      suggestionData = rows.map(row => {
        const cols = row.split(',');
        while (cols.length < 4) cols.push('');
        const label = cols[0].trim();
        const tags = cols[3].trim();
        return { label, tags };
      });
      console.log('Loaded tags:', suggestionData);
    });
}

function updateSuggestions(inputId, boxId) {
  const input = document.getElementById(inputId);
  const box = document.getElementById(boxId);
  box.innerHTML = '';

  const val = input.value.trim().toLowerCase();
  if (!val) {
    box.style.display = 'none';
    return;
  }

  const matches = suggestionData.filter(item =>
    item.tags.toLowerCase().includes(val) || item.label.toLowerCase().includes(val)
  );

  if (matches.length === 0) {
    box.style.display = 'none';
    return;
  }

  matches.forEach(item => {
    const div = document.createElement('div');
    div.textContent = item.label;
    div.addEventListener('click', () => {
      input.value = item.label;
      box.style.display = 'none';
    });
    box.appendChild(div);
  });

  box.style.display = 'block';
}

function loadUpdates() {
  fetch('update.csv?cache_bust=' + Date.now())
    .then(response => response.text())
    .then(text => {
      const textWithoutBOM = text.replace(/^\uFEFF/, '');
      const rows = textWithoutBOM.trim().split(/\r?\n/).slice(1); // ヘッダー除外
      const updateList = document.getElementById('update-list');
      if (!updateList) return;

      rows.reverse().forEach(row => {
        const cols = row.split(',');
        if (cols.length >= 2) {
          const li = document.createElement('li');
          li.textContent = `${cols[0]} ${cols[1]}`;
          updateList.appendChild(li);
        }
      });
    })
    .catch(err => {
      console.error('更新情報の読み込みに失敗しました:', err);
    });
}

document.addEventListener('DOMContentLoaded', () => {
  loadTagCSV().then(() => {
    const headerInput = document.getElementById('header-search');
    if (headerInput) {
      headerInput.addEventListener('input', () => {
        updateSuggestions('header-search', 'header-suggestion-box');
      });
    }

    const mainInput = document.getElementById('main-search');
    if (mainInput) {
      mainInput.addEventListener('input', () => {
        updateSuggestions('main-search', 'main-suggestion-box');
      });
    }
  });

  // ✅ 更新情報の読み込み
  loadUpdates();
});
