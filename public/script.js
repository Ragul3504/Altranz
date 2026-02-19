// script.js

document.addEventListener('DOMContentLoaded', () => {
    const eventsGrid = document.getElementById('eventsGrid');
    const registrationForm = document.getElementById('registrationForm');
    const totalFeeDisplay = document.getElementById('totalFee');
    const filterBtns = document.querySelectorAll('.filter-btn');

    let allEvents = [];
    let selectedEventIds = new Set();
    let currentFilter = 'All';

    // Fetch Events
    if (eventsGrid) {
        fetch('/api/events')
            .then(res => res.json())
            .then(events => {
                allEvents = events;
                renderEvents();
            })
            .catch(err => {
                console.error('Error fetching events:', err);
                eventsGrid.innerHTML = '<p>Error loading operations. Check comms.</p>';
            });
    }

    // Render Events
    function renderEvents() {
        eventsGrid.innerHTML = '';

        const filteredEvents = currentFilter === 'All'
            ? allEvents
            : allEvents.filter(e => e.type === currentFilter);

        if (filteredEvents.length === 0) {
            eventsGrid.innerHTML = '<p>No operations found in this sector.</p>';
            return;
        }

        filteredEvents.forEach(event => {
            const card = document.createElement('div');
            card.className = `event-card-checkbox ${selectedEventIds.has(event.id) ? 'selected' : ''}`;
            card.dataset.id = event.id;
            card.onclick = () => toggleEvent(event.id);

            card.innerHTML = `
                <h4>${event.name}</h4>
                <div class="event-meta">Type: ${event.type}</div>
                <div class="event-meta">Fee: ₹${event.fee}</div>
            `;
            eventsGrid.appendChild(card);
        });
    }

    // Toggle Event Selection
    function toggleEvent(id) {
        if (selectedEventIds.has(id)) {
            selectedEventIds.delete(id);
        } else {
            selectedEventIds.add(id);
        }

        // Update UI
        renderEvents();
        calculateTotal();
    }

    // Calculate Total
    function calculateTotal() {
        let total = 0;
        selectedEventIds.forEach(id => {
            const event = allEvents.find(e => e.id === id);
            if (event) total += event.fee;
        });
        totalFeeDisplay.innerText = total;
    }

    // Filters
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderEvents();
        });
    });

    // Form Submission (Registration Page)
    if (registrationForm) {
        registrationForm.addEventListener('submit', (e) => {
            e.preventDefault();

            if (selectedEventIds.size === 0) {
                alert('You must select at least one operation to proceed.');
                return;
            }

            const formData = new FormData(registrationForm);
            const selectedEvents = allEvents.filter(e => selectedEventIds.has(e.id));
            let totalFee = 0;
            selectedEvents.forEach(e => totalFee += e.fee);

            const registrationData = {
                fullName: formData.get('fullName'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                college: formData.get('college'),
                department: formData.get('department'),
                year: formData.get('year'),
                selectedEvents: selectedEvents,
                totalFee: totalFee
            };

            // Save to Session Storage
            sessionStorage.setItem('registrationData', JSON.stringify(registrationData));

            // Redirect to Payment Page
            window.location.href = `payment.html`;
        });
    }

    // Payment Page Logic
    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
        // Load data from session
        const storedData = sessionStorage.getItem('registrationData');
        if (!storedData) {
            alert('No registration data found. Returning to home.');
            window.location.href = 'index.html';
            return;
        }

        const registrationData = JSON.parse(storedData);
        document.getElementById('paymentAmount').innerText = registrationData.totalFee;

        // Handle Payment Submission
        paymentForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const transactionId = document.getElementById('transactionId').value;
            if (!transactionId) {
                alert('Please enter a valid Transaction ID.');
                return;
            }

            const payload = {
                ...registrationData,
                transactionId: transactionId
            };

            const submitBtn = paymentForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerText;
            submitBtn.innerText = "VERIFYING...";
            submitBtn.disabled = true;

            try {
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                const result = await response.json();

                if (response.ok) {
                    // Clear session
                    sessionStorage.removeItem('registrationData');
                    window.location.href = 'success.html';
                } else {
                    alert('Registration failed: ' + (result.error || 'Unknown error'));
                    submitBtn.innerText = originalBtnText;
                    submitBtn.disabled = false;
                }
            } catch (err) {
                console.error('Error submitting form:', err);
                alert('Network error. Check connection.');
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }
});
