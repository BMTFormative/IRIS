/**
 * O3 Job Matching Application - HIGH Reasoning Mode
 * Advanced AI recruitment platform with executive-level insights
 */

class O3MatchingApp {
    constructor() {
        this.currentStep = 1;
        // Job settings including qualification threshold
        this.jobData = {
            title: '',
            description: '',
            eliminationConditions: '',
            topCount: 5,
            threshold: 85  // default qualification threshold (%)
        };
        this.uploadedFiles = [];
        this.screeningResults = [];
        this.selectedCandidates = new Set();
        // Pagination for large candidate lists
        this.batchDisplaySize = 20;
        this.visibleCount = 0;
        this.isProcessing = false;
        
        // Chart.js placeholders
        this.comparisonChart = null;
        this.CHART_COLORS = ['#667eea','#38ef7d','#f6ad55','#fc8181','#9f7aea'];
        this.initializeApp();
    }
    
    initializeApp() {
        console.log('🚀 IRIS Matching App initialized with HIGH reasoning mode');
        
        this.initializeEventListeners();
        this.initializeFileUpload();
        this.setupProgressTracking();
        this.loadSettings();
        // Setup candidate detail drawer
        this.setupCandidateDrawer();
        
        // Show welcome message
        this.showNotification('IRIS HIGH Reasoning Mode Active - Ready for advanced analysis!', 'info');
        // Bind save/load session buttons
        const saveBtn = document.getElementById('save-session');
        const loadBtn = document.getElementById('load-session');
        if (saveBtn) saveBtn.addEventListener('click', () => this.saveSession());
        if (loadBtn) loadBtn.addEventListener('click', () => this.loadSession());
        // Bind guided tour button
        const tourBtn = document.getElementById('start-tour');
        if (tourBtn) tourBtn.addEventListener('click', () => this.startTour());
        // Bind compare-selected button (click handler)
        const compareBtn = document.getElementById('compare-selected');
        if (compareBtn) compareBtn.addEventListener('click', () => this.showComparisonView());
        // Initial display update (hide prev button if on first step)
        this.updateStepDisplay();
        // Ensure navigation buttons initial state
        this.updateStepDisplay();
    }

    // Initialize the side drawer for candidate details
    setupCandidateDrawer() {
        const drawer = document.getElementById('candidate-drawer');
        const closeBtn = document.getElementById('drawer-close-btn');
        if (drawer && closeBtn) {
            closeBtn.addEventListener('click', () => {
                drawer.classList.add('translate-x-full');
            });
        }
    }

    // Show detailed view of a candidate in the drawer
    showCandidateDrawer(candidateId) {
        const candidate = this.screeningResults.find(c => c.id === candidateId);
        if (!candidate) return;
        const drawer = document.getElementById('candidate-drawer');
        const titleEl = document.getElementById('drawer-title');
        const contentEl = document.getElementById('drawer-content');
        // Set drawer title
        titleEl.textContent = candidate.name;
        // Build candidate details HTML
        let html = '';
        html += `<h4 class="text-lg font-semibold mb-2">${candidate.current_role || ''}</h4>`;
        html += `<p class="mb-2"><strong>Overall Score:</strong> ${candidate.overall_score || 'N/A'}</p>`;
        if (candidate.scoring_breakdown) {
            html += '<div class="mb-4"><strong>Scoring Breakdown:</strong><ul class="list-disc ml-5">';
            Object.entries(candidate.scoring_breakdown).forEach(([k, v]) => {
                html += `<li>${k}: ${v}</li>`;
            });
            html += '</ul></div>';
        }
        if (candidate.key_strengths) {
            html += '<div class="mb-4"><strong>Key Strengths:</strong><ul class="list-disc ml-5">';
            candidate.key_strengths.forEach(s => html += `<li>${s}</li>`);
            html += '</ul></div>';
        }
        if (candidate.development_areas) {
            html += '<div class="mb-4"><strong>Development Areas:</strong><ul class="list-disc ml-5">';
            candidate.development_areas.forEach(s => html += `<li>${s}</li>`);
            html += '</ul></div>';
        }
        if (candidate.reasoning_summary) {
            html += `<div class="mb-4"><strong>IRIS Reasoning:</strong><p>${candidate.reasoning_summary}</p></div>`;
        }
        if (candidate.interview_recommendations) {
            html += '<div class="mb-4"><strong>Interview Recommendations:</strong><ul class="list-disc ml-5">';
            candidate.interview_recommendations.forEach(r => html += `<li>${r}</li>`);
            html += '</ul></div>';
        }
        html += `<div class="mb-4"><strong>Risk Level:</strong> ${candidate.risk_level || 'N/A'}</div>`;
        html += `<div><strong>Availability:</strong> ${candidate.availability || 'N/A'}</div>`;
        if (candidate.rejection_reason) {
            html += '<div class="mb-4"><strong>Rejection Reason:</strong> ' + candidate.rejection_reason + '</div>';
        }
        contentEl.innerHTML = html;
        // Open drawer
        drawer.classList.remove('translate-x-full');
    }
    
    initializeEventListeners() {
        // Navigation
        const nextBtn = document.getElementById('next-step');
        // Repurpose Next button to directly launch analysis (replace any existing handlers)
        if (nextBtn) {
            nextBtn.textContent = '🚀 Launch IRIS Analysis';
            nextBtn.onclick = () => this.launchAnalysis();
        }
        const prevBtn = document.getElementById('prev-step');
        if (prevBtn) prevBtn.addEventListener('click', () => this.prevStep());
        
        // Launch analysis
        const launchBtn = document.getElementById('launch-analysis');
        if (launchBtn) launchBtn.addEventListener('click', () => this.launchAnalysis());
        
        // Form inputs with real-time validation
        const jobTitleInput = document.getElementById('job-title');
        if (jobTitleInput) jobTitleInput.addEventListener('input', (e) => {
            this.jobData.title = e.target.value;
            this.updateSummary();
            this.validateCurrentStep();
        });
        
        const jobDescInput = document.getElementById('job-description');
        if (jobDescInput) jobDescInput.addEventListener('input', (e) => {
            this.jobData.description = e.target.value;
            this.validateCurrentStep();
        });
        // Capture elimination conditions input
        const elimInput = document.getElementById('elimination-conditions');
        if (elimInput) elimInput.addEventListener('input', (e) => {
            this.jobData.eliminationConditions = e.target.value;
        });
        
        // Qualification threshold input
        const thrInput = document.getElementById('qualification-threshold');
        const thrValueEl = document.getElementById('threshold-value');
        if (thrInput && thrValueEl) {
            thrInput.addEventListener('input', (e) => {
                const v = parseInt(e.target.value);
                this.jobData.threshold = !isNaN(v) ? v : 0;
                thrValueEl.textContent = `${this.jobData.threshold}%`;
                this.updateSummary();
            });
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                if (this.currentStep < 3) {
                    this.nextStep();
                } else if (this.currentStep === 3) {
                    this.launchAnalysis();
                }
            }
        });
    }
    
    initializeFileUpload() {
        const uploadZone = document.getElementById('cv-upload-zone');
        const fileInput = document.getElementById('file-input');
        
        // Click to upload
        uploadZone.addEventListener('click', () => {
            if (!this.isProcessing) {
                fileInput.click();
            }
        });
        
        // Drag and drop with enhanced visual feedback
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });
        
        uploadZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
        });
        
        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            if (!this.isProcessing) {
                this.handleFiles(e.dataTransfer.files);
            }
        });
        
        fileInput.addEventListener('change', (e) => {
            if (!this.isProcessing) {
                this.handleFiles(e.target.files);
            }
        });
    }
    
    setupProgressTracking() {
        this.progressData = {
            totalCandidates: 0,
            processedCandidates: 0,
            qualifiedCandidates: 0,
            currentBatch: 0,
            totalBatches: 0,
            startTime: null,
            reasoningTokens: 0
        };
    }
    
    async handleFiles(files) {
        console.log(`📁 Processing ${files.length} files`);
        
        const maxFileSize = 10 * 1024 * 1024; // 10MB
        // Only .txt files allowed for initial parsing
        // Allow TXT, PDF, and DOCX files for initial parsing
        const allowedTypes = ['.txt', '.pdf', '.docx'];
        
        const validFiles = [];
        const invalidFiles = [];
        
        for (let file of files) {
            const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
            
            if (file.size > maxFileSize) {
                invalidFiles.push(`${file.name} (file too large)`);
            } else if (!allowedTypes.includes(fileExtension)) {
                invalidFiles.push(`${file.name} (unsupported format)`);
            } else {
                validFiles.push(file);
            }
        }
        
        if (invalidFiles.length > 0) {
            this.showNotification(`Invalid files: ${invalidFiles.join(', ')}`, 'error');
        }
        
        if (validFiles.length === 0) return;
        
        // Show upload progress
        this.showUploadProgress(validFiles.length);
        
        try {
            const formData = new FormData();
            validFiles.forEach(file => {
                formData.append('files', file);
                this.uploadedFiles.push({
                    name: file.name,
                    size: file.size,
                    status: 'uploading'
                });
            });
            
            const response = await fetch('/api/upload-cvs', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Merge new uploaded files with existing ones (keep previous uploads)
                const newFiles = result.files.map(fileData => ({
                    name: fileData.name,
                    size: fileData.size,
                    status: fileData.status || 'uploaded',
                    id: fileData.id,
                    content: fileData.content,
                    type: fileData.type
                }));
                // Filter out any previous 'uploading' placeholders
                const existing = this.uploadedFiles.filter(f => f.status === 'uploaded');
                this.uploadedFiles = [...existing, ...newFiles];
                
                this.updateFilePreview();
                this.updateSummary();
                this.validateCurrentStep();
                
                console.log('📄 Files with content loaded:', this.uploadedFiles.map(f => ({
                    name: f.name,
                    contentLength: f.content ? f.content.length : 0,
                    contentPreview: f.content ? f.content.substring(0, 100) + '...' : 'No content'
                })));
                
                this.showNotification(`✅ ${validFiles.length} CVs uploaded successfully!`, 'success');
                
                // Auto-advance if files are uploaded
                if (this.currentStep === 2 && this.uploadedFiles.length > 0) {
                    setTimeout(() => this.nextStep(), 1500);
                }
            } else {
                throw new Error(result.error || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload failed:', error);
            this.showNotification('Upload failed. Please try again.', 'error');
            
            // Reset failed uploads
            this.uploadedFiles = this.uploadedFiles.filter(file => file.status !== 'uploading');
            this.updateFilePreview();
        }
    }
    
    showUploadProgress(fileCount) {
        const uploadZone = document.getElementById('cv-upload-zone');
        uploadZone.innerHTML = `
            <div class="upload-progress">
                <div class="loading-animation mx-auto mb-4"></div>
                <h3 class="text-xl font-bold text-gray-900 mb-2">Uploading ${fileCount} files...</h3>
                <p class="text-gray-600">Processing and extracting content</p>
            </div>
        `;
    }
    
    updateFilePreview() {
        const preview = document.getElementById('uploaded-files-preview');
        const filesList = document.getElementById('files-list');
        
        if (this.uploadedFiles.length > 0) {
            preview.classList.remove('hidden');
            
            filesList.innerHTML = this.uploadedFiles.map(file => `
                <div class="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                    <div class="flex items-center space-x-4">
                        <div class="w-3 h-3 rounded-full ${this.getStatusColor(file.status)}"></div>
                        <div>
                            <div class="font-semibold text-gray-900">${file.name}</div>
                            <div class="text-sm text-gray-600">${this.formatFileSize(file.size)}</div>
                        </div>
                    </div>
                    <div class="flex items-center space-x-3">
                        <span class="px-3 py-1 rounded-full text-xs font-semibold ${this.getStatusBadgeClass(file.status)}">
                            ${file.status.toUpperCase()}
                        </span>
                        <button onclick="app.removeFile('${file.name}')" class="text-red-500 hover:text-red-700 transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>
                </div>
            `).join('');
            
            // Reset upload zone
            if (this.uploadedFiles.every(f => f.status === 'uploaded')) {
                this.resetUploadZone();
            }
        } else {
            preview.classList.add('hidden');
            this.resetUploadZone();
        }
    }
    
    resetUploadZone() {
        const uploadZone = document.getElementById('cv-upload-zone');
        uploadZone.innerHTML = `
            <div class="upload-visual">
                <svg class="w-20 h-20 text-blue-500 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                </svg>
                <h3 class="text-2xl font-bold text-gray-900 mb-3">Drop CV Files Here</h3>
                <p class="text-gray-600 mb-6">or click to browse and select files</p>
                <button type="button" class="btn-primary">
                    📁 Choose Files
                </button>
                <p class="text-sm text-gray-500 mt-4">Supports PDF, DOCX, TXT files • Max 10MB each</p>
            </div>
        `;
    }
    
    removeFile(fileName) {
        this.uploadedFiles = this.uploadedFiles.filter(file => file.name !== fileName);
        this.updateFilePreview();
        this.updateSummary();
        this.validateCurrentStep();
        this.showNotification(`Removed ${fileName}`, 'info');
    }
    
    async launchAnalysis() {
        if (this.isProcessing) return;
        
        console.log('🚀 Launching IRIS HIGH reasoning analysis');
        
        if (!this.validateLaunchConditions()) {
            return;
        }
        
        this.isProcessing = true;
        
        // Hide setup, show results
        document.getElementById('setup-card').style.display = 'none';
        document.getElementById('results-section').classList.remove('hidden');
        
        // Initialize progress tracking
        this.progressData.startTime = new Date();
        this.progressData.totalCandidates = this.uploadedFiles.length;
        
        // Start streaming screening
        await this.startScreeningStream();
    }
    
    validateLaunchConditions() {
        if (!this.jobData.title.trim()) {
            this.showNotification('Please enter a job title', 'error');
            this.goToStep(1);
            return false;
        }
        
        if (!this.jobData.description.trim()) {
            this.showNotification('Please enter a job description', 'error');
            this.goToStep(1);
            return false;
        }
        
        if (this.uploadedFiles.length === 0) {
            this.showNotification('Please upload at least one CV', 'error');
            this.goToStep(2);
            return false;
        }
        
        return true;
    }
    
    async startScreeningStream() {
        console.log('📡 Starting IRIS streaming analysis');
        
        const progressSection = document.getElementById('screening-progress');
        progressSection.classList.remove('hidden');
        
        try {
            const response = await fetch('/api/o3/screening-stream', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    job_title: this.jobData.title,
                    job_description: this.jobData.description,
                    elimination_conditions: this.jobData.eliminationConditions,
                    cvs: this.uploadedFiles,
                    reasoning_effort: 'high',
                    qualification_threshold: this.jobData.threshold
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                
                // Add new chunk to buffer
                buffer += decoder.decode(value, { stream: true });
                
                // Process complete SSE messages
                let boundary;
                while ((boundary = buffer.indexOf('\n\n')) !== -1) {
                    const message = buffer.slice(0, boundary);
                    buffer = buffer.slice(boundary + 2);
                    
                    if (!message.trim()) continue;
                    
                    // Parse SSE message
                    const lines = message.split('\n');
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            // Extract JSON string outside try-catch
                            const jsonStr = line.slice(6).trim();
                            try {
                                const data = JSON.parse(jsonStr);
                                console.log('📡 Received SSE data:', data);
                                await this.handleScreeningUpdate(data);
                            } catch (e) {
                                console.warn('Failed to parse SSE data:', jsonStr, e);
                            }
                            break; // Only process first data line per message
                        }
                    }
                }
            }
            
        } catch (error) {
            console.error('Streaming failed:', error);
            this.showNotification('An error occurred while streaming results.', 'error');
            // Keep result section visible; do not reset to setup
        }
    }
    
    async handleScreeningUpdate(data) {
        console.log('📊 Screening update:', data.event);
        
        const progressBar = document.getElementById('progress-bar');
        const progressText = document.getElementById('progress-text');
        const progressMessage = document.getElementById('progress-message');
        const etaText = document.getElementById('eta-text');
        // UI elements for batch tracking
        const logEl = document.getElementById('screening-log');
        const batchContainer = document.getElementById('batch-progress');
        const batchTextEl = document.getElementById('batch-text');
        
        // Update UI based on screening events
        switch (data.event) {
            case 'screening_started':
                progressMessage.textContent = 'IRIS HIGH reasoning analysis initialized...';
                this.progressData.totalCandidates = data.data.total_candidates;
                // Initialize batch progress bar
                const totalBatches = Math.ceil(data.data.total_candidates / 20);
                this.progressData.totalBatches = totalBatches;
                if (batchContainer) {
                    batchContainer.innerHTML = '';
                    for (let i = 0; i < totalBatches; i++) {
                        const seg = document.createElement('div');
                        seg.className = 'w-3 h-3 bg-gray-300 rounded';
                        seg.dataset.idx = i;
                        batchContainer.appendChild(seg);
                    }
                }
                // Reset batch text
                if (batchTextEl) batchTextEl.textContent = `Batch 0 of ${totalBatches}`;
                break;
                
            case 'batch_processing':
                progressMessage.textContent = data.data.message;
                // Highlight current batch
                if (typeof data.data.batch_idx === 'number') {
                    const seg = document.querySelector(`#batch-progress div[data-idx='${data.data.batch_idx}']`);
                    if (seg) seg.className = 'w-3 h-3 bg-yellow-400 rounded';
                    const bt = document.getElementById('batch-text');
                    if (bt) bt.textContent = `Processing batch ${data.data.batch_idx + 1} of ${this.progressData.totalBatches}`;
                }
                // Log progress
                if (logEl) {
                    logEl.insertAdjacentHTML('beforeend', `<div class="mb-1 text-xs text-gray-700">Started batch ${data.data.batch_idx + 1}</div>`);
                    logEl.scrollTop = logEl.scrollHeight;
                }
                if (data.data.reasoning_note) {
                    progressMessage.textContent += ` (${data.data.reasoning_note})`;
                }
                // Update linear progress
                progressBar.style.width = `${data.data.progress}%`;
                progressText.textContent = `${Math.round(data.data.progress)}%`;
                this.updateETA(data.data.progress);
                // Update circular progress
                const radialCircle = document.getElementById('radial-progress-circle');
                const radialText = document.getElementById('radial-progress-text');
                if (radialCircle && radialText) {
                    const radius = 54;
                    const circumference = 2 * Math.PI * radius;
                    const offset = circumference * (1 - data.data.progress / 100);
                    radialCircle.style.strokeDashoffset = offset;
                    radialText.textContent = `${Math.round(data.data.progress)}%`;
                }
                break;
                
            case 'batch_complete':
                this.screeningResults.push(...data.data.batch_results);
                this.progressData.processedCandidates = data.data.processed;
                this.progressData.qualifiedCandidates = this.screeningResults.filter(c => c.qualified).length;
                
                progressBar.style.width = `${data.data.progress}%`;
                progressText.textContent = `${Math.round(data.data.progress)}%`;
                progressMessage.textContent = `Processed ${data.data.processed}/${data.data.total} candidates`;
                
                if (data.data.reasoning_insights) {
                    this.progressData.reasoningTokens += data.data.reasoning_insights.reasoning_tokens || 0;
                }
                
                this.updateETA(data.data.progress);
                // Mark batch complete
                if (typeof data.data.batch_idx === 'number') {
                    const seg = document.querySelector(`#batch-progress div[data-idx='${data.data.batch_idx}']`);
                    if (seg) seg.className = 'w-3 h-3 bg-green-500 rounded';
                    const bt2 = document.getElementById('batch-text');
                    if (bt2) bt2.textContent = `Completed batch ${data.data.batch_idx + 1} of ${this.progressData.totalBatches}`;
                }
                if (logEl) {
                    logEl.insertAdjacentHTML('beforeend', `<div class="mb-1 text-xs text-green-700">Completed batch ${data.data.batch_idx + 1}</div>`);
                    logEl.scrollTop = logEl.scrollHeight;
                }
                break;
                
            case 'screening_complete':
                progressMessage.textContent = 'HIGH reasoning screening complete!';
                progressBar.style.width = '100%';
                progressText.textContent = '100%';
                etaText.textContent = 'Complete!';
                // Finalize circular progress
                const radialCircleFinal = document.getElementById('radial-progress-circle');
                const radialTextFinal = document.getElementById('radial-progress-text');
                if (radialCircleFinal && radialTextFinal) {
                    radialCircleFinal.style.strokeDashoffset = 0;
                    radialTextFinal.textContent = '100%';
                }
                
                // Finalize
                const bt3 = document.getElementById('batch-text');
                if (bt3) bt3.textContent = `All batches complete`;
                if (logEl) {
                    logEl.insertAdjacentHTML('beforeend', `<div class="mt-2 text-xs text-blue-700">Screening complete for ${this.progressData.totalCandidates} candidates</div>`);
                    logEl.scrollTop = logEl.scrollHeight;
                }
                setTimeout(() => {
                    this.showScreeningResults();
                }, 1500);
                break;
        }
    }
    
    updateETA(progress) {
        if (progress > 0 && this.progressData.startTime) {
            const elapsed = new Date() - this.progressData.startTime;
            const estimatedTotal = elapsed / (progress / 100);
            const remaining = estimatedTotal - elapsed;
            
            if (remaining > 0) {
                const minutes = Math.floor(remaining / 60000);
                const seconds = Math.floor((remaining % 60000) / 1000);
                document.getElementById('eta-text').textContent = 
                    minutes > 0 ? `${minutes}m ${seconds}s remaining` : `${seconds}s remaining`;
            }
        }
    }
    
    showScreeningResults() {
        console.log('📋 Showing screening results:', this.screeningResults.length, 'candidates');
        
        // Hide progress, show selection board
        document.getElementById('screening-progress').classList.add('hidden');
        
        const selectionBoard = document.getElementById('selection-board');
        selectionBoard.classList.remove('hidden');
        
        // Sort candidates by score (descending) with stable tie-breaker
        const sortedCandidates = this.screeningResults.slice().sort((a, b) => {
            const diff = (b.overall_score || 0) - (a.overall_score || 0);
            if (diff !== 0) return diff;
            return (a.name || '').localeCompare(b.name || '');
        });
        
        // Render board and attach behaviors
        selectionBoard.innerHTML = this.renderSelectionBoard(sortedCandidates);
        // Attach detail button listeners for each candidate
        document.querySelectorAll('.view-details-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                this.showCandidateDrawer(id);
            });
        });
        
        // Show completion notification with advanced stats
        this.showNotification(
            `Analysis complete! ${this.progressData.qualifiedCandidates}/${this.progressData.totalCandidates} candidates qualified`, 
            'success'
        );
        // Apply load-more pagination for large lists
        this.visibleCount = this.batchDisplaySize;
        this.applyLoadMore();
        // Enable/disable Compare Selected button based on current selection
        const compareBtn = document.getElementById('compare-selected');
        if (compareBtn) {
            compareBtn.disabled = this.selectedCandidates.size < 2;
            // Attach click handler to show comparison view
            compareBtn.onclick = () => this.showComparisonView();
        }
        // Enable keyboard selection on candidate cards
        document.querySelectorAll('#selection-board .candidate-card').forEach(card => {
            card.setAttribute('tabindex', '0');
            card.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleCandidateSelection(card.getAttribute('data-candidate-id'));
                }
            });
        });
        // Setup infinite scroll: load more when sentinel comes into view
        const scrollContainer = document.querySelector('#selection-board .scroll-container');
        const sentinel = document.getElementById('load-more-sentinel');
        if (scrollContainer && sentinel) {
            const observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.applyLoadMore();
                    }
                });
            }, { root: scrollContainer, threshold: 1.0 });
            observer.observe(sentinel);
        }
        // Initialize filter buttons for candidate categories
        ['all', 'qualified', 'not-qualified'].forEach(type => {
            const btn = document.getElementById(`filter-${type}`);
            if (!btn) return;
            btn.onclick = () => this.filterCandidates(type);
        });
    }
    
    renderSelectionBoard(candidates) {
        const qualifiedCount = candidates.filter(c => c.qualified).length;
        
        return `
            <div class="selection-board-content">
                <!-- Header: Title -->
                <div class="mb-6 text-center">
                    <h2 class="text-3xl font-bold text-gray-900">🎯 Candidate Selection Board</h2>
                </div>
                <!-- Summary Stats -->
                <div class="flex justify-center items-center space-x-8 text-lg mb-8">
                        <div class="flex items-center space-x-2">
                            <div class="w-4 h-4 bg-blue-500 rounded-full"></div>
                            <span><strong>${candidates.length}</strong> Total Analyzed</span>
                        </div>
                        <div class="flex items-center space-x-2">
                            <div class="w-4 h-4 bg-green-500 rounded-full"></div>
                            <span><strong>${qualifiedCount}</strong> Qualified</span>
                        </div>
                    </div>
                
                <!-- Top N selection and clear -->
                <div class="flex justify-center items-center space-x-2 mb-8">
                    <input id="top-n-input" type="number" min="1" max="${candidates.length}" value="${this.jobData.topCount}" onchange="app.jobData.topCount=Math.min(Math.max(parseInt(this.value)||1,1),${candidates.length});this.value=app.jobData.topCount;" class="border border-gray-300 rounded px-2 py-1 w-20 text-center" />
                    <button onclick="app.selectTopCandidates(parseInt(document.getElementById('top-n-input').value) || 0)" class="btn-primary px-4 py-1 rounded">
                        Select Top N
                    </button>
                    <button onclick="app.clearSelection()" class="px-4 py-1 text-gray-600 bg-gray-100 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                        Clear Selection
                    </button>
                </div>
                <!-- Filter Controls -->
                <div class="flex justify-center space-x-4 mb-8">
                    <button id="filter-all" class="btn-primary px-4 py-1 rounded">All</button>
                    <button id="filter-qualified" class="btn-secondary px-4 py-1 rounded">Qualified</button>
                    <button id="filter-not-qualified" class="btn-secondary px-4 py-1 rounded">Not Qualified</button>
                </div>
                
                <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8 border border-blue-100">
                    <div class="flex justify-between items-center">
                        <div>
                            <span class="text-lg font-semibold text-blue-900">Selected: </span>
                            <span class="text-2xl font-bold text-blue-600" id="selected-count">0</span>
                            <span class="text-lg text-blue-700"> candidates</span>
                        </div>
                    <button id="analyze-selected"
                            onclick="app.startDeepAnalysis()"
                            class="btn-launch opacity-50 cursor-not-allowed"
                            disabled>
                        🧠 Deep Analysis with IRIS
                    </button>
                    <button id="compare-selected"
                            onclick="app.showComparisonView()"
                            class="btn-secondary ml-4 opacity-50 cursor-not-allowed" disabled>
                        🔍 Compare Selected
                    </button>
                    </div>
                </div>
                
                <div class="scroll-container">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${candidates.map(candidate => this.renderCandidateCard(candidate)).join('')}
                    </div>
                    <div id="load-more-sentinel" class="h-1"></div>
                </div>
            </div>
        `;
    }
    
    // Pagination helper: hide extra candidate cards and add Load More button
    applyLoadMore() {
        const cards = Array.from(document.querySelectorAll('#selection-board .candidate-card'));
        const total = cards.length;
        // Hide cards beyond visibleCount
        cards.forEach((card, idx) => card.style.display = (idx < this.visibleCount) ? '' : 'none');
        // Remove existing Load More button if present
        const oldBtn = document.getElementById('load-more-btn');
        if (oldBtn) oldBtn.remove();
        // Add Load More if there are more cards
        if (this.visibleCount < total) {
            const btn = document.createElement('button');
            btn.id = 'load-more-btn';
            btn.className = 'btn-primary mt-6 block mx-auto';
            btn.textContent = 'Load More';
            btn.addEventListener('click', () => {
                this.visibleCount = Math.min(this.visibleCount + this.batchDisplaySize, total);
                cards.forEach((card, idx) => card.style.display = (idx < this.visibleCount) ? '' : 'none');
                if (this.visibleCount >= total) btn.remove();
            });
            const container = document.querySelector('#selection-board .selection-board-content');
            if (container) container.appendChild(btn);
        }
    }
    
    renderCandidateCard(candidate) {
        const reasoningInsights = candidate.reasoning_summary || 'Advanced reasoning analysis available';
        const hiddenPotential = candidate.hidden_potential || [];
        const riskLevel = candidate.risk_assessment || 'Not assessed';
        
        return `
            <div class="candidate-card ${candidate.qualified ? 'qualified' : 'not-qualified'}" 
                 data-candidate-id="${candidate.id}"
                 role="button" tabindex="0"
                 aria-pressed="${candidate.qualified}"
                 onclick="app.toggleCandidateSelection('${candidate.id}')">
                <div class="score-badge">
                    ${candidate.overall_score?.toFixed(1) || candidate.score?.toFixed(1) || 'N/A'}★
                </div>
                
                <div class="candidate-info">
                    <h3 class="text-xl font-bold text-gray-900 mb-1">${candidate.name}</h3>
                    <p class="text-sm font-semibold ${candidate.qualified ? 'text-green-600' : 'text-red-600'} mb-2">
                        ${candidate.qualified ? 'Qualified' : 'Not Qualified'}
                    </p>
                    ${!candidate.qualified && candidate.rejection_reason ? `
                    <p class="text-xs text-red-600 mb-2"><strong>Rejection Reason:</strong> ${candidate.rejection_reason}</p>
                    ` : ''}
                    <p class="text-gray-600 mb-3">${candidate.current_role || 'Role not specified'}</p>
                    
                    <div class="mb-4">
                        <div class="text-sm font-semibold text-gray-700 mb-2">Key Strengths:</div>
                        <div class="flex flex-wrap gap-1">
                            ${(candidate.key_strengths || []).slice(0, 3).map(strength => 
                                `<span class="skill-tag">${strength}</span>`
                            ).join('')}
                        </div>
                    </div>
                    
                    ${hiddenPotential.length > 0 ? `
                        <div class="mb-4">
                            <div class="text-sm font-semibold text-purple-700 mb-2">🔍 Hidden Potential:</div>
                            <div class="text-xs text-purple-600">
                                ${hiddenPotential.slice(0, 2).join(' • ')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="mb-4">
                        <div class="text-sm font-semibold text-gray-700 mb-2">IRIS Reasoning:</div>
                        <div class="text-xs text-gray-600 leading-relaxed">
                            ${reasoningInsights.substring(0, 120)}${reasoningInsights.length > 120 ? '...' : ''}
                        </div>
                    </div>
                    
                    <div class="flex justify-between items-center text-xs">
                        <span class="px-2 py-1 rounded-full ${this.getRiskBadgeClass(riskLevel)}">
                            Risk: ${riskLevel}
                        </span>
                        <span class="text-gray-500">
                            ${candidate.availability || 'Available'}
                        </span>
                    </div>
                    <div class="mt-4 text-right">
                        <button class="view-details-btn text-sm text-indigo-600 hover:underline" data-id="${candidate.id}">
                            View Details
                        </button>
                    </div>
                </div>
                
                <div class="selection-indicator mt-4">
                    <div class="w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center">
                        <div class="w-3 h-3 bg-blue-500 rounded-full opacity-0 transition-opacity"></div>
                    </div>
                </div>
            </div>
        `;
    }
    
    toggleCandidateSelection(candidateId) {
        const card = document.querySelector(`[data-candidate-id="${candidateId}"]`);
        
        if (this.selectedCandidates.has(candidateId)) {
            this.selectedCandidates.delete(candidateId);
            card.classList.remove('selected');
            card.querySelector('.selection-indicator .w-3').style.opacity = '0';
        } else if (this.selectedCandidates.size < 15) {
            this.selectedCandidates.add(candidateId);
            card.classList.add('selected');
            card.querySelector('.selection-indicator .w-3').style.opacity = '1';
        } else {
            this.showNotification('Maximum 15 candidates can be selected for deep analysis', 'error');
            return;
        }
        // Update selected count display
        const selCountEl = document.getElementById('selected-count');
        if (selCountEl) selCountEl.textContent = this.selectedCandidates.size;
        // Enable/disable deep analysis button
        const analyzeBtn = document.getElementById('analyze-selected');
        if (analyzeBtn) {
            if (this.selectedCandidates.size > 0) {
                analyzeBtn.disabled = false;
                analyzeBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            } else {
                analyzeBtn.disabled = true;
                analyzeBtn.classList.add('opacity-50', 'cursor-not-allowed');
            }
        }
        
        this.updateSelectionUI();
    }
    
    selectTopCandidates(count) {
        this.clearSelection();
        
        const topCandidates = this.screeningResults
            .sort((a, b) => (b.overall_score || b.score) - (a.overall_score || a.score))
            .slice(0, count);
        
        topCandidates.forEach(candidate => {
            this.selectedCandidates.add(candidate.id);
            const card = document.querySelector(`[data-candidate-id="${candidate.id}"]`);
            if (card) {
                card.classList.add('selected');
                card.querySelector('.selection-indicator .w-3').style.opacity = '1';
            }
        });
        
        this.updateSelectionUI();
        this.showNotification(`Selected top ${count} candidates for deep analysis`, 'success');
    }
    
    clearSelection() {
        this.selectedCandidates.clear();
        document.querySelectorAll('.candidate-card').forEach(card => {
            card.classList.remove('selected');
            card.querySelector('.selection-indicator .w-3').style.opacity = '0';
        });
        this.updateSelectionUI();
    }
    
    updateSelectionUI() {
        const countElement = document.getElementById('selected-count');
        const analyzeButton = document.getElementById('analyze-selected');
        
        if (countElement) {
            countElement.textContent = this.selectedCandidates.size;
        }
        
        if (analyzeButton) {
            const hasSelection = this.selectedCandidates.size > 0;
            analyzeButton.disabled = !hasSelection;
            if (hasSelection) {
                analyzeButton.classList.remove('opacity-50', 'cursor-not-allowed');
                analyzeButton.classList.add('hover:transform', 'hover:scale-105');
            } else {
                analyzeButton.classList.add('opacity-50', 'cursor-not-allowed');
                analyzeButton.classList.remove('hover:transform', 'hover:scale-105');
            }
        }
        // Enable/disable compare button if more than one candidate selected
        const compareButton = document.getElementById('compare-selected');
        if (compareButton) {
            const canCompare = this.selectedCandidates.size >= 2;
            compareButton.disabled = !canCompare;
            if (canCompare) {
                compareButton.classList.remove('opacity-50', 'cursor-not-allowed');
            } else {
                compareButton.classList.add('opacity-50', 'cursor-not-allowed');
            }
        }
    }
    
    async startDeepAnalysis() {
        if (this.selectedCandidates.size === 0) {
            this.showNotification('Please select candidates for deep analysis', 'error');
            return;
        }
        
        console.log('🧠 Starting O3 deep analysis for', this.selectedCandidates.size, 'candidates');
        
        const selectedCandidatesData = this.screeningResults.filter(c => 
            this.selectedCandidates.has(c.id)
        );
        
        // Show deep analysis loading
        const dashboard = document.getElementById('executive-dashboard');
        dashboard.classList.remove('hidden');
        // Show skeleton placeholder while deep analysis is being fetched
        dashboard.innerHTML = `
            <div class="p-8">
                <div class="skeleton-line medium mx-auto h-6"></div>
                <div class="skeleton-line long h-4"></div>
                <div class="skeleton-line long h-4"></div>
                <div class="skeleton-line medium h-4"></div>
                <div class="skeleton-line long h-4"></div>
                <div class="skeleton-line short h-4"></div>
                <div class="skeleton-line long h-4"></div>
                <div class="skeleton-line medium h-4"></div>
                <div class="skeleton-line long h-4"></div>
            </div>
        `;
        
        // Scroll to dashboard
        dashboard.scrollIntoView({ behavior: 'smooth' });
        
        try {
            // Display full-page overlay spinner while deep analysis runs
            const overlay = document.createElement('div');
            overlay.id = 'deep-analysis-overlay';
            overlay.innerHTML = `
                <div class="overlay-content">
                    <div class="overlay-spinner"></div>
                    <h3 class="text-xl font-semibold text-gray-700">Deep Analysis in Progress...</h3>
                    <p class="text-gray-600 mt-2">Please wait while IRIS generates the executive dashboard</p>
                </div>
            `;
            // Append overlay inside the executive-dashboard container
            const dashboardEl = document.getElementById('executive-dashboard');
            if (dashboardEl) {
                dashboardEl.appendChild(overlay);
            } else {
                document.body.appendChild(overlay);
            }
            const response = await fetch('/api/o3/deep-analysis', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    candidates: selectedCandidatesData,
                    job_title: this.jobData.title,
                    job_description: this.jobData.description,
                    reasoning_effort: 'high'
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                this.showExecutiveDashboard(result);
            } else {
                throw new Error(result.error || 'Deep analysis failed');
            }
            
        } catch (error) {
            console.error('Deep analysis failed:', error);
            this.showNotification('Executive analysis failed. Please try again.', 'error');
            
            dashboard.innerHTML = `
                <div class="p-12 text-center">
                    <div class="text-red-500 text-6xl mb-4">⚠️</div>
                    <h3 class="text-2xl font-bold text-gray-900 mb-4">Analysis Failed</h3>
                    <p class="text-gray-600 mb-6">Unable to generate executive dashboard. Please try again.</p>
                    <button onclick="app.startDeepAnalysis()" class="btn-primary">
                        🔄 Retry Analysis
                    </button>
                </div>
            `;
        }
    }
    
    showExecutiveDashboard(analysisResult) {
        console.log('📊 Displaying enhanced executive dashboard');
        // Remove deep analysis overlay if present
        const overlay = document.getElementById('deep-analysis-overlay');
        if (overlay) overlay.remove();
        
        const dashboard = document.getElementById('executive-dashboard');
        
        // Use raw HTML content from server without additional processing
        const enhancedContent = analysisResult.html_content || '';
        
        dashboard.innerHTML = `
            <div class="executive-dashboard-header bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-t-3xl flex-none">
                <div class="flex justify-between items-center">
                    <div>
                        <h2 class="text-3xl font-bold mb-2">📋 Executive Recruitment Dashboard</h2>
                        <p class="text-blue-100">
                            ${this.selectedCandidates.size} candidates analyzed • Generated ${new Date().toLocaleDateString()}
                        </p>
                    </div>
                    <div class="flex items-center space-x-4">
                        <button onclick="app.copyFullReport()" title="Copy report" class="text-white opacity-60 hover:opacity-90 text-lg">
                            📋
                        </button>
                        <div class="reasoning-indicator">
                            HIGH REASONING
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="dashboard-content flex-1 overflow-auto p-8 relative">
                <!-- Simple clean layout -->
                
                ${enhancedContent}
            </div>
            
            <div class="dashboard-footer p-8 bg-gray-50 rounded-b-3xl border-t flex-none">
                <div class="flex justify-between items-center">
                    <div class="text-sm text-gray-600">
                        <p>Generated by IRIS Advanced Reasoning • Processing time: ${analysisResult.analysis_metadata?.processing_duration || 'N/A'}</p>
                        <p>Output Tokens: ${analysisResult.analysis_metadata?.tokens_used || 0}</p>
                    </div>
                    <div class="flex space-x-4">
                        <button onclick="app.exportDashboard('pdf')" class="btn-primary">
                            📄 Export PDF
                        </button>
                        <button onclick="app.exportDashboard('excel')" class="btn-primary">
                            📊 Export Excel
                        </button>
                        <button onclick="app.exportDashboard('json')" class="btn-primary">
                            📋 Export JSON
                        </button>
                        <button onclick="app.exportDashboard('word')" class="btn-primary">
                            📝 Export Word
                        </button>
                        <button onclick="app.startNewAnalysis()" class="px-6 py-3 text-gray-600 bg-gray-100 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
                            🔄 New Analysis
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Initialize interactive features
        this.initializeDashboardFeatures();
        
        // Show completion notification
        this.showNotification('🎉 Enhanced executive dashboard generated successfully!', 'success');
        
        // Update processing flag
        this.isProcessing = false;
    }
    
    enhanceReportContent(htmlContent) {
        if (!htmlContent) {
            return '<p class="text-gray-600">Dashboard content not available</p>';
        }
        
        // Clean and properly format the text
        let text = htmlContent
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();
        
        // Convert to proper HTML with correct formatting
        let formattedHtml = this.formatTextToHTML(text);
        
        return `
            <div class="report-container">
                <div class="report-header">
                    <button class="copy-button-full" onclick="app.copyFullReport()" title="Copy full report">
                        📋 Copy Full Report
                    </button>
                </div>
                <div class="report-content">
                    ${formattedHtml}
                </div>
            </div>
        `;
    }
    
    formatTextToHTML(text) {
        // Split by separator lines to get sections
        const sections = text.split('────────────────────────────────────────');
        let html = '';
        
        sections.forEach((section, index) => {
            if (!section.trim()) return;
            
            let lines = section.trim().split('\n').map(line => line.trim()).filter(line => line);
            if (lines.length === 0) return;
            
            if (index === 0) {
                // Header section
                html += '<div class="report-header-section">';
                lines.forEach(line => {
                    if (line.includes('EXECUTIVE RECRUITMENT DASHBOARD')) {
                        html += `<h1 class="report-main-title">${line}</h1>`;
                    } else if (line.includes('Role:') || line.includes('Generated:') || line.includes('Candidate') || line.includes('–') || line.includes('|')) {
                        html += `<p class="report-header-info">${line}</p>`;
                    } else if (line.trim() && line.length > 10) {
                        html += `<p class="report-header-info">${line}</p>`;
                    }
                });
                html += '</div>';
            } else {
                // Content sections
                html += '<div class="report-section">';
                
                // Section title (first line, usually numbered)
                if (lines[0]) {
                    html += `<h2 class="section-title">${lines[0]}</h2>`;
                    lines = lines.slice(1);
                }
                
                html += '<div class="section-content">';
                
                let currentSubsection = null;
                
                lines.forEach(line => {
                    // More specific subsection header detection
                    if (line.endsWith(':') && 
                        line.length < 50 && 
                        !line.startsWith('•') && 
                        !line.match(/^\d+\./) &&
                        !line.includes('–') &&
                        !line.includes('|') &&
                        line.split(' ').length <= 4) {
                        
                        if (currentSubsection) {
                            html += '</div>'; // Close previous subsection
                        }
                        html += `<h3 class="subsection-title">${line.replace(/:$/, '')}</h3>`;
                        html += '<div class="subsection-content">';
                        currentSubsection = line;
                        
                    } else if (line.startsWith('•')) {
                        // Bullet point
                        html += `<div class="bullet-item">• ${line.substring(1).trim()}</div>`;
                        
                    } else if (line.match(/^\d+\./)) {
                        // Numbered item
                        html += `<div class="numbered-item">${line}</div>`;
                        
                    } else if (line.trim()) {
                        // Regular paragraph
                        html += `<p class="content-paragraph">${line}</p>`;
                    }
                });
                
                if (currentSubsection) {
                    html += '</div>'; // Close last subsection
                }
                
                html += '</div>'; // Close section-content
                html += '</div>'; // Close report-section
            }
        });
        
        return html;
    }
    
    // Removed complex HTML conversion - keeping simple text display
    
    generateSectionId(title) {
        return title.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    
    getSectionIcon(title) {
        const icons = {
            'executive summary': '📋',
            'candidate deep dive': '👥',
            'strategic recommendations': '🎯',
            'market intelligence': '📊',
            'hiring priorities': '⭐',
            'compensation strategy': '💰',
            'timeline recommendations': '⏰',
            'competitive positioning': '🏆',
            'talent market insights': '📈'
        };
        
        const key = title.toLowerCase();
        for (const [section, icon] of Object.entries(icons)) {
            if (key.includes(section)) return icon;
        }
        return '📌';
    }
    
    initializeDashboardFeatures() {
        console.log('🔧 Initializing simple dashboard features');
        
        // Simple initialization - no complex features needed
        // Just ensure the copy functionality works
    }
    
    generateTableOfContents() {
        const tocContainer = document.getElementById('toc-links');
        const sections = document.querySelectorAll('.report-section');
        
        if (!tocContainer || sections.length === 0) return;
        
        let tocHTML = '';
        sections.forEach((section, index) => {
            const title = section.querySelector('.report-section-title');
            if (title) {
                const text = title.textContent.replace(/[📋👥🎯📊⭐💰⏰🏆📈📌]/g, '').trim();
                tocHTML += `<a href="#${section.id}" class="toc-item" data-section="${section.id}">${text}</a>`;
            }
        });
        
        tocContainer.innerHTML = tocHTML;
    }
    
    initializeReadingProgress() {
        const progressFill = document.getElementById('progress-fill');
        const dashboardContent = document.querySelector('.dashboard-content');
        
        if (!progressFill || !dashboardContent) return;
        
        dashboardContent.addEventListener('scroll', () => {
            const scrollTop = dashboardContent.scrollTop;
            const scrollHeight = dashboardContent.scrollHeight - dashboardContent.clientHeight;
            const scrollPercentage = (scrollTop / scrollHeight) * 100;
            
            progressFill.style.width = `${Math.min(scrollPercentage, 100)}%`;
        });
    }
    
    initializeAccordions() {
        const sections = document.querySelectorAll('.report-section');
        
        sections.forEach(section => {
            const header = section.querySelector('.report-section-header');
            const content = section.querySelector('.report-section-content');
            
            if (header && content) {
                header.style.cursor = 'pointer';
                header.addEventListener('click', () => {
                    content.classList.toggle('accordion-content');
                    content.classList.toggle('expanded');
                });
            }
        });
    }
    
    initializeTooltips() {
        // Add tooltips to various elements
        const copyButtons = document.querySelectorAll('.copy-button');
        copyButtons.forEach(button => {
            button.addEventListener('mouseenter', (e) => {
                this.showTooltip(e.target, 'Click to copy this section');
            });
        });
    }
    
    initializeScrollSpy() {
        const tocItems = document.querySelectorAll('.toc-item');
        const sections = document.querySelectorAll('.report-section');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const tocItem = document.querySelector(`[data-section="${entry.target.id}"]`);
                if (entry.isIntersecting) {
                    tocItems.forEach(item => item.classList.remove('active'));
                    if (tocItem) tocItem.classList.add('active');
                }
            });
        }, { threshold: 0.5 });
        
        sections.forEach(section => observer.observe(section));
    }
    
    async copySection(sectionId) {
        const section = document.getElementById(sectionId);
        const button = section?.querySelector('.copy-button');
        
        if (!section || !button) return;
        
        try {
            // Get clean text content
            const textContent = this.getCleanTextContent(section);
            
            await navigator.clipboard.writeText(textContent);
            
            // Visual feedback
            const originalContent = button.innerHTML;
            button.innerHTML = '✅ Copied!';
            button.classList.add('copied');
            
            setTimeout(() => {
                button.innerHTML = originalContent;
                button.classList.remove('copied');
            }, 2000);
            
            this.showNotification('Section copied to clipboard!', 'success');
            
        } catch (error) {
            console.error('Copy failed:', error);
            this.showNotification('Failed to copy section', 'error');
        }
    }
    
    async copyFullReport() {
        // Support both old report-content and new deep analysis dashboard-content
        let reportContent = document.querySelector('.report-content');
        if (!reportContent) {
            reportContent = document.querySelector('#executive-dashboard .dashboard-content');
        }
        if (!reportContent) return;
        
        try {
            // Extract clean text from the formatted report
            const textContent = this.extractCleanReportText(reportContent);
            
            await navigator.clipboard.writeText(textContent);
            
            // Visual feedback
            const button = document.querySelector('.copy-button-full');
            if (button) {
                const originalContent = button.innerHTML;
                button.innerHTML = '✅ Copied!';
                button.classList.add('copied');
                
                setTimeout(() => {
                    button.innerHTML = originalContent;
                    button.classList.remove('copied');
                }, 2000);
            }
            
            this.showNotification('Full report copied to clipboard!', 'success');
            
        } catch (error) {
            console.error('Copy full report failed:', error);
            this.showNotification('Failed to copy full report', 'error');
        }
    }
    
    extractCleanReportText(element) {
        let text = '';
        
        // Header section
        const headerSection = element.querySelector('.report-header-section');
        if (headerSection) {
            const title = headerSection.querySelector('.report-main-title');
            if (title) text += title.textContent + '\n';
            
            const infos = headerSection.querySelectorAll('.report-header-info');
            infos.forEach(info => {
                text += info.textContent + '\n';
            });
            text += '\n';
        }
        
        // Report sections
        const sections = element.querySelectorAll('.report-section');
        sections.forEach((section, index) => {
            if (index > 0 || !headerSection) {
                text += '────────────────────────────────────────\n';
            }
            
            const sectionTitle = section.querySelector('.section-title');
            if (sectionTitle) {
                text += sectionTitle.textContent + '\n';
                text += '────────────────────────────────────────\n';
            }
            
            const sectionContent = section.querySelector('.section-content');
            if (sectionContent) {
                // Process subsections
                const subsections = sectionContent.children;
                for (let child of subsections) {
                    if (child.classList.contains('subsection-title')) {
                        text += child.textContent + '\n';
                    } else if (child.classList.contains('subsection-content')) {
                        const items = child.children;
                        for (let item of items) {
                            if (item.classList.contains('bullet-item')) {
                                text += item.textContent + '\n';
                            } else if (item.classList.contains('numbered-item')) {
                                text += item.textContent + '\n';
                            } else if (item.classList.contains('content-paragraph')) {
                                text += item.textContent + '\n';
                            }
                        }
                        text += '\n';
                    } else if (child.classList.contains('content-paragraph')) {
                        text += child.textContent + '\n';
                    } else if (child.classList.contains('bullet-item')) {
                        text += child.textContent + '\n';
                    } else if (child.classList.contains('numbered-item')) {
                        text += child.textContent + '\n';
                    }
                }
            }
            text += '\n';
        });
        
        return text.trim();
    }
    
    getOriginalReportContent() {
        // Get the original report text without HTML enhancements
        const sections = document.querySelectorAll('.report-section');
        let fullContent = '';
        
        sections.forEach((section, index) => {
            const title = section.querySelector('.report-section-title, h1');
            const content = section.querySelector('.report-section-content');
            
            if (index === 0) {
                // Header section
                fullContent += 'EXECUTIVE RECRUITMENT DASHBOARD\n';
                fullContent += `Generated: ${new Date().toLocaleDateString()}\n`;
                fullContent += `Candidates Analyzed: ${this.selectedCandidates.size}\n\n`;
            } else if (title && content) {
                fullContent += '────────────────────────────────────────\n';
                fullContent += `${index}. ${title.textContent.replace(/[📋👥🎯📊⭐💰⏰🏆📈📌]/g, '').trim()}\n`;
                fullContent += '────────────────────────────────────────\n';
                
                // Extract clean text from content
                const cleanText = this.extractCleanTextFromElement(content);
                fullContent += cleanText + '\n\n';
            }
        });
        
        return fullContent.trim();
    }
    
    extractCleanTextFromElement(element) {
        // Extract clean text while preserving structure
        let text = '';
        
        const subsections = element.querySelectorAll('.subsection');
        if (subsections.length > 0) {
            subsections.forEach(subsection => {
                const title = subsection.querySelector('.subsection-title');
                if (title) {
                    text += title.textContent + '\n';
                }
                
                const bullets = subsection.querySelectorAll('.bullet-point, .numbered-item');
                bullets.forEach(bullet => {
                    const content = bullet.querySelector('.bullet-content, .item-content');
                    if (content) {
                        text += '• ' + this.getPlainText(content.textContent) + '\n';
                    }
                });
                
                const paragraphs = subsection.querySelectorAll('.content-paragraph');
                paragraphs.forEach(p => {
                    text += this.getPlainText(p.textContent) + '\n';
                });
                
                text += '\n';
            });
        } else {
            // No subsections, extract all content
            const allElements = element.querySelectorAll('.bullet-point, .numbered-item, .content-paragraph');
            allElements.forEach(el => {
                if (el.classList.contains('bullet-point')) {
                    const content = el.querySelector('.bullet-content');
                    if (content) text += '• ' + this.getPlainText(content.textContent) + '\n';
                } else if (el.classList.contains('numbered-item')) {
                    const number = el.querySelector('.number');
                    const content = el.querySelector('.item-content');
                    if (number && content) {
                        text += number.textContent + ' ' + this.getPlainText(content.textContent) + '\n';
                    }
                } else {
                    text += this.getPlainText(el.textContent) + '\n';
                }
            });
        }
        
        return text.trim();
    }
    
    getPlainText(text) {
        return text
            .replace(/\s+/g, ' ')
            .trim();
    }
    
    // Removed copyCandidateProfile - now handled by section copying
    
    getCleanTextContent(element) {
        // Clone the element to avoid modifying the original
        const clone = element.cloneNode(true);
        
        // Remove copy buttons and other UI elements
        clone.querySelectorAll('.copy-button, .floating-toc, #reading-progress').forEach(el => el.remove());
        
        // Get text content and clean it up
        return clone.textContent
            .replace(/\s+/g, ' ')
            .replace(/^\s+|\s+$/g, '')
            .trim();
    }
    
    showTooltip(element, text) {
        // Simple tooltip implementation
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip-popup';
        tooltip.textContent = text;
        tooltip.style.cssText = `
            position: absolute;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 0.5rem;
            border-radius: 0.25rem;
            font-size: 0.8rem;
            z-index: 1000;
            pointer-events: none;
        `;
        
        document.body.appendChild(tooltip);
        
        const rect = element.getBoundingClientRect();
        tooltip.style.top = `${rect.top - tooltip.offsetHeight - 5}px`;
        tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
        
        setTimeout(() => tooltip.remove(), 2000);
    }
    
    toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDark);
        
        this.showNotification(`${isDark ? 'Dark' : 'Light'} mode activated`, 'info');
    }
    
    // Navigation methods
    nextStep() {
        // Move to next step (only two steps: 1=Setup, 2=Analysis)
        if (this.currentStep < 2 && this.validateCurrentStep()) {
            this.currentStep = 2;
            this.updateStepDisplay();
        }
    }
    
    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepDisplay();
        }
    }
    
    goToStep(step) {
        if (step >= 1 && step <= 2) {
            this.currentStep = step;
            this.updateStepDisplay();
        }
    }
    
    updateStepDisplay() {
        // Hide all steps
        document.querySelectorAll('.step-content').forEach(step => {
            step.classList.add('hidden');
        });
        
        // Show current step
        document.getElementById(`step-${this.currentStep}`).classList.remove('hidden');
        
        // Update step indicators
        for (let i = 1; i <= 2; i++) {
            const indicator = document.getElementById(`step-indicator-${i}`);
            indicator.classList.remove('active', 'completed');
            
            if (i < this.currentStep) {
                indicator.classList.add('completed');
                indicator.innerHTML = '✓';
            } else if (i === this.currentStep) {
                indicator.classList.add('active');
                indicator.innerHTML = i;
            } else {
                indicator.innerHTML = i;
            }
        }
        
        // Update navigation buttons: hide Previous on first step
        const prevBtn = document.getElementById('prev-step');
        if (prevBtn) {
            prevBtn.style.visibility = this.currentStep === 1 ? 'hidden' : 'visible';
        }
        // Hide Next (Launch) on results step (step 2)
        const nextBtn = document.getElementById('next-step');
        if (nextBtn) {
            nextBtn.style.display = this.currentStep === 2 ? 'none' : 'block';
        }
        
        // Focus on first input of current step
        setTimeout(() => {
            const firstInput = document.querySelector(`#step-${this.currentStep} input, #step-${this.currentStep} textarea`);
            if (firstInput && this.currentStep === 1) {
                firstInput.focus();
            }
        }, 100);
    }
    
    validateCurrentStep() {
        switch (this.currentStep) {
            case 1:
                const hasTitle = this.jobData.title.trim().length > 0;
                const hasDescription = this.jobData.description.trim().length > 0;
                
                if (!hasTitle) {
                    this.showNotification('Please enter a job title', 'error');
                    document.getElementById('job-title').focus();
                    return false;
                }
                
                if (!hasDescription) {
                    this.showNotification('Please enter a job description', 'error');
                    document.getElementById('job-description').focus();
                    return false;
                }
                
                return true;
                
            case 2:
                if (this.uploadedFiles.length === 0) {
                    this.showNotification('Please upload at least one CV', 'error');
                    return false;
                }
                return true;
                
            case 3:
                return true;
                
            default:
                return true;
        }
    }
    
    // Utility methods
    updateSummary() {
        const elements = {
            'summary-job-title': this.jobData.title || '-',
            'summary-cv-count': this.uploadedFiles.length
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }
    
    getStatusColor(status) {
        const colors = {
            'uploading': 'bg-yellow-500',
            'uploaded': 'bg-green-500',
            'failed': 'bg-red-500'
        };
        return colors[status] || 'bg-gray-500';
    }
    
    getStatusBadgeClass(status) {
        const classes = {
            'uploading': 'bg-yellow-100 text-yellow-800',
            'uploaded': 'bg-green-100 text-green-800',
            'failed': 'bg-red-100 text-red-800'
        };
        return classes[status] || 'bg-gray-100 text-gray-800';
    }
    
    getRiskBadgeClass(riskLevel) {
        const classes = {
            'Low': 'bg-green-100 text-green-800',
            'Medium': 'bg-yellow-100 text-yellow-800',
            'High': 'bg-red-100 text-red-800',
            'Not assessed': 'bg-gray-100 text-gray-800'
        };
        return classes[riskLevel] || 'bg-gray-100 text-gray-800';
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.setAttribute('role', 'alert');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="flex items-center space-x-3">
                <div class="notification-icon">
                    ${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
                </div>
                <div class="notification-message">${message}</div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Hide notification
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 400);
        }, type === 'error' ? 5000 : 3000);
    }
    
    loadSettings() {
        // Load any saved settings from localStorage
        const savedSettings = localStorage.getItem('o3MatchingSettings');
        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);
                // Apply settings if needed
                console.log('Loaded settings:', settings);
            } catch (e) {
                console.warn('Failed to load settings:', e);
            }
        }
        
        // Initialize dark mode based on user preference
        const darkMode = localStorage.getItem('darkMode') === 'true';
        if (darkMode) {
            document.body.classList.add('dark-mode');
        }
    }
    
    resetToSetup() {
        this.isProcessing = false;
        document.getElementById('setup-card').style.display = 'block';
        document.getElementById('results-section').classList.add('hidden');
    }
    
    async exportDashboard(format) {
        console.log(`📤 Exporting enhanced dashboard as ${format}`);
        this.showNotification(`Preparing ${format.toUpperCase()} export...`, 'info');
        
        const dashboardContent = document.querySelector('.dashboard-content');
        if (!dashboardContent) {
            this.showNotification('No dashboard content to export', 'error');
            return;
        }
        
        try {
            switch (format.toLowerCase()) {
                case 'pdf':
                    await this.exportToPDF();
                    break;
                case 'excel':
                    await this.exportToExcel();
                    break;
                case 'json':
                    await this.exportToJSON();
                    break;
                case 'word':
                    await this.exportToWord();
                    break;
                default:
                    throw new Error(`Unsupported export format: ${format}`);
            }
            
            this.showNotification(`✅ Dashboard exported as ${format.toUpperCase()}!`, 'success');
            
        } catch (error) {
            console.error('Export failed:', error);
            this.showNotification(`Export failed: ${error.message}`, 'error');
        }
    }
    
    async exportToPDF() {
        // Enhanced PDF export with professional styling
        const { jsPDF } = window.jspdf || {};
        if (!jsPDF) {
            // Fallback to browser print
            return this.exportToPrint();
        }
        
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        // Add professional header
        pdf.setFontSize(20);
        pdf.setTextColor(102, 126, 234);
        pdf.text('Executive Recruitment Dashboard', 20, 20);
        
        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0);
        pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30);
        pdf.text(`Candidates Analyzed: ${this.selectedCandidates.size}`, 20, 36);
        
        // Extract text content from dashboard
        const textContent = this.getCleanTextContent(document.querySelector('.dashboard-content'));
        const lines = pdf.splitTextToSize(textContent, 170);
        
        let yPosition = 50;
        const pageHeight = pdf.internal.pageSize.height;
        
        lines.forEach(line => {
            if (yPosition > pageHeight - 20) {
                pdf.addPage();
                yPosition = 20;
            }
            pdf.text(line, 20, yPosition);
            yPosition += 6;
        });
        
        pdf.save(`executive-dashboard-${new Date().toISOString().split('T')[0]}.pdf`);
    }
    
    async exportToPrint() {
        // Create a print-friendly version
        const printWindow = window.open('', '_blank');
        const dashboardContent = document.querySelector('.dashboard-content').innerHTML;
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Executive Recruitment Dashboard</title>
                <style>
                    body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.4; margin: 20mm; }
                    h1, h2, h3 { color: #1e40af; page-break-after: avoid; }
                    h1 { font-size: 20pt; text-align: center; border-bottom: 2px solid #1e40af; padding-bottom: 10pt; }
                    h2 { font-size: 16pt; margin-top: 20pt; }
                    h3 { font-size: 14pt; margin-top: 15pt; }
                    .copy-button, .floating-toc, #reading-progress { display: none !important; }
                    .report-section { page-break-inside: avoid; margin-bottom: 20pt; }
                    .candidate-profile-card { border: 1px solid #ccc; padding: 10pt; margin: 10pt 0; }
                    @media print { body { margin: 0; } }
                </style>
            </head>
            <body>
                <h1>📋 Executive Recruitment Dashboard</h1>
                <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>Candidates Analyzed:</strong> ${this.selectedCandidates.size}</p>
                <hr>
                ${dashboardContent}
            </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    }
    
    async exportToExcel() {
        // Convert dashboard data to Excel format
        const data = this.extractStructuredData();
        
        // Create workbook with multiple sheets
        const workbook = {
            SheetNames: ['Executive Summary', 'Candidate Profiles', 'Recommendations'],
            Sheets: {}
        };
        
        // Executive Summary sheet
        workbook.Sheets['Executive Summary'] = this.createExcelSheet([
            ['Executive Recruitment Dashboard'],
            ['Generated', new Date().toLocaleDateString()],
            ['Candidates Analyzed', this.selectedCandidates.size],
            ['', ''],
            ['Key Insights', ''],
            ...data.insights.map(insight => ['', insight])
        ]);
        
        // Candidate Profiles sheet
        const candidateHeaders = ['Name', 'Score', 'Status', 'Key Strengths', 'Risk Level'];
        const candidateRows = data.candidates.map(candidate => [
            candidate.name,
            candidate.score,
            candidate.status,
            candidate.strengths.join('; '),
            candidate.riskLevel
        ]);
        
        workbook.Sheets['Candidate Profiles'] = this.createExcelSheet([
            candidateHeaders,
            ...candidateRows
        ]);
        
        // Recommendations sheet
        workbook.Sheets['Recommendations'] = this.createExcelSheet([
            ['Strategic Recommendations'],
            ['', ''],
            ...data.recommendations.map(rec => ['', rec])
        ]);
        
        // Generate Excel file (would need xlsx library in production)
        const fileName = `executive-dashboard-${new Date().toISOString().split('T')[0]}.xlsx`;
        this.downloadFile(JSON.stringify(workbook, null, 2), fileName, 'application/json');
    }
    
    async exportToJSON() {
        const data = {
            metadata: {
                title: 'Executive Recruitment Dashboard',
                generated: new Date().toISOString(),
                candidatesAnalyzed: this.selectedCandidates.size,
                exportFormat: 'JSON',
                version: '2.0'
            },
            dashboard: this.extractStructuredData(),
            rawContent: this.getCleanTextContent(document.querySelector('.dashboard-content'))
        };
        
        const fileName = `executive-dashboard-${new Date().toISOString().split('T')[0]}.json`;
        this.downloadFile(JSON.stringify(data, null, 2), fileName, 'application/json');
    }
    
    async exportToWord() {
        // Generate Word-compatible HTML
        const wordHTML = `
            <!DOCTYPE html>
            <html xmlns:o="urn:schemas-microsoft-com:office:office" 
                  xmlns:w="urn:schemas-microsoft-com:office:word" 
                  xmlns="http://www.w3.org/TR/REC-html40">
            <head>
                <meta charset="utf-8">
                <title>Executive Recruitment Dashboard</title>
                <style>
                    body { font-family: 'Calibri', sans-serif; font-size: 11pt; line-height: 1.4; }
                    h1 { color: #1e40af; font-size: 18pt; text-align: center; }
                    h2 { color: #1e40af; font-size: 14pt; border-bottom: 1px solid #1e40af; }
                    h3 { color: #1e3a8a; font-size: 12pt; }
                    .copy-button, .floating-toc, #reading-progress { display: none; }
                </style>
            </head>
            <body>
                <h1>📋 Executive Recruitment Dashboard</h1>
                <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>Candidates Analyzed:</strong> ${this.selectedCandidates.size}</p>
                <hr>
                ${document.querySelector('.dashboard-content').innerHTML}
            </body>
            </html>
        `;
        
        const fileName = `executive-dashboard-${new Date().toISOString().split('T')[0]}.doc`;
        this.downloadFile(wordHTML, fileName, 'application/msword');
    }
    
    extractStructuredData() {
        // Extract structured data from the dashboard for exports
        const insights = [];
        const candidates = [];
        const recommendations = [];
        
        // Extract insights from dashboard
        document.querySelectorAll('.action-item').forEach(item => {
            insights.push(item.textContent.trim());
        });
        
        // Extract candidate data
        document.querySelectorAll('.candidate-profile-card').forEach(card => {
            const name = card.querySelector('.candidate-name')?.textContent || 'Unknown';
            const score = card.querySelector('.candidate-score')?.textContent || 'N/A';
            const strengthsElements = card.querySelectorAll('.skill-tag-enhanced');
            const strengths = Array.from(strengthsElements).map(el => el.textContent);
            const riskElement = card.querySelector('.risk-indicator');
            const riskLevel = riskElement ? riskElement.textContent : 'Not assessed';
            
            candidates.push({
                name,
                score,
                status: 'Analyzed',
                strengths,
                riskLevel
            });
        });
        
        // Extract recommendations
        document.querySelectorAll('.recommendation-high').forEach(rec => {
            recommendations.push(rec.textContent.trim());
        });
        
        return { insights, candidates, recommendations };
    }
    
    createExcelSheet(data) {
        const sheet = {};
        const range = { s: { c: 0, r: 0 }, e: { c: 0, r: 0 } };
        
        data.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                const cellAddress = this.excelColumnName(colIndex) + (rowIndex + 1);
                sheet[cellAddress] = { v: cell, t: typeof cell === 'number' ? 'n' : 's' };
                
                if (range.e.c < colIndex) range.e.c = colIndex;
                if (range.e.r < rowIndex) range.e.r = rowIndex;
            });
        });
        
        sheet['!ref'] = `A1:${this.excelColumnName(range.e.c)}${range.e.r + 1}`;
        return sheet;
    }
    
    excelColumnName(columnIndex) {
        let name = '';
        while (columnIndex >= 0) {
            name = String.fromCharCode(65 + (columnIndex % 26)) + name;
            columnIndex = Math.floor(columnIndex / 26) - 1;
        }
        return name;
    }
    
    downloadFile(content, fileName, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.style.display = 'none';
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    }
    
    startNewAnalysis() {
        if (confirm('Start a new analysis? This will clear current results.')) {
            // Reset application state
            this.currentStep = 1;
            this.jobData = { title: '', description: '', topCount: 5 };
            this.uploadedFiles = [];
            this.screeningResults = [];
            this.selectedCandidates.clear();
            this.isProcessing = false;
            
            // Reset UI
            this.resetToSetup();
            this.updateStepDisplay();
            this.updateSummary();
            
            // Clear form inputs
            document.getElementById('job-title').value = '';
            document.getElementById('job-description').value = '';
            document.getElementById('top-candidates-count').value = '5';
            
            this.showNotification('Ready for new analysis!', 'info');
        }
    }
}

// Launch a guided onboarding tour using Intro.js
O3MatchingApp.prototype.startTour = function() {
    if (typeof introJs !== 'function') {
        console.warn('Intro.js not loaded, cannot start tour');
        return;
    }
    introJs().setOptions({
        steps: [
            { element: '#job-title', intro: 'Enter the job title for the position.' },
            { element: '#job-description', intro: 'Provide a detailed description of the role.' },
            { element: '#qualification-threshold', intro: 'Adjust the slider to set the qualification threshold (%).' },
            { element: '#cv-upload-zone', intro: 'Upload CV files by dragging & dropping or clicking here.' },
            { element: '#launch-analysis', intro: 'Click to start IRIS analysis based on your settings.' },
            { element: '#screening-progress', intro: 'Monitor the real-time screening progress here.' },
            { element: '#selection-board', intro: 'Review and select candidates from the screening results.' },
            { element: '#comparison-section', intro: 'Compare shortlisted candidates using interactive charts.' },
            { element: '#executive-dashboard', intro: 'View deep analysis results in this section.' }
        ],
        showProgress: true,
        exitOnOverlayClick: false,
        tooltipPosition: 'auto'
    }).start();
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
        console.log('🎯 Initializing IRIS Job Matching Application');
    window.app = new O3MatchingApp();
});

// Comparison view: side-by-side radar chart of selected candidates
O3MatchingApp.prototype.showComparisonView = function() {
    const compSec = document.getElementById('comparison-section');
    const dash = document.getElementById('executive-dashboard');
        if (dash) dash.classList.add('hidden');
        compSec.classList.remove('hidden');
    // Get selected candidates
    const selected = this.screeningResults.filter(c => this.selectedCandidates.has(c.id));
    if (selected.length < 2) {
        this.showNotification('Select at least 2 candidates to compare', 'error');
        return;
    }
    // Prepare default chart and controls
    this.buildComparisonChart('radar', selected);
    const radarBtn = document.getElementById('chart-radar');
    const barBtn = document.getElementById('chart-bar');
    const exportBtn = document.getElementById('export-chart');
    if (radarBtn) radarBtn.onclick = () => this.buildComparisonChart('radar', selected);
    if (barBtn) barBtn.onclick = () => this.buildComparisonChart('bar', selected);
    if (exportBtn) exportBtn.onclick = () => {
        if (this.comparisonChart) {
            const url = this.comparisonChart.toBase64Image();
            const a = document.createElement('a'); a.href = url; a.download = 'comparison.png'; a.click();
        }
    };
};
// Build comparison chart of specified type ('radar' or 'bar') using provided candidate list
O3MatchingApp.prototype.buildComparisonChart = function(type, selected) {
    const breakdown = selected[0].scoring_breakdown || {};
    const labels = Object.keys(breakdown);
    const datasets = selected.map((c, i) => ({
        label: c.name,
        data: labels.map(k => c.scoring_breakdown[k] || 0),
        backgroundColor: this.CHART_COLORS[i % this.CHART_COLORS.length] + (type==='radar'?'33':'88'),
        borderColor: this.CHART_COLORS[i % this.CHART_COLORS.length],
        borderWidth: 2,
        fill: type==='radar'
    }));
    const ctx = document.getElementById('comparison-chart').getContext('2d');
    if (this.comparisonChart) this.comparisonChart.destroy();
    this.comparisonChart = new Chart(ctx, {
        type: type,
        data: { labels, datasets },
        options: {
            scales: type==='radar' ? {
                r: { angleLines:{display:true}, suggestedMin:0, suggestedMax:100, ticks:{stepSize:20}, pointLabels:{font:{size:14,weight:'600'},color:'#374151'} }
            } : {
                x: { title:{display:true,text:''} }, y:{suggestedMin:0,suggestedMax:100,ticks:{stepSize:20}}
            },
            plugins: { tooltip:{enabled:true}, legend:{position:'top'} },
            responsive:true, maintainAspectRatio:false
        }
    });
    // Update summary under chart
    this.updateComparisonSummary(selected);
};
// Generate a brief textual summary of the top differences between two candidates
O3MatchingApp.prototype.updateComparisonSummary = function(selected) {
    const summaryEl = document.getElementById('comparison-summary');
    if (!summaryEl) return;
    if (selected.length === 2) {
        const [a,b] = selected;
        const diffs = Object.keys(a.scoring_breakdown).map(k=>({
            key:k, a:a.scoring_breakdown[k]||0, b:b.scoring_breakdown[k]||0
        }));
        diffs.sort((x,y)=>Math.abs(y.a-y.b)-Math.abs(x.a-x.b));
        const top = diffs.slice(0,2).map(d=>{
            const winner = d.a>=d.b? a.name: b.name;
            const loser = d.a>=d.b? b.name: a.name;
            return `${winner} outperforms ${loser} by ${Math.abs(d.a-d.b)} in ${d.key.replace(/_/g,' ')}`;
        });
        summaryEl.textContent = top.join('; ');
    } else summaryEl.textContent = '';
    // Close updateComparisonSummary
};
// Filter candidate cards by category: 'all', 'qualified', or 'not-qualified'
O3MatchingApp.prototype.filterCandidates = function(filter) {
    // Update filter button active state
    ['all', 'qualified', 'not-qualified'].forEach(type => {
        const btn = document.getElementById(`filter-${type}`);
        if (!btn) return;
        if (type === filter) {
            btn.classList.remove('btn-secondary'); btn.classList.add('btn-primary');
        } else {
            btn.classList.remove('btn-primary'); btn.classList.add('btn-secondary');
        }
    });
    const cards = document.querySelectorAll('#selection-board .candidate-card');
    cards.forEach(card => {
        const isQualified = card.classList.contains('qualified');
        let show = true;
        if (filter === 'qualified') show = isQualified;
        else if (filter === 'not-qualified') show = !isQualified;
        // 'all' shows everything
        card.style.display = show ? '' : 'none';
    });
};

// Save current session to localStorage
O3MatchingApp.prototype.saveSession = function() {
    const settings = {
        title: this.jobData.title,
        description: this.jobData.description,
        topCount: this.jobData.topCount,
        threshold: this.jobData.threshold,
        selected: Array.from(this.selectedCandidates)
    };
    localStorage.setItem('irisMatchingSession', JSON.stringify(settings));
    this.showNotification('Session saved locally', 'success');
};

// Load session from localStorage
O3MatchingApp.prototype.loadSession = function() {
    const raw = localStorage.getItem('irisMatchingSession');
    if (!raw) {
        this.showNotification('No saved session found', 'error');
        return;
    }
    try {
        const settings = JSON.parse(raw);
        // Apply settings
        this.jobData.title = settings.title || '';
        this.jobData.description = settings.description || '';
        this.jobData.topCount = settings.topCount || this.jobData.topCount;
        this.jobData.threshold = settings.threshold || this.jobData.threshold;
        // Update UI inputs
        document.getElementById('job-title').value = this.jobData.title;
        document.getElementById('job-description').value = this.jobData.description;
        document.getElementById('top-candidates-count').value = this.jobData.topCount;
        const thrInput = document.getElementById('qualification-threshold');
        const thrValueEl = document.getElementById('threshold-value');
        if (thrInput && thrValueEl) {
            thrInput.value = this.jobData.threshold;
            thrValueEl.textContent = this.jobData.threshold + '%';
        }
        this.updateSummary();
        // Reapply selection if candidates already loaded
        if (settings.selected && Array.isArray(settings.selected)) {
            this.selectedCandidates = new Set(settings.selected);
        }
        this.showNotification('Session loaded', 'success');
    } catch (e) {
        console.error(e);
        this.showNotification('Failed to load session', 'error');
    }
};

// Export for global access
window.O3MatchingApp = O3MatchingApp;