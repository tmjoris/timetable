// Modal functionality
const generateBtns = document.querySelectorAll('#generate-btn, #cta-generate-btn');
const modal = document.getElementById('generate-modal');
const closeBtn = document.getElementById('close-modal');
const cancelBtn = document.getElementById('cancel-generate');
const confirmBtn = document.getElementById('confirm-generate');
const successMsg = document.getElementById('success-message');

// Open modal
generateBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        modal.style.display = 'flex';
    });
});

// Close modal
function closeModal() {
    modal.style.display = 'none';
}

closeBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', function(e) {
    e.preventDefault();
    closeModal();
});

// Confirm generation
confirmBtn.addEventListener('click', function(e) {
    e.preventDefault();
    closeModal();
    
    // Show success message
    successMsg.style.display = 'block';
    setTimeout(() => {
        successMsg.style.display = 'none';
    }, 3000);
});

// Close modal when clicking outside
window.addEventListener('click', function(e) {
    if (e.target === modal) {
        closeModal();
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});
