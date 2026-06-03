const addContentBtn = document.getElementById('addContentBtn');
const addContentModal = document.getElementById('addContentModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const exportModal = document.getElementById('exportModal');
const analyticsModal = document.getElementById('analyticsModal');
const closeExportBtn = document.getElementById('closeExportBtn');
const closeAnalyticsBtn = document.getElementById('closeAnalyticsBtn');
const analyticsBtn = document.getElementById('analyticsBtn');
const downloadBtn = document.getElementById('downloadBtn');
const copyBtn = document.getElementById('copyBtn');
const printBtn = document.getElementById('printBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const exportPDF = document.getElementById('exportPDF');
const exportHTML = document.getElementById('exportHTML');
const exportJSON = document.getElementById('exportJSON');
const exportDOCX = document.getElementById('exportDOCX');
const generateBtn = document.getElementById('generateBtn');
const themeToggle = document.getElementById('themeToggle');
const templateSelect = document.getElementById('templateSelect');
const panelTabs = document.querySelectorAll('.panel-tab');
const panels = document.querySelectorAll('.panel-content');
const addSectionButtons = document.querySelectorAll('.content-card');
const jobDescription = document.getElementById('jobDescription');
const analyzeBtn = document.getElementById('analyzeBtn');
const matcherResults = document.getElementById('matcherResults');
const matchPercentage = document.getElementById('matchPercentage');
const matchedKeywordsContainer = document.getElementById('matchedKeywords');
const missingKeywordsContainer = document.getElementById('missingKeywords');
const matchSuggestions = document.getElementById('matchSuggestions');
const atsScore = document.getElementById('atsScore');
const keywordScore = document.getElementById('keywordScore');
const actionVerbScore = document.getElementById('actionVerbScore');
const analyticsWords = document.getElementById('analyticsWords');
const analyticsSections = document.getElementById('analyticsSections');
const analyticsActionVerbs = document.getElementById('analyticsActionVerbs');
const analyticsCompletion = document.getElementById('analyticsCompletion');
const contentLength = document.getElementById('contentLength');
const keywordDensity = document.getElementById('keywordDensity');
const impactScore = document.getElementById('impactScore');
const optimizationTips = document.getElementById('optimizationTips');
const analyticsMetrics = document.getElementById('analyticsMetrics');
const loadingIndicator = document.getElementById('loading');
const resumePreview = document.getElementById('resumePreview');

const fieldIds = ['personalInfo', 'summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'languages'];
const templateClasses = {
  modern: 'template-modern',
  classic: 'template-classic',
  minimal: 'template-minimal',
  creative: 'template-creative',
  tech: 'template-tech',
};
const sectionVisibilityKey = 'resume_section_visibility';
let sectionVisibility = {};

const actionVerbs = [
  'led', 'managed', 'created', 'developed', 'executed', 'designed', 'built', 'improved', 'optimized', 'owned', 'accelerated', 'analyzed', 'launched', 'collaborated', 'mentored', 'spearheaded', 'transformed', 'enhanced', 'delivered', 'implemented'
];

const stopWords = [
  'and', 'or', 'the', 'a', 'an', 'to', 'for', 'with', 'in', 'on', 'of', 'at', 'by', 'from', 'as', 'that', 'this', 'is', 'are', 'be', 'been', 'will', 'would', 'can', 'could', 'should', 'may', 'might'
];

function selectPanel(panelId) {
  panels.forEach((panel) => {
    const expectedId = `${panelId}-panel`;
    panel.classList.toggle('active', panel.id === panelId || panel.id === expectedId);
  });
  panelTabs.forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.panel === panelId);
  });
}

function openModal(modal) {
  modal.classList.add('active');
}

function closeModal(modal) {
  modal.classList.remove('active');
}

function getSectionCard(section) {
  return document.querySelector(`.section-card[data-section="${section}"]`);
}

function openSection(section) {
  const card = getSectionCard(section);
  if (card) {
    card.classList.remove('collapsed');
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function readField(id) {
  const element = document.getElementById(id);
  return element ? element.value.trim() : '';
}

function saveField(id) {
  const element = document.getElementById(id);
  if (element) {
    localStorage.setItem(`resume_${id}`, element.value);
  }
}

function loadSavedFields() {
  fieldIds.forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      const stored = localStorage.getItem(`resume_${id}`);
      element.value = stored || element.value || '';
    }
  });

  const storedTemplate = localStorage.getItem('resume_template');
  if (storedTemplate && templateClasses[storedTemplate]) {
    templateSelect.value = storedTemplate;
    updateTemplateClass(storedTemplate);
  }

  const storedTheme = localStorage.getItem('resume_theme');
  if (storedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggle.textContent = '☀️';
  }

  loadSectionOrder();
  loadSectionVisibility();
}

function updateTemplateClass(choice) {
  const className = templateClasses[choice] || templateClasses.modern;
  resumePreview.className = `resume-preview ${className}`;
}

function buildContactLines(personalInfo) {
  return personalInfo
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join(' • ');
}

function buildList(items) {
  const list = Array.isArray(items) ? items : String(items);
  return list
    .split(/\n|\r|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseRows(text) {
  return text
    .split(/\n|\r/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function getCurrentSectionOrder() {
  return Array.from(document.querySelectorAll('.content-sections .section-card')).map((card) => card.dataset.section);
}

function renderSectionBlock(section, data) {
  switch (section) {
    case 'summary':
      return `<div class="resume-summary">${data.summary || generateSummary(data)}</div>`;
    case 'experience': {
      const items = parseRows(data.experience).map((item) => `<li>${item}</li>`).join('');
      return `<div class="resume-section"><h3 class="resume-section-title">Experience</h3><ul class="resume-list">${items || '<li>Add your strongest outcomes and responsibilities.</li>'}</ul></div>`;
    }
    case 'education': {
      const items = parseRows(data.education).map((item) => `<li>${item}</li>`).join('');
      return `<div class="resume-section"><h3 class="resume-section-title">Education</h3><ul class="resume-list">${items || '<li>Include your school, degree and relevant achievements.</li>'}</ul></div>`;
    }
    case 'skills': {
      const skills = buildList(data.skills.replace(/,/g, '\n')).map((skill) => `<span class="skill-pill">${skill}</span>`).join('');
      return `<div class="resume-section"><h3 class="resume-section-title">Skills</h3><div class="skill-list">${skills || '<span class="skill-pill">Add key technologies or strengths</span>'}</div></div>`;
    }
    case 'projects': {
      const items = parseRows(data.projects).map((item) => `<li>${item}</li>`).join('');
      return `<div class="resume-section"><h3 class="resume-section-title">Projects</h3><ul class="resume-list">${items || '<li>List projects that demonstrate impact and technical skills.</li>'}</ul></div>`;
    }
    case 'certifications': {
      const items = parseRows(data.certifications).map((item) => `<li>${item}</li>`).join('');
      return `<div class="resume-section"><h3 class="resume-section-title">Certifications</h3><ul class="resume-list">${items || '<li>Mention certifications that validate your expertise.</li>'}</ul></div>`;
    }
    case 'languages': {
      const items = buildList(data.languages.replace(/,/g, '\n')).map((item) => `<li>${item}</li>`).join('');
      return `<div class="resume-section"><h3 class="resume-section-title">Languages</h3><ul class="resume-list">${items || '<li>Display languages that support global collaboration.</li>'}</ul></div>`;
    }
    default:
      return '';
  }
}

function createResumeHTML(data) {
  const contact = buildContactLines(data.personalInfo);
  const summaryValue = data.summary || generateSummary(data);
  const sectionOrder = getVisibleSectionOrder();
  const contentBlocks = sectionOrder
    .filter((section) => section !== 'personalInfo')
    .map((section) => renderSectionBlock(section, { ...data, summary: summaryValue }))
    .join('');

  return `
  <div class="resume-container">
    <div class="resume-header">
      <div>
        <div class="resume-name">${data.title || 'Professional Resume'}</div>
        <div class="resume-title">${data.subtitle || 'Resume Builder'}</div>
      </div>
      <div class="resume-contact">${contact}</div>
    </div>
    ${contentBlocks}
  </div>`;
}

function getTextForAnalysis(data) {
  return getVisibleFieldIds()
    .map((id) => data[id])
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function buildFieldData() {
  return fieldIds.reduce((data, id) => {
    data[id] = readField(id);
    return data;
  }, {});
}

function extractKeywordsFromText(text) {
  const normalized = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word && word.length > 2 && !stopWords.includes(word));

  const frequency = normalized.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 16)
    .map((entry) => entry[0]);
}

function generateSummary(data) {
  const contact = data.personalInfo ? buildContactLines(data.personalInfo) : '';
  const skillText = data.skills ? data.skills.split(',').slice(0, 5).join(', ') : '';
  const summaryParts = [];

  if (data.experience) {
    summaryParts.push('results-focused professional with a track record of delivering measurable outcomes');
  }
  if (skillText) {
    summaryParts.push(`skilled in ${skillText}`);
  }
  if (contact) {
    summaryParts.push('adept at collaborating across teams to translate strategy into execution');
  }

  return summaryParts.length > 0 ? summaryParts.join('. ') + '.' : 'Dedicated professional with a passion for delivering high-quality work and measurable business impact.';
}

function countActionVerbs(text) {
  const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
  return words.reduce((count, word) => (actionVerbs.includes(word) ? count + 1 : count), 0);
}

function analyzeJobDescription() {
  const jobText = jobDescription.value.trim();
  if (!jobText) {
    matcherResults.style.display = 'none';
    matchedKeywordsContainer.innerHTML = '<div class="suggestion-item">Add a job description to analyze matching recommendations.</div>';
    missingKeywordsContainer.innerHTML = '<div class="suggestion-item">Include the desired role responsibilities and keywords in your description.</div>';
    matchSuggestions.innerHTML = '';
    matchPercentage.textContent = '0';
    return;
  }

  matcherResults.style.display = 'grid';
  const resumeData = buildFieldData();
  const resumeText = getTextForAnalysis(resumeData);
  const keywords = extractKeywordsFromText(jobText);
  const matchedKeywords = keywords.filter((keyword) => resumeText.includes(keyword));
  const score = keywords.length ? Math.round((matchedKeywords.length / keywords.length) * 100) : 0;
  const actionMatches = countActionVerbs(resumeText);
  const ats = Math.min(100, score + Math.min(20, actionMatches * 2));

  matchPercentage.textContent = `${score}`;
  atsScore.textContent = `${ats}%`;
  keywordScore.textContent = `${Math.min(100, Math.round((keywords.length ? (matchedKeywords.length / keywords.length) * 100 : 0)))}%`;
  actionVerbScore.textContent = `${actionMatches}`;

  matchedKeywordsContainer.innerHTML = keywords
    .map((keyword) => `<span class="keyword-tag ${matchedKeywords.includes(keyword) ? 'matched' : ''}">${keyword}</span>`)
    .join('') || '<div class="suggestion-item">No strong keywords detected yet.</div>';

  missingKeywordsContainer.innerHTML = keywords
    .filter((keyword) => !matchedKeywords.includes(keyword))
    .slice(0, 8)
    .map((keyword) => `<span class="keyword-tag">${keyword}</span>`)
    .join('') || '<div class="suggestion-item">Your resume already includes the most relevant terms.</div>';

  matchSuggestions.innerHTML = keywords
    .filter((keyword) => !matchedKeywords.includes(keyword))
    .slice(0, 4)
    .map((keyword) => `<div class="suggestion-item">Consider adding <strong>${keyword}</strong> to your resume.</div>`)
    .join('') || '<div class="suggestion-item">Your resume already aligns well with this job description!</div>';
}

function refreshAnalytics() {
  const data = buildFieldData();
  const visibleFields = getVisibleFieldIds();
  const values = visibleFields.map((id) => data[id]).filter(Boolean);
  const wordCount = values.join(' ').split(/\s+/).filter(Boolean).length;
  const filledSections = visibleFields.filter((id) => data[id]).length;
  const completed = visibleFields.length ? Math.round((filledSections / visibleFields.length) * 100) : 0;
  const actionCount = countActionVerbs(getTextForAnalysis(data));
  const keywordCount = extractKeywordsFromText(getTextForAnalysis(data)).length;
  const density = wordCount ? Math.min(100, Math.round((keywordCount / wordCount) * 200)) : 0;
  const impact = Math.min(100, actionCount * 9 + Math.round(filledSections * 4));

  analyticsWords.textContent = wordCount;
  analyticsSections.textContent = `${filledSections}/${visibleFields.length}`;
  analyticsActionVerbs.textContent = actionCount;
  analyticsCompletion.textContent = `${completed}%`;
  contentLength.textContent = `${wordCount}`;
  keywordDensity.textContent = `${density}%`;
  impactScore.textContent = `${impact}%`;

  const tips = [
    completed < 80 ? 'Add at least 1 more section to improve resume completeness.' : 'Your resume covers most key sections. Great work!',
    actionCount < 6 ? 'Use more strong action verbs such as Led, Designed, Implemented, or Optimized.' : 'Your resume already contains strong action language.',
    data.skills ? 'Keep your skills list concise and targeted to the role.' : 'Add your top skills using commas to improve matching.',
    data.summary ? 'Keep your summary concise and achievement-driven.' : 'Write a short summary that highlights impact and role focus.',
  ];

  optimizationTips.innerHTML = tips.map((tip) => `<li>${tip}</li>`).join('');

  const metrics = [
    { title: 'Estimated Readability', value: `${Math.min(100, completed + 10)}%`, detail: 'More sections improve recruiter engagement.' },
    { title: 'Skill Density', value: `${Math.min(100, Math.round((data.skills ? data.skills.split(',').length : 0) * 10))}%`, detail: 'Add concise skills to stand out.' },
    { title: 'Action Impact', value: `${Math.min(100, actionCount * 8)}%`, detail: 'Use strong verbs to increase impact.' },
    { title: 'Keyword Readiness', value: `${Math.min(100, filledSections * 12)}%`, detail: 'Align with the target role for better ATS performance.' },
  ];

  analyticsMetrics.innerHTML = metrics
    .map((metric) => `<div class="analytics-metric"><strong>${metric.title}</strong>${metric.value}<div>${metric.detail}</div></div>`)
    .join('');
}

function buildResumeData() {
  const data = buildFieldData();
  const contact = buildContactLines(data.personalInfo);
  const title = parseRows(data.personalInfo)[0] || 'Professional Resume';
  const subtitle = parseRows(data.personalInfo)[1] || '';

  return {
    title,
    subtitle,
    contact,
    summary: data.summary || generateSummary(data),
    experience: data.experience,
    education: data.education,
    skills: data.skills,
    projects: data.projects,
    certifications: data.certifications,
    languages: data.languages,
    personalInfo: data.personalInfo,
  };
}

function generateResume() {
  loadingIndicator.classList.add('active');
  setTimeout(() => {
    const data = buildResumeData();
    resumePreview.innerHTML = createResumeHTML(data);
    updateTemplateClass(templateSelect.value);
    refreshAnalytics();
    analyzeJobDescription();
    loadingIndicator.classList.remove('active');
  }, 300);
}

function downloadFile(filename, content, type = 'text/plain') {
  const blob = new Blob([content], { type });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

function exportHTMLFile() {
  const data = buildResumeData();
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${data.title}</title><style>body{font-family:Arial,sans-serif;padding:32px;background:#f9fafb;color:#111827;} .resume-header{margin-bottom:24px;} .resume-name{font-size:32px;font-weight:800;} .resume-title{color:#6366f1;text-transform:uppercase;letter-spacing:0.16em;font-size:13px;font-weight:700;} .resume-contact{margin-top:12px;color:#6b7280;font-size:13px;} .resume-section{margin-top:24px;} .resume-section-title{font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;color:#111827;border-bottom:2px solid #6366f1;padding-bottom:8px;margin-bottom:14px;} .resume-list{list-style:none;padding-left:0;margin:0;} .resume-list li{position:relative;padding-left:18px;color:#4b5563;font-size:14px;margin-bottom:10px;} .resume-list li:before{content:"▹";position:absolute;left:0;color:#6366f1;} .skill-pill{display:inline-block;margin:0 8px 8px 0;padding:8px 12px;border-radius:999px;background:rgba(99,102,241,0.12);color:#6366f1;font-size:12px;font-weight:700;}</style></head><body>${createResumeHTML(data)}</body></html>`;
  downloadFile('resume.html', html, 'text/html');
}

function exportJSONFile() {
  const data = buildResumeData();
  downloadFile('resume.json', JSON.stringify(data, null, 2), 'application/json');
}

function exportDOCXFile() {
  const data = buildResumeData();
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${data.title}</title></head><body>${createResumeHTML(data)}</body></html>`;
  downloadFile('resume.docx', html, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
}

function copyHTMLToClipboard() {
  const html = resumePreview.innerHTML;
  navigator.clipboard
    .writeText(html)
    .then(() => alert('Resume HTML copied to clipboard.'))
    .catch(() => alert('Copy failed. Please try again.'));
}

function togglePreviewFullscreen() {
  if (!document.fullscreenElement) {
    resumePreview.requestFullscreen?.();
    fullscreenBtn.textContent = '🡽';
    fullscreenBtn.title = 'Exit Fullscreen';
  } else {
    document.exitFullscreen?.();
    fullscreenBtn.textContent = '⛶';
    fullscreenBtn.title = 'Toggle Fullscreen';
  }
}

function saveSectionOrder() {
  const order = Array.from(document.querySelectorAll('.content-sections .section-card')).map((card) => card.dataset.section);
  localStorage.setItem('resume_section_order', JSON.stringify(order));
}

function loadSectionOrder() {
  const storedOrder = localStorage.getItem('resume_section_order');
  if (!storedOrder) return;

  const order = JSON.parse(storedOrder);
  const container = document.querySelector('.content-sections');
  order.forEach((section) => {
    const card = getSectionCard(section);
    if (card) {
      container.appendChild(card);
    }
  });
}

function getVisibleSectionOrder() {
  return Array.from(document.querySelectorAll('.content-sections .section-card:not(.hidden)')).map((card) => card.dataset.section);
}

function getVisibleFieldIds() {
  return fieldIds.filter((id) => {
    const card = getSectionCard(id);
    return card && !card.classList.contains('hidden');
  });
}

function getDefaultSectionVisibility() {
  return fieldIds.reduce((visibility, id) => {
    visibility[id] = true;
    return visibility;
  }, {});
}

function saveSectionVisibility() {
  localStorage.setItem(sectionVisibilityKey, JSON.stringify(sectionVisibility));
}

function loadSectionVisibility() {
  const storedVisibility = localStorage.getItem(sectionVisibilityKey);
  sectionVisibility = storedVisibility ? JSON.parse(storedVisibility) : getDefaultSectionVisibility();

  Object.entries(sectionVisibility).forEach(([section, visible]) => {
    const card = getSectionCard(section);
    if (card) {
      card.classList.toggle('hidden', !visible);
    }
  });
}

function setSectionVisible(section, visible) {
  const card = getSectionCard(section);
  if (!card) return;

  sectionVisibility[section] = visible;
  card.classList.toggle('hidden', !visible);

  if (visible) {
    card.classList.remove('collapsed');
  }

  saveSectionVisibility();
  saveSectionOrder();
  generateResume();
}

function createSectionDeleteButtons() {
  document.querySelectorAll('.section-card').forEach((card) => {
    const section = card.dataset.section;
    const header = card.querySelector('.section-header');
    if (!header || header.querySelector('.section-delete')) return;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'section-delete';
    deleteBtn.type = 'button';
    deleteBtn.title = 'Remove section';
    deleteBtn.textContent = '✕';

    deleteBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      setSectionVisible(section, false);
    });

    header.appendChild(deleteBtn);
  });
}

function handleDragStart(event) {
  event.currentTarget.classList.add('dragging');
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', event.currentTarget.dataset.section);
}

function handleDragEnd(event) {
  event.currentTarget.classList.remove('dragging');
  document.querySelectorAll('.section-card').forEach((card) => card.classList.remove('drag-over'));
}

function handleDragOver(event) {
  event.preventDefault();
}

function handleDragEnter(event) {
  const target = event.currentTarget;
  if (!target.classList.contains('dragging')) {
    target.classList.add('drag-over');
  }
}

function handleDragLeave(event) {
  event.currentTarget.classList.remove('drag-over');
}

function handleDrop(event) {
  event.preventDefault();
  const target = event.currentTarget;
  const draggedSection = event.dataTransfer.getData('text/plain');
  const draggedCard = getSectionCard(draggedSection);
  if (!draggedCard || draggedCard === target) return;

  const container = document.querySelector('.content-sections');
  const afterTarget = event.clientY - target.getBoundingClientRect().top > target.offsetHeight / 2;
  if (afterTarget) {
    container.insertBefore(draggedCard, target.nextElementSibling);
  } else {
    container.insertBefore(draggedCard, target);
  }

  target.classList.remove('drag-over');
  saveSectionOrder();
  generateResume();
}

function attachDragHandles() {
  document.querySelectorAll('.section-card').forEach((card) => {
    const header = card.querySelector('.section-header');
    if (header && !header.querySelector('.section-handle')) {
      const handle = document.createElement('span');
      handle.className = 'section-handle';
      handle.textContent = '⋮⋮';
      handle.title = 'Drag to reorder';
      header.insertBefore(handle, header.querySelector('.section-toggle'));
    }
  });
}

function initializeDragAndDrop() {
  document.querySelectorAll('.section-card').forEach((card) => {
    card.setAttribute('draggable', 'true');
    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragend', handleDragEnd);
    card.addEventListener('dragover', handleDragOver);
    card.addEventListener('dragenter', handleDragEnter);
    card.addEventListener('dragleave', handleDragLeave);
    card.addEventListener('drop', handleDrop);
  });
  attachDragHandles();
}

function initializeSectionCollapse() {
  document.querySelectorAll('.section-header').forEach((header) => {
    header.addEventListener('click', () => {
      const card = header.closest('.section-card');
      card.classList.toggle('collapsed');
      const toggle = header.querySelector('.section-toggle');
      toggle.textContent = card.classList.contains('collapsed') ? '+' : '−';
    });
  });
}

function initializeFieldListeners() {
  fieldIds.forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('input', () => {
        saveField(id);
      });
    }
  });
}

panelTabs.forEach((tab) => {
  tab.addEventListener('click', () => selectPanel(tab.dataset.panel));
});

addContentBtn.addEventListener('click', () => openModal(addContentModal));
closeModalBtn.addEventListener('click', () => closeModal(addContentModal));
closeExportBtn.addEventListener('click', () => closeModal(exportModal));
closeAnalyticsBtn.addEventListener('click', () => closeModal(analyticsModal));

addSectionButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const section = button.dataset.section;
    if (getSectionCard(section)?.classList.contains('hidden')) {
      setSectionVisible(section, true);
    }
    openSection(section);
    closeModal(addContentModal);
  });
});

templateSelect.addEventListener('change', () => {
  localStorage.setItem('resume_template', templateSelect.value);
  updateTemplateClass(templateSelect.value);
  generateResume();
});

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  themeToggle.textContent = isDark ? '☀️' : '🌙';
  localStorage.setItem('resume_theme', isDark ? 'dark' : 'light');
});

generateBtn.addEventListener('click', generateResume);

analyzeBtn.addEventListener('click', analyzeJobDescription);
analyticsBtn.addEventListener('click', () => {
  refreshAnalytics();
  openModal(analyticsModal);
});
downloadBtn.addEventListener('click', () => openModal(exportModal));
exportPDF.addEventListener('click', () => window.print());
exportHTML.addEventListener('click', exportHTMLFile);
exportJSON.addEventListener('click', exportJSONFile);
exportDOCX.addEventListener('click', exportDOCXFile);
copyBtn.addEventListener('click', copyHTMLToClipboard);
printBtn.addEventListener('click', () => window.print());
fullscreenBtn.addEventListener('click', togglePreviewFullscreen);

document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement) {
    fullscreenBtn.textContent = '⛶';
    fullscreenBtn.title = 'Toggle Fullscreen';
  }
});

initializeFieldListeners();
loadSavedFields();
initializeSectionCollapse();
initializeDragAndDrop();
createSectionDeleteButtons();
selectPanel('content');
generateResume();
