import { db, collection, doc, setDoc, getDocs, deleteDoc } from "./firebase-config.js";

// Global Variables
const daySelect = document.getElementById('daySelect');
const timetableBody = document.getElementById('timetableBody');
const addSlotBtn = document.getElementById('addSlotBtn');
const submitBtn = document.getElementById('submitBtn');
const resetBtn = document.getElementById('resetBtn');
const copyMondayBtn = document.getElementById('copyMondayBtn');
const downloadCsvBtn = document.getElementById('downloadCsvBtn');

let slots = {}; // { slotID: { start_time, end_time, teacher, subject, hall } }
const defaultSlots = {
    slot1: { start_time: "08:20 AM", end_time: "09:20 AM", teacher: "", subject: "", hall: "" },
    slot2: { start_time: "09:20 AM", end_time: "10:20 AM", teacher: "", subject: "", hall: "" },
    slot3: { start_time: "10:30 AM", end_time: "11:30 AM", teacher: "", subject: "", hall: "" },
    slot4: { start_time: "11:30 AM", end_time: "12:30 PM", teacher: "", subject: "", hall: "" },
    slot5: { start_time: "01:10 PM", end_time: "02:10 PM", teacher: "", subject: "", hall: "" },
    slot6: { start_time: "02:10 PM", end_time: "03:10 PM", teacher: "", subject: "", hall: "" }
};

let currentDay = "Monday";

// Functions
async function loadTimetable(day) {
    timetableBody.innerHTML = '';
    slots = {};

    if (day === "Saturday" || day === "Sunday") {
        alert("Saturday and Sunday are holidays by default!");
        return;
    }

    const querySnapshot = await getDocs(collection(db, "timetable", day, "slots"));
    querySnapshot.forEach((docSnap) => {
        slots[docSnap.id] = docSnap.data();
    });

    if (Object.keys(slots).length === 0) {
        // No data found, load default
        slots = structuredClone(defaultSlots);
    }

    renderTable();
}

async function renderTable() {
    timetableBody.innerHTML = ''; // Clear existing rows

    // Fetch teacher data from Firestore
    const teacherSnapshot = await getDocs(collection(db, "teachers"));
    const teacherList = [];
    const subjectSet = new Set();

    teacherSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.name) {
            teacherList.push(data.name); // List of teacher names
        }
        if (data.subject) {
            subjectSet.add(data.subject); // Set of subjects
        }
    });

    const subjectList = Array.from(subjectSet); // Convert Set to Array

    // Create datalist for teachers if not already created
    let teacherDatalist = document.getElementById('teacherList');
    if (!teacherDatalist) {
        teacherDatalist = document.createElement('datalist');
        teacherDatalist.id = 'teacherList';
        document.body.appendChild(teacherDatalist); // Append only once
    }
    teacherDatalist.innerHTML = teacherList.map(name => `<option value="${name}"></option>`).join('');

    // Create datalist for subjects if not already created
    let subjectDatalist = document.getElementById('subjectList');
    if (!subjectDatalist) {
        subjectDatalist = document.createElement('datalist');
        subjectDatalist.id = 'subjectList';
        document.body.appendChild(subjectDatalist); // Append only once
    }
    subjectDatalist.innerHTML = subjectList.map(sub => `<option value="${sub}"></option>`).join('');

    // Render each slot row
    Object.keys(slots).forEach(slotID => {
        const slot = slots[slotID];
        const row = document.createElement('tr');

        row.innerHTML = 
            `<td><input type="time" value="${slot.start_time}" data-slot="${slotID}" data-field="start_time"></td>
            <td><input type="time" value="${slot.end_time}" data-slot="${slotID}" data-field="end_time"></td>
            <td>
                <input type="text" list="teacherList" value="${slot.teacher}" data-slot="${slotID}" data-field="teacher" placeholder="Select or type teacher">
            </td>
            <td>
                <input type="text" list="subjectList" value="${slot.subject}" data-slot="${slotID}" data-field="subject" placeholder="Select or type subject">
            </td>
            <td><input type="text" value="${slot.hall}" data-slot="${slotID}" data-field="hall"></td>
            <td>
                <button class="deleteBtn" data-slot="${slotID}">Delete</button>
            </td>`;
        timetableBody.appendChild(row);
    });

    // Attach delete events
    document.querySelectorAll('.deleteBtn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const slotID = e.target.getAttribute('data-slot');
            delete slots[slotID];
            renderTable();
        });
    });

    // Update values on input
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', (e) => {
            const slotID = e.target.getAttribute('data-slot');
            const field = e.target.getAttribute('data-field');
            if (slots[slotID]) {
                slots[slotID][field] = e.target.value;
            }
        });
    });
}

async function submitTimetable() {
    if (currentDay === "Saturday" || currentDay === "Sunday") {
        alert("Saturday and Sunday are holidays. Submission skipped.");
        return;
    }

    const slotsCollectionRef = collection(db, "timetable", currentDay, "slots");

    // First delete all previous slots
    const querySnapshot = await getDocs(slotsCollectionRef);
    const deletionPromises = querySnapshot.docs.map((docSnap) => deleteDoc(doc(db, "timetable", currentDay, "slots", docSnap.id)));
    await Promise.all(deletionPromises);

    // Then add updated slots
    const savingPromises = Object.keys(slots).map(slotID => {
        const slotData = slots[slotID];
        const docRef = doc(db, "timetable", currentDay, "slots", slotID);
        return setDoc(docRef, slotData);
    });

    await Promise.all(savingPromises);
    alert("Timetable submitted successfully!");
}

function addNewSlot() {
    const newSlotID = `slot${Object.keys(slots).length + 1}`;
    slots[newSlotID] = { start_time: "", end_time: "", teacher: "", subject: "", hall: "" };
    renderTable();
}

function resetDay() {
    if (confirm("Are you sure you want to reset today's timetable to default?")) {
        slots = structuredClone(defaultSlots);
        renderTable();
    }
}

async function copyMonday() {
    if (currentDay === "Monday") {
        alert("You are already on Monday!");
        return;
    }
    const querySnapshot = await getDocs(collection(db, "timetable", "Monday", "slots"));
    slots = {};
    querySnapshot.forEach((docSnap) => {
        slots[docSnap.id] = docSnap.data();
    });
    renderTable();
}

function downloadCSV() {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Start Time,End Time,Teacher,Subject,Hall\n";  // Header

    Object.values(slots).forEach(slot => {
        // Correctly concatenate slot data
        const row = `${slot.start_time},${slot.end_time},${slot.teacher},${slot.subject},${slot.hall}`;
        csvContent += row + "\n";  // Append row
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${currentDay}_Timetable.csv`);  // Dynamically name the file
    document.body.appendChild(link); // Append the link
    link.click();  // Trigger the download
    document.body.removeChild(link); // Remove the link after download
}

// Event Listeners
daySelect.addEventListener('change', () => {
    currentDay = daySelect.value;
    loadTimetable(currentDay);
});

addSlotBtn.addEventListener('click', addNewSlot);
submitBtn.addEventListener('click', submitTimetable);
resetBtn.addEventListener('click', resetDay);
copyMondayBtn.addEventListener('click', copyMonday);
downloadCsvBtn.addEventListener('click', downloadCSV);

// Initialize with default timetable for Monday
loadTimetable(currentDay);
