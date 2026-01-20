// Initialize AOS
AOS.init({
    duration: 800,
    easing: 'ease-out-cubic',
    once: true,
    offset: 50
});

// Mobile Menu Toggle
function toggleMobileMenu() {
    const mobileMenu = document.querySelector('.mobile-menu');
    const hamburger = document.querySelector('.hamburger');
    const overlay = document.querySelector('.mobile-overlay');
    
    mobileMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
    overlay.classList.toggle('hidden');
    document.body.classList.toggle('overflow-hidden');
}

// Navbar Scroll Effect
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    const backToTop = document.getElementById('backToTop');
    const currentScroll = window.pageYOffset;
    
    // Navbar shadow on scroll
    if (currentScroll > 50) {
        navbar.classList.add('shadow-xl');
        navbar.classList.remove('shadow-lg');
    } else {
        navbar.classList.remove('shadow-xl');
        navbar.classList.add('shadow-lg');
    }
    
    // Back to top button
    if (currentScroll > 500) {
        backToTop.classList.remove('opacity-0', 'invisible');
        backToTop.classList.add('opacity-100', 'visible');
    } else {
        backToTop.classList.add('opacity-0', 'invisible');
        backToTop.classList.remove('opacity-100', 'visible');
    }
    
    lastScroll = currentScroll;
});

// Scroll to top function
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// 1. Load Data on Startup
document.addEventListener('DOMContentLoaded', () => {
    const savedStatus = localStorage.getItem('resiido_status');
    if (savedStatus) {
        document.getElementById('statusText').innerText = savedStatus;
    }
    initCounterAnimation();
});

// Counter Animation for Stats
function initCounterAnimation() {
    const counters = document.querySelectorAll('.stat-counter');
    const observerOptions = {
        threshold: 0.5
    };
    
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-count'));
                animateCounter(counter, target);
                counterObserver.unobserve(counter);
            }
        });
    }, observerOptions);
    
    counters.forEach(counter => counterObserver.observe(counter));
}

function animateCounter(element, target) {
    let current = 0;
    const duration = 2000;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            element.classList.add('count-pop');
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// 2. Admin Panel Logic
function toggleAdminPanel() {
    const modal = document.getElementById('adminModal');
    const loginStep = document.getElementById('loginStep');
    const editStep = document.getElementById('editStep');
    const passInput = document.getElementById('adminPass');

    if (modal.classList.contains('hidden')) {
        modal.classList.remove('hidden');
        loginStep.classList.remove('hidden');
        editStep.classList.add('hidden');
        passInput.value = '';
    } else {
        modal.classList.add('hidden');
    }
}

function checkLogin() {
    const pass = document.getElementById('adminPass').value;
    if (pass === 'admin123') {
        document.getElementById('loginStep').classList.add('hidden');
        document.getElementById('editStep').classList.remove('hidden');
        document.getElementById('newStatus').value = document.getElementById('statusText').innerText;
    } else {
        alert('Incorrect Password!');
    }
}

function saveChanges() {
    const newText = document.getElementById('newStatus').value;
    document.getElementById('statusText').innerText = newText;
    localStorage.setItem('resiido_status', newText);
    
    // Success feedback
    const btn = event.target;
    btn.innerHTML = '<i class="fas fa-check mr-2"></i>Saved!';
    setTimeout(() => {
        btn.innerHTML = 'Save Update';
        toggleAdminPanel();
    }, 1000);
}

// 3. Contact Form with EmailJS Integration
// Initialize EmailJS with your public key
(function() {
    emailjs.init("L5_6y1OrPunB6CcEn");
})();

function handleContact(event) {
    event.preventDefault();
    const btn = document.getElementById('submitBtn');
    const originalText = btn.innerHTML;
    
    // Get form data
    const formData = {
        from_name: document.getElementById('from_name').value,
        from_email: document.getElementById('from_email').value,
        message: document.getElementById('message').value
    };
    
    // Show loading state
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Sending...';
    btn.classList.add('opacity-75', 'cursor-not-allowed', 'pointer-events-none');
    
    // Send email using EmailJS
    emailjs.send('service_tkxd41h', 'template_n5d75fg', formData)
        .then(function(response) {
            console.log('SUCCESS!', response.status, response.text);
            btn.innerHTML = '<i class="fas fa-check mr-2"></i>Message Sent!';
            btn.classList.remove('opacity-75', 'cursor-not-allowed', 'pointer-events-none');
            btn.classList.add('from-green-500', 'to-emerald-500');
            
            setTimeout(() => {
                alert('Thank you for contacting the Resiido Team! We will get back to you soon.');
                btn.innerHTML = originalText;
                btn.classList.remove('from-green-500', 'to-emerald-500');
                document.getElementById('contactForm').reset();
            }, 500);
        })
        .catch(function(error) {
            console.log('FAILED...', error);
            btn.innerHTML = '<i class="fas fa-times mr-2"></i>Failed to Send';
            btn.classList.remove('opacity-75', 'cursor-not-allowed', 'pointer-events-none');
            btn.classList.add('from-red-500', 'to-red-600');
            
            setTimeout(() => {
                alert('Sorry, there was an error sending your message. Please try again later.');
                btn.innerHTML = originalText;
                btn.classList.remove('from-red-500', 'to-red-600');
            }, 500);
        });
}

// Close mobile menu on window resize
window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024) {
        const mobileMenu = document.querySelector('.mobile-menu');
        const hamburger = document.querySelector('.hamburger');
        const overlay = document.querySelector('.mobile-overlay');
        
        if (mobileMenu.classList.contains('active')) {
            mobileMenu.classList.remove('active');
            hamburger.classList.remove('active');
            overlay.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
        }
    }
});
