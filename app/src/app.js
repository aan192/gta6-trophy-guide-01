const STORAGE_KEY = 'gta6-trophy-checklist';
let trophiesData = null;
let earnedSet = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'));

// Check shot mode URL params
const urlParams = new URLSearchParams(window.location.search);
const shotMode = urlParams.get('shot');

if (shotMode && earnedSet.size === 0) {
  // Seed ~40% demo progress for screenshot captures
  earnedSet = new Set([
    "Vice Got a Price!", "Just Like Paradise", "Paradise Lost", "T**s Ass Drug Money",
    "Vice City, Baby!", "Top Of The World, Ma", "Trust", "Break the Bank",
    "Cunning Stunts", "Master of None", "Baited My Tackle", "Stick Fiddler",
    "Positive Mental Attitude", "Fair Game", "Don't Touch My Deck", "Hot Together",
    "Whip It Good", "Gunslinger", "Sneakthief", "A Classic Blitz Play", "The Goodtime State", "In The Beginning…"
  ]);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earnedSet]));
}

async function init() {
  try {
    const res = await fetch('data/trophies.json');
    trophiesData = await res.json();
    setupEventListeners();
    renderAll();

    if (shotMode === 'guide') {
      switchView('guide');
      selectGuideTrophy(trophiesData.trophies[1]); // Just Like Paradise or first non-platinum
    } else if (shotMode === 'roadmap') {
      switchView('roadmap');
    } else if (shotMode === 'missables') {
      switchView('missables');
    } else {
      switchView('checklist');
    }
  } catch (err) {
    console.error('Failed to load trophies data:', err);
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earnedSet]));
  updateStats();
}

function updateStats() {
  if (!trophiesData) return;
  const total = trophiesData.trophies.length;
  const earnedCount = earnedSet.size;
  const pct = Math.round((earnedCount / total) * 100);

  document.getElementById('stat-earned').textContent = earnedCount;
  document.getElementById('stat-pct').textContent = `${pct}%`;
  document.getElementById('progress-bar').style.width = `${pct}%`;

  // Grade counts
  const grades = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  const earnedGrades = { platinum: 0, gold: 0, silver: 0, bronze: 0 };

  for (const t of trophiesData.trophies) {
    if (grades[t.grade] !== undefined) grades[t.grade]++;
    if (earnedSet.has(t.name)) {
      if (earnedGrades[t.grade] !== undefined) earnedGrades[t.grade]++;
    }
  }

  document.getElementById('count-platinum').textContent = `${earnedGrades.platinum}/${grades.platinum}`;
  document.getElementById('count-gold').textContent = `${earnedGrades.gold}/${grades.gold}`;
  document.getElementById('count-silver').textContent = `${earnedGrades.silver}/${grades.silver}`;
  document.getElementById('count-bronze').textContent = `${earnedGrades.bronze}/${grades.bronze}`;

  // Missables count
  const missables = trophiesData.trophies.filter(t => t.missable);
  const missEarned = missables.filter(t => earnedSet.has(t.name)).length;
  document.getElementById('missables-count').textContent = `${missEarned}/${missables.length}`;
}

function renderAll() {
  updateStats();
  renderChecklist();
  renderRoadmap();
  renderMissables();
  renderGuideSidebar();
}

function renderChecklist() {
  if (!trophiesData) return;
  const tbody = document.getElementById('trophy-tbody');
  tbody.replaceChildren();

  const search = document.getElementById('search-input').value.toLowerCase();
  const kindFilter = document.getElementById('filter-kind').value;
  const gradeFilter = document.getElementById('filter-grade').value;
  const statusFilter = document.getElementById('filter-status').value;
  const hideSpoilers = document.getElementById('spoiler-toggle').checked;

  for (const t of trophiesData.trophies) {
    const earned = earnedSet.has(t.name);

    if (kindFilter !== 'all' && t.kind !== kindFilter) continue;
    if (gradeFilter !== 'all' && t.grade !== gradeFilter) continue;
    if (statusFilter === 'earned' && !earned) continue;
    if (statusFilter === 'unearned' && earned) continue;

    const queryMatch = !search || t.name.toLowerCase().includes(search) || t.description.toLowerCase().includes(search) || t.guide.toLowerCase().includes(search);
    if (!queryMatch) continue;

    const tr = document.createElement('tr');

    // Checkbox cell
    const tdCheck = document.createElement('td');
    tdCheck.className = 'td-check';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = earned;
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) earnedSet.add(t.name);
      else earnedSet.delete(t.name);
      saveProgress();
      updateStats();
    });
    tdCheck.appendChild(checkbox);

    // Grade cell
    const tdGrade = document.createElement('td');
    tdGrade.className = 'td-grade';
    const badge = document.createElement('span');
    badge.className = `badge ${t.grade}`;
    badge.textContent = t.grade;
    tdGrade.appendChild(badge);

    // Name & Desc cell
    const tdName = document.createElement('td');
    const nameDiv = document.createElement('div');
    nameDiv.className = 't-name';
    const isSpoiler = (t.hidden || t.kind === 'story') && hideSpoilers && !earned;
    nameDiv.textContent = isSpoiler ? '🔒 [Hidden / Story Trophy]' : t.name;

    if (t.missable) {
      const mBadge = document.createElement('span');
      mBadge.className = 'badge missable-flag';
      mBadge.textContent = 'Missable';
      nameDiv.appendChild(mBadge);
    }

    const descDiv = document.createElement('div');
    descDiv.className = 't-desc';
    descDiv.textContent = isSpoiler ? 'Complete trophy to reveal description and guide.' : `${t.description} — ${t.guide.substring(0, 90)}...`;

    tdName.append(nameDiv, descDiv);

    // Kind cell
    const tdKind = document.createElement('td');
    tdKind.className = 'td-kind';
    const kindBadge = document.createElement('span');
    kindBadge.className = 'badge kind';
    kindBadge.textContent = t.kind;
    tdKind.appendChild(kindBadge);

    // Action cell
    const tdAction = document.createElement('td');
    tdAction.className = 'td-action';
    const viewBtn = document.createElement('button');
    viewBtn.className = 'btn small secondary';
    viewBtn.textContent = 'Guide';
    viewBtn.addEventListener('click', () => {
      switchView('guide');
      selectGuideTrophy(t);
    });
    tdAction.appendChild(viewBtn);

    tr.append(tdCheck, tdGrade, tdName, tdKind, tdAction);
    tbody.appendChild(tr);
  }
}

function renderRoadmap() {
  if (!trophiesData) return;
  const container = document.getElementById('roadmap-container');
  container.replaceChildren();

  const stagesMap = {
    1: { title: "Stage 1: Main Story Campaign & Chapter Milestones", desc: "Focus on completing all story missions across chapters. Keep manual saves before major chapter shifts to protect missables." },
    2: { title: "Stage 2: Strangers & Freaks / Character Arcs", desc: "Clear all 8 stranger strands and character side missions before end-game point of no return." },
    3: { title: "Stage 3: Collectibles, Exploration & Properties", desc: "Hunt down collectible cards, WAiNK spots, garage properties, unique vehicles, and map exploration." },
    4: { title: "Stage 4: Activities, Challenges & Shooting Range", desc: "Gold medal all 42 shooting range courses, win races, drone races, stunts, and meditations." },
    5: { title: "Stage 5: Cooperative & Partner Exploits", desc: "Complete co-op partner tasks, escape 4-star wanted levels, bank vaults, and fund laundering." },
    6: { title: "Stage 6: Platinum Leonida Legend", desc: "Clean up remaining miscellaneous trophies to claim the platinum." }
  };

  for (let s = 1; s <= 6; s++) {
    const stageInfo = stagesMap[s];
    const stageTrophies = trophiesData.trophies.filter(t => (t.stage || 1) === s);

    const card = document.createElement('div');
    card.className = 'stage-card';

    const header = document.createElement('div');
    header.className = 'stage-header';
    header.innerHTML = `<div><h3>${stageInfo.title}</h3><p class="subtitle">${stageInfo.desc}</p></div><span class="badge platinum">${stageTrophies.length} Trophies</span>`;

    const list = document.createElement('div');
    list.className = 'stage-trophies-list';

    for (const t of stageTrophies) {
      const item = document.createElement('div');
      item.className = 'stage-trophy-item';
      const earned = earnedSet.has(t.name);
      item.innerHTML = `<span>${earned ? '✅' : '⬜'} <strong>${t.name}</strong></span><span class="badge ${t.grade}">${t.grade}</span>`;
      item.style.cursor = 'pointer';
      item.addEventListener('click', () => {
        switchView('guide');
        selectGuideTrophy(t);
      });
      list.appendChild(item);
    }

    card.append(header, list);
    container.appendChild(card);
  }
}

function renderMissables() {
  if (!trophiesData) return;
  const container = document.getElementById('missables-container');
  container.replaceChildren();

  const missables = trophiesData.trophies.filter(t => t.missable);

  for (const t of missables) {
    const card = document.createElement('div');
    card.className = 'missable-card';
    const earned = earnedSet.has(t.name);

    card.innerHTML = `
      <h4>${t.name} <span class="badge ${t.grade}">${t.grade}</span></h4>
      <p class="t-desc" style="margin-bottom: 0.75rem;"><strong>Description:</strong> ${t.description}</p>
      <p style="font-size: 0.9rem; margin-bottom: 0.75rem;"><strong>Strategy:</strong> ${t.guide}</p>
      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem;">
        <span>Status: <strong>${earned ? '✅ Earned' : '⚠️ Pending'}</strong></span>
        <button class="btn small secondary" data-name="${t.name}">View Full Guide</button>
      </div>
    `;

    card.querySelector('button').addEventListener('click', () => {
      switchView('guide');
      selectGuideTrophy(t);
    });

    container.appendChild(card);
  }
}

function renderGuideSidebar() {
  if (!trophiesData) return;
  const sideList = document.getElementById('guide-list-side');
  sideList.replaceChildren();

  const search = document.getElementById('guide-search').value.toLowerCase();

  for (const t of trophiesData.trophies) {
    if (search && !t.name.toLowerCase().includes(search)) continue;

    const item = document.createElement('div');
    item.className = 'guide-side-item';
    item.dataset.id = t.id;
    const earned = earnedSet.has(t.name);
    item.innerHTML = `<div style="display: flex; justify-content: space-between; font-weight: 600;"><span>${earned ? '✅' : '⬜'} ${t.name}</span><span class="badge ${t.grade}" style="font-size: 0.65rem; padding: 0.1rem 0.4rem;">${t.grade}</span></div>`;

    item.addEventListener('click', () => {
      document.querySelectorAll('.guide-side-item').forEach(el => el.classList.remove('active'));
      item.classList.add('active');
      selectGuideTrophy(t);
    });

    sideList.appendChild(item);
  }
}

function selectGuideTrophy(t) {
  const pane = document.getElementById('guide-detail-pane');
  const earned = earnedSet.has(t.name);

  const sourcesHtml = (t.sources || ["Exophase — GTA VI trophies"]).map(s => `<li>🔗 ${s}</li>`).join('');
  const stepsHtml = t.steps && t.steps.length ? `<div class="guide-section"><h4>Walkthrough Steps</h4><ol>${t.steps.map(st => `<li>${st}</li>`).join('')}</ol></div>` : '';
  const missableWarning = t.missable ? `<div class="guide-section" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); padding: 1rem; border-radius: 6px;"><h4 style="color: var(--accent-red); margin-bottom: 0.25rem;">⚠️ Missable Trophy Warning</h4><p>This trophy can be permanently missed during specific campaign chapters or side quest timelines. Keep backup saves!</p></div>` : '';

  pane.innerHTML = `
    <div class="guide-detail">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
        <div>
          <h2>${t.name}</h2>
          <p class="subtitle">${t.description}</p>
        </div>
        <div><span class="badge ${t.grade}">${t.grade}</span> <span class="badge kind">${t.kind}</span></div>
      </div>

      <div class="guide-meta">
        <label class="toggle-label"><input type="checkbox" id="guide-earned-check" ${earned ? 'checked' : ''}> Mark as Earned in Tracker</label>
      </div>

      ${missableWarning}

      <div class="guide-section" style="margin-top: 1rem;">
        <h4>Comprehensive Strategy & Guide</h4>
        <p>${t.guide}</p>
      </div>

      ${stepsHtml}

      <div class="guide-section">
        <h4>Cited Research Sources & References</h4>
        <ul class="sources-list">${sourcesHtml}</ul>
      </div>
    </div>
  `;

  pane.querySelector('#guide-earned-check').addEventListener('change', (e) => {
    if (e.target.checked) earnedSet.add(t.name);
    else earnedSet.delete(t.name);
    saveProgress();
    renderGuideSidebar();
    renderChecklist();
  });
}

function switchView(viewName) {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    if (btn.dataset.view === viewName) btn.classList.add('active');
    else btn.classList.remove('active');
  });

  document.querySelectorAll('.view-panel').forEach(panel => {
    if (panel.id === `view-${viewName}`) panel.classList.add('active');
    else panel.classList.remove('active');
  });
}

function setupEventListeners() {
  document.querySelectorAll('.view-nav .nav-btn[data-view]').forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });

  document.getElementById('search-input').addEventListener('input', renderChecklist);
  document.getElementById('filter-kind').addEventListener('change', renderChecklist);
  document.getElementById('filter-grade').addEventListener('change', renderChecklist);
  document.getElementById('filter-status').addEventListener('change', renderChecklist);
  document.getElementById('spoiler-toggle').addEventListener('change', renderChecklist);

  document.getElementById('reset-filters').addEventListener('click', () => {
    document.getElementById('search-input').value = '';
    document.getElementById('filter-kind').value = 'all';
    document.getElementById('filter-grade').value = 'all';
    document.getElementById('filter-status').value = 'all';
    document.getElementById('spoiler-toggle').checked = false;
    renderChecklist();
  });

  document.getElementById('guide-search').addEventListener('input', renderGuideSidebar);

  // Export progress
  document.getElementById('export-btn').addEventListener('click', () => {
    const data = JSON.stringify([...earnedSet], null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gta6-trophy-progress.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  // Import progress
  document.getElementById('import-file').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const arr = JSON.parse(text);
      if (Array.isArray(arr)) {
        earnedSet = new Set(arr);
        saveProgress();
        renderAll();
        alert('Successfully imported trophy progress!');
      } else {
        alert('Invalid progress file format.');
      }
    } catch (err) {
      alert('Failed to parse progress file.');
    }
  });
}

init();
