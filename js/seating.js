// Seating Arrangement System JavaScript
// UTF-8 Encoding

// Global variables
let canvas;
let groups = [];
let participants = [];
let history = [];
let pairings = [];
let groupIdCounter = 0;
let groupRelationships = {}; // Track who has been in the same group
let currentZoom = 1; // Zoom level tracking
let timerInterval = null;
let timerSeconds = 0;
let isTimerRunning = false;
let showBigTimer = false;
let bigTimerOverlay = null;

// Toggle big timer display
function toggleBigTimer() {
    showBigTimer = !showBigTimer;
    
    if (showBigTimer) {
        // Create big timer overlay if it doesn't exist
        if (!bigTimerOverlay) {
            bigTimerOverlay = document.createElement('div');
            bigTimerOverlay.className = 'big-timer-overlay';
            document.body.appendChild(bigTimerOverlay);
        }
        
        // Show overlay
        bigTimerOverlay.classList.add('show');
        updateBigTimerDisplay();
        
        // Update button state
        document.getElementById('toggleBigTimer').classList.add('active');
    } else {
        // Hide overlay
        if (bigTimerOverlay) {
            bigTimerOverlay.classList.remove('show');
        }
        
        // Update button state
        document.getElementById('toggleBigTimer').classList.remove('active');
    }
}

// Update big timer display
function updateBigTimerDisplay() {
    if (!bigTimerOverlay || !showBigTimer) return;
    
    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;
    const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    bigTimerOverlay.textContent = display;
    
    // Update warning classes
    if (timerSeconds <= 10) {
        bigTimerOverlay.classList.add('danger');
        bigTimerOverlay.classList.remove('warning');
    } else if (timerSeconds <= 60) {
        bigTimerOverlay.classList.add('warning');
        bigTimerOverlay.classList.remove('danger');
    } else {
        bigTimerOverlay.classList.remove('warning', 'danger');
    }
}

// Initialize Fabric.js canvas
document.addEventListener('DOMContentLoaded', function() {
    canvas = new fabric.Canvas('seatingCanvas', {
        backgroundColor: '#f0f0f0',
        selection: true,
        preserveObjectStacking: true,
        defaultCursor: 'default',
        hoverCursor: 'pointer',
        allowTouchScrolling: true,
        enableRetinaScaling: true
    });
    
    // 모바일 터치 이벤트 지원
    if ('ontouchstart' in window) {
        canvas.allowTouchScrolling = true;
        
        // 모바일에서 캔버스 크기 조정
        function resizeCanvas() {
            const container = document.getElementById('canvasWrapper');
            const isMobile = window.innerWidth <= 768;
            
            if (isMobile) {
                const width = container.offsetWidth - 20;
                const height = Math.min(600, window.innerHeight - 300);
                canvas.setDimensions({
                    width: width,
                    height: height
                });
                canvas.renderAll();
            }
        }
        
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
    }
    
    // Add keyboard event listener for backspace and ESC
    document.addEventListener('keydown', function(e) {
        // Handle Delete/Backspace for group deletion
        if (e.key === 'Backspace' || e.key === 'Delete') {
            if (canvas.selectedGroup) {
                e.preventDefault();
                deleteGroup(canvas.selectedGroup);
            }
        }
        
        // Handle ESC for fullscreen exit
        if (e.key === 'Escape' && isFullscreen) {
            e.preventDefault();
            toggleFullscreen();
        }
    });

    // Event listeners
    document.getElementById('createGroup').addEventListener('click', createGroup);
    document.getElementById('generateInputs').addEventListener('click', generateParticipantInputs);
    document.getElementById('autoArrange').addEventListener('click', autoArrangeSeats);
    document.getElementById('rearrange').addEventListener('click', rearrangeSeats);
    document.getElementById('clearCanvas').addEventListener('click', clearCanvas);
    document.getElementById('addPair').addEventListener('click', addPairing);
    
    // Bulk input event listeners
    document.getElementById('individualMode').addEventListener('click', () => switchInputMode('individual'));
    document.getElementById('bulkMode').addEventListener('click', () => switchInputMode('bulk'));
    document.getElementById('parseBulkInput').addEventListener('click', parseBulkInput);
    document.getElementById('clearBulkInput').addEventListener('click', clearBulkInput);
    document.getElementById('generateSampleData').addEventListener('click', generateSampleData);
    
    // Zoom and fullscreen controls
    document.getElementById('zoomIn').addEventListener('click', zoomIn);
    document.getElementById('zoomOut').addEventListener('click', zoomOut);
    document.getElementById('zoomReset').addEventListener('click', zoomReset);
    document.getElementById('fullscreen').addEventListener('click', toggleFullscreen);
    
    // Timer controls
    document.getElementById('startTimer').addEventListener('click', startTimer);
    document.getElementById('stopTimer').addEventListener('click', stopTimer);
    document.getElementById('toggleBigTimer').addEventListener('click', toggleBigTimer);
    
    // Mouse wheel zoom
    const canvasWrapper = document.getElementById('canvasWrapper');
    canvasWrapper.addEventListener('wheel', handleMouseWheel);

    // Load history from localStorage
    loadHistory();
    
    // Initialize UI
    updateStats();
    
    // Initialize participant count to 0
    document.getElementById('participantCount').value = 0;
    // Force clear any cached values
    document.getElementById('participantCount').setAttribute('value', '0');
    
    // Remove default selection box
    canvas.selection = false;
    
    let isDragging = false;
    let lastPosX, lastPosY;
    
    // Handle group selection and dragging
    canvas.on('mouse:down', function(options) {
        if (!options.e) return;
        
        // Use canvas.getPointer which automatically handles zoom
        const pointer = canvas.getPointer(options.e);
        let clickedGroup = null;
        
        // Get all objects from canvas and find groups
        const canvasObjects = canvas.getObjects();
        
        // Find which group was clicked (reverse order for top-most first)
        for (let i = canvasObjects.length - 1; i >= 0; i--) {
            const obj = canvasObjects[i];
            if (obj.groupId && obj.containsPoint(pointer)) {
                clickedGroup = obj;
                break;
            }
        }
        
        if (clickedGroup) {
            selectGroup(clickedGroup);
            isDragging = true;
            
            // Store the pointer position in canvas coordinates
            lastPosX = pointer.x;
            lastPosY = pointer.y;
            
            canvas.defaultCursor = 'move';
            canvas.hoverCursor = 'move';
            canvas.selectedGroup = clickedGroup;
        } else {
            deselectAllGroups();
        }
    });
    
    canvas.on('mouse:move', function(options) {
        if (!isDragging || !canvas.selectedGroup) return;
        
        const e = options.e;
        const pointer = canvas.getPointer(e);
        
        if (lastPosX !== undefined && lastPosY !== undefined) {
            // Calculate movement delta
            const deltaX = pointer.x - lastPosX;
            const deltaY = pointer.y - lastPosY;
            
            canvas.selectedGroup.set({
                left: canvas.selectedGroup.left + deltaX,
                top: canvas.selectedGroup.top + deltaY
            });
            
            canvas.selectedGroup.setCoords();
            canvas.requestRenderAll();
        }
        
        lastPosX = pointer.x;
        lastPosY = pointer.y;
    });
    
    canvas.on('mouse:up', function() {
        isDragging = false;
        canvas.defaultCursor = 'default';
        canvas.hoverCursor = 'pointer';
        
        if (canvas.selectedGroup) {
            canvas.selectedGroup.setCoords();
        }
        
        // Reset position tracking
        lastPosX = undefined;
        lastPosY = undefined;
    });
});

// Generate participant input fields
function generateParticipantInputs() {
    const count = parseInt(document.getElementById('participantCount').value);
    const container = document.getElementById('participantsInputs');
    
    // Save existing input values
    const existingInputs = [];
    const existingRows = container.querySelectorAll('.participant-input-row');
    existingRows.forEach(row => {
        const name = row.querySelector('.participant-name').value;
        const gender = row.querySelector('.participant-gender').value;
        existingInputs.push({ name, gender });
    });
    
    container.innerHTML = '';
    
    for (let i = 0; i < count; i++) {
        const inputGroup = document.createElement('div');
        inputGroup.className = 'participant-input-row';
        
        // Restore existing values if available
        const existingName = existingInputs[i] ? existingInputs[i].name : '';
        const existingGender = existingInputs[i] ? existingInputs[i].gender : '';
        
        inputGroup.innerHTML = `
            <input type="text" id="participant-name-${i}" class="participant-name" placeholder="참여자 ${i + 1}" value="${existingName}" />
            <select id="participant-gender-${i}" class="participant-gender">
                <option value="">성별</option>
                <option value="남" ${existingGender === '남' ? 'selected' : ''}>남</option>
                <option value="여" ${existingGender === '여' ? 'selected' : ''}>여</option>
            </select>
        `;
        container.appendChild(inputGroup);
    }
}

// Update group selector when new group is created
function updateGroupSelector() {
    const selector = document.getElementById('targetGroup');
    selector.innerHTML = '<option value="auto">자동 배치</option>';
    
    groups.forEach(group => {
        const option = document.createElement('option');
        option.value = group.groupId;
        option.textContent = `모둠 ${group.groupId} (${group.occupants.filter(o => o === null).length}/${group.groupSize} 빈자리)`;
        selector.appendChild(option);
    });
}

// Update canvas size based on groups
function updateCanvasSize() {
    const baseHeight = 600;
    const groupHeight = 200; // Reduced from 240
    const groupsPerRow = 5; // Increased from 4
    const rows = Math.ceil(groups.length / groupsPerRow);
    const newHeight = Math.max(baseHeight, rows * groupHeight + 100);
    
    canvas.setHeight(newHeight);
    canvas.setWidth(800);
    
    // Update the actual canvas element dimensions
    const canvasElement = document.getElementById('seatingCanvas');
    canvasElement.height = newHeight;
    canvasElement.width = 800;
    
    // Update wrapper to match
    const canvasWrapper = document.querySelector('.canvas-wrapper');
    if (canvasWrapper) {
        canvasWrapper.style.height = newHeight + 'px';
    }
    
    canvas.renderAll();
}

// Create a new group
function createGroup() {
    const groupSize = parseInt(document.getElementById('groupSize').value);
    const groupId = ++groupIdCounter;
    
    // Create group container (reduced size)
    const groupWidth = 150;
    const groupHeight = 150;
    const padding = 8;
    
    // Create group rectangle
    const rect = new fabric.Rect({
        width: groupWidth,
        height: groupHeight,
        fill: '#e3f2fd',
        stroke: '#2196f3',
        strokeWidth: 2,
        rx: 8,
        ry: 8,
        originX: 'center',
        originY: 'center'
    });

    // Create group label
    const text = new fabric.Text('모둠 ' + groupId, {
        fontSize: 14,
        fontWeight: 'bold',
        fontFamily: 'Noto Sans KR, sans-serif',
        fill: '#1976d2',
        originX: 'center',
        originY: 'center',
        top: -groupHeight/2 - 18
    });

    // Create seats inside the group
    const seats = [];
    const seatSize = 28;
    const seatPadding = 12;
    const cols = Math.ceil(Math.sqrt(groupSize));
    const rows = Math.ceil(groupSize / cols);
    
    for (let i = 0; i < groupSize; i++) {
        const row = Math.floor(i / cols);
        const col = i % cols;
        
        const seat = new fabric.Circle({
            radius: seatSize / 2,
            fill: '#ffffff',
            stroke: '#757575',
            strokeWidth: 1,
            originX: 'center',
            originY: 'center',
            left: (col - (cols - 1) / 2) * (seatSize + seatPadding),
            top: (row - (rows - 1) / 2) * (seatSize + seatPadding),
            selectable: false
        });
        
        seats.push(seat);
    }

    // Create group object
    const groupElements = [rect, text, ...seats];
    const groupsPerRow = 5; // Increased from 4 to 5 since boxes are smaller
    const canvasWidth = 800;
    const groupSpacing = (canvasWidth - groupWidth * groupsPerRow) / (groupsPerRow + 1);
    const row = Math.floor(groups.length / groupsPerRow);
    const col = groups.length % groupsPerRow;
    
    const group = new fabric.Group(groupElements, {
        left: groupSpacing + col * (groupWidth + groupSpacing) + groupWidth/2,
        top: 50 + row * 200 + groupHeight/2, // Reduced vertical spacing
        originX: 'center',
        originY: 'center',
        hasControls: false,
        hasBorders: false,
        lockRotation: true,
        lockScalingX: true,
        lockScalingY: true,
        lockMovementX: false,
        lockMovementY: false,
        selectable: false,
        evented: true
    });

    // Store group information
    group.groupId = groupId;
    group.groupSize = groupSize;
    group.seats = seats;
    group.occupants = new Array(groupSize).fill(null);
    
    groups.push(group);
    canvas.add(group);
    
    // Mark that this group is newly created and positioned
    group.isNewlyCreated = true;
    
    // Update canvas size to accommodate new groups
    updateCanvasSize();
    
    // Refresh canvas
    canvas.calcOffset();
    canvas.requestRenderAll();
    
    // Update group selector
    updateGroupSelector();
    updateStats();
    
    // Update participant count and generate inputs automatically
    const totalSeats = groups.reduce((sum, group) => sum + group.groupSize, 0);
    console.log(`모둠 생성 완료. 총 좌석 수: ${totalSeats}`);
    document.getElementById('participantCount').value = totalSeats;
    generateParticipantInputs();
}

// Parse participants from input fields
function parseParticipants() {
    const participantRows = document.querySelectorAll('.participant-input-row');
    participants = [];
    
    participantRows.forEach((row, index) => {
        const name = row.querySelector('.participant-name').value.trim();
        const gender = row.querySelector('.participant-gender').value;
        
        // Allow participants even if some fields are empty
        if (name || gender) {
            participants.push({ 
                name: name || `참여자${index + 1}`, // Default name if empty
                gender: gender || '남' // Default gender if not specified
            });
        }
    });
    
    return participants;
}

// Auto arrange seats with gender ratio consideration
function autoArrangeSeats() {
    const participantList = parseParticipants();
    if (participantList.length === 0) {
        alert('참여자를 입력해주세요.');
        return;
    }
    
    if (groups.length === 0) {
        alert('먼저 모둠을 생성해주세요.');
        return;
    }
    
    const targetGroupId = document.getElementById('targetGroup').value;
    const considerGenderRatio = document.getElementById('genderRatio').checked;
    
    if (targetGroupId === 'auto') {
        // Auto arrange to all groups
        autoArrangeToAllGroups(participantList, considerGenderRatio);
    } else {
        // Arrange to specific group
        const targetGroup = groups.find(g => g.groupId == targetGroupId);
        if (targetGroup) {
            arrangeToSpecificGroup(participantList, targetGroup, considerGenderRatio);
        }
    }
    
    canvas.renderAll();
    updateGroupSelector();
    updateGroupsTable();
    updateStats();
}

// Auto arrange to all groups
function autoArrangeToAllGroups(participantList, considerGenderRatio) {
    // Clear current arrangements
    groups.forEach(group => {
        group.occupants = new Array(group.groupSize).fill(null);
        updateGroupDisplay(group);
    });
    
    // Calculate total seats
    const totalSeats = groups.reduce((sum, group) => sum + group.groupSize, 0);
    if (participantList.length > totalSeats) {
        alert('참여자 수가 좌석 수보다 많습니다.');
        return;
    }
    
    console.log('배치 시작 - 참여자:', participantList.map(p => p.name));
    
    // Arrange with history consideration
    const arrangement = arrangeWithHistory(participantList, groups, considerGenderRatio);
    
    // Verify all participants are placed exactly once
    const placedParticipants = [];
    arrangement.forEach(group => {
        group.forEach(participant => {
            if (participant) {
                placedParticipants.push(participant.name);
            }
        });
    });
    
    console.log('배치된 참여자:', placedParticipants);
    
    // Check for duplicates or missing
    const uniquePlaced = [...new Set(placedParticipants)];
    if (uniquePlaced.length !== placedParticipants.length) {
        console.error('중복 배치 발견!');
    }
    
    const originalNames = participantList.map(p => p.name);
    const missing = originalNames.filter(name => !placedParticipants.includes(name));
    if (missing.length > 0) {
        console.error('누락된 참여자:', missing);
    }
    
    // Apply arrangement
    arrangement.forEach((groupArrangement, groupIndex) => {
        const group = groups[groupIndex];
        groupArrangement.forEach((participant, seatIndex) => {
            if (participant) {
                group.occupants[seatIndex] = participant;
            }
        });
        updateGroupDisplay(group);
    });
    
    // Save to history
    saveToHistory(arrangement);
    updateGroupRelationships(arrangement);
}

// Arrange to specific group
function arrangeToSpecificGroup(participantList, targetGroup, considerGenderRatio) {
    // Count empty seats in target group
    const emptySeats = targetGroup.occupants.filter(o => o === null).length;
    
    if (participantList.length > emptySeats) {
        alert(`선택한 모둠의 빈 자리(${emptySeats})보다 참여자(${participantList.length})가 많습니다.`);
        return;
    }
    
    // Fill empty seats
    let participantIndex = 0;
    
    if (considerGenderRatio) {
        // Separate by gender
        const males = participantList.filter(p => p.gender === '남');
        const females = participantList.filter(p => p.gender === '여');
        
        // Calculate ratio
        const maleRatio = males.length / participantList.length;
        const targetMaleCount = Math.round(emptySeats * maleRatio);
        
        // Find empty seat indices
        const emptyIndices = [];
        targetGroup.occupants.forEach((occupant, idx) => {
            if (occupant === null) emptyIndices.push(idx);
        });
        
        // Shuffle empty indices
        emptyIndices.sort(() => Math.random() - 0.5);
        
        // Assign males first
        for (let i = 0; i < targetMaleCount && i < males.length && i < emptyIndices.length; i++) {
            targetGroup.occupants[emptyIndices[i]] = males[i];
        }
        
        // Assign females
        let femaleStart = targetMaleCount;
        for (let i = 0; i < females.length && femaleStart < emptyIndices.length; i++, femaleStart++) {
            targetGroup.occupants[emptyIndices[femaleStart]] = females[i];
        }
    } else {
        // Simple assignment
        targetGroup.occupants.forEach((occupant, idx) => {
            if (occupant === null && participantIndex < participantList.length) {
                targetGroup.occupants[idx] = participantList[participantIndex++];
            }
        });
    }
    
    updateGroupDisplay(targetGroup);
}

// Arrange participants considering previous groupings
function arrangeWithHistory(participants, groups, considerGender) {
    const arrangement = groups.map(g => new Array(g.groupSize).fill(null));
    const participantsCopy = [...participants]; // Create a copy to work with
    const placedIndices = new Set(); // Track which participants have been placed
    
    // Apply pairings first
    const pairingsToApply = [];
    pairings.forEach(pair => {
        const [person1, person2] = pair;
        const p1Index = participantsCopy.findIndex(p => p.name === person1);
        const p2Index = participantsCopy.findIndex(p => p.name === person2);
        
        if (p1Index !== -1 && p2Index !== -1 && !placedIndices.has(p1Index) && !placedIndices.has(p2Index)) {
            pairingsToApply.push([p1Index, p2Index]);
        }
    });
    
    // Place paired participants
    pairingsToApply.forEach(([p1Index, p2Index]) => {
        // Find a group with two empty adjacent seats
        for (let i = 0; i < groups.length; i++) {
            const emptySeats = arrangement[i].map((seat, idx) => seat === null ? idx : -1).filter(idx => idx !== -1);
            if (emptySeats.length >= 2) {
                arrangement[i][emptySeats[0]] = participantsCopy[p1Index];
                arrangement[i][emptySeats[1]] = participantsCopy[p2Index];
                placedIndices.add(p1Index);
                placedIndices.add(p2Index);
                break;
            }
        }
    });
    
    // Get remaining participants
    const remainingParticipants = participantsCopy
        .map((p, idx) => ({ participant: p, index: idx }))
        .filter(item => !placedIndices.has(item.index))
        .map(item => item.participant);
    
    if (considerGender) {
        // Separate by gender
        const maleParticipants = remainingParticipants.filter(p => p.gender === '남');
        const femaleParticipants = remainingParticipants.filter(p => p.gender === '여');
        
        // Shuffle both arrays
        const shuffledMales = [...maleParticipants].sort(() => Math.random() - 0.5);
        const shuffledFemales = [...femaleParticipants].sort(() => Math.random() - 0.5);
        
        let maleIndex = 0;
        let femaleIndex = 0;
        
        // Fill each group
        groups.forEach((group, groupIndex) => {
            // Count existing genders in the group
            let existingMales = 0;
            let existingFemales = 0;
            
            arrangement[groupIndex].forEach(seat => {
                if (seat && seat.gender === '남') existingMales++;
                else if (seat && seat.gender === '여') existingFemales++;
            });
            
            // Fill empty seats
            for (let seatIdx = 0; seatIdx < arrangement[groupIndex].length; seatIdx++) {
                if (arrangement[groupIndex][seatIdx] === null) {
                    // Decide which gender to place
                    let placeParticipant = null;
                    
                    // If group has no males and we have males available, prioritize male
                    if (existingMales === 0 && maleIndex < shuffledMales.length) {
                        placeParticipant = shuffledMales[maleIndex++];
                        existingMales++;
                    }
                    // If group has no females and we have females available, prioritize female
                    else if (existingFemales === 0 && femaleIndex < shuffledFemales.length) {
                        placeParticipant = shuffledFemales[femaleIndex++];
                        existingFemales++;
                    }
                    // Otherwise, alternate or use what's available
                    else {
                        // Try to maintain balance
                        const totalInGroup = existingMales + existingFemales;
                        const maleRatio = totalInGroup > 0 ? existingMales / totalInGroup : 0;
                        
                        if (maleRatio <= 0.5 && maleIndex < shuffledMales.length) {
                            placeParticipant = shuffledMales[maleIndex++];
                            existingMales++;
                        } else if (femaleIndex < shuffledFemales.length) {
                            placeParticipant = shuffledFemales[femaleIndex++];
                            existingFemales++;
                        } else if (maleIndex < shuffledMales.length) {
                            placeParticipant = shuffledMales[maleIndex++];
                            existingMales++;
                        }
                    }
                    
                    if (placeParticipant) {
                        arrangement[groupIndex][seatIdx] = placeParticipant;
                    }
                }
            }
        });
    } else {
        // Simple distribution without gender consideration
        const shuffled = [...remainingParticipants].sort(() => Math.random() - 0.5);
        let participantIndex = 0;
        
        groups.forEach((group, groupIndex) => {
            for (let seatIdx = 0; seatIdx < arrangement[groupIndex].length; seatIdx++) {
                if (arrangement[groupIndex][seatIdx] === null && participantIndex < shuffled.length) {
                    arrangement[groupIndex][seatIdx] = shuffled[participantIndex++];
                }
            }
        });
    }
    
    return arrangement;
}

// Update group display with participant names
function updateGroupDisplay(group) {
    const groupObject = group;
    const objects = [...groupObject._objects];
    
    // Remove existing name texts (keep only rect, title, and seats)
    const nameTexts = objects.filter(obj => obj.isNameText);
    nameTexts.forEach(text => groupObject.remove(text));
    
    // Skip first two objects (rect and title text)
    for (let i = 2; i < objects.length; i++) {
        const seatIndex = i - 2;
        const seat = objects[i];
        const occupant = groupObject.occupants[seatIndex];
        
        if (occupant) {
            // Update seat color based on gender
            seat.set({
                fill: occupant.gender === '남' ? '#bbdefb' : '#ffcdd2',
                stroke: occupant.gender === '남' ? '#90caf9' : '#ef9a9a',
                strokeWidth: 2
            });
            
            // Add gender icon inside the seat
            const genderIcon = new fabric.Text(occupant.gender === '남' ? '♂' : '♀', {
                fontSize: 16,
                fontFamily: 'Arial',
                fill: occupant.gender === '남' ? '#1976d2' : '#d32f2f',
                fontWeight: 'bold',
                originX: 'center',
                originY: 'center',
                left: seat.left,
                top: seat.top,
                selectable: false,
                evented: false,
                isNameText: true // Mark for easy removal
            });
            
            // Add name text below the seat
            const nameText = new fabric.Text(occupant.name, {
                fontSize: 10,
                fontFamily: 'Noto Sans KR, sans-serif',
                fill: '#333333',
                fontWeight: '600',
                originX: 'center',
                originY: 'top',
                left: seat.left,
                top: seat.top + seat.radius + 2,
                selectable: false,
                evented: false,
                isNameText: true // Mark as name text for easy removal
            });
            
            groupObject.add(genderIcon);
            groupObject.add(nameText);
        } else {
            // Reset to white for empty seats
            seat.set({
                fill: '#ffffff',
                stroke: '#757575',
                strokeWidth: 1
            });
        }
    }
    
    groupObject.dirty = true;
    canvas.renderAll();
}

// Add pairing
function addPairing() {
    const pairInput = document.getElementById('pairPeople').value;
    const names = pairInput.split(',').map(s => s.trim());
    
    if (names.length === 2 && names[0] && names[1]) {
        pairings.push(names);
        updatePairingsList();
        document.getElementById('pairPeople').value = '';
    }
}

// Update pairings list display
function updatePairingsList() {
    const pairsList = document.getElementById('pairsList');
    pairsList.innerHTML = '';
    
    pairings.forEach((pair, index) => {
        const pairDiv = document.createElement('div');
        pairDiv.className = 'pair-item';
        pairDiv.innerHTML = `
            <span>${pair[0]} - ${pair[1]}</span>
            <button onclick="removePairing(${index})">삭제</button>
        `;
        pairsList.appendChild(pairDiv);
    });
}

// Remove pairing
function removePairing(index) {
    pairings.splice(index, 1);
    updatePairingsList();
}

// Delete a specific group
function deleteGroup(groupObject) {
    // Clear selection
    deselectAllGroups();
    
    // Remove from canvas
    canvas.remove(groupObject);
    
    // Remove from groups array
    const index = groups.findIndex(g => g.groupId === groupObject.groupId);
    if (index > -1) {
        groups.splice(index, 1);
    }
    
    // Rebuild groups array from canvas objects to ensure consistency
    rebuildGroupsArray();
    
    // Update remaining groups without repositioning
    reorganizeGroups();
    
    // Update canvas size
    updateCanvasSize();
    
    // Re-render canvas
    canvas.requestRenderAll();
    
    // Update participant count automatically
    const newTotalParticipants = groups.reduce((sum, group) => sum + group.groupSize, 0);
    document.getElementById('participantCount').value = newTotalParticipants;
    generateParticipantInputs();
    
    // Update UI
    updateGroupSelector();
    updateGroupsTable();
    updateStats();
}

// Reorganize groups after deletion
function reorganizeGroups() {
    // Just update the groups array without repositioning
    // This keeps groups in their current positions
    
    // Get all group objects from canvas
    const canvasObjects = canvas.getObjects();
    const groupObjects = canvasObjects.filter(obj => obj.groupId);
    
    // Ensure groups remain interactive
    groupObjects.forEach((group) => {
        group.set({
            selectable: false,
            evented: true,
            hasControls: false,
            hasBorders: false,
            lockMovementX: false,
            lockMovementY: false
        });
        
        group.setCoords(); // Update bounding box
    });
    
    // Clear selection and re-render
    deselectAllGroups();
    canvas.requestRenderAll();
}

// Clear canvas
function clearCanvas() {
    if (confirm('모든 모둠을 삭제하시겠습니까?')) {
        canvas.clear();
        canvas.backgroundColor = '#f0f0f0';
        groups = [];
        
        // Optionally clear relationship history
        if (confirm('이전 모둠 관계 기록도 초기화하시겠습니까?')) {
            groupRelationships = {};
            localStorage.removeItem('groupRelationships');
            console.log('모둠 관계 기록이 초기화되었습니다.');
        }
        groupIdCounter = 0;
        updateCanvasSize();
        canvas.renderAll();
        
        // Reset participant count
        document.getElementById('participantCount').value = 0;
        document.getElementById('participantsInputs').innerHTML = '';
        
        updateGroupSelector();
        updateGroupsTable();
        updateStats();
    }
}

// Save to history
function saveToHistory(arrangement) {
    const historyEntry = {
        date: new Date().toLocaleString('ko-KR'),
        arrangement: arrangement.map((group, index) => ({
            groupId: groups[index].groupId,
            members: group.filter(m => m !== null).map(m => m.name)
        }))
    };
    
    history.unshift(historyEntry);
    if (history.length > 10) {
        history = history.slice(0, 10);
    }
    
    localStorage.setItem('seatingHistory', JSON.stringify(history));
    updateHistoryDisplay();
}

// Load history
function loadHistory() {
    const saved = localStorage.getItem('seatingHistory');
    if (saved) {
        history = JSON.parse(saved);
        updateHistoryDisplay();
    }
}

// Update history display
function updateHistoryDisplay() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';
    
    history.forEach((entry, index) => {
        const historyDiv = document.createElement('div');
        historyDiv.className = 'history-item';
        
        let content = `<div class="history-date">${entry.date}</div>`;
        entry.arrangement.forEach(group => {
            content += `<div class="history-group">모둠 ${group.groupId}: ${group.members.join(', ')}</div>`;
        });
        
        historyDiv.innerHTML = content;
        historyList.appendChild(historyDiv);
    });
}


// Update groups table
function updateGroupsTable() {
    const tableDiv = document.getElementById('groupsTable');
    let html = '<table class="groups-members-table"><thead><tr>';
    
    groups.forEach(group => {
        html += `<th>모둠 ${group.groupId}</th>`;
    });
    html += '</tr></thead><tbody><tr>';
    
    groups.forEach(group => {
        html += '<td><ul>';
        group.occupants.forEach((occupant, idx) => {
            if (occupant) {
                html += `<li>${idx + 1}. ${occupant.name} (${occupant.gender})</li>`;
            } else {
                html += `<li>${idx + 1}. <span class="empty-seat">빈자리</span></li>`;
            }
        });
        html += '</ul></td>';
    });
    
    html += '</tr></tbody></table>';
    tableDiv.innerHTML = html;
}

// Update group relationships
function updateGroupRelationships(arrangement) {
    arrangement.forEach(groupMembers => {
        const members = groupMembers.filter(m => m !== null);
        
        // Update relationships for each pair in the group
        for (let i = 0; i < members.length; i++) {
            for (let j = i + 1; j < members.length; j++) {
                const key = [members[i].name, members[j].name].sort().join('|');
                if (!groupRelationships[key]) {
                    groupRelationships[key] = 0;
                }
                groupRelationships[key]++;
            }
        }
    });
    
    // Save relationships to localStorage
    localStorage.setItem('groupRelationships', JSON.stringify(groupRelationships));
}

// Load group relationships
function loadGroupRelationships() {
    const saved = localStorage.getItem('groupRelationships');
    if (saved) {
        groupRelationships = JSON.parse(saved);
    }
}

// Rearrange seats considering previous groupings
function rearrangeSeats() {
    // Collect all current participants from groups
    const currentParticipants = [];
    groups.forEach(group => {
        group.occupants.forEach(occupant => {
            if (occupant) {
                currentParticipants.push(occupant);
            }
        });
    });
    
    if (currentParticipants.length === 0) {
        alert('배치된 참여자가 없습니다. 먼저 자동 배치를 실행해주세요.');
        return;
    }
    
    if (groups.length === 0) {
        alert('먼저 모둠을 생성해주세요.');
        return;
    }
    
    const considerGenderRatio = document.getElementById('genderRatio').checked;
    
    // Clear current arrangements
    groups.forEach(group => {
        group.occupants = new Array(group.groupSize).fill(null);
        updateGroupDisplay(group);
    });
    
    // Calculate total seats
    const totalSeats = groups.reduce((sum, group) => sum + group.groupSize, 0);
    if (currentParticipants.length > totalSeats) {
        alert('참여자 수가 좌석 수보다 많습니다.');
        return;
    }
    
    // Calculate overall gender ratio
    const totalMales = currentParticipants.filter(p => p.gender === '남').length;
    const totalFemales = currentParticipants.filter(p => p.gender === '여').length;
    const overallMaleRatio = totalMales / currentParticipants.length;
    
    console.log('재배치 시작 - 참여자 수:', currentParticipants.length);
    console.log(`전체 성별 비율 - 남: ${totalMales}명 (${(overallMaleRatio * 100).toFixed(1)}%), 여: ${totalFemales}명 (${((1 - overallMaleRatio) * 100).toFixed(1)}%)`);
    console.log('남녀 비율 고려:', considerGenderRatio);
    console.log('이전 관계 데이터:', Object.keys(groupRelationships).length, '개의 관계');
    console.log('배치 방식: 모든 모둠에 균등 분배');
    
    // Arrange with minimizing previous groupings
    const arrangement = arrangeMinimizingRelationships(currentParticipants, groups, considerGenderRatio);
    
    // Apply arrangement
    arrangement.forEach((groupArrangement, groupIndex) => {
        const group = groups[groupIndex];
        groupArrangement.forEach((participant, seatIndex) => {
            if (participant) {
                group.occupants[seatIndex] = participant;
            }
        });
        updateGroupDisplay(group);
    });
    
    // Save to history and update relationships
    saveToHistory(arrangement);
    updateGroupRelationships(arrangement);
    canvas.renderAll();
    updateGroupSelector();
    updateGroupsTable();
    updateStats();
    
    // Show success message
    const totalArranged = arrangement.reduce((sum, group) => sum + group.filter(p => p !== null).length, 0);
    console.log('재배치 완료 - 배치된 인원:', totalArranged);
    
    // Calculate distribution statistics
    const groupSizes = arrangement.map(group => group.filter(p => p !== null).length);
    const minSize = Math.min(...groupSizes);
    const maxSize = Math.max(...groupSizes);
    console.log(`모둠별 인원 분포: 최소 ${minSize}명, 최대 ${maxSize}명 (차이: ${maxSize - minSize}명)`);
    
    // Log group distribution with gender details
    arrangement.forEach((group, idx) => {
        const members = group.filter(p => p !== null);
        const males = members.filter(p => p.gender === '남').length;
        const females = members.filter(p => p.gender === '여').length;
        const total = members.length;
        console.log(`모둠 ${idx + 1}: ${total}명 / ${groups[idx].groupSize}명 (남 ${males}명, 여 ${females}명)`);
        
        if (total >= 2) {
            const minorityCount = Math.min(males, females);
            const majorityCount = Math.max(males, females);
            const minorityRatio = minorityCount / total;
            
            if (minorityCount === 0) {
                console.warn(`⚠️ 모둠 ${idx + 1}은 한 성별로만 구성되어 있습니다!`);
            } else if (total >= 4 && minorityRatio < 0.25) {
                console.warn(`⚠️ 모둠 ${idx + 1}의 성별 불균형이 심합니다 (${minorityCount}:${majorityCount})`);
            } else if (total >= 6 && minorityRatio < 0.33) {
                console.info(`ℹ️ 모둠 ${idx + 1}의 성별 비율: ${males}:${females}`);
            }
        }
    });
}

// Arrange minimizing previous relationships and optimizing gender ratio
function arrangeMinimizingRelationships(participants, groups, considerGender) {
    const arrangement = groups.map(g => new Array(g.groupSize).fill(null));
    
    // Calculate how many participants should go to each group for even distribution
    const totalParticipants = participants.length;
    const totalGroups = groups.length;
    const basePerGroup = Math.floor(totalParticipants / totalGroups);
    const remainder = totalParticipants % totalGroups;
    
    // Determine target size for each group (distribute remainder evenly)
    const targetSizes = [];
    for (let i = 0; i < totalGroups; i++) {
        // First 'remainder' groups get one extra person
        const targetSize = basePerGroup + (i < remainder ? 1 : 0);
        // But don't exceed the group's capacity
        targetSizes.push(Math.min(targetSize, groups[i].groupSize));
    }
    
    // Calculate ideal gender distribution for each group based on overall ratio
    const totalMales = participants.filter(p => p.gender === '남').length;
    const totalFemales = participants.filter(p => p.gender === '여').length;
    const maleRatio = totalMales / totalParticipants;
    
    const targetGenderDistribution = targetSizes.map(size => {
        const idealMales = Math.round(size * maleRatio);
        const idealFemales = size - idealMales;
        return { males: idealMales, females: idealFemales };
    });
    
    console.log('목표 모둠별 인원:', targetSizes);
    console.log('목표 성별 분포:', targetGenderDistribution);
    
    // Calculate relationship scores for each pair
    const participantsList = [...participants];
    const relationshipMatrix = {};
    
    // Separate participants by gender
    const maleParticipants = [];
    const femaleParticipants = [];
    const maleIndices = [];
    const femaleIndices = [];
    
    participantsList.forEach((p, idx) => {
        if (p.gender === '남') {
            maleParticipants.push(p);
            maleIndices.push(idx);
        } else if (p.gender === '여') {
            femaleParticipants.push(p);
            femaleIndices.push(idx);
        }
    });
    
    // Build relationship matrix
    for (let i = 0; i < participantsList.length; i++) {
        relationshipMatrix[i] = {};
        for (let j = 0; j < participantsList.length; j++) {
            if (i !== j) {
                const key = [participantsList[i].name, participantsList[j].name].sort().join('|');
                relationshipMatrix[i][j] = groupRelationships[key] || 0;
            }
        }
    }
    
    // Apply pairings first (same as in arrangeWithHistory)
    const pairedParticipants = new Set();
    const pairedIndices = new Set();
    
    pairings.forEach(pair => {
        const [person1, person2] = pair;
        const p1Idx = participantsList.findIndex(p => p.name === person1);
        const p2Idx = participantsList.findIndex(p => p.name === person2);
        
        if (p1Idx !== -1 && p2Idx !== -1 && !pairedIndices.has(p1Idx) && !pairedIndices.has(p2Idx)) {
            // Find a group with two empty adjacent seats that hasn't reached target size
            for (let i = 0; i < groups.length; i++) {
                const currentSize = arrangement[i].filter(seat => seat !== null).length;
                const emptySeats = arrangement[i].map((seat, idx) => seat === null ? idx : -1).filter(idx => idx !== -1);
                
                // Check if this group can accommodate 2 more people without exceeding target
                if (emptySeats.length >= 2 && currentSize + 2 <= targetSizes[i]) {
                    arrangement[i][emptySeats[0]] = participantsList[p1Idx];
                    arrangement[i][emptySeats[1]] = participantsList[p2Idx];
                    pairedIndices.add(p1Idx);
                    pairedIndices.add(p2Idx);
                    break;
                }
            }
        }
    });
    
    // Try to distribute remaining participants to minimize total relationship score
    const groupAssignments = Array(groups.length).fill(null).map(() => []);
    const unassigned = [...Array(participantsList.length).keys()].filter(idx => !pairedIndices.has(idx));
    
    // Initialize group assignments with paired participants
    arrangement.forEach((group, groupIdx) => {
        group.forEach((participant, seatIdx) => {
            if (participant) {
                const idx = participantsList.findIndex(p => p.name === participant.name);
                if (idx !== -1) {
                    groupAssignments[groupIdx].push(idx);
                }
            }
        });
    });
    
    // Improved assignment algorithm with gender ratio and relationship consideration
    if (considerGender) {
        // Sort unassigned participants by gender for better distribution
        const unassignedMales = unassigned.filter(idx => participantsList[idx].gender === '남');
        const unassignedFemales = unassigned.filter(idx => participantsList[idx].gender === '여');
        
        // Assign participants alternating between genders when possible
        while (unassignedMales.length > 0 || unassignedFemales.length > 0) {
            // Choose which gender to assign next based on current distribution
            let participantToAssign = null;
            let participantIdx = -1;
            
            // Calculate current gender distribution in each group
            const groupGenderCounts = groupAssignments.map((groupIdxs, groupIdx) => {
                const males = groupIdxs.filter(idx => participantsList[idx].gender === '남').length;
                const females = groupIdxs.filter(idx => participantsList[idx].gender === '여').length;
                return { males, females, total: males + females, groupIdx };
            });
            
            // Find the best assignment - prioritize filling groups sequentially
            let bestAssignment = null;
            let bestScore = Infinity;
            
            // Try both genders
            const candidateIndices = [...unassignedMales, ...unassignedFemales];
            
            // Find the first group that hasn't reached its target size
            let targetGroupIdx = -1;
            for (let i = 0; i < groups.length; i++) {
                if (groupAssignments[i].length < targetSizes[i]) {
                    targetGroupIdx = i;
                    break;
                }
            }
            
            if (targetGroupIdx !== -1) {
                // Only consider the target group (first non-full group)
                const groupInfo = groupGenderCounts[targetGroupIdx];
                
                // For empty groups, try to balance starting genders across all groups
                let candidatesToConsider = candidateIndices;
                if (groupInfo.total === 0) {
                    // Count starting genders in filled groups
                    let maleStarts = 0;
                    let femaleStarts = 0;
                    for (let i = 0; i < targetGroupIdx; i++) {
                        if (groupAssignments[i].length > 0) {
                            if (participantsList[groupAssignments[i][0]].gender === '남') {
                                maleStarts++;
                            } else {
                                femaleStarts++;
                            }
                        }
                    }
                    
                    // Prefer candidates of underrepresented starting gender
                    if (maleStarts > femaleStarts && unassignedFemales.length > 0) {
                        candidatesToConsider = [...unassignedFemales];
                    } else if (femaleStarts > maleStarts && unassignedMales.length > 0) {
                        candidatesToConsider = [...unassignedMales];
                    }
                }
                
                for (const candidateIdx of candidatesToConsider) {
                    const candidate = participantsList[candidateIdx];
                    
                    // Calculate composite score for this candidate in the target group
                    let score = 0;
                    
                    // Relationship score (weight: 3)
                    for (const existingIdx of groupAssignments[targetGroupIdx]) {
                        score += (relationshipMatrix[candidateIdx][existingIdx] || 0) * 3;
                    }
                    
                    // Gender balance score - prevent extreme imbalance only
                    const newMales = groupInfo.males + (candidate.gender === '남' ? 1 : 0);
                    const newFemales = groupInfo.females + (candidate.gender === '여' ? 1 : 0);
                    const totalInGroup = newMales + newFemales;
                    
                    // Calculate acceptable imbalance based on group size
                    if (totalInGroup >= 2) {
                        const minorityGender = Math.min(newMales, newFemales);
                        const majorityGender = Math.max(newMales, newFemales);
                        
                        // Get target gender distribution for this group
                        const targetDist = targetGenderDistribution[targetGroupIdx];
                        const targetMales = targetDist.males;
                        const targetFemales = targetDist.females;
                        
                        // Calculate deviation from target distribution
                        const maleDeviation = Math.abs(newMales - targetMales);
                        const femaleDeviation = Math.abs(newFemales - targetFemales);
                        const totalDeviation = maleDeviation + femaleDeviation;
                        score += totalDeviation * 40; // Penalty for deviation from target
                        
                        // Define minimum acceptable ratios based on group size
                        let acceptableMinority = 1; // Minimum acceptable
                        let idealMinority = 1; // Ideal minority count
                        
                        if (totalInGroup === 4) {
                            acceptableMinority = 2; // Force 2:2 for 4-person groups
                            idealMinority = 2;
                        } else if (totalInGroup === 5) {
                            acceptableMinority = 2; // At least 2 of minority
                            idealMinority = 2; // Ideal is 3:2
                        } else if (totalInGroup === 6) {
                            acceptableMinority = 2; // At least 2, prefer 3
                            idealMinority = 3; // Ideal is 3:3 or 4:2
                        }
                        
                        // Strong penalty for deviation from ideal ratio
                        const deviationFromIdeal = Math.abs(minorityGender - idealMinority);
                        score += deviationFromIdeal * 30;
                        
                        // Heavy penalty for not meeting minimum acceptable
                        if (minorityGender < acceptableMinority) {
                            const severity = acceptableMinority - minorityGender;
                            score += severity * 100;
                            
                            // Extreme penalty for single-gender groups
                            if (minorityGender === 0) {
                                score += 200;
                            }
                        }
                        
                        // Additional penalty for 5-person groups with 4:1 or 6-person groups with 5:1
                        if ((totalInGroup === 5 && minorityGender === 1) || 
                            (totalInGroup === 6 && minorityGender === 1)) {
                            score += 150; // Strong penalty for extreme imbalance
                        }
                    }
                    
                    // Add small random factor
                    score += Math.random() * 0.1;
                    
                    if (score < bestScore) {
                        bestScore = score;
                        bestAssignment = { participantIdx: candidateIdx, groupIdx: targetGroupIdx };
                    }
                }
            }
            
            if (bestAssignment) {
                groupAssignments[bestAssignment.groupIdx].push(bestAssignment.participantIdx);
                
                // Remove from unassigned lists
                const maleIdx = unassignedMales.indexOf(bestAssignment.participantIdx);
                if (maleIdx !== -1) {
                    unassignedMales.splice(maleIdx, 1);
                } else {
                    const femaleIdx = unassignedFemales.indexOf(bestAssignment.participantIdx);
                    if (femaleIdx !== -1) {
                        unassignedFemales.splice(femaleIdx, 1);
                    }
                }
            } else {
                console.error('Could not find assignment for participants');
                break;
            }
        }
    } else {
        // Algorithm without gender consideration - still fill groups sequentially
        while (unassigned.length > 0) {
            let bestAssignment = null;
            let bestScore = Infinity;
            
            // Find the first group that hasn't reached its target size
            let targetGroupIdx = -1;
            for (let i = 0; i < groups.length; i++) {
                if (groupAssignments[i].length < targetSizes[i]) {
                    targetGroupIdx = i;
                    break;
                }
            }
            
            if (targetGroupIdx !== -1) {
                // Only consider the target group
                for (const participantIdx of unassigned) {
                    let score = 0;
                    for (const existingIdx of groupAssignments[targetGroupIdx]) {
                        score += relationshipMatrix[participantIdx][existingIdx] || 0;
                    }
                    score += Math.random() * 0.1;
                    
                    if (score < bestScore) {
                        bestScore = score;
                        bestAssignment = { participantIdx, groupIdx: targetGroupIdx };
                    }
                }
            }
            
            if (bestAssignment) {
                groupAssignments[bestAssignment.groupIdx].push(bestAssignment.participantIdx);
                unassigned.splice(unassigned.indexOf(bestAssignment.participantIdx), 1);
            } else {
                break;
            }
        }
    }
    
    // Apply final arrangement
    groupAssignments.forEach((groupIdxs, groupIdx) => {
        const groupParticipants = groupIdxs.map(idx => participantsList[idx]);
        
        if (considerGender) {
            // Sort participants within group for better gender distribution
            const males = groupParticipants.filter(p => p.gender === '남');
            const females = groupParticipants.filter(p => p.gender === '여');
            
            // Arrange in alternating pattern when possible
            const arranged = [];
            let maleIdx = 0, femaleIdx = 0;
            
            // Start with the gender that has fewer members to ensure better distribution
            const startWithMale = males.length <= females.length;
            
            for (let i = 0; i < groupParticipants.length; i++) {
                if ((i % 2 === 0) === startWithMale) {
                    if (maleIdx < males.length) {
                        arranged.push(males[maleIdx++]);
                    } else if (femaleIdx < females.length) {
                        arranged.push(females[femaleIdx++]);
                    }
                } else {
                    if (femaleIdx < females.length) {
                        arranged.push(females[femaleIdx++]);
                    } else if (maleIdx < males.length) {
                        arranged.push(males[maleIdx++]);
                    }
                }
            }
            
            // Fill the group slots
            arranged.forEach((participant, idx) => {
                if (idx < groups[groupIdx].groupSize) {
                    arrangement[groupIdx][idx] = participant;
                }
            });
        } else {
            // Simple assignment without gender consideration
            groupParticipants.forEach((participant, seatIdx) => {
                if (seatIdx < groups[groupIdx].groupSize) {
                    arrangement[groupIdx][seatIdx] = participant;
                }
            });
        }
    });
    
    // Post-processing: Check for extreme gender imbalances and fix them
    if (considerGender) {
        const groupGenderStats = arrangement.map((group, idx) => {
            const members = group.filter(p => p !== null);
            const males = members.filter(p => p.gender === '남').length;
            const females = members.filter(p => p.gender === '여').length;
            const total = members.length;
            return { idx, males, females, total };
        });
        
        // Find groups with extreme imbalances
        for (let i = 0; i < groupGenderStats.length; i++) {
            const stat = groupGenderStats[i];
            if (stat.total >= 5) {
                const minorityCount = Math.min(stat.males, stat.females);
                const majorityCount = Math.max(stat.males, stat.females);
                const minorityGender = stat.males < stat.females ? '남' : '여';
                const majorityGender = stat.males >= stat.females ? '남' : '여';
                
                // Check if this group has extreme imbalance (5:1 or 6:0 for 6-person groups, 4:1 for 5-person groups)
                if ((stat.total === 6 && minorityCount <= 1) || 
                    (stat.total === 5 && minorityCount <= 1)) {
                    
                    // Try to find another group with opposite imbalance to swap with
                    for (let j = 0; j < groupGenderStats.length; j++) {
                        if (i === j) continue;
                        
                        const otherStat = groupGenderStats[j];
                        if (otherStat.total < 2) continue;
                        
                        const otherMinorityCount = Math.min(otherStat.males, otherStat.females);
                        const otherMajorityCount = Math.max(otherStat.males, otherStat.females);
                        const otherMinorityGender = otherStat.males < otherStat.females ? '남' : '여';
                        const otherMajorityGender = otherStat.males >= otherStat.females ? '남' : '여';
                        
                        // Check if the other group has more of what we need
                        if (otherMajorityGender === minorityGender && otherMajorityCount >= otherMinorityCount + 2) {
                            // Find participants to swap
                            let swapFromI = null;
                            let swapFromJ = null;
                            
                            // Find a majority gender person from group i
                            for (let k = 0; k < arrangement[i].length; k++) {
                                if (arrangement[i][k] && arrangement[i][k].gender === majorityGender) {
                                    swapFromI = k;
                                    break;
                                }
                            }
                            
                            // Find a minority gender person from group j (who is majority in their group)
                            for (let k = 0; k < arrangement[j].length; k++) {
                                if (arrangement[j][k] && arrangement[j][k].gender === minorityGender) {
                                    swapFromJ = k;
                                    break;
                                }
                            }
                            
                            // Perform swap if both found
                            if (swapFromI !== null && swapFromJ !== null) {
                                const temp = arrangement[i][swapFromI];
                                arrangement[i][swapFromI] = arrangement[j][swapFromJ];
                                arrangement[j][swapFromJ] = temp;
                                
                                // Update stats
                                if (minorityGender === '남') {
                                    groupGenderStats[i].males++;
                                    groupGenderStats[i].females--;
                                    groupGenderStats[j].males--;
                                    groupGenderStats[j].females++;
                                } else {
                                    groupGenderStats[i].males--;
                                    groupGenderStats[i].females++;
                                    groupGenderStats[j].males++;
                                    groupGenderStats[j].females--;
                                }
                                
                                console.log(`성별 균형 조정: 모둠 ${i+1}과 모둠 ${j+1} 간 참여자 교환`);
                                break; // Only do one swap per imbalanced group
                            }
                        }
                    }
                }
            }
        }
    }
    
    return arrangement;
}

// Update statistics
function updateStats() {
    // Calculate total participants
    let totalParticipants = 0;
    let maleCount = 0;
    let femaleCount = 0;
    
    groups.forEach(group => {
        group.occupants.forEach(occupant => {
            if (occupant) {
                totalParticipants++;
                if (occupant.gender === '남') maleCount++;
                else if (occupant.gender === '여') femaleCount++;
            }
        });
    });
    
    // Calculate total seats
    const totalSeats = groups.reduce((sum, group) => sum + group.groupSize, 0);
    const emptySeats = totalSeats - totalParticipants;
    
    // Update UI
    document.getElementById('totalParticipants').textContent = `참여자: ${totalParticipants}명`;
    document.getElementById('totalSeats').textContent = `총 좌석: ${totalSeats}석`;
    document.getElementById('emptySeats').textContent = `빈 자리: ${emptySeats}석`;
    document.getElementById('maleCount').textContent = `남 ${maleCount}명`;
    document.getElementById('femaleCount').textContent = `여 ${femaleCount}명`;
}

// Initialize relationships on load
loadGroupRelationships();

// Select a group
function selectGroup(group) {
    // Deselect all groups first
    deselectAllGroups();
    
    // Mark this group as selected
    group.isSelected = true;
    
    // Update visual appearance
    const rect = group._objects[0];
    rect.set({
        stroke: '#ff5722',
        strokeWidth: 4,
        shadow: new fabric.Shadow({
            color: 'rgba(255, 87, 34, 0.3)',
            offsetX: 0,
            offsetY: 0,
            blur: 10
        })
    });
    
    // Bring selected group to front
    canvas.bringToFront(group);
    
    // Update dropdown
    document.getElementById('targetGroup').value = group.groupId;
    
    // Store selected group for keyboard events
    canvas.selectedGroup = group;
    
    canvas.requestRenderAll();
    updateGroupsTable();
}

// Deselect all groups
function deselectAllGroups() {
    // Get all objects from canvas
    const canvasObjects = canvas.getObjects();
    
    canvasObjects.forEach(obj => {
        if (obj.groupId) {
            obj.isSelected = false;
            if (obj._objects && obj._objects[0]) {
                obj._objects[0].set({
                    stroke: '#2196f3',
                    strokeWidth: 2,
                    shadow: null
                });
            }
        }
    });
    
    canvas.selectedGroup = null;
    canvas.requestRenderAll();
}

// Update group highlight
function updateGroupHighlight(selectedGroupId) {
    const canvasObjects = canvas.getObjects();
    const group = canvasObjects.find(obj => obj.groupId === selectedGroupId);
    if (group) {
        selectGroup(group);
    }
}

// Rebuild groups array from canvas objects
function rebuildGroupsArray() {
    groups = [];
    const canvasObjects = canvas.getObjects();
    
    canvasObjects.forEach(obj => {
        if (obj.groupId) {
            groups.push(obj);
        }
    });
    
    // Sort by groupId to maintain order
    groups.sort((a, b) => a.groupId - b.groupId);
}

// Make removePairing global
window.removePairing = removePairing;

// Template Management Functions
let templates = [];

// Initialize template functionality
function initializeTemplates() {
    // Load templates from localStorage
    loadTemplates();
    
    // Add event listeners
    document.getElementById('saveTemplate').addEventListener('click', saveCurrentTemplate);
    
    // Display saved templates
    displayTemplates();
}

// Save current arrangement as template
function saveCurrentTemplate() {
    const templateName = document.getElementById('templateName').value.trim();
    
    if (!templateName) {
        alert('템플릿 이름을 입력해주세요.');
        return;
    }
    
    // Check if there are any groups to save
    if (groups.length === 0) {
        alert('저장할 좌석 배치가 없습니다.');
        return;
    }
    
    // Create template data
    const templateData = {
        id: Date.now(),
        name: templateName,
        createdAt: new Date().toLocaleString('ko-KR'),
        groups: groups.map(group => ({
            groupId: group.groupId,
            groupSize: group.groupSize,
            position: {
                left: group.left,
                top: group.top
            },
            occupants: group.occupants.map(occ => occ ? {
                name: occ.name,
                gender: occ.gender
            } : null)
        })),
        totalSeats: groups.reduce((sum, group) => sum + group.groupSize, 0),
        totalParticipants: groups.reduce((sum, group) => 
            sum + group.occupants.filter(occ => occ !== null).length, 0)
    };
    
    // Add to templates array
    templates.push(templateData);
    
    // Save to localStorage
    saveTemplates();
    
    // Clear input
    document.getElementById('templateName').value = '';
    
    // Update display
    displayTemplates();
    
    alert(`템플릿 "${templateName}"이 저장되었습니다.`);
}

// Load template
function loadTemplate(templateId) {
    const template = templates.find(t => t.id === templateId);
    
    if (!template) {
        alert('템플릿을 찾을 수 없습니다.');
        return;
    }
    
    if (!confirm(`"${template.name}" 템플릿을 불러오시겠습니까? 현재 배치는 모두 삭제됩니다.`)) {
        return;
    }
    
    // Clear current canvas
    canvas.clear();
    canvas.backgroundColor = '#f0f0f0';
    groups = [];
    groupIdCounter = 0;
    
    // Recreate groups from template
    template.groups.forEach(groupData => {
        // Update groupIdCounter to maintain consistency
        if (groupData.groupId > groupIdCounter) {
            groupIdCounter = groupData.groupId;
        }
        
        // Create group container
        const groupWidth = 150;
        const groupHeight = 150;
        
        // Create group rectangle
        const rect = new fabric.Rect({
            width: groupWidth,
            height: groupHeight,
            fill: '#e3f2fd',
            stroke: '#2196f3',
            strokeWidth: 2,
            rx: 8,
            ry: 8,
            originX: 'center',
            originY: 'center'
        });

        // Create group label
        const text = new fabric.Text('모둠 ' + groupData.groupId, {
            fontSize: 14,
            fontWeight: 'bold',
            fontFamily: 'Noto Sans KR, sans-serif',
            fill: '#1976d2',
            originX: 'center',
            originY: 'center',
            top: -groupHeight/2 - 18
        });

        // Create seats inside the group
        const seats = [];
        const seatSize = 28;
        const seatPadding = 12;
        const cols = Math.ceil(Math.sqrt(groupData.groupSize));
        const rows = Math.ceil(groupData.groupSize / cols);
        
        for (let i = 0; i < groupData.groupSize; i++) {
            const row = Math.floor(i / cols);
            const col = i % cols;
            
            const seat = new fabric.Circle({
                radius: seatSize / 2,
                fill: '#ffffff',
                stroke: '#757575',
                strokeWidth: 1,
                originX: 'center',
                originY: 'center',
                left: (col - (cols - 1) / 2) * (seatSize + seatPadding),
                top: (row - (rows - 1) / 2) * (seatSize + seatPadding),
                selectable: false
            });
            
            seats.push(seat);
        }

        // Create group object
        const groupElements = [rect, text, ...seats];
        
        const group = new fabric.Group(groupElements, {
            left: groupData.position.left,
            top: groupData.position.top,
            originX: 'center',
            originY: 'center',
            hasControls: false,
            hasBorders: false,
            lockRotation: true,
            lockScalingX: true,
            lockScalingY: true,
            lockMovementX: false,
            lockMovementY: false,
            selectable: false,
            evented: true
        });

        // Store group information
        group.groupId = groupData.groupId;
        group.groupSize = groupData.groupSize;
        group.seats = seats;
        group.occupants = groupData.occupants.map(occ => occ ? {...occ} : null);
        
        groups.push(group);
        canvas.add(group);
        
        // Update display with occupants
        updateGroupDisplay(group);
    });
    
    // Update canvas size and UI
    updateCanvasSize();
    canvas.renderAll();
    updateGroupSelector();
    updateGroupsTable();
    updateStats();
    
    // Update participant count and inputs
    const totalParticipants = template.totalParticipants;
    document.getElementById('participantCount').value = totalParticipants;
    generateParticipantInputs();
    
    // Fill participant inputs with loaded data
    const participantInputs = document.querySelectorAll('.participant-input-row');
    let inputIndex = 0;
    
    template.groups.forEach(groupData => {
        groupData.occupants.forEach(occupant => {
            if (occupant && inputIndex < participantInputs.length) {
                const row = participantInputs[inputIndex];
                row.querySelector('.participant-name').value = occupant.name;
                row.querySelector('.participant-gender').value = occupant.gender;
                inputIndex++;
            }
        });
    });
    
    alert(`템플릿 "${template.name}"을 불러왔습니다.`);
}

// Delete template
function deleteTemplate(templateId) {
    const template = templates.find(t => t.id === templateId);
    
    if (!template) {
        return;
    }
    
    if (!confirm(`"${template.name}" 템플릿을 삭제하시겠습니까?`)) {
        return;
    }
    
    // Remove from array
    templates = templates.filter(t => t.id !== templateId);
    
    // Save to localStorage
    saveTemplates();
    
    // Update display
    displayTemplates();
}

// Save templates to localStorage
function saveTemplates() {
    localStorage.setItem('seatingTemplates', JSON.stringify(templates));
}

// Load templates from localStorage
function loadTemplates() {
    const saved = localStorage.getItem('seatingTemplates');
    if (saved) {
        try {
            templates = JSON.parse(saved);
        } catch (e) {
            console.error('템플릿 로드 실패:', e);
            templates = [];
        }
    }
}

// Display templates in the UI
function displayTemplates() {
    const templateList = document.getElementById('templateList');
    templateList.innerHTML = '';
    
    if (templates.length === 0) {
        templateList.innerHTML = '<div class="template-empty">저장된 템플릿이 없습니다.</div>';
        return;
    }
    
    templates.forEach(template => {
        const templateItem = document.createElement('div');
        templateItem.className = 'template-item';
        templateItem.innerHTML = `
            <div class="template-info">
                <div class="template-name">${template.name}</div>
                <div class="template-details">
                    ${template.createdAt} | 
                    좌석: ${template.totalSeats}석 | 
                    참여자: ${template.totalParticipants}명
                </div>
            </div>
            <div class="template-actions">
                <button class="btn btn-load-template" onclick="loadTemplate(${template.id})">
                    불러오기
                </button>
                <button class="btn btn-delete-template" onclick="deleteTemplate(${template.id})">
                    삭제
                </button>
            </div>
        `;
        templateList.appendChild(templateItem);
    });
}

// Make functions global
window.loadTemplate = loadTemplate;
window.deleteTemplate = deleteTemplate;

// Initialize templates when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Wait for other initialization to complete
    setTimeout(initializeTemplates, 100);
});

// Zoom Functions
function zoomIn() {
    if (currentZoom < 2) {
        currentZoom += 0.1;
        applyZoom();
    }
}

function zoomOut() {
    if (currentZoom > 0.5) {
        currentZoom -= 0.1;
        applyZoom();
    }
}

function zoomReset() {
    currentZoom = 1;
    applyZoom();
}

function applyZoom() {
    // Store original canvas dimensions
    const originalWidth = 800;
    const originalHeight = 600;
    
    // Apply zoom
    canvas.setZoom(currentZoom);
    
    // Calculate new dimensions based on current zoom
    const newWidth = originalWidth * currentZoom;
    const newHeight = originalHeight * currentZoom;
    
    // Set canvas dimensions
    canvas.setWidth(newWidth);
    canvas.setHeight(newHeight);
    
    // Update canvas size to accommodate all groups
    if (groups.length > 0) {
        const baseHeight = 600;
        const groupHeight = 200; // Reduced from 240
        const groupsPerRow = 5; // Increased from 4
        const rows = Math.ceil(groups.length / groupsPerRow);
        const requiredHeight = Math.max(baseHeight, rows * groupHeight + 100);
        canvas.setHeight(requiredHeight * currentZoom);
    }
    
    // Ensure all groups remain interactive after zoom
    canvas.forEachObject(function(obj) {
        if (obj.groupId) {
            obj.set({
                selectable: false,
                evented: true,
                hasControls: false,
                hasBorders: false
            });
            // Update object coordinates after zoom
            obj.setCoords();
        }
    });
    
    canvas.calcOffset();
    canvas.renderAll();
    
    // Update zoom level display
    document.getElementById('zoomLevel').textContent = Math.round(currentZoom * 100) + '%';
    
    // Update canvas wrapper to handle overflow
    const canvasWrapper = document.getElementById('canvasWrapper');
    if (currentZoom > 1) {
        canvasWrapper.style.overflow = 'auto';
    } else {
        canvasWrapper.style.overflow = 'auto'; // Always allow scroll for consistency
    }
}

// Handle mouse wheel zoom
function handleMouseWheel(e) {
    e.preventDefault();
    const delta = e.deltaY;
    
    if (e.ctrlKey || e.metaKey) {
        // Zoom with Ctrl/Cmd + wheel
        if (delta < 0) {
            zoomIn();
        } else {
            zoomOut();
        }
    } else {
        // Normal scroll behavior when not holding Ctrl/Cmd
        const canvasWrapper = document.getElementById('canvasWrapper');
        canvasWrapper.scrollTop += delta;
    }
}

// Fullscreen functionality
let isFullscreen = false;

function toggleFullscreen() {
    const canvasArea = document.querySelector('.canvas-area');
    const fullscreenBtn = document.getElementById('fullscreen');
    
    if (!isFullscreen) {
        // Enter fullscreen
        isFullscreen = true;
        canvasArea.classList.add('fullscreen');
        
        // Show big timer button
        document.getElementById('toggleBigTimer').style.display = 'inline-flex';
        
        // Change button to exit fullscreen
        fullscreenBtn.classList.add('exit-fullscreen');
        fullscreenBtn.title = '전체 화면 종료';
        fullscreenBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 5a1 1 0 0 1 1 1v2h2a1 1 0 0 1 0 2H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1zm10 0a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-3a1 1 0 0 1 0-2h2V6a1 1 0 0 1 1-1zm-9 8a1 1 0 0 1 0 2H4a1 1 0 0 1-1-1v-3a1 1 0 0 1 2 0v2h1a1 1 0 0 1 1-1zm8 0a1 1 0 0 1 1 1v1h1a1 1 0 0 1 0 2h-3a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1z"/>
            </svg>
        `;
        
        // Store current zoom
        const prevZoom = currentZoom;
        
        // Adjust canvas for fullscreen
        setTimeout(() => {
            const wrapper = document.getElementById('canvasWrapper');
            const wrapperHeight = wrapper.clientHeight;
            const wrapperWidth = wrapper.clientWidth;
            
            // Calculate scale to fit canvas in fullscreen
            const scaleX = (wrapperWidth - 40) / 800;
            const scaleY = (wrapperHeight - 40) / 600;
            const scale = Math.min(scaleX, scaleY, 1.5);
            
            currentZoom = scale;
            applyZoom();
            
            // Re-enable interactions after zoom change
            canvas.forEachObject(function(obj) {
                if (obj.groupId) {
                    obj.set({
                        selectable: false,
                        evented: true,
                        hasControls: false,
                        hasBorders: false,
                        lockRotation: true,
                        lockScalingX: true,
                        lockScalingY: true,
                        lockMovementX: false,
                        lockMovementY: false
                    });
                }
            });
            canvas.renderAll();
        }, 100);
        
    } else {
        // Exit fullscreen
        isFullscreen = false;
        canvasArea.classList.remove('fullscreen');
        
        // Change button back to fullscreen
        fullscreenBtn.classList.remove('exit-fullscreen');
        fullscreenBtn.title = '전체 화면';
        fullscreenBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 4a1 1 0 0 1 1-1h3a1 1 0 0 1 0 2H5v2a1 1 0 0 1-2 0V4zm10 0a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v3a1 1 0 0 1-2 0V5h-2a1 1 0 0 1-1-1zM4 13a1 1 0 0 1 1 1v2h2a1 1 0 0 1 0 2H4a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1zm12 0a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-3a1 1 0 0 1 0-2h2v-2a1 1 0 0 1 1-1z"/>
            </svg>
        `;
        
        // Hide big timer button
        document.getElementById('toggleBigTimer').style.display = 'none';
        
        // Hide big timer if shown
        if (showBigTimer) {
            toggleBigTimer();
        }
        
        // Reset zoom
        currentZoom = 1;
        applyZoom();
        
        // Re-enable interactions after exiting fullscreen
        canvas.forEachObject(function(obj) {
            if (obj.groupId) {
                obj.set({
                    selectable: false,
                    evented: true,
                    hasControls: false,
                    hasBorders: false,
                    lockRotation: true,
                    lockScalingX: true,
                    lockScalingY: true,
                    lockMovementX: false,
                    lockMovementY: false
                });
            }
        });
        canvas.renderAll();
    }
}

// Timer Functions
function startTimer() {
    if (isTimerRunning) return;
    
    // Get minutes from input
    const minutes = parseInt(document.getElementById('timerMinutes').value) || 5;
    timerSeconds = minutes * 60;
    
    // Update UI
    document.getElementById('startTimer').style.display = 'none';
    document.getElementById('stopTimer').style.display = 'inline-flex';
    document.getElementById('timerMinutes').disabled = true;
    
    isTimerRunning = true;
    updateTimerDisplay();
    
    // Start interval
    timerInterval = setInterval(() => {
        timerSeconds--;
        updateTimerDisplay();
        
        // Warning at 60 seconds (1 minute)
        if (timerSeconds === 60) {
            showOneMinuteWarning();
        }
        
        // Warning at 10 seconds
        if (timerSeconds === 10) {
            showTimerWarning();
        }
        
        // Timer complete
        if (timerSeconds <= 0) {
            timerComplete();
        }
    }, 1000);
}

function stopTimer() {
    if (!isTimerRunning) return;
    
    isTimerRunning = false;
    clearInterval(timerInterval);
    
    // Reset UI
    document.getElementById('startTimer').style.display = 'inline-flex';
    document.getElementById('stopTimer').style.display = 'none';
    document.getElementById('timerMinutes').disabled = false;
    document.getElementById('timerDisplay').classList.remove('warning', 'danger');
    
    // Remove warning from fullscreen
    const canvasArea = document.querySelector('.canvas-area');
    canvasArea.classList.remove('warning', 'danger');
    
    // Hide big timer if shown
    if (showBigTimer) {
        toggleBigTimer();
    }
    
    // Reset timer display
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;
    const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    const timerDisplay = document.getElementById('timerDisplay');
    timerDisplay.textContent = display;
    
    // Update warning classes for regular timer
    if (timerSeconds <= 10) {
        timerDisplay.classList.add('danger');
        timerDisplay.classList.remove('warning');
    } else if (timerSeconds <= 60) {
        timerDisplay.classList.add('warning');
        timerDisplay.classList.remove('danger');
    } else {
        timerDisplay.classList.remove('warning', 'danger');
    }
    
    // Update big timer display if active
    updateBigTimerDisplay();
}

function showOneMinuteWarning() {
    // Add warning class to timer display for 1 minute warning
    document.getElementById('timerDisplay').classList.add('warning');
    
    // If in fullscreen, add warning class to canvas area
    const canvasArea = document.querySelector('.canvas-area');
    if (canvasArea.classList.contains('fullscreen')) {
        canvasArea.classList.add('warning');
    }
    
    // Show 1 minute warning message
    if (isFullscreen) {
        const warningDiv = document.createElement('div');
        warningDiv.className = 'fullscreen-warning one-minute';
        warningDiv.innerHTML = `
            <div class="warning-text">⏰ 1분 남았습니다!</div>
        `;
        warningDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 152, 0, 0.95);
            color: white;
            padding: 30px 60px;
            border-radius: 10px;
            font-size: 36px;
            font-weight: bold;
            z-index: 10001;
            animation: warningFlash 1s infinite;
        `;
        document.body.appendChild(warningDiv);
        
        // Remove warning after 3 seconds
        setTimeout(() => {
            warningDiv.remove();
        }, 3000);
    }
}

function showTimerWarning() {
    // Add danger class to timer display for 10 second warning
    document.getElementById('timerDisplay').classList.add('danger');
    
    // If in fullscreen, change background color to danger
    const canvasArea = document.querySelector('.canvas-area');
    if (canvasArea.classList.contains('fullscreen')) {
        canvasArea.classList.remove('warning');
        canvasArea.classList.add('danger');
    }
    
    // Show alert
    if (isFullscreen) {
        // Create fullscreen warning message
        const warningDiv = document.createElement('div');
        warningDiv.className = 'fullscreen-warning';
        warningDiv.innerHTML = `
            <div class="warning-text">⚠️ 10초 후 자동 재배치됩니다!</div>
        `;
        warningDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 0, 0, 0.9);
            color: white;
            padding: 30px 60px;
            border-radius: 10px;
            font-size: 28px;
            font-weight: bold;
            z-index: 10001;
            animation: warningBounce 1s infinite;
        `;
        document.body.appendChild(warningDiv);
        
        // Remove warning after 3 seconds
        setTimeout(() => {
            warningDiv.remove();
        }, 3000);
    }
}

function timerComplete() {
    stopTimer();
    
    // Auto rearrange seats
    const hasParticipants = groups.some(group => 
        group.occupants.some(occupant => occupant !== null)
    );
    
    if (hasParticipants) {
        // Show completion message
        const completionDiv = document.createElement('div');
        completionDiv.className = 'timer-completion';
        completionDiv.innerHTML = `
            <div class="completion-text">⏰ 시간 종료! 자동 재배치를 시작합니다...</div>
        `;
        completionDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 180, 166, 0.95);
            color: white;
            padding: 30px 60px;
            border-radius: 10px;
            font-size: 24px;
            font-weight: bold;
            z-index: 10001;
        `;
        document.body.appendChild(completionDiv);
        
        // Perform rearrangement after short delay
        setTimeout(() => {
            completionDiv.remove();
            rearrangeSeats();
        }, 2000);
    } else {
        alert('배치된 참여자가 없어 재배치할 수 없습니다.');
    }
}

// Add warning bounce animation
const style = document.createElement('style');
style.textContent = `
    @keyframes warningBounce {
        0%, 100% { transform: translate(-50%, -50%) scale(1); }
        50% { transform: translate(-50%, -50%) scale(1.1); }
    }
`;
document.head.appendChild(style);

// Bulk input functions
function switchInputMode(mode) {
    const individualArea = document.getElementById('individualInputArea');
    const bulkArea = document.getElementById('bulkInputArea');
    const individualBtn = document.getElementById('individualMode');
    const bulkBtn = document.getElementById('bulkMode');
    
    if (mode === 'bulk') {
        individualArea.style.display = 'none';
        bulkArea.style.display = 'block';
        individualBtn.classList.remove('active');
        bulkBtn.classList.add('active');
    } else {
        individualArea.style.display = 'block';
        bulkArea.style.display = 'none';
        individualBtn.classList.add('active');
        bulkBtn.classList.remove('active');
    }
}

function parseBulkInput() {
    const bulkText = document.getElementById('bulkInputText').value.trim();
    if (!bulkText) {
        alert('입력할 내용이 없습니다.');
        return;
    }
    
    const lines = bulkText.split('\n').filter(line => line.trim());
    const participants = [];
    let errorLines = [];
    
    lines.forEach((line, index) => {
        const parts = line.split(',').map(part => part.trim());
        if (parts.length === 2 && parts[0] && (parts[1] === '남' || parts[1] === '여')) {
            participants.push({
                name: parts[0],
                gender: parts[1]
            });
        } else {
            errorLines.push(index + 1);
        }
    });
    
    if (errorLines.length > 0) {
        alert(`다음 줄에 오류가 있습니다: ${errorLines.join(', ')}\n올바른 형식: 이름,성별 (성별은 '남' 또는 '여')`);
        return;
    }
    
    if (participants.length === 0) {
        alert('유효한 참여자가 없습니다.');
        return;
    }
    
    // Update participant count and generate inputs
    document.getElementById('participantCount').value = participants.length;
    generateParticipantInputs();
    
    // Fill in the participant data
    setTimeout(() => {
        participants.forEach((participant, index) => {
            const nameInput = document.querySelector(`#participant-name-${index}`);
            const genderSelect = document.querySelector(`#participant-gender-${index}`);
            
            if (nameInput && genderSelect) {
                nameInput.value = participant.name;
                genderSelect.value = participant.gender;
            }
        });
        
        // Update stats
        updateStats();
        
        // Show success message
        alert(`${participants.length}명의 참여자가 성공적으로 입력되었습니다.`);
        
        // Switch back to individual mode to show results
        switchInputMode('individual');
        
        // Clear bulk input
        document.getElementById('bulkInputText').value = '';
    }, 100);
}

function clearBulkInput() {
    if (confirm('일괄 입력 내용을 모두 지우시겠습니까?')) {
        document.getElementById('bulkInputText').value = '';
    }
}

function generateSampleData() {
    const sampleNames = {
        male: ['김민수', '이준호', '박성진', '최동훈', '정재원', '강현우', '조민기', '윤성호', '장태양', '서준영',
               '한승우', '오지환', '임재현', '송민재', '백승호', '노진우', '권혁수', '문성민', '황인범', '유상철'],
        female: ['김지은', '이수진', '박민지', '최예린', '정하늘', '강소영', '조은비', '윤서연', '장미래', '서지우',
                '한가인', '오유진', '임채원', '송다은', '백서현', '노은서', '권나래', '문소희', '황수지', '유하나']
    };
    
    const count = prompt('생성할 샘플 인원 수를 입력하세요 (최대 40명):', '20');
    if (!count || isNaN(count)) return;
    
    const numParticipants = Math.min(Math.max(parseInt(count), 1), 40);
    const sampleData = [];
    
    // Generate balanced male/female participants
    const numMales = Math.ceil(numParticipants / 2);
    const numFemales = numParticipants - numMales;
    
    // Shuffle and select names
    const shuffledMales = [...sampleNames.male].sort(() => Math.random() - 0.5);
    const shuffledFemales = [...sampleNames.female].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < numMales && i < shuffledMales.length; i++) {
        sampleData.push(`${shuffledMales[i]},남`);
    }
    
    for (let i = 0; i < numFemales && i < shuffledFemales.length; i++) {
        sampleData.push(`${shuffledFemales[i]},여`);
    }
    
    // Shuffle the final list
    sampleData.sort(() => Math.random() - 0.5);
    
    // Set the bulk input text
    document.getElementById('bulkInputText').value = sampleData.join('\n');
    
    alert(`${sampleData.length}명의 샘플 데이터가 생성되었습니다.`);
}

