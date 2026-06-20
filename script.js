// Interactivity & Dynamic Data Fetching

document.addEventListener('DOMContentLoaded', () => {
    // 1. Theme Management
    const themeBtn = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        updateThemeIcon('light');
    } else {
        updateThemeIcon('dark');
    }
    
    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        const currentTheme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
        localStorage.setItem('theme', currentTheme);
        updateThemeIcon(currentTheme);
    });
    
    function updateThemeIcon(theme) {
        if (theme === 'light') {
            themeBtn.innerHTML = `
                <svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            `;
            themeBtn.title = "Switch to Dark Mode";
        } else {
            themeBtn.innerHTML = `
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            `;
            themeBtn.title = "Switch to Light Mode";
        }
    }

    // 2. Skill Category Filtering
    const filterButtons = document.querySelectorAll('.filter-btn');
    const skillCards = document.querySelectorAll('.skill-category-card');
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            
            const category = btn.dataset.category;
            
            skillCards.forEach(card => {
                if (category === 'all') {
                    card.style.display = 'flex';
                } else if (card.dataset.category === category) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // 3. Dynamic Repos & Stats Fetching
    const config = {
        githubUser: 'nishantkluhera',
        sharedUser: 'projects506',
        leetcodeUser: 'nishantluhera'
    };

    fetchGithubData(config.githubUser, config.sharedUser);
    fetchLeetCodeData(config.leetcodeUser);
});

// Github Fetching
async function fetchGithubData(username, sharedUsername) {
    const reposContainer = document.getElementById('api-repos-grid');
    const loadingEl = document.getElementById('repos-loading');
    
    // Stats elements
    const personalReposCount = document.getElementById('personal-repos-count');
    const personalFollowersCount = document.getElementById('personal-followers-count');
    const sharedReposCount = document.getElementById('shared-repos-count');

    try {
        // Fetch profiles
        const personalProfilePromise = fetch(`https://api.github.com/users/${username}`).then(r => r.json());
        const sharedProfilePromise = fetch(`https://api.github.com/users/${sharedUsername}`).then(r => r.json());
        
        // Fetch repos
        const personalReposPromise = fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=30`).then(r => r.json());
        const sharedReposPromise = fetch(`https://api.github.com/users/${sharedUsername}/repos?sort=updated&per_page=30`).then(r => r.json());
        
        const [personalProfile, sharedProfile, personalRepos, sharedRepos] = await Promise.all([
            personalProfilePromise,
            sharedProfilePromise,
            personalReposPromise,
            sharedReposPromise
        ]);

        // Set profile stats
        if (personalProfile.public_repos !== undefined) {
            personalReposCount.textContent = personalProfile.public_repos;
            personalFollowersCount.textContent = personalProfile.followers;
        }
        if (sharedProfile.public_repos !== undefined) {
            sharedReposCount.textContent = sharedProfile.public_repos;
        }

        // Process and filter repos
        let combinedRepos = [];
        
        if (Array.isArray(personalRepos)) {
            personalRepos.forEach(repo => {
                if (!repo.fork) {
                    combinedRepos.push({
                        name: repo.name,
                        description: repo.description,
                        stars: repo.stargazers_count,
                        forks: repo.forks_count,
                        url: repo.html_url,
                        owner: 'personal',
                        updated: new Date(repo.updated_at)
                    });
                }
            });
        }
        
        if (Array.isArray(sharedRepos)) {
            sharedRepos.forEach(repo => {
                if (!repo.fork) {
                    combinedRepos.push({
                        name: repo.name,
                        description: repo.description,
                        stars: repo.stargazers_count,
                        forks: repo.forks_count,
                        url: repo.html_url,
                        owner: 'shared',
                        updated: new Date(repo.updated_at)
                    });
                }
            });
        }

        // Sort by stargazers + forks DESC (most popular first)
        combinedRepos.sort((a, b) => (b.stars * 2 + b.forks) - (a.stars * 2 + a.forks));

        // Limit to top 6 repositories
        const topRepos = combinedRepos.slice(0, 6);

        if (topRepos.length === 0) {
            loadingEl.textContent = 'No repositories found.';
            return;
        }

        loadingEl.style.display = 'none';
        reposContainer.innerHTML = topRepos.map(repo => `
            <div class="api-repo-card" onclick="window.open('${repo.url}', '_blank')">
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span class="repo-badge">${repo.owner === 'personal' ? 'Personal' : 'Shared Account'}</span>
                    </div>
                    <div class="api-repo-name" title="${repo.name}">${repo.name}</div>
                    <div class="api-repo-desc">${repo.description || 'No description provided.'}</div>
                </div>
                <div class="api-repo-footer">
                    <div class="api-repo-stats">
                        <div class="api-repo-stat">
                            <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                            <span>${repo.stars}</span>
                        </div>
                        <div class="api-repo-stat">
                            <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none"><path d="M15 14c-2 0-3 1-3 3s1 3 3 3 3-1 3-3-1-3-3-3zm-9 0c-2 0-3 1-3 3s1 3 3 3 3-1 3-3-1-3-3-3zm6-9c2 0 3 1 3 3s-1 3-3 3-3-1-3-3 1-3 3-3z"></path><path d="M12 11V8m-6 9v-2a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v2"></path></svg>
                            <span>${repo.forks}</span>
                        </div>
                    </div>
                    <div style="font-size: 0.75rem;">Updated ${formatDate(repo.updated)}</div>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error fetching GitHub repos:', error);
        loadingEl.textContent = 'Failed to load live projects. You can browse them directly on GitHub.';
    }
}

// LeetCode Stats Fetching
async function fetchLeetCodeData(username) {
    // Leetcode DOM elements
    const lcSolved = document.getElementById('lc-solved');
    const lcRank = document.getElementById('lc-rank');
    const lcEasyCount = document.getElementById('lc-easy-count');
    const lcMediumCount = document.getElementById('lc-medium-count');
    const lcHardCount = document.getElementById('lc-hard-count');
    
    // Bar elements
    const lcEasyBar = document.getElementById('lc-easy-bar');
    const lcMediumBar = document.getElementById('lc-medium-bar');
    const lcHardBar = document.getElementById('lc-hard-bar');

    try {
        const response = await fetch(`https://leetcode-stats-api.herokuapp.com/${username}`);
        const stats = await response.json();

        if (stats.status === 'success') {
            lcSolved.textContent = `${stats.totalSolved} / ${stats.totalQuestions}`;
            lcRank.textContent = stats.ranking.toLocaleString();
            
            lcEasyCount.textContent = `${stats.easySolved} / ${stats.totalEasy}`;
            lcMediumCount.textContent = `${stats.mediumSolved} / ${stats.totalMedium}`;
            lcHardCount.textContent = `${stats.hardSolved} / ${stats.totalHard}`;

            // Calculate percentage width (with a fallback safety check)
            const easyPct = Math.min((stats.easySolved / stats.totalEasy) * 100, 100);
            const mediumPct = Math.min((stats.mediumSolved / stats.totalMedium) * 100, 100);
            const hardPct = Math.min((stats.hardSolved / stats.totalHard) * 100, 100);

            // Animate progress bars
            setTimeout(() => {
                lcEasyBar.style.width = `${easyPct}%`;
                lcMediumBar.style.width = `${mediumPct}%`;
                lcHardBar.style.width = `${hardPct}%`;
            }, 300);
        } else {
            setLeetcodeFallback();
        }
    } catch (error) {
        console.error('Error fetching LeetCode stats:', error);
        setLeetcodeFallback();
    }
}

function setLeetcodeFallback() {
    document.getElementById('lc-solved').textContent = '400+';
    document.getElementById('lc-rank').textContent = 'Top 10%';
    document.getElementById('lc-easy-count').textContent = 'Solved';
    document.getElementById('lc-medium-count').textContent = 'Solved';
    document.getElementById('lc-hard-count').textContent = 'Solved';
    
    document.getElementById('lc-easy-bar').style.width = '70%';
    document.getElementById('lc-medium-bar').style.width = '60%';
    document.getElementById('lc-hard-bar').style.width = '30%';
}

// Utility to format date
function formatDate(date) {
    const options = { month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}
