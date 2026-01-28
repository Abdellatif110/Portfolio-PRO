/*
  PORTFOLIO SYSTEM LOGIC
  - Full-screen slide navigation
  - Cinema-grade animations
  - Technical matrix (skills) interaction
  - Projects pagination system
*/

// Global variables
let currentSection = 0;
const totalSections = 6;
let isScrolling = false;
const scrollDelay = 800; // Matches CSS var(--transition-slow)
let currentPage = 0;
const projectsPerPage = 3;
let totalProjects = 0;

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // Apply theme
    applyThemeOnLoad();

    // Remove loader
    setTimeout(() => {
        const loader = document.querySelector('.page-loader');
        if (loader) loader.classList.add('hidden');
        initializeHeroAnimation();
        startTypewriter();
    }, 2000);

    // Setup Systems
    setupScrollEngine();
    setupDotNavigation();
    setupKeyboardNavigation();
    setupCTAButtons();
    handleFormSubmit();
    setupInputFilledState();
    initProjectsPagination();

    // Dark Mode Toggle
    const darkModeBtn = document.getElementById('darkModeToggle');
    if (darkModeBtn) {
        darkModeBtn.addEventListener('click', toggleDarkMode);
    }

    // Initialize projects on load
    setTimeout(() => {
        if (currentSection === 3) {
            triggerSectionSpecialAnimations(3);
        }
    }, 500);
});

// --- Theme Management ---
function toggleDarkMode() {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');

    const icon = document.querySelector('#darkModeToggle i');
    if (icon) {
        icon.className = isLight ? 'fas fa-sun' : 'fas fa-moon';
    }
}

function applyThemeOnLoad() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        const icon = document.querySelector('#darkModeToggle i');
        if (icon) icon.className = 'fas fa-sun';
    }
}

// --- Navigation Engine ---
function setupScrollEngine() {
    document.addEventListener('wheel', (e) => {
        if (isScrolling || window.innerWidth <= 768) return;

        if (e.deltaY > 0) {
            scrollToSection(currentSection + 1);
        } else {
            scrollToSection(currentSection - 1);
        }
    }, { passive: true });

    // Touch Support
    let touchStartY = 0;
    document.addEventListener('touchstart', e => { touchStartY = e.touches[0].clientY; }, { passive: true });
    document.addEventListener('touchend', e => {
        if (isScrolling || window.innerWidth <= 768) return;
        const touchEndY = e.changedTouches[0].clientY;
        if (touchStartY - touchEndY > 50) scrollToSection(currentSection + 1);
        if (touchEndY - touchStartY > 50) scrollToSection(currentSection - 1);
    }, { passive: true });
}

function scrollToSection(index) {
    if (index < 0 || index >= totalSections || index === currentSection) return;

    isScrolling = true;
    const sections = document.querySelectorAll('.fullpage-section');
    const isDown = index > currentSection;

    // Transition Classes
    sections[currentSection].classList.remove('active');
    sections[currentSection].classList.add(isDown ? 'exit-up' : 'exit-down');

    sections[index].classList.add(index > currentSection ? 'enter-up' : 'enter-down');

    // Force Reflow
    void sections[index].offsetWidth;

    sections[index].classList.add('active');

    // Cleanup old classes after transition
    setTimeout(() => {
        sections.forEach((s, i) => {
            if (i !== index) {
                s.classList.remove('exit-up', 'exit-down', 'enter-up', 'enter-down');
            }
        });
        isScrolling = false;
    }, scrollDelay);

    currentSection = index;
    updateUI();
    triggerSectionSpecialAnimations(index);
}

function updateUI() {
    // Update Dots
    document.querySelectorAll('.nav-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === currentSection);
    });

    // Update Counter
    const counter = document.querySelector('.current-section');
    if (counter) counter.textContent = String(currentSection + 1).padStart(2, '0');
}

// --- Special Animations ---
function initializeHeroAnimation() {
    const hero = document.querySelector('.hero-title');
    if (hero) hero.classList.add('animate-active');
}

function triggerSectionSpecialAnimations(index) {
    const section = document.querySelectorAll('.fullpage-section')[index];

    // Skills Bar Animation
    if (index === 2) {
        const bars = section.querySelectorAll('.level-bar');
        bars.forEach((bar, i) => {
            bar.style.width = '0';
            setTimeout(() => {
                bar.style.width = bar.style.getPropertyValue('--width');
            }, 400 + (i * 100));
        });
    }

    // Projects Entrance
    if (index === 3) {
        section.querySelectorAll('.project-card').forEach((card, i) => {
            if (card.style.display !== 'none') {
                card.style.opacity = '0';
                card.style.transform = 'translateY(30px)';
                setTimeout(() => {
                    card.style.transition = '0.6s cubic-bezier(0.2, 0.8, 0.2, 1)';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 300 + (i * 150));
            }
        });

        // Ensure projects are properly displayed
        setTimeout(() => {
            showPage(currentPage);
        }, 100);
    }
}

// --- Typewriter Effect ---
const phrases = ["FULL-STACK ARCHITECT", "INTERFACE DESIGNER", "PROBLEM SOLVER", "SYSTEM ENGINEER"];
let phraseIdx = 0;
let charIdx = 0;
let isDeleting = false;

function startTypewriter() {
    const target = document.querySelector('.typing-text');
    if (!target) return;

    const currentPhrase = phrases[phraseIdx];

    if (isDeleting) {
        target.textContent = currentPhrase.substring(0, charIdx - 1);
        charIdx--;
    } else {
        target.textContent = currentPhrase.substring(0, charIdx + 1);
        charIdx++;
    }

    let typeSpeed = isDeleting ? 50 : 100;

    if (!isDeleting && charIdx === currentPhrase.length) {
        typeSpeed = 2000;
        isDeleting = true;
    } else if (isDeleting && charIdx === 0) {
        isDeleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        typeSpeed = 500;
    }

    setTimeout(startTypewriter, typeSpeed);
}

// --- Projects Pagination ---
function initProjectsPagination() {
    const projectsGrid = document.getElementById('projectsGrid');
    if (!projectsGrid) return;

    const projects = projectsGrid.querySelectorAll('.project-card');
    totalProjects = projects.length;

    updatePageIndicators();
    showPage(currentPage);
    updateProjectCount();
}

function showPage(page) {
    const projectsGrid = document.getElementById('projectsGrid');
    if (!projectsGrid) return;

    const projects = projectsGrid.querySelectorAll('.project-card');
    const startIndex = page * projectsPerPage;
    const totalPages = Math.ceil(totalProjects / projectsPerPage);

    // Validate page number
    if (page < 0 || page >= totalPages) return;

    // Hide all projects first
    projects.forEach(project => {
        project.style.display = 'none';
        project.style.opacity = '0';
        project.style.transform = 'translateY(20px)';
    });

    // Show projects for current page
    let visibleCount = 0;
    for (let i = startIndex; i < startIndex + projectsPerPage && i < totalProjects; i++) {
        if (projects[i]) {
            projects[i].style.display = 'block';
            // Animate appearance
            setTimeout(() => {
                projects[i].style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                projects[i].style.opacity = '1';
                projects[i].style.transform = 'translateY(0)';
            }, visibleCount * 100);
            visibleCount++;
        }
    }

    currentPage = page;
    updatePageIndicators();
    updateProjectCount();
    updatePaginationButtons();
}

function updatePageIndicators() {
    const totalPages = Math.ceil(totalProjects / projectsPerPage);
    const indicatorsContainer = document.querySelector('.page-indicators');

    if (!indicatorsContainer) return;

    indicatorsContainer.innerHTML = '';

    for (let i = 0; i < totalPages; i++) {
        const dot = document.createElement('div');
        dot.className = `page-dot ${i === currentPage ? 'active' : ''}`;
        dot.addEventListener('click', () => showPage(i));
        indicatorsContainer.appendChild(dot);
    }
}

function updateProjectCount() {
    const startIndex = currentPage * projectsPerPage + 1;
    const endIndex = Math.min((currentPage + 1) * projectsPerPage, totalProjects);

    const currentRange = document.getElementById('currentRange');
    const totalProjectsElement = document.getElementById('totalProjects');

    if (currentRange) {
        currentRange.textContent = `${startIndex}-${endIndex}`;
    }

    if (totalProjectsElement) {
        totalProjectsElement.textContent = totalProjects;
    }
}

function updatePaginationButtons() {
    const totalPages = Math.ceil(totalProjects / projectsPerPage);
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    if (prevBtn) {
        prevBtn.disabled = currentPage === 0;
    }

    if (nextBtn) {
        nextBtn.disabled = currentPage === totalPages - 1;
    }
}

function nextPage() {
    const totalPages = Math.ceil(totalProjects / projectsPerPage);
    if (currentPage < totalPages - 1) {
        showPage(currentPage + 1);
    }
}

function prevPage() {
    if (currentPage > 0) {
        showPage(currentPage - 1);
    }
}



// --- Navigation Helpers ---
function setupDotNavigation() {
    document.querySelectorAll('.nav-dot').forEach(dot => {
        dot.addEventListener('click', () => {
            scrollToSection(parseInt(dot.getAttribute('data-section')));
        });
    });
}

function setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        if (isScrolling) return;
        if (e.key === 'ArrowDown') scrollToSection(currentSection + 1);
        if (e.key === 'ArrowUp') scrollToSection(currentSection - 1);
    });
}

function setupCTAButtons() {
    document.querySelectorAll('[data-scroll-to]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            scrollToSection(parseInt(btn.getAttribute('data-scroll-to')));
        });
    });
}

// --- Form & Input Logic ---
function setupInputFilledState() {
    document.querySelectorAll('.form-input').forEach(input => {
        input.addEventListener('blur', () => {
            input.setAttribute('data-filled', input.value.trim() !== '' ? 'true' : 'false');
        });
        input.addEventListener('input', () => {
            input.setAttribute('data-filled', input.value.trim() !== '' ? 'true' : 'false');
        });
    });
}

function handleFormSubmit() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = form.querySelector('.submit-button');
        const originalText = btn.innerHTML;

        // Visual Feedback - Sending
        btn.innerHTML = '<span>TRANSMITTING...</span> <i class="fas fa-spinner fa-spin"></i>';

        // EmailJS Send
        // REPLACE "YOUR_SERVICE_ID" and "YOUR_TEMPLATE_ID" with your actual IDs
        emailjs.sendForm('service_fqjp7qz', 'template_n90bkjs', '#contactForm')
            .then(() => {
                // Success
                btn.innerHTML = '<span>DATA TRANSMITTED</span> <i class="fas fa-check"></i>';
                btn.style.background = '#00ff88';
                btn.style.color = '#000';

                setTimeout(() => {
                    form.reset();
                    document.querySelectorAll('.form-input').forEach(i => i.setAttribute('data-filled', 'false'));
                    btn.innerHTML = originalText;
                    btn.style.background = '';
                    btn.style.color = '';
                }, 3000);
            }, (error) => {
                // Error
                console.error('FAILED...', error);
                btn.innerHTML = '<span>TRANSMISSION FAILED</span> <i class="fas fa-times"></i>';
                btn.style.background = '#ff0055';

                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.background = '';
                    btn.style.color = '';
                }, 3000);
            });
    });
}

// --- Window Resize Handler ---
window.addEventListener('resize', () => {
    // Reset projects pagination on resize
    const projectsGrid = document.getElementById('projectsGrid');
    if (projectsGrid) {
        const projects = projectsGrid.querySelectorAll('.project-card');
        totalProjects = projects.length;

        // Ensure current page is valid after resize
        const totalPages = Math.ceil(totalProjects / projectsPerPage);
        if (currentPage >= totalPages) {
            currentPage = Math.max(0, totalPages - 1);
        }

        updatePageIndicators();
        showPage(currentPage);
        updateProjectCount();
    }

    // Update skills bars if on skills section
    if (currentSection === 2) {
        triggerSectionSpecialAnimations(2);
    }
});

// --- Initialize on first load ---
setTimeout(() => {
    initProjectsPagination();
    initJourneyPagination();
}, 1000);

// --- Journey Pagination ---
let currentJourneyPage = 0;
const journeyPerPage = 4;
let totalJourneyItems = 0;

function initJourneyPagination() {
    const journeyGrid = document.querySelector('.journey-grid');
    if (!journeyGrid) return;

    const items = journeyGrid.querySelectorAll('.journey-card');
    totalJourneyItems = items.length;

    // Set up buttons
    const prevBtn = document.querySelector('.journey-prev');
    const nextBtn = document.querySelector('.journey-next');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentJourneyPage > 0) showJourneyPage(currentJourneyPage - 1);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(totalJourneyItems / journeyPerPage);
            if (currentJourneyPage < totalPages - 1) showJourneyPage(currentJourneyPage + 1);
        });
    }

    showJourneyPage(0);
}

function showJourneyPage(page) {
    const journeyGrid = document.querySelector('.journey-grid');
    if (!journeyGrid) return;

    const items = journeyGrid.querySelectorAll('.journey-card');
    const startIndex = page * journeyPerPage;
    const totalPages = Math.ceil(totalJourneyItems / journeyPerPage);

    if (page < 0 || page >= totalPages) return;

    // Hide all first
    items.forEach(item => {
        item.style.display = 'none';
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
    });

    // Show current page items
    let visibleCount = 0;
    for (let i = startIndex; i < startIndex + journeyPerPage && i < totalJourneyItems; i++) {
        if (items[i]) {
            items[i].style.display = 'flex'; // Restore flex display
            setTimeout(() => {
                items[i].style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                items[i].style.opacity = '1';
                items[i].style.transform = 'translateY(0)';
            }, visibleCount * 100);
            visibleCount++;
        }
    }

    currentJourneyPage = page;
    updateJourneyIndicators();
    updateJourneyPaginationButtons();
}

function updateJourneyIndicators() {
    const totalPages = Math.ceil(totalJourneyItems / journeyPerPage);
    const indicatorsContainer = document.querySelector('.journey-indicators');

    if (!indicatorsContainer) return;

    indicatorsContainer.innerHTML = '';

    for (let i = 0; i < totalPages; i++) {
        const dot = document.createElement('div');
        dot.className = `page-dot ${i === currentJourneyPage ? 'active' : ''}`;
        dot.addEventListener('click', () => showJourneyPage(i));
        indicatorsContainer.appendChild(dot);
    }
}

function updateJourneyPaginationButtons() {
    const totalPages = Math.ceil(totalJourneyItems / journeyPerPage);
    const prevBtn = document.querySelector('.journey-prev');
    const nextBtn = document.querySelector('.journey-next');

    if (prevBtn) prevBtn.disabled = currentJourneyPage === 0;
    if (nextBtn) nextBtn.disabled = currentJourneyPage === totalPages - 1;
}