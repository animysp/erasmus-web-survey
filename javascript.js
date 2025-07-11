// Confirm JS is loaded
console.log('JS loaded');

document.addEventListener('DOMContentLoaded', function () {



    // --- Info Page Modal Nav & Footer Logic ---
    const urlParams = new URLSearchParams(window.location.search);
    const from = urlParams.get('from');
    const infoFooter = document.getElementById('information-footer');

    // Elements
    const invitationModalContent = document.getElementById('invitation-modal-content');
    const informationModalContent = document.getElementById('information-modal-content');
    const backToInvitation = document.getElementById('back-to-invitation');
    const backToQuestionnaire = document.getElementById('back-to-questionnaire');
    const informationLink = document.getElementById('information-link');

    // At start: hide info modal and nav links
    if (informationModalContent) informationModalContent.style.display = 'none';
    if (backToInvitation) backToInvitation.style.display = 'none';
    if (backToQuestionnaire) backToQuestionnaire.style.display = 'none';

    // Show info modal when clicking "Learn more about this research"
    if (informationLink) {
        informationLink.addEventListener('click', function () {
            if (invitationModalContent) invitationModalContent.style.display = 'none';
            if (informationModalContent) informationModalContent.style.display = '';
            if (backToInvitation) backToInvitation.style.display = '';
            if (backToQuestionnaire) backToQuestionnaire.style.display = 'none';
        });
    }

    // Back to invitation: show invitation modal, hide info modal and nav
    if (backToInvitation) {
        backToInvitation.addEventListener('click', function (e) {
            e.preventDefault();
            if (invitationModalContent) invitationModalContent.style.display = '';
            if (informationModalContent) informationModalContent.style.display = 'none';
            backToInvitation.style.display = 'none';
            if (backToQuestionnaire) backToQuestionnaire.style.display = 'none';
        });
    }

    // Show/hide nav and footer based on entry point
    if (from === 'invitation') {
        if (backToInvitation) backToInvitation.style.display = '';
        if (backToQuestionnaire) backToQuestionnaire.style.display = 'none';
        if (infoFooter) infoFooter.style.display = '';
    } else if (from === 'questionnaire') {
        if (backToInvitation) backToInvitation.style.display = 'none';
        if (backToQuestionnaire) backToQuestionnaire.style.display = '';
        if (infoFooter) infoFooter.style.display = 'none';
    }

    // --- Questionnaire State Persistence ---
    // Only run this block on questionnaire.html and information.html
    const isQuestionnaire = window.location.pathname.includes('questionnaire.html');
    const isInformation = window.location.pathname.includes('information.html');

    // Helper to get and set state in sessionStorage
    function saveQuestionnaireState() {
        // Save answers and active states for both contents
        const state = {
            content: document.getElementById('questionnaire-content-2')?.style.display !== 'none' ? 2 : 1,
            answers: {},
            active: []
        };
        document.querySelectorAll('.questionnaire-item').forEach((item, idx) => {
            const checked = item.querySelector('.radio:checked');
            if (checked) state.answers[item.id] = checked.value;
            if (item.classList.contains('active')) state.active.push(item.id);
        });
        sessionStorage.setItem('questionnaireState', JSON.stringify(state));
    }

    function loadQuestionnaireState() {
        const state = JSON.parse(sessionStorage.getItem('questionnaireState') || '{}');
        if (!state || !state.answers) return;
        // Restore answers
        Object.entries(state.answers).forEach(([itemId, value]) => {
            const item = document.getElementById(itemId);
            if (item) {
                const radio = item.querySelector(`.radio[value="${value}"]`);
                if (radio) radio.checked = true;
            }
        });
        // Restore active state
        document.querySelectorAll('.questionnaire-item').forEach(item => {
            item.classList.remove('active', 'inactive');
            if (state.active && state.active.includes(item.id)) {
                item.classList.add('active');
            } else {
                item.classList.add('inactive');
            }
        });
        // Restore content section
        if (state.content === 2) {
            document.getElementById('questionnaire-content-1').style.display = 'none';
            document.getElementById('questionnaire-content-2').style.display = '';
        } else {
            document.getElementById('questionnaire-content-1').style.display = '';
            document.getElementById('questionnaire-content-2').style.display = 'none';
        }
    }

    // On questionnaire page: save state before going to info, reset if back to invitation
    if (isQuestionnaire) {
        // Save state before going to info
        document.querySelectorAll('a[href*="information.html"]').forEach(link => {
            link.addEventListener('click', function () {
                saveQuestionnaireState();
            });
        });
        // Reset state if back to invitation
        document.querySelectorAll('a[href*="index.html"]').forEach(link => {
            link.addEventListener('click', function () {
                sessionStorage.removeItem('questionnaireState');
            });
        });
        // On load, try to restore state if exists
        loadQuestionnaireState();
    }

    // On information page: restore state if from questionnaire, reset if from invitation
    if (isInformation) {
        if (from === 'questionnaire') {
            // When going back to questionnaire, restore state
            if (backToQuestionnaire) {
                backToQuestionnaire.addEventListener('click', function () {
                    // No action needed, state is already in sessionStorage
                });
            }
        }
        if (from === 'invitation') {
            // When going back to invitation, clear state
            if (backToInvitation) {
                backToInvitation.addEventListener('click', function () {
                    sessionStorage.removeItem('questionnaireState');
                });
            }
        }
    }

    // --- Questionnaire 1 logic ---
    const items1 = Array.from(document.querySelectorAll('#questionnaire-content-1 .questionnaire-item'));
    const radios1 = Array.from(document.querySelectorAll('#questionnaire-content-1 .radio'));
    const nextButton1 = document.getElementById('next-button-1');
    const submitButton1 = document.getElementById('submit-button-1');
    const progressBarFill = document.querySelector('#progress-bar-1 .progress-bar-fill');
    let sum = 0;

    function updateProgressBar1() {
        if (!progressBarFill || items1.length === 0) return;
        const answeredCount = items1.filter(item => item.querySelector('.radio:checked')).length;
        const percent = Math.round((answeredCount / items1.length) * 100);
        progressBarFill.style.width = percent + '%';
    }

    function updateButtons1() {
        // Get all selected values in questionnaire-content-1
        const selected = items1.map(item => {
            const checked = item.querySelector('.radio:checked');
            return checked ? Number(checked.value) : null;
        });
        const answeredCount = selected.filter(v => v !== null).length;
        sum = selected.reduce((acc, v) => acc + (v !== null ? v : 0), 0);

        // Update progress bar
        updateProgressBar1();

        // Hide both buttons if nothing answered
        if (answeredCount === 0) {
            nextButton1.style.display = 'none';
            submitButton1.style.display = 'none';
            return;
        }

        // Show only submit if sum is 0
        if (sum === 0) {
            submitButton1.style.display = '';
            nextButton1.style.display = 'none';
            submitButton1.disabled = answeredCount !== items1.length;
        } else {
            nextButton1.style.display = '';
            submitButton1.style.display = 'none';
            nextButton1.disabled = answeredCount !== items1.length;
        }
    }

    const progressText = document.getElementById('progress-text');

    function setProgressTextSmooth(newText) {
        if (!progressText) return;
        progressText.style.transition = 'opacity 0.3s';
        progressText.style.opacity = 0;
        setTimeout(() => {
            progressText.textContent = newText;
            progressText.style.opacity = 1;
        }, 300);
    }

    function updateProgressText1() {
        const answeredCount = items1.filter(item => item.querySelector('.radio:checked')).length;
        if (answeredCount === 0) {
            progressText.textContent = "Welcome! We're grateful you're here. Let's get started";
        } else {
            //progressText.textContent = `${answeredCount} of ${items1.length}`;
            progressText.textContent = `${answeredCount} of ${items1.length}`;
        }
    }


    // Initial state
    if (nextButton1) nextButton1.style.display = 'none';
    if (submitButton1) submitButton1.style.display = 'none';
    if (progressText) {
        progressText.style.opacity = 1;
        progressText.textContent = "Welcome! We're grateful you're here. Let's get started";
    }
    updateProgressBar1();

    radios1.forEach(radio => {
        radio.addEventListener('change', updateButtons1);
        radio.addEventListener('change', updateProgressBar1);
        radio.addEventListener('change', updateProgressText1);
    });

    radios1.forEach(radio => {
        radio.addEventListener('change', function (e) {
            updateButtons1();

            // Auto-activate and scroll to next question
            const currentItem = e.target.closest('.questionnaire-item');
            const currentIdx = items1.indexOf(currentItem);
            const nextItem = items1[currentIdx + 1];
            if (nextItem && nextItem.classList.contains('inactive')) {
                nextItem.classList.remove('inactive');
                nextItem.classList.add('active');
                nextItem.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Next button: go to questionnaire-content-2
    if (nextButton1) {
        nextButton1.addEventListener('click', function () {
            document.getElementById('questionnaire-content-1').style.display = 'none';
            document.getElementById('questionnaire-content-2').style.display = '';
            // Set encouraging message for section 2
            if (progressText) {
                setProgressTextSmooth("You're doing great! Just one more step.");
            }
        });

    }

    // Submit button 1: go to result page
    if (submitButton1) {
        submitButton1.addEventListener('click', function () {
            window.location.href = 'result.html?score=' + sum;
        });
    }

    // --- Questionnaire 2 logic ---
    const items2 = Array.from(document.querySelectorAll('#questionnaire-content-2 .questionnaire-item'));
    const radios2 = Array.from(document.querySelectorAll('#questionnaire-content-2 .radio'));
    const previousButton1 = document.getElementById('previous-button-1');
    const submitButton2 = document.getElementById('submit-button-2');

    function updateButtons2() {
        // Get all selected values in questionnaire-content-2
        const selected = items2.map(item => {
            const checked = item.querySelector('.radio:checked');
            return checked ? Number(checked.value) : null;
        });
        const answeredCount = selected.filter(v => v !== null).length;
        // Enable submit only if all answered
        submitButton2.disabled = answeredCount !== items2.length;
    }

    // Initial state
    if (submitButton2) submitButton2.disabled = true;

    radios2.forEach(radio => {
        radio.addEventListener('change', updateButtons2);
    });

    // Previous button: go back to questionnaire-content-1
    if (previousButton1) {
        previousButton1.addEventListener('click', function () {
            document.getElementById('questionnaire-content-2').style.display = 'none';
            document.getElementById('questionnaire-content-1').style.display = '';
            // Restore progress text to number format for section 1
            if (progressText) {
                const answeredCount = items1.filter(item => item.querySelector('.radio:checked')).length;
                setProgressTextSmooth(
                    answeredCount === 0
                        ? "Welcome! We're grateful you're here. Let's get started"
                        : `${answeredCount} of ${items1.length}`
                );
            }
        });
    }

    // Submit button 2: add value to sum and go to result page
    if (submitButton2) {
        submitButton2.addEventListener('click', function () {
            // Add values from questionnaire-content-2
            const selected = items2.map(item => {
                const checked = item.querySelector('.radio:checked');
                return checked ? Number(checked.value) : 0;
            });
            const total = sum + selected.reduce((acc, v) => acc + v, 0);
            window.location.href = 'result.html?score=' + total;
        });
    }

    // Reusable consent check function
    function setupConsentCheck(joinBtnSelector, consentCheckboxSelector, warningSelector) {
        const joinBtn = document.querySelector(joinBtnSelector);
        const consentCheckbox = document.querySelector(consentCheckboxSelector);
        const warningText = document.querySelector(warningSelector);

        if (joinBtn && consentCheckbox && warningText) {
            joinBtn.addEventListener('click', function (e) {
                if (!consentCheckbox.checked) {
                    e.preventDefault();
                    warningText.style.opacity = 1;
                } else {
                    warningText.style.opacity = 0;
                }
            });
        }
    }

    // Invitation page
    setupConsentCheck(
        '.invitation-actions #join-questionnaire',
        '.invitation .consent #consent-checkbox-invitation',
        '.invitation-actions .warning'
    );

    // Information page
    setupConsentCheck(
        '.information-actions #join-questionnaire',
        '.information .consent #consent-checkbox-information',
        '.information-actions .warning'
    );

    // Information nav highlight and smooth scroll
    const infoContent = document.querySelector('.information-content');
    const navLinks = Array.from(document.querySelectorAll('.information-item-link'));
    const sections = Array.from(document.querySelectorAll('.information-item'));

    function setActiveInformationLink(activeIdx) {
        navLinks.forEach((link, idx) => {
            const a = link.querySelector('a');
            if (a) {
                if (idx === activeIdx) {
                    a.style.color = 'var(--color-brand-secondary-500)';
                    a.style.fontWeight = 'var(--p1-semibold-font-weight)';
                } else {
                    a.style.color = '';
                    a.style.fontWeight = 'var(--p1-regular-font-weight)';
                }
            }
        });
    }

    if (navLinks.length) setActiveInformationLink(0);

    if (infoContent && navLinks.length && sections.length) {
        // Scroll animation when clicking nav links
        navLinks.forEach((link, idx) => {
            const a = link.querySelector('a');
            if (a) {
                a.addEventListener('click', function (e) {
                    e.preventDefault();
                    const targetSection = sections[idx];
                    if (targetSection) {
                        const contentRect = infoContent.getBoundingClientRect();
                        const sectionRect = targetSection.getBoundingClientRect();
                        const scrollTop = infoContent.scrollTop;
                        const offset = sectionRect.top - contentRect.top + scrollTop;
                        infoContent.scrollTo({
                            top: offset,
                            behavior: 'smooth'
                        });
                    }
                });
            }
        });

        // Highlight nav link on scroll
        infoContent.addEventListener('scroll', function () {
            let minDiff = Infinity;
            let activeIdx = 0;
            const contentRect = infoContent.getBoundingClientRect();

            sections.forEach((section, idx) => {
                const rect = section.getBoundingClientRect();
                const diff = Math.abs(rect.top - contentRect.top);
                if (diff < minDiff) {
                    minDiff = diff;
                    activeIdx = idx;
                }
            });

            setActiveInformationLink(activeIdx);
        });
    }

    // --- Result Page Logic ---
    if (window.location.pathname.includes('result.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const score = parseInt(urlParams.get('score'), 10) || 0;

        const scoreValue = document.getElementById('score-value');
        const scoreStage = document.getElementById('score-stage');
        const scoreStageContainer = document.querySelector('.score-stage-container');
        const scoreDescriptionTitle = document.getElementById('score-description-title');
        const scoreDescription = document.getElementById('score-description');
        const scoreContainer = document.getElementById('score-container');

        // Set score
        if (scoreValue) scoreValue.textContent = score;

        // Set result details based on score
        if (scoreStage && scoreDescriptionTitle && scoreDescription) {
            if (score <= 4) {
                scoreStage.textContent = 'Non or Minimal Depression';
                scoreStageContainer.style.backgroundColor = '#8FE8B4';
                scoreContainer.style.border = '1px solid #8FE8B4';
                scoreContainer.style.backgroundColor = '#f2f7f3';
                scoreDescriptionTitle.textContent = "You're in a good place mentally";
                scoreDescription.textContent = "No action needed right now. Your responses suggest you're managing well. Continue your current self-care routine.";
            } else if (score <= 9) {
                scoreStage.textContent = 'Mild Depression';
                scoreStageContainer.style.backgroundColor = '#CBEA91';
                scoreContainer.style.border = '1px solid #CBEA91';
                scoreContainer.style.backgroundColor = '#F7FBEF';
                scoreDescriptionTitle.textContent = "Keep monitoring how you feel";
                scoreDescription.textContent = "Consider retaking this survey in a few weeks to track any changes in your mood.";
            } else if (score <= 14) {
                scoreStage.textContent = 'Moderate Depression';
                scoreStageContainer.style.backgroundColor = '#FFD268';
                scoreContainer.style.border = '1px solid #FFD268';
                scoreContainer.style.backgroundColor = '#FFFBF3';
                scoreDescriptionTitle.textContent = "It's time to reach out for support";
                scoreDescription.textContent = "This might be a good time to talk to someone you trust, contact your primary care doctor, or look into counseling resources in your area.";
            } else if (score <= 19) {
                scoreStage.textContent = 'Moderately severe Depression';
                scoreStageContainer.style.backgroundColor = '#FFB086';
                scoreContainer.style.border = '1px solid #FFB086';
                scoreContainer.style.backgroundColor = '#FFF4EE';
                scoreDescriptionTitle.textContent = "Consider both medication and counseling";
                scoreDescription.textContent = "Reach out to your healthcare provider to discuss prescription options and ask for a referral to a counselor or therapist.";
            } else {
                scoreStage.textContent = 'Severe Depression';
                scoreStageContainer.style.backgroundColor = '#FFA8A3';
                scoreContainer.style.border = '1px solid #FFA8A3';
                scoreContainer.style.backgroundColor = '#FFF2F1';
                scoreDescriptionTitle.textContent = "Seek immediate professional help";
                scoreDescription.textContent = "Contact your doctor right away to discuss medication options and ask for an urgent referral to a mental health specialist. You deserve support and care.";
            }
        }
    }

    // Elements for modal transformation
    const modal = document.querySelector('.modal');
    const modalNav = document.querySelector('.modal-nav');
    const collapsedModalContent = document.getElementById('collapsed-modal-content');
    const declineInvitation = document.getElementById('decline-invitation');
    const declineInformation = document.getElementById('decline-information');
    const closeModalButton = document.getElementById('close-modal-button');


    // At start: hide collapsed modal content
    if (collapsedModalContent) collapsedModalContent.style.display = 'none';


    // Event listeners for reminder buttons
    const reminderButtons = document.querySelectorAll('.reminder-button');

    reminderButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            // Collapse modal after reminder time is selected
            collapseModal();
        });
    });

    function collapseModal() {
        if (!modal) return;

        // Add morphing class for smooth transition
        modal.classList.add('morphing');

        // 1. Fix the current size and position of the modal
        const rect = modal.getBoundingClientRect();
        modal.style.width = rect.width + 'px';
        modal.style.height = rect.height + 'px';
        modal.style.position = 'fixed';
        modal.style.left = rect.left + 'px';
        modal.style.top = rect.top + 'px';
        modal.style.margin = '0';
        modal.style.transform = 'none';

        // 2. Fade out modal contents first (including reminder modal)
        const contents = [invitationModalContent, informationModalContent, reminderModalContent, modalNav];
        contents.forEach(content => {
            if (content && content.style.display !== 'none') {
                content.style.transition = 'opacity 0.2s ease-out';
                content.style.opacity = '0';
            }
        });

        // 3. After content fades, hide and start morphing
        setTimeout(() => {
            contents.forEach(content => {
                if (content) content.style.display = 'none';
            });

            // Start the smooth transition to collapsed state
            modal.style.width = '96px';
            modal.style.height = '96px';
            modal.style.left = 'calc(100vw - 144px)';
            modal.style.top = 'calc(100vh - 144px)';
            modal.style.borderRadius = 'var(--radius-rounded)';

            // Show collapsed content during transition
            if (collapsedModalContent) {
                collapsedModalContent.style.display = '';
                collapsedModalContent.style.opacity = '0';
                collapsedModalContent.style.transition = 'opacity 0.3s ease-in';

                // Fade in collapsed content after morph starts
                setTimeout(() => {
                    collapsedModalContent.style.opacity = '1';
                }, 200);
            }
        }, 200);

        // Remove morphing class after animation
        setTimeout(() => {
            modal.classList.remove('morphing');
        }, 700);
    }

    function expandModal() {
        if (!modal) return;

        // Add morphing class
        modal.classList.add('morphing');

        // 1. Fade out collapsed content first
        if (collapsedModalContent) {
            collapsedModalContent.style.transition = 'opacity 0.2s ease-out';
            collapsedModalContent.style.opacity = '0';

            setTimeout(() => {
                collapsedModalContent.style.display = 'none';
            }, 200);
        }

        // 2. Start morphing back to original size after content fades
        setTimeout(() => {
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const targetWidth = 672;
            const targetHeight = 600;

            modal.style.width = targetWidth + 'px';
            modal.style.height = targetHeight + 'px';
            modal.style.left = (viewportWidth - targetWidth) / 2 + 'px';
            modal.style.top = (viewportHeight - targetHeight) / 2 + 'px';
            modal.style.borderRadius = 'var(--radius-lg)';

            // Show invitation content during transition
            if (invitationModalContent) {
                invitationModalContent.style.display = '';
                invitationModalContent.style.opacity = '0';
                invitationModalContent.style.transition = 'opacity 0.3s ease-in';
            }
            if (modalNav) {
                modalNav.style.display = '';
                modalNav.style.opacity = '0';
                modalNav.style.transition = 'opacity 0.3s ease-in';
            }

            // Fade in content after morph starts
            setTimeout(() => {
                if (invitationModalContent) invitationModalContent.style.opacity = '1';
                if (modalNav) modalNav.style.opacity = '1';
            }, 200);
        }, 200);

        // 4. Reset all styles after animation completes
        setTimeout(() => {
            modal.style.width = '';
            modal.style.height = '';
            modal.style.position = '';
            modal.style.left = '';
            modal.style.top = '';
            modal.style.margin = '';
            modal.style.borderRadius = '';
            modal.style.transform = '';

            // Reset content opacities and ensure proper visibility
            if (invitationModalContent) {
                invitationModalContent.style.opacity = '';
                invitationModalContent.style.transition = '';
            }
            if (modalNav) {
                modalNav.style.opacity = '';
                modalNav.style.transition = '';
            }
            if (informationModalContent) informationModalContent.style.display = 'none';
            if (backToInvitation) backToInvitation.style.display = 'none';
            if (backToQuestionnaire) backToQuestionnaire.style.display = 'none';

            modal.classList.remove('morphing');
        }, 700);
    }

    if (declineInvitation) {
        declineInvitation.addEventListener('click', function (e) {
            e.preventDefault();
            collapseModal();
        });
    }

    if (declineInformation) {
        declineInformation.addEventListener('click', function (e) {
            e.preventDefault();
            collapseModal();
        });
    }

    if (closeModalButton) {
        closeModalButton.addEventListener('click', function (e) {
            e.preventDefault();
            collapseModal();
        });
    }

    // Event listener for expanding from collapsed state
    if (collapsedModalContent) {
        collapsedModalContent.addEventListener('click', function (e) {
            e.preventDefault();

            // Cancel pending reminder message if it hasn't appeared yet
            if (reminderTimeoutId) {
                clearTimeout(reminderTimeoutId);
                reminderTimeoutId = null;
            }

            stopJumpingAnimation(); // Stop any jumping animation
            hideReminderMessage(); // Hide reminder message if it's already visible
            expandModal();
        });
    }

    // Elements for reminder functionality
    const reminderModalContent = document.getElementById('reminder-modal-content');
    const remindInvitation = document.getElementById('remind-invitation');
    const remindInformation = document.getElementById('remind-information');

    // At start: hide reminder modal content
    if (reminderModalContent) {
        reminderModalContent.style.display = 'none';
        reminderModalContent.style.opacity = '0';
    }

    function showReminderModal() {
        // Hide other modal contents with smooth fade out
        const otherContents = [invitationModalContent, informationModalContent];

        otherContents.forEach(content => {
            if (content && content.style.display !== 'none') {
                content.style.transition = 'opacity 0.3s ease-in-out';
                content.style.opacity = '0';
                setTimeout(() => {
                    content.style.display = 'none';
                }, 300);
            }
        });

        // Show reminder modal with smooth fade in
        setTimeout(() => {
            if (reminderModalContent) {
                reminderModalContent.style.display = '';
                reminderModalContent.style.transition = 'opacity 0.3s ease-in-out';
                setTimeout(() => {
                    reminderModalContent.style.opacity = '1';
                }, 50);
            }
        }, 300);
    }

    // Event listeners for remind buttons
    if (remindInvitation) {
        remindInvitation.addEventListener('click', function (e) {
            e.preventDefault();
            showReminderModal();
        });
    }

    if (remindInformation) {
        remindInformation.addEventListener('click', function (e) {
            e.preventDefault();
            showReminderModal();
        });
    }

    const reminderMessage = document.getElementById('reminder-message');

    // At start: hide reminder message
    if (reminderMessage) {
        reminderMessage.style.display = 'none';
        reminderMessage.style.opacity = '0';
    }

    let reminderTimeoutId = null; // Add this variable to track the reminder timeout

    reminderButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            // Collapse modal after reminder time is selected
            collapseModal();

            // Show reminder message after 3 seconds (store timeout ID)
            reminderTimeoutId = setTimeout(() => {
                showReminderMessage();
                reminderTimeoutId = null; // Clear the ID after timeout executes
            }, 3000);
        });
    });

    let reminderAnimationInterval = null;

    function showReminderMessage() {
        if (reminderMessage) {
            reminderMessage.style.display = '';
            reminderMessage.style.position = 'fixed';
            reminderMessage.style.right = 'calc(144px + 24px)'; // 120px modal + 48px margin + 24px gap
            reminderMessage.style.bottom = 'calc(48px + 48px)'; // 48px margin + 60px (half of modal height)
            reminderMessage.style.transform = 'translateY(50%)'; // Center vertically
            reminderMessage.style.transition = 'opacity 0.5s ease-in-out';

            // Gradually show the message
            setTimeout(() => {
                reminderMessage.style.opacity = '1';

                // Start jumping animation after message appears
                setTimeout(() => {
                    startJumpingAnimation();
                }, 500);
            }, 100);
        }
    }

    function startJumpingAnimation() {
        if (!modal || !reminderMessage) return;

        let jumpCount = 0;

        function performJump() {
            // Apply jump animation to both modal and reminder message
            // Use ease-out for jumping up (slower start, faster end)
            modal.style.transition = 'transform 0.4s ease-out';
            reminderMessage.style.transition = 'transform 0.4s ease-out, opacity 0.5s ease-in-out';

            // Jump up
            modal.style.transform = 'translateY(-48px)';
            reminderMessage.style.transform = 'translateY(calc(50% - 48px))';

            setTimeout(() => {
                // Use ease-in for landing down (faster start, slower end)
                modal.style.transition = 'transform 0.3s ease-in';
                reminderMessage.style.transition = 'transform 0.3s ease-in, opacity 0.5s ease-in-out';

                // Jump down
                modal.style.transform = 'translateY(0)';
                reminderMessage.style.transform = 'translateY(50%)';

                jumpCount++;

                // If completed 2 jumps, wait 1 second before next set
                if (jumpCount >= 2) {
                    jumpCount = 0;
                    reminderAnimationInterval = setTimeout(() => {
                        if (reminderMessage && reminderMessage.style.opacity === '1') {
                            performJump();
                        }
                    }, 1500); // Increased wait time between sets
                } else {
                    // Continue jumping (longer delay between jumps)
                    setTimeout(() => {
                        if (reminderMessage && reminderMessage.style.opacity === '1') {
                            performJump();
                        }
                    }, 300); // Increased delay between individual jumps
                }
            }, 300); // Increased time for jump up duration
        }

        // Start the jumping sequence
        performJump();
    }

    function stopJumpingAnimation() {
        // Clear any pending animation timeouts
        if (reminderAnimationInterval) {
            clearTimeout(reminderAnimationInterval);
            reminderAnimationInterval = null;
        }

        // Reset transforms
        if (modal) {
            modal.style.transform = '';
            modal.style.transition = '';
        }
        if (reminderMessage) {
            reminderMessage.style.transform = 'translateY(50%)';
            reminderMessage.style.transition = 'opacity 0.5s ease-in-out';
        }
    }

    function hideReminderMessage() {
        if (reminderMessage) {
            stopJumpingAnimation(); // Stop animation before hiding

            reminderMessage.style.transition = 'opacity 0.3s ease-out';
            reminderMessage.style.opacity = '0';
            setTimeout(() => {
                reminderMessage.style.display = 'none';
            }, 300);
        }
    }

    // --- Result Page Logic ---
    if (window.location.pathname.includes('result.html')) {
        // ...existing result page code...

        // Close results button functionality
        const closeResultsButton = document.getElementById('close-results-button');
        const closeButton = document.getElementById('close-button');

        function closeResultsModal() {
            if (modal) {
                modal.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
                modal.style.opacity = '0';
                modal.style.transform = 'scale(0.95)';

                setTimeout(() => {
                    window.close(); // Try to close the window/tab
                    // If window.close() doesn't work (e.g., not opened by script), redirect
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 100);
                }, 500);
            }
        }

        if (closeResultsButton) {
            closeResultsButton.addEventListener('click', function (e) {
                e.preventDefault();
                closeResultsModal();
            });
        }

        if (closeButton) {
            closeButton.addEventListener('click', function (e) {
                e.preventDefault();
                closeResultsModal();
            });
        }
    }
});
