/* ==========================================================================
   ЦИФРОВА ЕКСПЕДИЦІЯ: ТАЄМНИЦІ СТИСНЕННЯ ДАНИХ (8 КЛАС)
   Логіка тренажерів, стан прогресу, калькулятор K, симулятори
   ========================================================================== */

// Стан користувача (збереження в LocalStorage)
const STORAGE_KEY = 'zip_lesson_8th_grade_state_v1';

let gameState = {
  score: 0,
  maxScore: 120,
  progress: 0,
  completedMissions: {
    q1: false,
    q2: false,
    formatExplored: false,
    simAddArchive: false,
    contextMission1: false,
    contextMission2: false,
    labExperiment: false,
    examSort: false,
    examScenario: false,
    examModes: false
  },
  userName: 'Учень 8-го класу',
  checklist: [false, false, false, false, false, false]
};

// Завантаження стану при старті
window.addEventListener('DOMContentLoaded', () => {
  loadState();
  initTextbookImages();
  initSimulatorInspect();
  updateSimCompressionStats();
  initVirtualDesktop();
  runCompressionLab();
  updateCertPreview();
  renderChecklist();
});

// Підстановка витягнутих з підручника малюнків (Base64 або локальні файли)
function initTextbookImages() {
  const mapping = [
    { id: 'imgFig210', key: 'fig_2_10_icons.png' },
    { id: 'imgFig211', key: 'fig_2_11_7zip_window.png' },
    { id: 'imgFig212', key: 'fig_2_12_add_to_archive.png' },
    { id: 'imgFig213', key: 'fig_2_13_update_mode.png' },
    { id: 'imgFig214', key: 'fig_2_14_context_menu.png' },
    { id: 'imgZarchiver', key: 'zarchiver_icon.png' }
  ];

  mapping.forEach(item => {
    const el = document.getElementById(item.id);
    if (el) {
      if (typeof ASSETS !== 'undefined' && ASSETS[item.key]) {
        el.src = ASSETS[item.key];
      } else {
        el.src = item.key; // прямий fallback
      }
    }
  });
}

// ----------------------------------------------------
// РОБОТА З ПРОГРЕСОМ ТА LOCALSTORAGE
// ----------------------------------------------------
function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  } catch (e) {
    console.error('LocalStorage write failed:', e);
  }
  renderHUD();
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      gameState = { ...gameState, ...parsed };
    }
  } catch (e) {
    console.warn('LocalStorage read error:', e);
  }
  renderHUD();
}

function addScore(points, missionKey) {
  if (missionKey && gameState.completedMissions[missionKey]) {
    return; // вже нараховано раніше
  }
  if (missionKey) {
    gameState.completedMissions[missionKey] = true;
  }
  gameState.score = Math.min(gameState.maxScore, gameState.score + points);
  
  // Розрахунок відсотка виконання
  const totalTasks = Object.keys(gameState.completedMissions).length;
  const doneTasks = Object.values(gameState.completedMissions).filter(Boolean).length;
  gameState.progress = Math.round((doneTasks / totalTasks) * 100);

  saveState();
}

function renderHUD() {
  const scoreDisp = document.getElementById('scoreDisplay');
  const progDisp = document.getElementById('progressPercent');
  const progFill = document.getElementById('progressBarFill');
  const rankDisp = document.getElementById('userRank');

  if (scoreDisp) scoreDisp.innerText = `${gameState.score} / ${gameState.maxScore}`;
  if (progDisp) progDisp.innerText = `${gameState.progress}%`;
  if (progFill) progFill.style.width = `${gameState.progress}%`;

  let rank = 'Стажер-архіваріус';
  if (gameState.score >= 100) rank = 'Експерт-Архіваріус 8 класу';
  else if (gameState.score >= 70) rank = 'Старший Системний Адмін';
  else if (gameState.score >= 35) rank = 'Майстер Компресії';

  if (rankDisp) rankDisp.innerText = rank;

  updateCertPreview();
}

document.getElementById('resetBtn')?.addEventListener('click', () => {
  if (confirm('Скинути весь прогрес експедиції та почати спочатку?')) {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  }
});

// Навігація по вкладках
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', function(e) {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    this.classList.add('active');
  });
});

// ----------------------------------------------------
// БЛОК 1: ВІКТОРИНА
// ----------------------------------------------------
function checkQ1() {
  const selected = document.querySelector('input[name="q1"]:checked');
  const fb = document.getElementById('q1_fb');
  if (!selected) {
    alert('Оберіть варіант відповіді!');
    return;
  }
  if (selected.value === 'b') {
    fb.className = 'q-feedback correct';
    fb.innerHTML = '✅ <strong>Правильно! (+10 XP)</strong> Google Диск автоматично об\'єднує вибрані файли або цілу папку в єдиний zip-архів перед завантаженням (підручник, стор. 42).';
    addScore(10, 'q1');
  } else {
    fb.className = 'q-feedback wrong';
    fb.innerHTML = '❌ <strong>Не зовсім так.</strong> Google Диск не видаляє файли і не створює exe. Він пакує їх у стандартний універсальний архів <strong>ZIP</strong>.';
  }
}

function checkQ2() {
  const selected = document.querySelector('input[name="q2"]:checked');
  const fb = document.getElementById('q2_fb');
  if (!selected) {
    alert('Оберіть варіант відповіді!');
    return;
  }
  if (selected.value === 'a') {
    fb.className = 'q-feedback correct';
    fb.innerHTML = '✅ <strong>Абсолютно вірно! (+10 XP)</strong> Програми та тексти вимагають 100% збереження кожного символу. Тому архіватори використовують <em>лише стиснення без втрати даних (lossless)</em>.';
    addScore(10, 'q2');
  } else {
    fb.className = 'q-feedback wrong';
    fb.innerHTML = '❌ <strong>Помилка.</strong> У програмах і текстах зміна навіть 1 байта призведе до краху системи або зіпсованого документа.';
  }
}

// ----------------------------------------------------
// БЛОК 2: КАРТОТЕКА ФОРМАТІВ
// ----------------------------------------------------
function toggleFormat(card) {
  card.classList.toggle('active');
  addScore(5, 'formatExplored');
}

// ----------------------------------------------------
// БЛОК 3: СИМУЛЯТОР 7-ZIP
// ----------------------------------------------------
function switchSimTab(tab) {
  document.querySelectorAll('.sim-tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.sim-tab-pane').forEach(p => p.classList.remove('active'));

  if (tab === 'mainWin') {
    document.querySelectorAll('.sim-tab-btn')[0].classList.add('active');
    document.getElementById('simTabMainWin').classList.add('active');
  } else {
    document.querySelectorAll('.sim-tab-btn')[1].classList.add('active');
    document.getElementById('simTabDialogWin').classList.add('active');
  }
}

function initSimulatorInspect() {
  const inspectElements = document.querySelectorAll('.inspectable');
  const guideText = document.getElementById('guideDetailText');

  inspectElements.forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const tip = el.getAttribute('data-tip');
      if (tip && guideText) {
        guideText.innerHTML = `<strong>Опис елемента:</strong> ${tip}`;
      }
    });
  });
}

function toggleRowSelect(row) {
  row.classList.toggle('selected-row');
  const selectedRows = document.querySelectorAll('#fileTableBody tr.selected-row');
  const statusInfo = document.getElementById('statusSelectedInfo');
  
  let totalBytes = 0;
  selectedRows.forEach(r => {
    if (r.cells[0].innerText.includes('photo')) totalBytes += 3145780;
    if (r.cells[0].innerText.includes('text')) totalBytes += 1048576;
    if (r.cells[0].innerText.includes('backup')) totalBytes += 420112;
  });

  statusInfo.innerText = `Вибрано ${selectedRows.length} об'єкт(ів) (${totalBytes.toLocaleString('uk-UA')} Б)`;
}

function openAddDialogSim() {
  switchSimTab('dialogWin');
  const selectedRows = document.querySelectorAll('#fileTableBody tr.selected-row');
  const nameInput = document.getElementById('dlgArchiveName');
  if (selectedRows.length === 1) {
    nameInput.value = 'Архів_документів.7z';
  } else {
    nameInput.value = 'Малюнки_та_звіти.7z';
  }
}

function triggerSimAction(act) {
  const messages = {
    extract: '📂 Видобування: відкрито вікно розархівування файлів у вибрану теку.',
    test: '🧪 Тестування: перевірка цілісності контрольних сум архіву. Помилок не виявлено!',
    copy: '📋 Скопійовано виділені об\'єкти.',
    move: '✂️ Об\'єкти готові до переміщення.',
    delete: '🗑️ Видалити: вибрані файли буде вилучено з архіву.',
    info: 'ℹ️ Інформація: відображення властивостей папки/архіву.'
  };
  alert(messages[act] || act);
}

// Повзунок стиснення
const compLevels = ['Без стиснення', 'Найшвидше', 'Швидке', 'Нормальне', 'Максимальне', 'Ультра'];
function onCompSliderChange(val) {
  document.getElementById('compLevelBadge').innerText = compLevels[val];
  updateSimCompressionStats();
}

function updateSimCompressionStats() {
  const sliderVal = parseInt(document.getElementById('dlgCompLevel')?.value || 3);
  const isSfx = document.getElementById('dlgSfx')?.checked;
  const format = document.getElementById('dlgFormat')?.value || '7z';
  const pass = document.getElementById('dlgPass1')?.value;

  const estSizeEl = document.getElementById('simEstSize');
  const estSpeedEl = document.getElementById('simEstSpeed');
  const estExtEl = document.getElementById('simEstExt');
  const ruleHint = document.getElementById('simRuleHint');

  let baseOriginal = 4.2; // МБ
  let ratio = [1.0, 0.65, 0.45, 0.32, 0.25, 0.20][sliderVal];
  let speeds = ['⚡ Миттєво (Store)', '⚡ Дуже швидко', '⚡ Швидко', '⚖️ Середня', '⏳ Повільно', '🐢 Найповільніше'];

  if (format === 'zip') ratio += 0.08;
  if (format === 'tar') ratio = 1.0;

  let estSize = (baseOriginal * ratio).toFixed(2);
  if (isSfx) {
    estSize = (parseFloat(estSize) + 0.35).toFixed(2); // додаємо вагу модуля SFX
  }

  if (estSizeEl) estSizeEl.innerText = `${estSize} МБ (було 4.2 МБ)`;
  if (estSpeedEl) estSpeedEl.innerText = speeds[sliderVal];
  if (estExtEl) estExtEl.innerText = isSfx ? '.exe (самовидобувний)' : `.${format}`;

  if (ruleHint) {
    if (sliderVal === 0) {
      ruleHint.innerHTML = '💡 <em>Без стиснення: файли просто пакуються в один контейнер без стискання. Швидкість максимальна!</em>';
    } else if (sliderVal === 5) {
      ruleHint.innerHTML = '💡 <em>Режим «Ультра»: максимальне стиснення, процесор навантажується на 100%, вимагає найбільше часу.</em>';
    } else {
      ruleHint.innerHTML = '💡 <em>«Більше стиснення = менший розмір, але довше триває процес» (підручник, стор. 44)</em>';
    }
  }
}

function executeSimArchive() {
  const isSfx = document.getElementById('dlgSfx').checked;
  const pass = document.getElementById('dlgPass1').value;
  const format = document.getElementById('dlgFormat').value;

  let msg = `✅ Архів успішно створено!\n• Формат: ${isSfx ? 'SFX (.exe)' : format}\n• Ступінь: ${document.getElementById('compLevelBadge').innerText}`;
  if (pass) msg += `\n• Захист: Пароль встановлено (AES-256)`;
  alert(msg);

  addScore(15, 'simAddArchive');
}

function toggleOriginalFig(figKey) {
  const el = document.getElementById(`${figKey}Holder`);
  if (el) {
    el.style.display = (el.style.display === 'none' || !el.style.display) ? 'block' : 'none';
  }
}

// ----------------------------------------------------
// БЛОК 4: ВІРТУАЛЬНИЙ РОБОЧИЙ СТІЛ & КОНТЕКСТНЕ МЕНЮ
// ----------------------------------------------------
let currentContextTarget = 'file'; // 'file' | 'archive' | 'sfx'
let currentContextMission = 1; // 1: створити захищений архів, 2: розпакувати в папку

function initVirtualDesktop() {
  const desk = document.getElementById('virtualDesktop');
  const menu = document.getElementById('osContextMenu');

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#osContextMenu')) {
      if (menu) menu.style.display = 'none';
    }
  });
}

function selectDeskIcon(el) {
  document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
  el.classList.add('selected');
}

function showContextMenu(e, targetType) {
  e.preventDefault();
  currentContextTarget = targetType;

  const menu = document.getElementById('osContextMenu');
  const desk = document.getElementById('virtualDesktop');
  const deskRect = desk.getBoundingClientRect();

  // Показуємо меню
  menu.style.display = 'block';

  // Позиція відносно десктопа
  let posX = e.clientX - deskRect.left;
  let posY = e.clientY - deskRect.top;

  if (posX + 200 > deskRect.width) posX = deskRect.width - 210;
  if (posY + 220 > deskRect.height) posY = deskRect.height - 230;

  menu.style.left = `${Math.max(10, posX)}px`;
  menu.style.top = `${Math.max(10, posY)}px`;

  // Перемикаємо пункти для звичайного файлу та для архіву (мал 2.14)
  const fileItems = document.querySelector('.cm-file-only');
  const archItems = document.querySelector('.cm-arch-only');

  if (targetType === 'file') {
    fileItems.style.display = 'block';
    archItems.style.display = 'none';
  } else {
    fileItems.style.display = 'none';
    archItems.style.display = 'block';
  }
}

function toggleCmSubmenu(show) {
  // handled by CSS hover
}

function handleCmAction(action) {
  const menu = document.getElementById('osContextMenu');
  if (menu) menu.style.display = 'none';

  const fbBox = document.getElementById('contextFeedbackBox');
  const fbText = document.getElementById('contextFeedbackText');

  if (currentContextMission === 1) {
    if (action === '7z_add_dlg') {
      fbBox.className = 'context-feedback-box success';
      fbText.innerHTML = '🎉 <strong>Відмінно! (+15 XP)</strong> Відкрито діалогове вікно архівації. Тут можна задати пароль шифрування та ступінь стиснення.';
      addScore(15, 'contextMission1');

      // Перемикаємо на місію 2
      setTimeout(() => {
        currentContextMission = 2;
        document.getElementById('contextMissionTitle').innerText = 'Місія 2: Швидко розархівуй «Проєкт_2026.zip» в окрему теку';
        fbBox.className = 'context-feedback-box';
        fbText.innerHTML = '👉 Тепер клікни правою кнопкою на <strong>Проєкт_2026.zip</strong> і вибери швидке видобування у власну папку (мал. 2.14).';
      }, 2000);
    } else {
      fbText.innerHTML = '⚠️ Потрібно відкрити налаштування! Обери <strong>7-Zip ➔ Додати до архіву...</strong>';
    }
  } else if (currentContextMission === 2) {
    if (action === '7z_extract_folder') {
      fbBox.className = 'context-feedback-box success';
      fbText.innerHTML = '🎉 <strong>Ідеально! (+15 XP)</strong> Обрано команду «Видобути до "Проєкт_2026\\"». Архів розпаковано в окрему створену теку без сміття на робочому столі!';
      addScore(15, 'contextMission2');
    } else if (action === '7z_extract_here') {
      fbText.innerHTML = '⚠️ Команда «Видобути до поточної папки» висипле всі файли прямо на робочий стіл. Краще обрати <strong>«Видобути до "Проєкт_2026\\"»</strong>.';
    } else {
      fbText.innerHTML = '⚠️ Для місії видобування обери <strong>7-Zip ➔ Видобути до "Проєкт_2026\\"</strong>.';
    }
  }
}

// ----------------------------------------------------
// БЛОК 5: ЛАБОРАТОРІЯ КОЕФІЦІЄНТА СТИСНЕННЯ (К)
// ----------------------------------------------------
let currentLabType = 'bmp';

function setLabData(type, btn) {
  currentLabType = type;
  document.querySelectorAll('.data-type-chips .chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  runCompressionLab();
}

function runCompressionLab() {
  const method = document.getElementById('labMethod')?.value || 'LZMA2';
  const level = parseInt(document.getElementById('labLevel')?.value || 3);

  // Вихідні розміри (КБ)
  const initialSizes = {
    bmp: 12000,
    txt: 5000,
    jpg: 4000,
    mp3: 8000
  };

  const initial = initialSizes[currentLabType];

  // Коефіцієнти стиснення в залежності від типу
  let baseK = 1.0;
  if (currentLabType === 'bmp') {
    baseK = [1.0, 2.2, 3.1, 4.0, 4.6, 5.2][level];
    if (method === 'LZMA2') baseK *= 1.05;
    if (method === 'PPMd') baseK *= 0.85; // PPMd гірший для графіки
  } else if (currentLabType === 'txt') {
    baseK = [1.0, 2.8, 3.8, 4.8, 5.6, 6.2][level];
    if (method === 'PPMd') baseK *= 1.25; // PPMd ідеальний для тексту!
  } else if (currentLabType === 'jpg') {
    // Уже стиснутий з втратами
    baseK = [1.0, 1.01, 1.02, 1.03, 1.04, 1.05][level];
  } else if (currentLabType === 'mp3') {
    // Уже стиснутий звук
    baseK = [1.0, 1.0, 1.01, 1.02, 1.02, 1.03][level];
  }

  const finalSize = Math.round(initial / baseK);
  const realK = (initial / finalSize).toFixed(2);
  const pct = ((finalSize / initial) * 100).toFixed(1);

  // Оновлення UI
  const kValEl = document.getElementById('labKValue');
  const kCommEl = document.getElementById('labKComment');
  const sizeBfEl = document.getElementById('labSizeBefore');
  const sizeAfEl = document.getElementById('labSizeAfter');
  const barAfEl = document.getElementById('labBarAfter');
  const insightEl = document.getElementById('labInsight');

  if (kValEl) kValEl.innerText = `${realK}x`;
  if (sizeBfEl) sizeBfEl.innerText = `${initial.toLocaleString('uk-UA')} КБ`;
  if (sizeAfEl) sizeAfEl.innerText = `${finalSize.toLocaleString('uk-UA')} КБ`;
  if (barAfEl) {
    barAfEl.style.width = `${pct}%`;
    barAfEl.innerText = `${pct}%`;
  }

  if (kCommEl && insightEl) {
    if (currentLabType === 'bmp') {
      kCommEl.innerText = '🔥 Колосальне стиснення! Зменшення у кілька разів.';
      insightEl.innerHTML = `📌 <strong>Висновок дослідника:</strong> Растровий формат BMP містить надлишкову сітку пікселів без внутрішнього стиснення. Тому архіватор досягає K = <strong>${realK}</strong>. Найкраще спрацював метод LZMA2!`;
    } else if (currentLabType === 'txt') {
      kCommEl.innerText = '📚 Тексти чудово компресуються (величезна надлишковість слів).';
      insightEl.innerHTML = `📌 <strong>Висновок дослідника:</strong> Текстові файли містять багато повторюваних слів та пробілів. Зверніть увагу: алгоритм <strong>PPMd</strong> показав максимальну ефективність для тексту (підручник стор. 49).`;
    } else if (currentLabType === 'jpg') {
      kCommEl.innerText = '⚠️ Слабкий ефект (K ≈ 1.0). Фото майже не зменшилося.';
      insightEl.innerHTML = `📌 <strong>Висновок дослідника:</strong> JPEG уже попередньо стиснутий за алгоритмом дискретного косинусного перетворення. Повторне стиснення архіватором майже марне (економія < 4%).`;
    } else {
      kCommEl.innerText = '⚠️ Музика MP3 вже містить потік кодування з психоакустичним стисненням.';
      insightEl.innerHTML = `📌 <strong>Висновок дослідника:</strong> Завдання 7 (стор. 49). Спроба архівувати MP3 дає K ≈ 1.01. Не витрачайте час на високі ступені стиснення для готових медіафайлів.`;
    }
  }

  addScore(10, 'labExperiment');
}

// ----------------------------------------------------
// БЛОК 6: ЕКЗАМЕН АРХІВАРІУСА
// ----------------------------------------------------
let sortedCounts = { archive: 0, regular: 0, total: 8 };

function handleSortItem(tag) {
  const type = tag.getAttribute('data-type');
  const targetBasket = type === 'archive' 
    ? document.getElementById('basketArchiveContent') 
    : document.getElementById('basketRegularContent');

  targetBasket.appendChild(tag);
  tag.onclick = null; // зафіксовано
  tag.style.cursor = 'default';

  sortedCounts[type]++;
  if (sortedCounts.archive + sortedCounts.regular === sortedCounts.total) {
    const fb = document.getElementById('sortFeedback');
    fb.className = 'q-feedback correct';
    fb.innerHTML = '🎉 <strong>Усі формати розсортовано бездоганно! (+20 XP)</strong> .7z, .zip, .rar, .tar, SFX — це архіви. .docx, .mp3, .bmp — звичайні робочі файли.';
    addScore(20, 'examSort');
  }
}

function checkScenario1() {
  const selected = document.querySelector('input[name="scen1"]:checked');
  const fb = document.getElementById('scen1_fb');
  if (!selected) {
    alert('Оберіть варіант рішення!');
    return;
  }
  if (selected.value === 'sfx') {
    fb.className = 'q-feedback correct';
    fb.innerHTML = '✅ <strong>Правильно! (+15 XP)</strong> SFX-архів (SelF-eXtracting) має розширення .exe і містить власний виконуваний код видобування. Адміністратор може надіслати його навіть користувачеві без архіваторів (стор. 43, 47 підручника).';
    addScore(15, 'examScenario');
  } else {
    fb.className = 'q-feedback wrong';
    fb.innerHTML = '❌ <strong>Ні.</strong> Щоб відкрити звичайний 7z чи TAR, потрібна встановлена програма, якої у колеги немає.';
  }
}

function checkMatchingModes() {
  const m1 = document.getElementById('matchOpt1').value;
  const m2 = document.getElementById('matchOpt2').value;
  const m3 = document.getElementById('matchOpt3').value;
  const m4 = document.getElementById('matchOpt4').value;
  const fb = document.getElementById('matchFeedback');

  if (!m1 || !m2 || !m3 || !m4) {
    alert('Оберіть відповідність для всіх 4 режимів!');
    return;
  }

  // Правильні:
  // 1. Додати та замінити -> add_rep
  // 2. Оновити та замінити -> upd_rep
  // 3. Оновити існуючі -> upd_only
  // 4. Синхронізувати -> synch
  if (m1 === 'add_rep' && m2 === 'upd_rep' && m3 === 'upd_only' && m4 === 'synch') {
    fb.className = 'q-feedback correct';
    fb.innerHTML = '🎉 <strong>Чудово! Всі режими збігаються з малюнком 2.13 (+20 XP)!</strong> Ти досконало розумієш тонкощі синхронізації та оновлення файлів в архіві.';
    addScore(20, 'examModes');
  } else {
    fb.className = 'q-feedback wrong';
    fb.innerHTML = '❌ <strong>Є неточності.</strong> Підказка зі стор. 45 книги: «Синхронізувати» — видаляє з архіву те, чого немає у вихідній теці, а «Оновити існуючі» — змінює лише наявні старіші версії.';
  }
}

// ----------------------------------------------------
// БЛОК 7: СЕРТИФІКАТ ТА ЧЕКЛИСТ ПР№2
// ----------------------------------------------------
function updateCertPreview() {
  const nameInput = document.getElementById('certStudentName');
  const scoreVal = document.getElementById('certScoreVal');
  const rankVal = document.getElementById('certRankVal');
  const codeVal = document.getElementById('certHashCode');
  const dateVal = document.getElementById('certDateVal');

  if (nameInput) gameState.userName = nameInput.value || 'Учень 8-го класу';
  if (scoreVal) scoreVal.innerText = `${gameState.score} XP`;

  let rank = 'Стажер';
  if (gameState.score >= 100) rank = 'Майстер-Архіваріус';
  else if (gameState.score >= 70) rank = 'Адміністратор';
  else if (gameState.score >= 35) rank = 'Спеціаліст';
  if (rankVal) rankVal.innerText = rank;

  if (dateVal) {
    const today = new Date().toLocaleDateString('uk-UA');
    dateVal.innerText = today;
  }

  // Генерація псевдокоду перевірки
  const hash = `ZIP8-${String(gameState.score).padStart(3, '0')}-${(gameState.progress * 13 + 101).toString(16).toUpperCase()}`;
  if (codeVal) codeVal.innerText = hash;
}

function copyCertReport() {
  const code = document.getElementById('certHashCode')?.innerText || 'ZIP8-TEST';
  const name = document.getElementById('certStudentName')?.value || 'Учень';
  const text = `ЗВІТ УЧНЯ: «Цифрова експедиція: Таємниці стиснення даних» (§ 2.2)\nУчень: ${name}\nНабрано XP: ${gameState.score} / ${gameState.maxScore} (${gameState.progress}%)\nЗвання: ${document.getElementById('userRank')?.innerText}\nКод верифікації: ${code}\nДата: ${new Date().toLocaleDateString('uk-UA')}`;

  navigator.clipboard.writeText(text).then(() => {
    alert('📋 Текстовий звіт скопійовано в буфер обміну! Можна надіслати вчителю у Teams / Classroom.');
  }).catch(() => {
    prompt('Скопіюйте цей текст:', text);
  });
}

function renderChecklist() {
  const inputs = document.querySelectorAll('.checklist-items input');
  inputs.forEach((inp, idx) => {
    inp.checked = !!gameState.checklist[idx];
  });
}

function saveChecklistState() {
  const inputs = document.querySelectorAll('.checklist-items input');
  inputs.forEach((inp, idx) => {
    gameState.checklist[idx] = inp.checked;
  });
  saveState();
}
