console.log('JS loaded');

document.addEventListener('DOMContentLoaded', function () {
    // --- Get common elements ---
    const modal = document.querySelector('.modal');
    
    // --- Modal Push-in Animation ---
    const isIndexPage = window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/');
    const isResultPage = window.location.pathname.includes('result.html');
    const shouldTriggerPushIn = sessionStorage.getItem('triggerPushIn') === 'true';
    
    // Add push-in animation for index page, result page, or when returning from result
    if (modal && (isIndexPage || isResultPage || shouldTriggerPushIn)) {
        // Clear the flag if it was set
        if (shouldTriggerPushIn) {
            sessionStorage.removeItem('triggerPushIn');
        }
        
        // Prepare modal for animation
        modal.classList.add('push-in-prepare');
        
        // Trigger animation after a short delay to ensure DOM is ready
        setTimeout(() => {
            modal.classList.remove('push-in-prepare');
            modal.classList.add('push-in');
            
            // Clean up animation class after animation completes
            setTimeout(() => {
                modal.classList.remove('push-in');
            }, 600);
        }, 50);
    }

    // --- Modal Content Switching ---
    const urlParams = new URLSearchParams(window.location.search);
    const showInfo = urlParams.get('info') === 'true';
    const fromQuestionnaire = urlParams.get('from') === 'questionnaire';
    const invitationModalContent = document.getElementById('invitation-modal-content');
    const informationModalContent = document.getElementById('information-modal-content');
    const backToInvitation = document.getElementById('back-to-invitation');
    const backToQuestionnaire = document.getElementById('back-to-questionnaire');
    const infoFooter = document.getElementById('information-footer');
    const informationLink = document.getElementById('information-link');
    const closeModalButton = document.getElementById('close-modal-button');
    const closeModalButtonContainer = document.querySelector('.close-modal-button-container');

    if (showInfo) {
        invitationModalContent && (invitationModalContent.style.display = 'none');
        informationModalContent && (informationModalContent.style.display = '');
        backToInvitation && (backToInvitation.style.display = 'none');
        backToQuestionnaire && (backToQuestionnaire.style.display = '');
        infoFooter && (infoFooter.style.display = 'none');
        
        // Hide close button if coming from questionnaire
        if (fromQuestionnaire) {
            closeModalButton && (closeModalButton.style.display = 'none');
            closeModalButtonContainer && (closeModalButtonContainer.style.display = 'none');
        }
    } else {
        informationModalContent && (informationModalContent.style.display = 'none');
        backToInvitation && (backToInvitation.style.display = 'none');
        backToQuestionnaire && (backToQuestionnaire.style.display = 'none');
        
        // Show close button when not in info mode
        closeModalButton && (closeModalButton.style.display = '');
        closeModalButtonContainer && (closeModalButtonContainer.style.display = '');
    }

    informationLink && informationLink.addEventListener('click', () => {
        invitationModalContent && (invitationModalContent.style.display = 'none');
        informationModalContent && (informationModalContent.style.display = '');
        // Reset opacity when showing information content
        informationModalContent && (informationModalContent.style.opacity = '1');
        backToInvitation && (backToInvitation.style.display = '');
        backToQuestionnaire && (backToQuestionnaire.style.display = 'none');
        
        // Show close button when accessing from invitation (not from questionnaire)
        closeModalButton && (closeModalButton.style.display = '');
        closeModalButtonContainer && (closeModalButtonContainer.style.display = '');
    });

    // Also fix the back to invitation function
    backToInvitation && backToInvitation.addEventListener('click', e => {
        e.preventDefault();
        invitationModalContent && (invitationModalContent.style.display = '');
        // Reset opacity when showing invitation content
        invitationModalContent && (invitationModalContent.style.opacity = '1');
        informationModalContent && (informationModalContent.style.display = 'none');
        backToInvitation.style.display = 'none';
        backToQuestionnaire && (backToQuestionnaire.style.display = 'none');
    });

    backToQuestionnaire && backToQuestionnaire.addEventListener('click', e => {
        e.preventDefault();
        window.location.href = 'questionnaire.html';
    });

    // --- Questionnaire State Persistence ---
    const isQuestionnaire = window.location.pathname.includes('questionnaire.html');
    
    function clearQuestionnaireState() {
        sessionStorage.removeItem('questionnaireState');
    }
    
    function saveQuestionnaireState() {
        const state = {
            content: document.getElementById('questionnaire-content-2')?.style.display !== 'none' ? 2 : 1,
            answers: {},
            active: [],
            progressText: progressText ? progressText.textContent : '',
            sum: sum // Save the sum from content 1
        };
        document.querySelectorAll('.questionnaire-item').forEach(item => {
            const checked = item.querySelector('.radio:checked');
            if (checked) state.answers[item.id] = checked.value;
            if (item.classList.contains('active')) state.active.push(item.id);
        });

        // Save button states for content 1
        if (nextButton1 && submitButton1) {
            state.nextButton1Display = nextButton1.style.display;
            state.submitButton1Display = submitButton1.style.display;
            state.nextButton1Disabled = nextButton1.disabled;
            state.submitButton1Disabled = submitButton1.disabled;
        }

        // Save button states for content 2
        if (submitButton2) {
            state.submitButton2Disabled = submitButton2.disabled;
        }

        // Save progress bar state
        if (progressBarFill) {
            state.progressBarWidth = progressBarFill.style.width;
        }

        sessionStorage.setItem('questionnaireState', JSON.stringify(state));
    }

    function loadQuestionnaireState() {
        const state = JSON.parse(sessionStorage.getItem('questionnaireState') || '{}');
        if (!state.answers) return;

        // Restore sum from saved state
        if (state.sum !== undefined) {
            sum = state.sum;
        }

        // Restore answers first
        Object.entries(state.answers).forEach(([itemId, value]) => {
            const item = document.getElementById(itemId);
            if (item) {
                const radio = item.querySelector(`.radio[value="${value}"]`);
                radio && (radio.checked = true);
            }
        });

        // Restore active/inactive states
        document.querySelectorAll('.questionnaire-item').forEach(item => {
            item.classList.remove('active', 'inactive');
            if (state.active && state.active.includes(item.id)) {
                item.classList.add('active');
            } else {
                item.classList.add('inactive');
            }
        });

        if (state.content === 2) {
            // Use dissolve transition when restoring to content 2
            if (document.getElementById('questionnaire-content-1').style.display !== 'none') {
                dissolveTransition('questionnaire-content-1', 'questionnaire-content-2', () => {
                    // Restore content 2 button states
                    if (submitButton2 && state.hasOwnProperty('submitButton2Disabled')) {
                        submitButton2.disabled = state.submitButton2Disabled;
                    }

                    // Restore the progress bar state if it was saved
                    if (progressBarFill && state.progressBarWidth) {
                        progressBarFill.style.width = state.progressBarWidth;
                    }
                }, state.progressText || "You're doing great! Just one more step.");
            } else {
                // Already on content 2, just restore states
                document.getElementById('questionnaire-content-1').style.display = 'none';
                document.getElementById('questionnaire-content-2').style.display = '';

                // Restore progress text for content 2
                if (progressText && state.progressText) {
                    progressText.textContent = state.progressText;
                }

                // Restore content 2 button states
                if (submitButton2 && state.hasOwnProperty('submitButton2Disabled')) {
                    submitButton2.disabled = state.submitButton2Disabled;
                }

                // Restore the progress bar state if it was saved
                if (progressBarFill && state.progressBarWidth) {
                    progressBarFill.style.width = state.progressBarWidth;
                }
            }
        } else {
            // Calculate progress text for content 1
            const answeredCount = items1.filter(item => item.querySelector('.radio:checked')).length;
            const progressTextContent = answeredCount === 0
                ? "Welcome! We're grateful you're here. Let's get started"
                : `${answeredCount} of ${items1.length}`;

            // Use dissolve transition when restoring to content 1
            if (document.getElementById('questionnaire-content-2').style.display !== 'none') {
                dissolveTransition('questionnaire-content-2', 'questionnaire-content-1', () => {
                    // For content 1, recalculate everything based on restored answers
                    updateButtons1(); // This will set the correct button states
                    updateProgressBar1(); // This will restore the progress bar

                    // Scroll to the latest active question instantly
                    const activeItems = Array.from(document.querySelectorAll('#questionnaire-content-1 .questionnaire-item.active'));
                    if (activeItems.length > 0) {
                        const lastActiveItem = activeItems[activeItems.length - 1];
                        lastActiveItem.scrollIntoView({ behavior: 'instant', block: 'start' });
                    }
                }, progressTextContent);
            } else {
                // Already on content 1, just restore states
                document.getElementById('questionnaire-content-1').style.display = '';
                document.getElementById('questionnaire-content-2').style.display = 'none';

                // For content 1, recalculate everything based on restored answers
                updateButtons1(); // This will set the correct button states
                updateProgressBar1(); // This will restore the progress bar
                updateProgressText1(); // This will restore the correct progress text

                // Scroll to the latest active question instantly
                const activeItems = Array.from(document.querySelectorAll('#questionnaire-content-1 .questionnaire-item.active'));
                if (activeItems.length > 0) {
                    const lastActiveItem = activeItems[activeItems.length - 1];
                    lastActiveItem.scrollIntoView({ behavior: 'instant', block: 'start' });
                }
            }
        }
    }

    if (isQuestionnaire) {
        const questionnaireInfoLink = document.getElementById('questionnaire-information-link');
        questionnaireInfoLink && questionnaireInfoLink.addEventListener('click', e => {
            e.preventDefault();
            saveQuestionnaireState();
            window.location.href = 'index.html?info=true&from=questionnaire';
        });
        const backToInvitationLink = document.getElementById('back-to-invitation-link');
        backToInvitationLink && backToInvitationLink.addEventListener('click', () => {
            clearQuestionnaireState();
        });

        // Load state AFTER all the questionnaire logic is set up
        setTimeout(() => {
            loadQuestionnaireState();
        }, 0);
    }

    // --- Questionnaire Logic ---
    const items1 = Array.from(document.querySelectorAll('#questionnaire-content-1 .questionnaire-item'));
    const radios1 = Array.from(document.querySelectorAll('#questionnaire-content-1 .radio'));
    const nextButton1 = document.getElementById('next-button-1');
    const submitButton1 = document.getElementById('submit-button-1');
    const progressBarFill = document.querySelector('#progress-bar-1 .progress-bar-fill');
    let sum = 0;
    
    // Helper function for dissolve transition between questionnaire contents
    function dissolveTransition(fromContent, toContent, callback, progressTextUpdate) {
        const fromElement = document.getElementById(fromContent);
        const toElement = document.getElementById(toContent);
        
        if (!fromElement || !toElement) {
            callback && callback();
            return;
        }
        
        // Update progress text first before any animation
        if (progressTextUpdate && progressText) {
            setProgressTextSmooth(progressTextUpdate);
        }
        
        // Start dissolve out animation after a short delay to ensure progress text is updated
        setTimeout(() => {
            fromElement.classList.add('dissolve-out');
            
            setTimeout(() => {
                // Hide the from element and show the to element
                fromElement.style.display = 'none';
                fromElement.classList.remove('dissolve-out');
                
                // Prepare the to element for animation
                toElement.classList.add('dissolve-prepare');
                toElement.style.display = '';
                
                // Start dissolve in animation
                setTimeout(() => {
                    toElement.classList.remove('dissolve-prepare');
                    toElement.classList.add('dissolve-in');
                    
                    // Clean up animation class after animation completes
                    setTimeout(() => {
                        toElement.classList.remove('dissolve-in');
                        callback && callback();
                    }, 300);
                }, 50);
            }, 300);
        }, 100); // Small delay to let progress text update first
    }
    function updateProgressBar1() {
        if (!progressBarFill || items1.length === 0) return;
        const answeredCount = items1.filter(item => item.querySelector('.radio:checked')).length;
        progressBarFill.style.width = Math.round((answeredCount / items1.length) * 100) + '%';
    }
    function updateButtons1() {
        const selected = items1.map(item => {
            const checked = item.querySelector('.radio:checked');
            return checked ? Number(checked.value) : null;
        });
        const answeredCount = selected.filter(v => v !== null).length;
        sum = selected.reduce((acc, v) => acc + (v !== null ? v : 0), 0);
        updateProgressBar1();
        if (answeredCount === 0) {
            nextButton1.style.display = 'none';
            submitButton1.style.display = 'none';
            return;
        }
        if (sum === 0) {
            submitButton1.style.display = '';
            nextButton1.style.display = 'none';
            // Allow submission when score is 0, even if not all questions are answered
            submitButton1.disabled = false;
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
        progressText.textContent = answeredCount === 0
            ? "Welcome! We're grateful you're here. Let's get started"
            : `${answeredCount} of ${items1.length}`;
    }
    nextButton1 && (nextButton1.style.display = 'none');
    submitButton1 && (submitButton1.style.display = 'none');
    progressText && (progressText.style.opacity = 1, progressText.textContent = "Welcome! We're grateful you're here. Let's get started");
    updateProgressBar1();
    radios1.forEach(radio => {
        radio.addEventListener('change', updateButtons1);
        radio.addEventListener('change', updateProgressBar1);
        radio.addEventListener('change', updateProgressText1);
        radio.addEventListener('change', function (e) {
            updateButtons1();
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
    // Update the next button logic to preserve content 2 state
    nextButton1 && nextButton1.addEventListener('click', () => {
        // Save current content 1 state
        const content1State = {
            content: 1,
            answers: {},
            active: [],
            sum: sum,
            progressBarWidth: progressBarFill ? progressBarFill.style.width : ''
        };
        document.querySelectorAll('#questionnaire-content-1 .questionnaire-item').forEach(item => {
            const checked = item.querySelector('.radio:checked');
            if (checked) content1State.answers[item.id] = checked.value;
            if (item.classList.contains('active')) content1State.active.push(item.id);
        });

        // Use dissolve transition to switch to content 2 with progress text update
        dissolveTransition('questionnaire-content-1', 'questionnaire-content-2', () => {
            // Restore any existing content 2 state
            const existingState = JSON.parse(sessionStorage.getItem('questionnaireState') || '{}');
            if (existingState.content === 2 && existingState.answers && existingState.answers['phq9-10']) {
                // Restore content 2 answer and button state
                const item = document.getElementById('phq9-10');
                if (item) {
                    const radio = item.querySelector(`.radio[value="${existingState.answers['phq9-10']}"]`);
                    if (radio) {
                        radio.checked = true;
                        updateButtons2(); // This will enable submit button if answered
                    }
                }
            }

            // Update session storage
            Object.assign(existingState, content1State, { content: 2, progressText: "You're doing great! Just one more step." });
            sessionStorage.setItem('questionnaireState', JSON.stringify(existingState));
        }, "You're doing great! Just one more step.");
    });

    // Add event listener for submit button in content 1 (when score is 0)
    submitButton1 && submitButton1.addEventListener('click', () => {
        // When submitting from content 1 with score 0, go directly to results
        window.location.href = 'result.html?score=' + sum;
    });

    // --- Questionnaire 2 logic ---
    const items2 = Array.from(document.querySelectorAll('#questionnaire-content-2 .questionnaire-item'));
    const radios2 = Array.from(document.querySelectorAll('#questionnaire-content-2 .radio'));
    const previousButton1 = document.getElementById('previous-button-1');
    const submitButton2 = document.getElementById('submit-button-2');
    function updateButtons2() {
        const selected = items2.map(item => {
            const checked = item.querySelector('.radio:checked');
            return checked ? Number(checked.value) : null;
        });
        submitButton2.disabled = selected.filter(v => v !== null).length !== items2.length;
    }
    submitButton2 && (submitButton2.disabled = true);
    radios2.forEach(radio => radio.addEventListener('change', updateButtons2));
    // Update the previous button logic
    previousButton1 && previousButton1.addEventListener('click', () => {
        // Save current state before switching
        const currentState = {
            content: 2,
            answers: {},
            active: [],
            submitButton2Disabled: submitButton2.disabled
        };
        document.querySelectorAll('.questionnaire-item').forEach(item => {
            const checked = item.querySelector('.radio:checked');
            if (checked) currentState.answers[item.id] = checked.value;
            if (item.classList.contains('active')) currentState.active.push(item.id);
        });

        // Calculate progress text for content 1
        const answeredCount = items1.filter(item => item.querySelector('.radio:checked')).length;
        const progressTextContent = answeredCount === 0
            ? "Welcome! We're grateful you're here. Let's get started"
            : `${answeredCount} of ${items1.length}`;

        // Use dissolve transition to switch back to content 1 with progress text update
        dissolveTransition('questionnaire-content-2', 'questionnaire-content-1', () => {
            // Recalculate buttons for content 1 (this ensures next button appears if all questions are answered)
            updateButtons1();

            // Update session storage with the previous state
            const existingState = JSON.parse(sessionStorage.getItem('questionnaireState') || '{}');
            Object.assign(existingState, currentState, { content: 1 });
            sessionStorage.setItem('questionnaireState', JSON.stringify(existingState));
        }, progressTextContent);
    });
    submitButton2 && submitButton2.addEventListener('click', () => {
        const selected = items2.map(item => {
            const checked = item.querySelector('.radio:checked');
            return checked ? Number(checked.value) : 0;
        });
        window.location.href = 'result.html?score=' + (sum + selected.reduce((acc, v) => acc + v, 0));
    });

    // --- Consent Check ---
    function setupConsentCheck(joinBtnSelector, consentCheckboxSelector, warningSelector) {
        const joinBtn = document.querySelector(joinBtnSelector);
        const consentCheckbox = document.querySelector(consentCheckboxSelector);
        const warningText = document.querySelector(warningSelector);
        joinBtn && consentCheckbox && warningText && joinBtn.addEventListener('click', function (e) {
            if (!consentCheckbox.checked) {
                e.preventDefault();
                warningText.style.opacity = 1;
            } else {
                warningText.style.opacity = 0;
            }
        });
    }
    setupConsentCheck('.invitation-actions #join-questionnaire', '#consent-checkbox-invitation', '.invitation-actions .warning');
    setupConsentCheck('.information-actions #join-questionnaire', '#consent-checkbox-information', '.information-actions .warning');

    // --- Information Nav Highlight & Scroll ---
    const infoContent = document.querySelector('.information-content');
    const navLinks = Array.from(document.querySelectorAll('.information-item-link'));
    const sections = Array.from(document.querySelectorAll('.information-item'));
    function setActiveInformationLink(activeIdx) {
        navLinks.forEach((link, idx) => {
            const a = link.querySelector('a');
            if (a) {
                a.style.color = idx === activeIdx ? 'var(--color-brand-secondary-500)' : '';
                a.style.fontWeight = idx === activeIdx ? 'var(--p1-semibold-font-weight)' : 'var(--p1-regular-font-weight)';
            }
        });
    }
    navLinks.length && setActiveInformationLink(0);
    if (infoContent && navLinks.length && sections.length) {
        navLinks.forEach((link, idx) => {
            const a = link.querySelector('a');
            a && a.addEventListener('click', function (e) {
                e.preventDefault();
                const targetSection = sections[idx];
                if (targetSection) {
                    const contentRect = infoContent.getBoundingClientRect();
                    const sectionRect = targetSection.getBoundingClientRect();
                    const scrollTop = infoContent.scrollTop;
                    const offset = sectionRect.top - contentRect.top + scrollTop;
                    infoContent.scrollTo({ top: offset, behavior: 'smooth' });
                }
            });
        });
        infoContent.addEventListener('scroll', function () {
            let minDiff = Infinity, activeIdx = 0;
            const contentRect = infoContent.getBoundingClientRect();
            sections.forEach((section, idx) => {
                const diff = Math.abs(section.getBoundingClientRect().top - contentRect.top);
                if (diff < minDiff) { minDiff = diff; activeIdx = idx; }
            });
            setActiveInformationLink(activeIdx);
        });
    }

    // --- Result Page Logic ---
    if (window.location.pathname.includes('result.html')) {
        const score = parseInt(new URLSearchParams(window.location.search).get('score'), 10) || 0;
        const scoreValue = document.getElementById('score-value');
        const scoreStage = document.getElementById('score-stage');
        const scoreStageContainer = document.querySelector('.score-stage-container');
        const scoreDescriptionTitle = document.getElementById('score-description-title');
        const scoreDescription = document.getElementById('score-description');
        const scoreContainer = document.getElementById('score-container');
        scoreValue && (scoreValue.textContent = score);
        if (scoreStage && scoreDescriptionTitle && scoreDescription) {
            if (score <= 4) {
                scoreStage.textContent = 'Non or Minimal Depression';
                scoreStageContainer.style.backgroundColor = '#8FE8B4';
                scoreContainer.style.border = '1px solid #8FE8B4';
                scoreContainer.style.backgroundColor = '#f2f7f3';
                scoreDescriptionTitle.textContent = "You're in a good place mentally";
                scoreDescriptionTitle.style.color = '#5dcc8bff';
                scoreDescription.textContent = "No action needed right now. Your responses suggest you're managing well. Continue your current self-care routine.";
            } else if (score <= 9) {
                scoreStage.textContent = 'Mild Depression';
                scoreStageContainer.style.backgroundColor = '#CBEA91';
                scoreContainer.style.border = '1px solid #CBEA91';
                scoreContainer.style.backgroundColor = '#F7FBEF';
                scoreDescriptionTitle.textContent = "Keep monitoring how you feel";
                scoreDescriptionTitle.style.color = '#98c14cff';
                scoreDescription.textContent = "Consider retaking this survey in a few weeks to track any changes in your mood.";
            } else if (score <= 14) {
                scoreStage.textContent = 'Moderate Depression';
                scoreStageContainer.style.backgroundColor = '#FFD268';
                scoreContainer.style.border = '1px solid #FFD268';
                scoreContainer.style.backgroundColor = '#FFFBF3';
                scoreDescriptionTitle.textContent = "It's time to reach out for support";
                scoreDescriptionTitle.style.color = '#eb9407ff';
                scoreDescription.textContent = "This might be a good time to talk to someone you trust, contact your primary care doctor, or look into counseling resources in your area.";
            } else if (score <= 19) {
                scoreStage.textContent = 'Moderately severe Depression';
                scoreStageContainer.style.backgroundColor = '#FFB086';
                scoreContainer.style.border = '1px solid #FFB086';
                scoreContainer.style.backgroundColor = '#FFF4EE';
                scoreDescriptionTitle.textContent = "Consider both medication and counseling";
                scoreDescriptionTitle.style.color = '#eb6f22ff';
                scoreDescription.textContent = "Reach out to your healthcare provider to discuss prescription options and ask for a referral to a counselor or therapist.";
            } else {
                scoreStage.textContent = 'Severe Depression';
                scoreStageContainer.style.backgroundColor = '#FFA8A3';
                scoreContainer.style.border = '1px solid #FFA8A3';
                scoreContainer.style.backgroundColor = '#FFF2F1';
                scoreDescriptionTitle.textContent = "Seek immediate professional help";
                scoreDescriptionTitle.style.color = '#f07065ff';
                scoreDescription.textContent = "Contact your doctor right away to discuss medication options and ask for an urgent referral to a mental health specialist. You deserve support and care.";
            }
        }
        // Close results modal
        const closeResultsButton = document.getElementById('close-results-button');
        const closeButton = document.getElementById('close-button');
        function closeResultsModal() {
            // Clear all questionnaire state when closing results
            clearQuestionnaireState();
            
            if (modal) {
                modal.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
                modal.style.opacity = '0';
                modal.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    window.close();
                    setTimeout(() => { 
                        // Store flag to trigger push-in animation on return
                        sessionStorage.setItem('triggerPushIn', 'true');
                        window.location.href = 'index.html'; 
                    }, 100);
                }, 500);
            }
        }
        closeResultsButton && closeResultsButton.addEventListener('click', e => { e.preventDefault(); closeResultsModal(); });
        closeButton && closeButton.addEventListener('click', e => { e.preventDefault(); closeResultsModal(); });
    }

    // --- Modal Collapse/Expand Logic ---
    const modalNav = document.querySelector('.modal-nav');
    const collapsedModalContent = document.getElementById('collapsed-modal-content');
    const declineInvitation = document.getElementById('decline-invitation');
    const declineInformation = document.getElementById('decline-information');
    collapsedModalContent && (collapsedModalContent.style.display = 'none');
    const reminderButtons = document.querySelectorAll('.reminder-button');
    reminderButtons.forEach(button => button.addEventListener('click', e => { e.preventDefault(); collapseModal(); }));

    function collapseModal() {
        if (!modal) return;
        modal.classList.add('morphing');
        const rect = modal.getBoundingClientRect();
        modal.style.width = rect.width + 'px';
        modal.style.height = rect.height + 'px';
        modal.style.position = 'fixed';
        modal.style.left = rect.left + 'px';
        modal.style.top = rect.top + 'px';
        modal.style.margin = '0';
        modal.style.transform = 'none';
        const contents = [invitationModalContent, informationModalContent, reminderModalContent, modalNav];
        contents.forEach(content => {
            if (content && content.style.display !== 'none') {
                content.style.transition = 'opacity 0.2s ease-out';
                content.style.opacity = '0';
            }
        });

        // Reset consent warning text visibility
        const invitationWarning = document.querySelector('.invitation-actions .warning');
        const informationWarning = document.querySelector('.information-actions .warning');
        invitationWarning && (invitationWarning.style.opacity = 0);
        informationWarning && (informationWarning.style.opacity = 0);

        setTimeout(() => {
            contents.forEach(content => { content && (content.style.display = 'none'); });
            modal.style.width = '96px';
            modal.style.height = '96px';
            modal.style.left = 'calc(100vw - 144px)';
            modal.style.top = 'calc(100vh - 144px)';
            modal.style.borderRadius = 'var(--radius-rounded)';
            if (collapsedModalContent) {
                collapsedModalContent.style.display = '';
                collapsedModalContent.style.opacity = '0';
                collapsedModalContent.style.transition = 'opacity 0.3s ease-in';
                setTimeout(() => { collapsedModalContent.style.opacity = '1'; }, 200);
            }
        }, 200);
        setTimeout(() => { modal.classList.remove('morphing'); }, 700);
    }
    function expandModal() {
        if (!modal) return;
        modal.classList.add('morphing');
        if (collapsedModalContent) {
            collapsedModalContent.style.transition = 'opacity 0.2s ease-out';
            collapsedModalContent.style.opacity = '0';
            setTimeout(() => { collapsedModalContent.style.display = 'none'; }, 200);
        }
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
            invitationModalContent && (invitationModalContent.style.display = '', invitationModalContent.style.opacity = '0', invitationModalContent.style.transition = 'opacity 0.3s ease-in');
            modalNav && (modalNav.style.display = '', modalNav.style.opacity = '0', modalNav.style.transition = 'opacity 0.3s ease-in');
            setTimeout(() => {
                invitationModalContent && (invitationModalContent.style.opacity = '1');
                modalNav && (modalNav.style.opacity = '1');
            }, 200);
        }, 200);
        setTimeout(() => {
            modal.style.width = '';
            modal.style.height = '';
            modal.style.position = '';
            modal.style.left = '';
            modal.style.top = '';
            modal.style.margin = '';
            modal.style.borderRadius = '';
            modal.style.transform = '';
            invitationModalContent && (invitationModalContent.style.opacity = '', invitationModalContent.style.transition = '');
            modalNav && (modalNav.style.opacity = '', modalNav.style.transition = '');
            informationModalContent && (informationModalContent.style.display = 'none');
            backToInvitation && (backToInvitation.style.display = 'none');
            backToQuestionnaire && (backToQuestionnaire.style.display = 'none');
            modal.classList.remove('morphing');
        }, 700);
    }
    declineInvitation && declineInvitation.addEventListener('click', e => { e.preventDefault(); collapseModal(); });
    declineInformation && declineInformation.addEventListener('click', e => { e.preventDefault(); collapseModal(); });
    closeModalButton && closeModalButton.addEventListener('click', e => { e.preventDefault(); collapseModal(); });
    collapsedModalContent && collapsedModalContent.addEventListener('click', e => {
        e.preventDefault();
        if (reminderTimeoutId) { clearTimeout(reminderTimeoutId); reminderTimeoutId = null; }
        stopJumpingAnimation();
        hideReminderMessage();
        expandModal();
    });

    // --- Reminder Modal Logic ---
    const reminderModalContent = document.getElementById('reminder-modal-content');
    const remindInvitation = document.getElementById('remind-invitation');
    const remindInformation = document.getElementById('remind-information');
    reminderModalContent && (reminderModalContent.style.display = 'none', reminderModalContent.style.opacity = '0');
    function showReminderModal() {
        [invitationModalContent, informationModalContent].forEach(content => {
            if (content && content.style.display !== 'none') {
                content.style.transition = 'opacity 0.3s ease-in-out';
                content.style.opacity = '0';
                setTimeout(() => { content.style.display = 'none'; }, 300);
            }
        });
        setTimeout(() => {
            reminderModalContent && (reminderModalContent.style.display = '', reminderModalContent.style.transition = 'opacity 0.3s ease-in-out');
            setTimeout(() => { reminderModalContent.style.opacity = '1'; }, 50);
            // Show back-to-invitation in modal-nav
            backToInvitation && (backToInvitation.style.display = '');
        }, 300);
    }

    // Back to invitation from reminder
    backToInvitation && backToInvitation.addEventListener('click', e => {
        e.preventDefault();
        invitationModalContent && (invitationModalContent.style.display = '');
        invitationModalContent && (invitationModalContent.style.opacity = '1');
        informationModalContent && (informationModalContent.style.display = 'none');
        reminderModalContent && (reminderModalContent.style.display = 'none', reminderModalContent.style.opacity = '0');
        backToInvitation.style.display = 'none';
        backToQuestionnaire && (backToQuestionnaire.style.display = 'none');
    });
    remindInvitation && remindInvitation.addEventListener('click', e => { e.preventDefault(); showReminderModal(); });
    remindInformation && remindInformation.addEventListener('click', e => { e.preventDefault(); showReminderModal(); });

    // --- Reminder Message Logic ---
    const reminderMessage = document.getElementById('reminder-message');
    reminderMessage && (reminderMessage.style.display = 'none', reminderMessage.style.opacity = '0');
    let reminderTimeoutId = null;
    reminderButtons.forEach(button => button.addEventListener('click', e => {
        e.preventDefault();
        collapseModal();
        reminderTimeoutId = setTimeout(() => {
            showReminderMessage();
            reminderTimeoutId = null;
        }, 3000);
    }));
    let reminderAnimationInterval = null;
    function showReminderMessage() {
        if (reminderMessage) {
            reminderMessage.style.display = '';
            reminderMessage.style.position = 'fixed';
            reminderMessage.style.right = 'calc(144px + 24px)';
            reminderMessage.style.bottom = 'calc(48px + 48px)';
            reminderMessage.style.transform = 'translateY(50%)';
            reminderMessage.style.transition = 'opacity 0.5s ease-in-out';
            setTimeout(() => {
                reminderMessage.style.opacity = '1';
                setTimeout(() => { startJumpingAnimation(); }, 500);
            }, 100);
        }
    }
    function startJumpingAnimation() {
        if (!modal || !reminderMessage) return;
        let jumpCount = 0;
        function performJump() {
            modal.style.transition = 'transform 0.4s ease-out';
            reminderMessage.style.transition = 'transform 0.4s ease-out, opacity 0.5s ease-in-out';
            modal.style.transform = 'translateY(-48px)';
            reminderMessage.style.transform = 'translateY(calc(50% - 48px))';
            setTimeout(() => {
                modal.style.transition = 'transform 0.3s ease-in';
                reminderMessage.style.transition = 'transform 0.3s ease-in, opacity 0.5s ease-in-out';
                modal.style.transform = 'translateY(0)';
                reminderMessage.style.transform = 'translateY(50%)';
                jumpCount++;
                if (jumpCount >= 2) {
                    jumpCount = 0;
                    reminderAnimationInterval = setTimeout(() => {
                        if (reminderMessage && reminderMessage.style.opacity === '1') performJump();
                    }, 1500);
                } else {
                    setTimeout(() => {
                        if (reminderMessage && reminderMessage.style.opacity === '1') performJump();
                    }, 300);
                }
            }, 300);
        }
        performJump();
    }
    function stopJumpingAnimation() {
        reminderAnimationInterval && clearTimeout(reminderAnimationInterval);
        reminderAnimationInterval = null;
        modal && (modal.style.transform = '', modal.style.transition = '');
        reminderMessage && (reminderMessage.style.transform = 'translateY(50%)', reminderMessage.style.transition = 'opacity 0.5s ease-in-out');
    }
    function hideReminderMessage() {
        if (reminderMessage) {
            stopJumpingAnimation();
            reminderMessage.style.transition = 'opacity 0.3s ease-out';
            reminderMessage.style.opacity = '0';
            setTimeout(() => { reminderMessage.style.display = 'none'; }, 300);
        }
    }

    // --- Questionnaire Modal Collapse/Expand ---
    const closeModalButtonQuestionnaire = document.getElementById('close-modal-button-questionnaire');
    const collapsedQuestionnaireContent = document.getElementById('collapsed-questionnaire-content');
    const questionnaireModalContent = document.getElementById('questionnaire-modal-content');
    const questionnaireModalFooter = document.getElementById('questionnaire-modal-footer');
    collapsedQuestionnaireContent && (collapsedQuestionnaireContent.style.display = 'none');
    function collapseQuestionnaireModal() {
        if (!modal) return;
        modal.classList.add('morphing');
        const rect = modal.getBoundingClientRect();
        modal.style.width = rect.width + 'px';
        modal.style.height = rect.height + 'px';
        modal.style.position = 'fixed';
        modal.style.left = rect.left + 'px';
        modal.style.top = rect.top + 'px';
        modal.style.margin = '0';
        modal.style.transform = 'none';
        [modalNav, questionnaireModalContent, questionnaireModalFooter].forEach(content => {
            if (content && content.style.display !== 'none') {
                content.style.transition = 'opacity 0.2s ease-out';
                content.style.opacity = '0';
            }
        });
        setTimeout(() => {
            [modalNav, questionnaireModalContent, questionnaireModalFooter].forEach(content => { content && (content.style.display = 'none'); });
            modal.style.width = '96px';
            modal.style.height = '96px';
            modal.style.left = 'calc(100vw - 144px)';
            modal.style.top = 'calc(100vh - 144px)';
            modal.style.borderRadius = 'var(--radius-rounded)';
            collapsedQuestionnaireContent && (collapsedQuestionnaireContent.style.display = '', collapsedQuestionnaireContent.style.opacity = '0', collapsedQuestionnaireContent.style.transition = 'opacity 0.3s ease-in', setTimeout(() => { collapsedQuestionnaireContent.style.opacity = '1'; }, 200));
        }, 200);
        setTimeout(() => { modal.classList.remove('morphing'); }, 700);
    }
    function expandQuestionnaireModal() {
        if (!modal) return;
        modal.classList.add('morphing');
        collapsedQuestionnaireContent && (collapsedQuestionnaireContent.style.transition = 'opacity 0.2s ease-out', collapsedQuestionnaireContent.style.opacity = '0', setTimeout(() => { collapsedQuestionnaireContent.style.display = 'none'; }, 200));
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
            questionnaireModalContent && (questionnaireModalContent.style.display = '', questionnaireModalContent.style.opacity = '0', questionnaireModalContent.style.transition = 'opacity 0.3s ease-in');
            modalNav && (modalNav.style.display = '', modalNav.style.opacity = '0', modalNav.style.transition = 'opacity 0.3s ease-in');
            questionnaireModalFooter && (questionnaireModalFooter.style.display = '', questionnaireModalFooter.style.opacity = '0', questionnaireModalFooter.style.transition = 'opacity 0.3s ease-in');
            setTimeout(() => {
                questionnaireModalContent && (questionnaireModalContent.style.opacity = '1');
                modalNav && (modalNav.style.opacity = '1');
                questionnaireModalFooter && (questionnaireModalFooter.style.opacity = '1');
            }, 200);
        }, 200);
        setTimeout(() => {
            modal.style.width = '';
            modal.style.height = '';
            modal.style.position = '';
            modal.style.left = '';
            modal.style.top = '';
            modal.style.margin = '';
            modal.style.borderRadius = '';
            modal.style.transform = '';
            questionnaireModalContent && (questionnaireModalContent.style.opacity = '', questionnaireModalContent.style.transition = '');
            modalNav && (modalNav.style.opacity = '', modalNav.style.transition = '');
            questionnaireModalFooter && (questionnaireModalFooter.style.opacity = '', questionnaireModalFooter.style.transition = '');
            modal.classList.remove('morphing');
        }, 700);
    }
    closeModalButtonQuestionnaire && closeModalButtonQuestionnaire.addEventListener('click', e => { e.preventDefault(); collapseQuestionnaireModal(); });
    collapsedQuestionnaireContent && collapsedQuestionnaireContent.addEventListener('click', e => { e.preventDefault(); expandQuestionnaireModal(); });
});