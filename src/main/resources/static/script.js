document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    lucide.createIcons();

    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('open');
            // Change icon
            const icon = mobileMenuBtn.querySelector('i');
            if (navLinks.classList.contains('open')) {
                icon.setAttribute('data-lucide', 'x');
            } else {
                icon.setAttribute('data-lucide', 'menu');
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

    // Form Submission
    const appointmentForm = document.getElementById('appointment-form');
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = appointmentForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerText;
            submitBtn.innerText = 'Booking...';
            submitBtn.disabled = true;

            const appointmentData = {
                name: document.getElementById('name').value,
                phone: document.getElementById('phone').value,
                preferredDate: document.getElementById('date').value,
                preferredTime: document.getElementById('time').value,
                message: document.getElementById('message').value
            };

            try {
                const response = await fetch('/api/appointments', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(appointmentData)
                });

                const result = await response.json();

                if (response.ok) {
                    alert(result.message || 'Appointment successfully booked!');
                    appointmentForm.reset();
                } else {
                    alert('Failed to book appointment. Please try again.');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred. Please check your connection and try again.');
            } finally {
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
            }
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

    // Q&A System Modal Logic
    const questionModal = document.getElementById('question-modal');
    const openQuestionBtn = document.getElementById('open-question-modal');
    const closeQuestionBtn = document.getElementById('close-question-modal');
    const questionForm = document.getElementById('question-form');

    if (openQuestionBtn && questionModal) {
        openQuestionBtn.addEventListener('click', () => { questionModal.style.display = 'flex'; });
        closeQuestionBtn.addEventListener('click', () => { questionModal.style.display = 'none'; });
        window.addEventListener('click', (e) => { if (e.target === questionModal) questionModal.style.display = 'none'; });
    }

    if (questionForm) {
        questionForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = questionForm.querySelector('button[type="submit"]');
            btn.innerText = 'Submitting...'; btn.disabled = true;
            try {
                const res = await fetch('/api/questions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ patientName: document.getElementById('q-name').value, questionText: document.getElementById('q-text').value })
                });
                const data = await res.json();
                alert(data.message || 'Question submitted!');
                questionForm.reset();
                questionModal.style.display = 'none';
            } catch (err) {
                alert('An error occurred. Please try again.');
            } finally {
                btn.innerText = 'Submit Question'; btn.disabled = false;
            }
        });
    }

    // Load doctor-answered Q&As dynamically
    async function loadDynamicQA() {
        const container = document.getElementById('dynamic-qa');
        if (!container) return;
        try {
            const res = await fetch('/api/questions/public');
            if (!res.ok) return;
            const questions = await res.json();
            container.innerHTML = '';
            questions.forEach(q => {
                const item = document.createElement('div');
                item.className = 'faq-item';
                item.innerHTML = `
                    <div class="faq-question">
                        <span>${q.questionText} <small style="color:#10b981; font-size:0.75rem; margin-left:8px;">— ${q.patientName}</small></span>
                        <div class="faq-icon"><i data-lucide="plus"></i></div>
                    </div>
                    <div class="faq-answer">
                        <p>${q.answerText}</p>
                    </div>`;
                container.appendChild(item);

                // Attach toggle click
                item.querySelector('.faq-question').addEventListener('click', () => {
                    item.classList.toggle('active');
                });
            });
            lucide.createIcons();
        } catch (err) { console.error('Could not load Q&A:', err); }
    }
    loadDynamicQA();

    // Review System Modal Logic
    const reviewModal = document.getElementById('review-modal');
    const openReviewBtn = document.getElementById('open-review-modal');
    const closeReviewBtn = document.getElementById('close-review-modal');
    const reviewForm = document.getElementById('review-form');

    if(openReviewBtn && reviewModal) {
        openReviewBtn.addEventListener('click', () => {
            reviewModal.style.display = 'flex';
        });
        closeReviewBtn.addEventListener('click', () => {
            reviewModal.style.display = 'none';
        });
        // Close on outside click
        window.addEventListener('click', (e) => {
            if (e.target === reviewModal) {
                reviewModal.style.display = 'none';
            }
        });
    }

    if (reviewForm) {
        reviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = reviewForm.querySelector('button[type="submit"]');
            submitBtn.innerText = 'Submitting...';
            submitBtn.disabled = true;

            const reviewData = {
                patientName: document.getElementById('review-name').value,
                rating: parseInt(document.getElementById('review-rating').value),
                comment: document.getElementById('review-comment').value
            };

            try {
                const response = await fetch('/api/reviews', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(reviewData)
                });
                const result = await response.json();
                if (response.ok) {
                    alert(result.message || 'Review submitted successfully!');
                    reviewForm.reset();
                    reviewModal.style.display = 'none';
                } else {
                    alert('Failed to submit review.');
                }
            } catch (error) {
                console.error(error);
                alert('An error occurred. Please try again.');
            } finally {
                submitBtn.innerText = 'Submit Review';
                submitBtn.disabled = false;
            }
        });
    }

    // Load Approved Reviews
    async function loadReviews() {
        const reviewsContainer = document.getElementById('dynamic-reviews');
        if(!reviewsContainer) return;

        try {
            const response = await fetch('/api/reviews/public');
            if(response.ok) {
                const reviews = await response.json();
                reviewsContainer.innerHTML = ''; // Clear out loading state
                
                if(reviews.length === 0) {
                    reviewsContainer.innerHTML = '<p style="text-align: center; width: 100%; color: var(--text-muted);">No reviews yet. Be the first to write one!</p>';
                    return;
                }

                reviews.forEach((review, index) => {
                    const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
                    const initial = review.patientName.charAt(0).toUpperCase();
                    // Basic animation delay cascade
                    const delay = (index % 3) * 100;
                    
                    const card = `
                    <div class="testimonial-card" data-aos="fade-up" data-aos-delay="${delay}">
                        <div class="quote-icon"><i data-lucide="quote"></i></div>
                        <div class="stars">${stars}</div>
                        <p>"${review.comment}"</p>
                        <div class="patient-profile">
                            <div class="patient-avatar">${initial}</div>
                            <div class="patient-info">
                                <strong>${review.patientName}</strong>
                            </div>
                        </div>
                    </div>`;
                    reviewsContainer.innerHTML += card;
                });
                // Re-init icons for new cards
                lucide.createIcons();
            }
        } catch (error) {
            console.error("Could not fetch reviews:", error);
        }
    }
    
    // Call loadReviews immediately
    loadReviews();

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
