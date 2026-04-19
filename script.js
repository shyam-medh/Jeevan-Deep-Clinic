document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    lucide.createIcons();

    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            // Change icon
            const icon = mobileMenuBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.setAttribute('data-lucide', 'x');
                navLinks.style.display = 'flex';
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '80px';
                navLinks.style.left = '0';
                navLinks.style.width = '100%';
                navLinks.style.background = 'white';
                navLinks.style.padding = '20px';
                navLinks.style.boxShadow = '0 10px 10px rgba(0,0,0,0.1)';
            } else {
                icon.setAttribute('data-lucide', 'menu');
                navLinks.style.display = 'none';
            }
            lucide.createIcons();
        });
    }

    // FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all
            faqItems.forEach(i => i.classList.remove('active'));
            
            // Open clicked
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // Static Form Submission for Vercel
    const appointmentForm = document.getElementById('appointment-form');
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;
            const date = document.getElementById('date').value;
            const time = document.getElementById('time').value;
            const message = document.getElementById('message').value;

            const subject = encodeURIComponent(`New Appointment Request from ${name}`);
            const body = encodeURIComponent(`Name: ${name}\nPhone: ${phone}\nDate: ${date}\nTime: ${time}\nMessage/Concern: ${message}`);
            
            window.location.href = `mailto:info@jeevandeepclinic.com?subject=${subject}&body=${body}`;
            
            alert('Your email client has been opened to send the request securely!');
            appointmentForm.reset();
        });
    }

    // WhatsApp Redirect with Form Data
    const whatsappBtn = document.getElementById('whatsapp-btn');
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name').value.trim() || 'Patient';
            const date = document.getElementById('date').value;
            const time = document.getElementById('time').value;
            const message = document.getElementById('message').value.trim();
            
            let waText = `Hello Jeevan Deep Clinic, I am ${name}. I would like to book an appointment`;
            if (date) waText += ` on ${date}`;
            if (time) waText += ` around ${time}`;
            waText += ".";
            
            if (message) {
                waText += ` My concern is: ${message}`;
            }
            
            const waUrl = `https://wa.me/918317035904?text=${encodeURIComponent(waText)}`;
            window.open(waUrl, '_blank');
        });
    }

    // Navbar Scroll Effect
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Active Link update
        highlightNavLink();
    });

    function highlightNavLink() {
        const sections = document.querySelectorAll('section');
        const navItems = document.querySelectorAll('.nav-links a');
        
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href').includes(current)) {
                item.classList.add('active');
            }
        });
    }
});
