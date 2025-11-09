function celebrate() {
    createConfetti();
    playBirthdayAnimation();
}

function createConfetti() {
    const confettiContainer = document.getElementById('confetti');
    const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#ff9a9e', '#a8e6cf'];
    
    for (let i = 0; i < 50; i++) {
        const confettiPiece = document.createElement('div');
        confettiPiece.className = 'confetti-piece';
        confettiPiece.style.left = Math.random() * 100 + '%';
        confettiPiece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confettiPiece.style.animationDelay = Math.random() * 2 + 's';
        confettiPiece.style.animationDuration = (Math.random() * 2 + 2) + 's';
        
        confettiContainer.appendChild(confettiPiece);
        
        setTimeout(() => {
            confettiPiece.remove();
        }, 4000);
    }
}

function playBirthdayAnimation() {
    const cake = document.querySelector('.cake');
    const title = document.querySelector('.birthday-title');
    
    cake.style.animation = 'none';
    title.style.animation = 'none';
    
    setTimeout(() => {
        cake.style.animation = 'cakeWiggle 0.5s ease-in-out 3';
        title.style.animation = 'titleGlow 0.5s ease-in-out 3';
    }, 10);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const menuBtn = document.querySelector('.menu-btn');
    
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
    menuBtn.classList.toggle('active');
    document.body.classList.toggle('sidebar-open');
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const menuBtn = document.querySelector('.menu-btn');
    
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    menuBtn.classList.remove('active');
    document.body.classList.remove('sidebar-open');
}

// Load saved theme on page load
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    setTimeout(() => {
        createSparkles();
    }, 1000);
});

function createSparkles() {
    const sparkleContainer = document.createElement('div');
    sparkleContainer.className = 'sparkles';
    sparkleContainer.style.position = 'fixed';
    sparkleContainer.style.top = '0';
    sparkleContainer.style.left = '0';
    sparkleContainer.style.width = '100%';
    sparkleContainer.style.height = '100%';
    sparkleContainer.style.pointerEvents = 'none';
    sparkleContainer.style.zIndex = '999';
    
    document.body.appendChild(sparkleContainer);
    
    for (let i = 0; i < 20; i++) {
        const sparkle = document.createElement('div');
        sparkle.innerHTML = '';
        sparkle.style.position = 'absolute';
        sparkle.style.left = Math.random() * 100 + '%';
        sparkle.style.top = Math.random() * 100 + '%';
        sparkle.style.fontSize = Math.random() * 20 + 10 + 'px';
        sparkle.style.animation = `sparkleFloat ${Math.random() * 3 + 2}s ease-in-out infinite`;
        sparkle.style.animationDelay = Math.random() * 2 + 's';
        
        sparkleContainer.appendChild(sparkle);
    }
    
    // Add sparkle animation CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes sparkleFloat {
            0%, 100% { 
                opacity: 0.3; 
                transform: translateY(0px) scale(0.8); 
            }
            50% { 
                opacity: 1; 
                transform: translateY(-20px) scale(1.2); 
            }
        }
    `;
    document.head.appendChild(style);
}