document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    lucide.createIcons();

    // Set date minimum to today (blocks past dates in native calendar picker)
    const dateInput = document.getElementById('date');
    const timeSelect = document.getElementById('time');
    if (dateInput) {
        function getTodayStr() {
            const d = new Date();
            return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        }
        dateInput.setAttribute('min', getTodayStr());
        dateInput.value = ''; // clear any old cached value

        function updateTimeSlots() {
            if (!timeSelect) return;
            const now = new Date();
            const isToday = dateInput.value === getTodayStr();
            const slotsConfig = [
                { value: '2:00 PM - 3:00 PM', startH: 14 },
                { value: '3:00 PM - 4:00 PM', startH: 15 },
                { value: '4:00 PM - 5:00 PM', startH: 16 },
                { value: '5:00 PM - 6:00 PM', startH: 17 },
                { value: '6:00 PM - 7:00 PM', startH: 18 },
                { value: '7:00 PM - 8:00 PM', startH: 19 },
            ];
            const currentH = now.getHours();
            Array.from(timeSelect.options).forEach(opt => {
                if (!opt.value) return;
                const slot = slotsConfig.find(s => s.value === opt.value);
                if (slot && isToday) {
                    opt.disabled = currentH >= slot.startH;
                    opt.text = opt.disabled ? slot.value + ' (Passed)' : slot.value;
                } else {
                    opt.disabled = false;
                    opt.text = slot ? slot.value : opt.value;
                }
            });
            if (timeSelect.options[timeSelect.selectedIndex]?.disabled) timeSelect.value = '';
        }
        dateInput.addEventListener('change', updateTimeSlots);
        updateTimeSlots();
    }

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
                message: document.getElementById('message').value,
                status: 'PENDING'
            };

            try {
                if (window.db) {
                    const { collection, addDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
                    await addDoc(collection(window.db, "appointments"), {
                        ...appointmentData,
                        createdAt: serverTimestamp()
                    });
                    
                    // Use the doctor number selected by the patient
                    const doctorNumber = document.getElementById('doctor')?.value || '918317035904';
                    const waText = `Hello Jeevan Deep Clinic, I am ${appointmentData.name}. I would like to book an appointment on ${appointmentData.preferredDate} around ${appointmentData.preferredTime}. My concern: ${appointmentData.message || 'N/A'}`;
                    const waUrl = `https://wa.me/91${doctorNumber}?text=${encodeURIComponent(waText)}`;
                    
                    alert('Appointment booked successfully! Redirecting to WhatsApp...');
                    window.open(waUrl, '_blank');
                    appointmentForm.reset();
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred. Please try again.');
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

            // Use selected doctor number for WhatsApp redirect
            const doctorNumber = document.getElementById('doctor')?.value || '8317035904';
            const waUrl = `https://wa.me/91${doctorNumber}?text=${encodeURIComponent(waText)}`;
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
                const qData = { 
                    patientName: document.getElementById('q-name').value, 
                    questionText: document.getElementById('q-text').value,
                    answered: false
                };
                
                if (window.db) {
                    const { collection, addDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
                    await addDoc(collection(window.db, "questions"), {
                        ...qData,
                        createdAt: serverTimestamp()
                    });
                    alert('Question submitted! The doctor will answer it shortly.');
                    questionForm.reset();
                    questionModal.style.display = 'none';
                }
            } catch (err) {
                console.error(err);
                alert('An error occurred. Please try again.');
            } finally {
                btn.innerText = 'Submit Question'; btn.disabled = false;
            }
        });
    }

    // Load doctor-answered Q&As dynamically from Firebase
    async function loadDynamicQA() {
        const container = document.getElementById('dynamic-qa');
        if (!container || !window.db) return;
        try {
            const { collection, getDocs, query, where } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
            // Simple query without orderBy to avoid needing a composite index
            const q = query(collection(window.db, "questions"), where("answered", "==", true));
            const querySnapshot = await getDocs(q);
            
            container.innerHTML = '';
            // Sort client-side by createdAt descending
            const docs = [];
            querySnapshot.forEach(d => docs.push(d.data()));
            // Sort newest first, only show items where showOnWebsite is not explicitly false
            docs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            // Filter: showOnWebsite defaults to true unless doctor explicitly set it to false
            const visible = docs.filter(d => d.showOnWebsite !== false).slice(0, 10);

            visible.forEach(qData => {
                const item = document.createElement('div');
                item.className = 'faq-item';
                item.innerHTML = `
                    <div class="faq-question">
                        <span>${qData.questionText} <small style="color:#10b981; font-size:0.75rem; margin-left:8px;">— ${qData.patientName}</small></span>
                        <div class="faq-icon"><i data-lucide="plus"></i></div>
                    </div>
                    <div class="faq-answer">
                        <p>${qData.answerText || 'The doctor will answer this shortly!'}</p>
                    </div>`;
                container.appendChild(item);
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
                comment: document.getElementById('review-comment').value,
                approved: false // Doctor needs to approve
            };

            try {
                if (window.db) {
                    const { collection, addDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
                    await addDoc(collection(window.db, "reviews"), {
                        ...reviewData,
                        createdAt: serverTimestamp()
                    });
                    alert('Review submitted! It will appear on the site once approved.');
                    reviewForm.reset();
                    reviewModal.style.display = 'none';
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
    // Load Approved Reviews from Firebase
    async function loadReviews() {
        const reviewsContainer = document.getElementById('dynamic-reviews');
        if(!reviewsContainer || !window.db) return;

        try {
            const { collection, getDocs, query, where } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
            // Simple query without orderBy to avoid composite index requirement
            const q = query(collection(window.db, "reviews"), where("approved", "==", true));
            const querySnapshot = await getDocs(q);
            
            reviewsContainer.innerHTML = '';
            const reviews = [];
            querySnapshot.forEach(d => reviews.push(d.data()));
            // Sort newest first, only show reviews doctor has approved AND made visible
            reviews.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            const topReviews = reviews.filter(r => r.approved && r.showOnWebsite !== false).slice(0, 6);

            if(topReviews.length === 0) {
                reviewsContainer.innerHTML = '<p style="text-align: center; width: 100%; color: var(--text-muted);">No reviews yet. Be the first to write one!</p>';
                return;
            }

            let index = 0;
            topReviews.forEach((review) => {
                const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
                const initial = review.patientName.charAt(0).toUpperCase();
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
                index++;
            });
            lucide.createIcons();
        } catch (error) {
            console.error("Could not fetch reviews:", error);
        }
    }
    
    // Wait for Firebase to be ready before loading dynamic content
    function onFirebaseReady(callback) {
        if (window.db) { callback(); return; }
        window.addEventListener('firebase-ready', callback, { once: true });
    }

    // Call loadReviews and loadDynamicQA only after Firebase is ready
    onFirebaseReady(() => {
        loadReviews();
        loadDynamicQA();
    });

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
